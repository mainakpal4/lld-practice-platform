import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProblemRepository } from '../src/infrastructure/InMemoryProblemRepository';
import { InMemoryAttemptRepository } from '../src/infrastructure/InMemoryAttemptRepository';
import { EvaluationJobRunner } from '../src/infrastructure/EvaluationJobRunner';
import { PracticeService } from '../src/services/PracticeService';
import { SEED_PROBLEMS } from '../src/infrastructure/seed/problems';

describe('PracticeService & Learning Progression Engine', () => {
  let problemRepo: InMemoryProblemRepository;
  let attemptRepo: InMemoryAttemptRepository;
  let jobRunner: EvaluationJobRunner;
  let practiceService: PracticeService;

  beforeEach(() => {
    problemRepo = new InMemoryProblemRepository(SEED_PROBLEMS);
    attemptRepo = new InMemoryAttemptRepository();
    // Use immediate execution (0ms delay) in unit tests
    jobRunner = new EvaluationJobRunner(attemptRepo, 0);
    practiceService = new PracticeService(problemRepo, attemptRepo, jobRunner);
  });

  it('starts an attempt with auto-incrementing attempt numbers', async () => {
    const att1 = await practiceService.startAttempt('prob-parking-lot', 'user-alpha');
    expect(att1.attemptNumber).toBe(1);
    expect(att1.status).toBe('DRAFT');

    const att2 = await practiceService.startAttempt('prob-parking-lot', 'user-alpha');
    expect(att2.attemptNumber).toBe(2);
  });

  it('submits an attempt and triggers async evaluation', async () => {
    const att = await practiceService.startAttempt('prob-parking-lot', 'user-alpha');
    
    const submittedAtt = await practiceService.submitAttempt(att.id, {
      assumptions: 'Standard garage assumptions and multi-level gates.',
      classDiagramMermaid: 'classDiagram\nParkingLot --> Spot',
      classSkeletonCode: 'public class ParkingLot {}\npublic class Spot {}\npublic class Car {}\npublic class Ticket {}',
      designPatterns: 'Strategy Pattern',
      tradeOffsAndEdgeCases: 'Synchronized spot booking to prevent race conditions.',
    });

    expect(submittedAtt.status).toBe('SUBMITTED');

    // Wait for the asynchronous job runner (0ms) to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    const evaluatedAtt = await practiceService.getAttempt(att.id);
    expect(evaluatedAtt?.status).toBe('COMPLETED');
    expect(evaluatedAtt?.evaluationResult).toBeDefined();
    expect(evaluatedAtt?.evaluationResult?.overallScore).toBeGreaterThan(0);
  });

  it('calculates progression delta and learning insights across attempts', async () => {
    // Attempt 1: Basic submission without interfaces
    const att1 = await practiceService.startAttempt('prob-parking-lot', 'user-alpha');
    await practiceService.submitAttempt(att1.id, {
      assumptions: 'Basic assumptions without details.',
      classDiagramMermaid: '',
      classSkeletonCode: 'public class ParkingLot { void park() {} }',
      designPatterns: 'None',
      tradeOffsAndEdgeCases: 'Basic lock',
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    // Attempt 2: Improved submission with interfaces and patterns
    const att2 = await practiceService.startAttempt('prob-parking-lot', 'user-alpha');
    await practiceService.submitAttempt(att2.id, {
      assumptions: 'Comprehensive multi-gate assumptions and boundary conditions.',
      classDiagramMermaid: 'classDiagram\nParkingLot --> IParkingStrategy',
      classSkeletonCode: `
        public interface IParkingStrategy { Spot find(); }
        public interface IPricingStrategy { double compute(); }
        public class ParkingLot {}
        public class Spot {}
        public class Vehicle {}
        public class Ticket {}
      `,
      designPatterns: 'Strategy Pattern and Factory Pattern',
      tradeOffsAndEdgeCases: 'Atomic compare-and-swap on spot state to avoid double booking.',
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    const history = await practiceService.getAttemptHistory('user-alpha', 'prob-parking-lot');
    expect(history.length).toBe(2);

    const first = history[0];
    const second = history[1];

    expect(first.previousAttempt).toBeUndefined();
    expect(second.previousAttempt).toBeDefined();
    expect(second.scoreDelta).toBeGreaterThan(0);
    expect(second.highlight).toContain('Score improved');
  });
});
