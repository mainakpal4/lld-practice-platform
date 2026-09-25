import { IAttemptRepository } from '../domain/interfaces/IAttemptRepository';
import { Attempt } from '../domain/models/Attempt';

export class InMemoryAttemptRepository implements IAttemptRepository {
  private readonly attempts: Map<string, Attempt> = new Map();

  public async save(attempt: Attempt): Promise<void> {
    this.attempts.set(attempt.id, attempt);
  }

  public async getById(id: string): Promise<Attempt | null> {
    return this.attempts.get(id) || null;
  }

  public async getByLearnerAndProblem(learnerId: string, problemId: string): Promise<Attempt[]> {
    const list: Attempt[] = [];
    for (const a of this.attempts.values()) {
      if (a.learnerId === learnerId && a.problemId === problemId) {
        list.push(a);
      }
    }
    // Return sorted by attemptNumber ascending
    return list.sort((a, b) => a.attemptNumber - b.attemptNumber);
  }

  public async getNextAttemptNumber(learnerId: string, problemId: string): Promise<number> {
    const existing = await this.getByLearnerAndProblem(learnerId, problemId);
    return existing.length + 1;
  }
}
