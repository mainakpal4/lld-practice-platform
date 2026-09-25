import { Problem } from '../models/Problem';

export interface IProblemRepository {
  getAll(): Promise<Problem[]>;
  getById(id: string): Promise<Problem | null>;
  getBySlug(slug: string): Promise<Problem | null>;
}
