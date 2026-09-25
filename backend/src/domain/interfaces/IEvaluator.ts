import { Problem } from '../models/Problem';
import { Submission } from '../models/Submission';
import { EvaluationResult } from '../models/EvaluationResult';

export interface IEvaluator {
  readonly name: string;
  evaluate(problem: Problem, submission: Submission): Promise<EvaluationResult>;
}
