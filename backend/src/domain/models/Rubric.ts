export interface RubricCriterion {
  id: string;
  name: string;
  weight: number; // percentage weight, e.g. 20 for 20%
  description: string;
  maxScore: number;
}

export class Rubric {
  constructor(
    public readonly id: string,
    public readonly problemId: string,
    public readonly criteria: RubricCriterion[]
  ) {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      throw new Error(`Rubric weights must sum to 100, got ${totalWeight}`);
    }
  }

  public getCriterion(id: string): RubricCriterion | undefined {
    return this.criteria.find(c => c.id === id);
  }
}
