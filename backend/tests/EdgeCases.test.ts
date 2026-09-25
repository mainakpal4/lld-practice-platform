import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProblemRepository } from '../src/infrastructure/InMemoryProblemRepository';
import { InMemoryAttemptRepository } from '../src/infrastructure/InMemoryAttemptRepository';
import { EvaluationJobRunner } from '../src/infrastructure/EvaluationJobRunner';
import { PracticeService } from '../src/services/PracticeService';
import { SEED_PROBLEMS } from '../src/infrastructure/seed/problems';

describe('Failure, Resilience & Edge Cases Suite', () => {
  let problemRepo: InMemoryProblemRepository;
  let attemptRepo: InMemoryAttemptRepository;
  let jobRunner: EvaluationJobRunner;
  let practiceService: PracticeService;

  beforeEach(() => {
    problemRepo = new InMemoryProblemRepository(SEED_PROBLEMS);
    attemptRepo = new InMemoryAttemptRepository();
    // Simulate slight delay so we can test concurrency guards
    jobRunner = new EvaluationJobRunner(attemptRepo, 100);
    practiceService = new PracticeService(problemRepo, attemptRepo, jobRunner);
  });

  it('rejects attempt for non-existent problem ID', async () => {
    await expect(practiceService.startAttempt('non-existent-problem')).rejects.toThrow(
      /Problem with ID non-existent-problem not found/
    );
  });

  it('rejects submission with empty or malformed payload', async () => {
    const att = await practiceService.startAttempt('prob-parking-lot', 'user-edge');
    await expect(
      practiceService.submitAttempt(att.id, {
        assumptions: '',
        classDiagramMermaid: '',
        classSkeletonCode: '',
        designPatterns: '',
        tradeOffsAndEdgeCases: '',
      })
    ).rejects.toThrow(/Validation failed/);
  });

  it('prevents duplicate concurrent submissions for the same attempt (Idempotency Guard)', async () => {
    const att = await practiceService.startAttempt('prob-parking-lot', 'user-edge');

    const validPayload = {
      assumptions: 'Valid assumptions text for parking lot problem.',
      classDiagramMermaid: 'classDiagram\nParkingLot --> Spot',
      classSkeletonCode: 'public class ParkingLot {}\npublic class Spot {}',
      designPatterns: 'Strategy Pattern',
      tradeOffsAndEdgeCases: 'Mutex locking mechanism.',
    };

    // First submission
    await practiceService.submitAttempt(att.id, validPayload);

    // Second submission while first is still running in background
    await expect(practiceService.submitAttempt(att.id, validPayload)).rejects.toThrow(
      /already actively being evaluated/
    );
  });

  it('handles evaluator failure gracefully and supports retry', async () => {
    const att = await practiceService.startAttempt('prob-parking-lot', 'user-edge');
    
    // Submit first so it reaches SUBMITTED
    att.submit(new (await import('../src/domain/models/Submission')).Submission(
      'sub-fail-1',
      att.id,
      new (await import('../src/domain/interfaces/ISubmissionContent')).StructuredTextSubmissionContent({
        assumptions: 'Valid assumptions text for parking lot problem.',
        classDiagramMermaid: 'classDiagram\nParkingLot --> Spot',
        classSkeletonCode: 'public class ParkingLot {}\npublic class Spot {}',
        designPatterns: 'Strategy Pattern',
        tradeOffsAndEdgeCases: 'Mutex locking mechanism.',
      })
    ));

    // Manually simulate a failure state on the attempt
    att.markEvaluating();
    att.failEvaluation('Network socket hang up on remote inference endpoint.');
    await attemptRepo.save(att);

    const failedAtt = await practiceService.getAttempt(att.id);
    expect(failedAtt?.status).toBe('FAILED');
    expect(failedAtt?.errorMessage).toContain('Network socket hang up');

    // Trigger retry
    const retriedAtt = await practiceService.retryEvaluation(att.id);
    expect(retriedAtt.status).toBe('SUBMITTED');
    expect(retriedAtt.errorMessage).toBeUndefined();

    // Wait for the job runner to reprocess
    await new Promise(resolve => setTimeout(resolve, 150));

    const finalAtt = await practiceService.getAttempt(att.id);
    expect(finalAtt?.status).toBe('COMPLETED');
    expect(finalAtt?.evaluationResult).toBeDefined();
  });
});
