import { Attempt } from '../domain/models/Attempt';
import { Problem } from '../domain/models/Problem';
import { IEvaluator } from '../domain/interfaces/IEvaluator';
import { IAttemptRepository } from '../domain/interfaces/IAttemptRepository';

export class EvaluationJobRunner {
  private readonly runningJobs: Set<string> = new Set();

  constructor(
    private readonly attemptRepository: IAttemptRepository,
    private readonly defaultDelayMs: number = 800 // Realistic async processing simulation
  ) {}

  public isJobRunning(attemptId: string): boolean {
    return this.runningJobs.has(attemptId);
  }

  public enqueue(attempt: Attempt, problem: Problem, evaluator: IEvaluator): void {
    if (this.runningJobs.has(attempt.id)) {
      console.warn(`Evaluation job for attempt ${attempt.id} is already in progress.`);
      return;
    }

    this.runningJobs.add(attempt.id);

    // Run asynchronously without blocking the HTTP request thread
    setTimeout(async () => {
      try {
        // 1. Transition state to EVALUATING
        attempt.markEvaluating();
        await this.attemptRepository.save(attempt);

        if (!attempt.currentSubmission) {
          throw new Error('No submission found on attempt to evaluate.');
        }

        // 2. Execute Evaluator Pipeline
        const result = await evaluator.evaluate(problem, attempt.currentSubmission);

        // 3. Complete and persist
        attempt.completeEvaluation(result);
        await this.attemptRepository.save(attempt);
      } catch (error: any) {
        console.error(`Evaluation failed for attempt ${attempt.id}:`, error);
        attempt.failEvaluation(error.message || 'An unexpected evaluation error occurred.');
        await this.attemptRepository.save(attempt);
      } finally {
        this.runningJobs.delete(attempt.id);
      }
    }, this.defaultDelayMs);
  }
}
