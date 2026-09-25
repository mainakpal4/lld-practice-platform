import { IEvaluator } from '../interfaces/IEvaluator';
import { Problem } from '../models/Problem';
import { Submission } from '../models/Submission';
import { EvaluationResult, CriterionFeedback } from '../models/EvaluationResult';

export class CompositeEvaluator implements IEvaluator {
  public readonly name = 'CompositeEvaluator';
  private readonly evaluators: IEvaluator[];

  constructor(evaluators: IEvaluator[]) {
    if (evaluators.length === 0) {
      throw new Error('CompositeEvaluator requires at least one sub-evaluator.');
    }
    this.evaluators = evaluators;
  }

  public async evaluate(problem: Problem, submission: Submission): Promise<EvaluationResult> {
    // Run all evaluators concurrently
    const results = await Promise.all(
      this.evaluators.map(evaluator => evaluator.evaluate(problem, submission))
    );

    // Merge criteria scores by criterionId
    const criteriaMap = new Map<string, CriterionFeedback[]>();
    for (const res of results) {
      for (const crit of res.criteriaFeedback) {
        if (!criteriaMap.has(crit.criterionId)) {
          criteriaMap.set(crit.criterionId, []);
        }
        criteriaMap.get(crit.criterionId)!.push(crit);
      }
    }

    const mergedCriteria: CriterionFeedback[] = [];
    criteriaMap.forEach((feedbacks, criterionId) => {
      // Average score, prioritize feedback with richer evidence and concerns
      const avgScore = Math.round((feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length) * 10) / 10;
      const primary = feedbacks.find(f => f.concern) || feedbacks[0];
      const evidence = feedbacks.map(f => f.evidence).filter(Boolean).join(' | ');
      const suggestion = feedbacks.map(f => f.suggestion).filter(Boolean)[0] || '';
      const concern = feedbacks.map(f => f.concern).filter(Boolean)[0] || '';

      mergedCriteria.push({
        criterionId,
        criterionName: primary.criterionName,
        score: avgScore,
        maxScore: primary.maxScore,
        weight: primary.weight,
        evidence: evidence || primary.evidence,
        concern,
        suggestion,
        confidence: primary.confidence,
      });
    });

    const allStrengths = Array.from(new Set(results.flatMap(r => r.keyStrengths)));
    const allSuggestions = Array.from(new Set(results.flatMap(r => r.improvementSuggestions)));
    const overallScore = EvaluationResult.calculateOverallScore(mergedCriteria);

    return new EvaluationResult(
      `eval-composite-${Date.now()}`,
      submission.id,
      overallScore,
      mergedCriteria,
      allStrengths,
      allSuggestions,
      `Composite (${this.evaluators.map(e => e.name).join(' + ')})`
    );
  }
}
