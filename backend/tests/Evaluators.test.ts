import { describe, it, expect } from 'vitest';
import { DeterministicRuleEvaluator } from '../src/domain/evaluators/DeterministicRuleEvaluator';
import { LlmEvaluator } from '../src/domain/evaluators/LlmEvaluator';
import { CompositeEvaluator } from '../src/domain/evaluators/CompositeEvaluator';
import { HumanReviewEvaluatorStub } from '../src/domain/evaluators/HumanReviewEvaluatorStub';
import { SEED_PROBLEMS } from '../src/infrastructure/seed/problems';
import { Submission } from '../src/domain/models/Submission';
import { StructuredTextSubmissionContent } from '../src/domain/interfaces/ISubmissionContent';

describe('Evaluator Engine Suite (Composite, Deterministic, LLM, Human)', () => {
  const parkingLotProblem = SEED_PROBLEMS[0];

  const submissionContent = new StructuredTextSubmissionContent({
    assumptions: 'Assumed multi-floor facility with gates. Capacity bounds fixed.',
    classDiagramMermaid: 'classDiagram\nParkingLot --> Spot',
    classSkeletonCode: `
      public interface IParkingStrategy { Spot allocate(); }
      public interface IPricingStrategy { double compute(Ticket t); }
      public class ParkingLot {}
      public class ParkingSpot {}
      public class Vehicle {}
      public class Ticket {}
    `,
    designPatterns: 'Strategy Pattern for spot allocation and dynamic pricing.',
    tradeOffsAndEdgeCases: 'Thread safety handled using synchronized locks on spot reservation.',
  });

  const submission = new Submission('sub-eval-1', 'att-1', submissionContent);

  it('DeterministicRuleEvaluator evaluates structure, classes, and interfaces correctly', async () => {
    const evaluator = new DeterministicRuleEvaluator();
    const result = await evaluator.evaluate(parkingLotProblem, submission);

    expect(result.overallScore).toBeGreaterThanOrEqual(70);
    expect(result.criteriaFeedback.length).toBe(6);
    expect(result.evaluatorType).toBe('DeterministicRuleEvaluator');

    const srpCrit = result.criteriaFeedback.find(c => c.criterionId === 'class_responsibilities');
    expect(srpCrit).toBeDefined();
    expect(srpCrit?.evidence).toContain('Declared 4 distinct classes');

    const coupCrit = result.criteriaFeedback.find(c => c.criterionId === 'coupling_interfaces');
    expect(coupCrit?.score).toBeGreaterThanOrEqual(8);
  });

  it('LlmEvaluator provides semantic reasoning and specific domain evidence', async () => {
    const evaluator = new LlmEvaluator();
    const result = await evaluator.evaluate(parkingLotProblem, submission);

    expect(result.overallScore).toBeGreaterThanOrEqual(75);
    expect(result.keyStrengths.length).toBeGreaterThan(0);
    expect(result.criteriaFeedback.every(c => c.confidence === 'HIGH' || c.confidence === 'MEDIUM')).toBe(true);
  });

  it('CompositeEvaluator integrates deterministic and semantic checks into a cohesive report', async () => {
    const det = new DeterministicRuleEvaluator();
    const llm = new LlmEvaluator();
    const composite = new CompositeEvaluator([det, llm]);

    const result = await composite.evaluate(parkingLotProblem, submission);

    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.evaluatorType).toContain('Composite');
    expect(result.criteriaFeedback.length).toBe(6);
    expect(result.keyStrengths.length).toBeGreaterThan(0);
  });

  it('HumanReviewEvaluatorStub fulfills Change Test B (pluggable reviewer)', async () => {
    const humanReviewer = new HumanReviewEvaluatorStub('lead-architect-1');
    const result = await humanReviewer.evaluate(parkingLotProblem, submission);

    expect(result.evaluatorType).toContain('HumanReview');
    expect(result.overallScore).toBe(88);
  });
});
