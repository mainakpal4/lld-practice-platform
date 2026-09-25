export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CriterionFeedback {
  criterionId: string;
  criterionName: string;
  score: number; // e.g. 0 to 10
  maxScore: number;
  weight: number; // percentage
  evidence: string; // Exact quote or reference to candidate solution
  concern: string; // Identified weakness, anti-pattern, or design smell
  suggestion: string; // Actionable advice for improvement in next attempt
  confidence: ConfidenceLevel;
}

export class EvaluationResult {
  constructor(
    public readonly id: string,
    public readonly submissionId: string,
    public readonly overallScore: number, // 0 - 100
    public readonly criteriaFeedback: CriterionFeedback[],
    public readonly keyStrengths: string[],
    public readonly improvementSuggestions: string[],
    public readonly evaluatorType: string,
    public readonly evaluatedAt: Date = new Date()
  ) {}

  public static calculateOverallScore(criteria: CriterionFeedback[]): number {
    if (criteria.length === 0) return 0;
    let weightedSum = 0;
    let totalWeight = 0;

    for (const c of criteria) {
      const normalizedScore = (c.score / c.maxScore) * 100;
      weightedSum += normalizedScore * (c.weight / 100);
      totalWeight += c.weight;
    }

    if (totalWeight === 0) return 0;
    return Math.round((weightedSum / (totalWeight / 100)) * 10) / 10;
  }
}
