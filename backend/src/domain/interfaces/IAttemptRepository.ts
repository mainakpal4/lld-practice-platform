import { Attempt } from '../models/Attempt';

export interface IAttemptRepository {
  save(attempt: Attempt): Promise<void>;
  getById(id: string): Promise<Attempt | null>;
  getByLearnerAndProblem(learnerId: string, problemId: string): Promise<Attempt[]>;
  getNextAttemptNumber(learnerId: string, problemId: string): Promise<number>;
}
