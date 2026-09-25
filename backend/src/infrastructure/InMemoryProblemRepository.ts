import { IProblemRepository } from '../domain/interfaces/IProblemRepository';
import { Problem } from '../domain/models/Problem';
import { SEED_PROBLEMS } from './seed/problems';

export class InMemoryProblemRepository implements IProblemRepository {
  private readonly problems: Map<string, Problem> = new Map();

  constructor(initialProblems: Problem[] = SEED_PROBLEMS) {
    for (const problem of initialProblems) {
      this.problems.set(problem.id, problem);
    }
  }

  public async getAll(): Promise<Problem[]> {
    return Array.from(this.problems.values());
  }

  public async getById(id: string): Promise<Problem | null> {
    return this.problems.get(id) || null;
  }

  public async getBySlug(slug: string): Promise<Problem | null> {
    for (const p of this.problems.values()) {
      if (p.slug.toLowerCase() === slug.toLowerCase()) {
        return p;
      }
    }
    return null;
  }
}
