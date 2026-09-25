import { Submission } from './Submission';
import { EvaluationResult } from './EvaluationResult';

export type AttemptStatus = 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';

export class Attempt {
  public status: AttemptStatus;
  public currentSubmission?: Submission;
  public evaluationResult?: EvaluationResult;
  public errorMessage?: string;
  public updatedAt: Date;

  constructor(
    public readonly id: string,
    public readonly problemId: string,
    public readonly learnerId: string,
    public readonly attemptNumber: number,
    public readonly createdAt: Date = new Date()
  ) {
    this.status = 'DRAFT';
    this.updatedAt = createdAt;
  }

  public submit(submission: Submission): void {
    if (this.status === 'EVALUATING') {
      throw new Error(`Cannot submit attempt ${this.id} while evaluation is already in progress.`);
    }

    const validation = submission.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join('; ')}`);
    }

    this.currentSubmission = submission;
    this.status = 'SUBMITTED';
    this.errorMessage = undefined;
    this.updatedAt = new Date();
  }

  public markEvaluating(): void {
    if (this.status !== 'SUBMITTED' && this.status !== 'FAILED') {
      throw new Error(`Attempt ${this.id} cannot transition to EVALUATING from ${this.status}`);
    }
    this.status = 'EVALUATING';
    this.updatedAt = new Date();
  }

  public completeEvaluation(result: EvaluationResult): void {
    if (this.status !== 'EVALUATING') {
      throw new Error(`Attempt ${this.id} cannot transition to COMPLETED from ${this.status}`);
    }
    this.evaluationResult = result;
    this.status = 'COMPLETED';
    this.updatedAt = new Date();
  }

  public failEvaluation(reason: string): void {
    this.status = 'FAILED';
    this.errorMessage = reason;
    this.updatedAt = new Date();
  }

  public retry(): void {
    if (this.status !== 'FAILED') {
      throw new Error(`Only FAILED attempts can be retried. Current status is ${this.status}`);
    }
    this.status = 'SUBMITTED';
    this.errorMessage = undefined;
    this.updatedAt = new Date();
  }
}
