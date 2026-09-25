import { IEvaluator } from '../interfaces/IEvaluator';
import { Problem } from '../models/Problem';
import { Submission } from '../models/Submission';
import { EvaluationResult } from '../models/EvaluationResult';

/**
 * HumanReviewEvaluatorStub
 *
 * Directly satisfies Change Test B:
 * Demonstrates how human code review or peer critique can be plugged into the evaluation pipeline
 * as an IEvaluator strategy without altering the PracticeService, Attempt state machine, or API contract.
 */
export class HumanReviewEvaluatorStub implements IEvaluator {
  public readonly name = 'HumanReviewEvaluator';

  constructor(private readonly reviewerId: string = 'staff-eng-42') {}

  public async evaluate(problem: Problem, submission: Submission): Promise<EvaluationResult> {
    // In a live system, this evaluator pushes to an internal staff review queue
    // and suspends or provides initial qualitative annotations.
    return new EvaluationResult(
      `eval-human-${Date.now()}`,
      submission.id,
      88,
      [
        {
          criterionId: 'class_responsibilities',
          criterionName: 'Staff Review: Cohesion & Modularity',
          score: 9,
          maxScore: 10,
          weight: 50,
          evidence: 'Verified clean extraction of payment and slot management.',
          concern: 'Watch out for memory footprint if active tickets map is kept in heap indefinitely.',
          suggestion: 'Introduce an eviction strategy or active session window.',
          confidence: 'HIGH',
        },
        {
          criterionId: 'extensibility',
          criterionName: 'Staff Review: Future Adaptability',
          score: 8.5,
          maxScore: 10,
          weight: 50,
          evidence: 'Factory pattern utilized for spot creation.',
          concern: 'Vehicle dimensions might require more granular spot fit checks.',
          suggestion: 'Model SpotFitPolicy interface for multi-dimensional spot matching.',
          confidence: 'HIGH',
        }
      ],
      ['Clear domain boundaries recognized by staff reviewer.'],
      ['Consider long-running ticket storage eviction.'],
      `HumanReview (${this.reviewerId})`
    );
  }
}
