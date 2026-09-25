import { IProblemRepository } from '../domain/interfaces/IProblemRepository';
import { IAttemptRepository } from '../domain/interfaces/IAttemptRepository';
import { IEvaluator } from '../domain/interfaces/IEvaluator';
import { Attempt } from '../domain/models/Attempt';
import { Submission } from '../domain/models/Submission';
import { StructuredTextSubmissionContent, StructuredTextPayload } from '../domain/interfaces/ISubmissionContent';
import { EvaluationJobRunner } from '../infrastructure/EvaluationJobRunner';
import { CompositeEvaluator } from '../domain/evaluators/CompositeEvaluator';
import { DeterministicRuleEvaluator } from '../domain/evaluators/DeterministicRuleEvaluator';
import { LlmEvaluator } from '../domain/evaluators/LlmEvaluator';
import { HumanReviewEvaluatorStub } from '../domain/evaluators/HumanReviewEvaluatorStub';

export interface CriterionProgression {
  criterionId: string;
  criterionName: string;
  previousScore?: number;
  currentScore: number;
  delta: number;
  maxScore: number;
}

export interface AttemptProgressionReport {
  currentAttempt: Attempt;
  previousAttempt?: Attempt;
  scoreDelta: number;
  criteriaDeltas: CriterionProgression[];
  highlight: string;
}

export class PracticeService {
  private readonly defaultEvaluator: IEvaluator;
  private readonly evaluators: Map<string, IEvaluator> = new Map();

  constructor(
    private readonly problemRepo: IProblemRepository,
    private readonly attemptRepo: IAttemptRepository,
    private readonly jobRunner: EvaluationJobRunner
  ) {
    const deterministic = new DeterministicRuleEvaluator();
    const llm = new LlmEvaluator();
    const composite = new CompositeEvaluator([deterministic, llm]);
    const human = new HumanReviewEvaluatorStub();

    this.evaluators.set('composite', composite);
    this.evaluators.set('deterministic', deterministic);
    this.evaluators.set('llm', llm);
    this.evaluators.set('human', human);

    this.defaultEvaluator = composite;
  }

  public async startAttempt(problemId: string, learnerId: string = 'default-learner'): Promise<Attempt> {
    const problem = await this.problemRepo.getById(problemId);
    if (!problem) {
      throw new Error(`Problem with ID ${problemId} not found.`);
    }

    const nextAttemptNumber = await this.attemptRepo.getNextAttemptNumber(learnerId, problemId);
    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const attempt = new Attempt(attemptId, problemId, learnerId, nextAttemptNumber);

    await this.attemptRepo.save(attempt);
    return attempt;
  }

  public async submitAttempt(
    attemptId: string,
    payload: StructuredTextPayload,
    evaluatorKey: string = 'composite'
  ): Promise<Attempt> {
    const attempt = await this.attemptRepo.getById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt ${attemptId} not found.`);
    }

    const problem = await this.problemRepo.getById(attempt.problemId);
    if (!problem) {
      throw new Error(`Associated problem ${attempt.problemId} not found.`);
    }

    if (this.jobRunner.isJobRunning(attempt.id)) {
      throw new Error(`Attempt ${attemptId} is already actively being evaluated.`);
    }

    const content = new StructuredTextSubmissionContent(payload);
    const submissionId = `sub-${Date.now()}`;
    const submission = new Submission(submissionId, attempt.id, content);

    // Domain validation & state transition to SUBMITTED
    attempt.submit(submission);
    await this.attemptRepo.save(attempt);

    // Pick evaluator
    const evaluator = this.evaluators.get(evaluatorKey) || this.defaultEvaluator;

    // Dispatch background evaluation job
    this.jobRunner.enqueue(attempt, problem, evaluator);

    return attempt;
  }

  public async retryEvaluation(attemptId: string): Promise<Attempt> {
    const attempt = await this.attemptRepo.getById(attemptId);
    if (!attempt) {
      throw new Error(`Attempt ${attemptId} not found.`);
    }

    const problem = await this.problemRepo.getById(attempt.problemId);
    if (!problem) {
      throw new Error(`Associated problem ${attempt.problemId} not found.`);
    }

    attempt.retry();
    await this.attemptRepo.save(attempt);

    this.jobRunner.enqueue(attempt, problem, this.defaultEvaluator);
    return attempt;
  }

  public async getAttempt(attemptId: string): Promise<Attempt | null> {
    return this.attemptRepo.getById(attemptId);
  }

  public async getAttemptHistory(learnerId: string, problemId: string): Promise<AttemptProgressionReport[]> {
    const attempts = await this.attemptRepo.getByLearnerAndProblem(learnerId, problemId);
    const reports: AttemptProgressionReport[] = [];

    for (let i = 0; i < attempts.length; i++) {
      const current = attempts[i];
      const previous = i > 0 ? attempts[i - 1] : undefined;

      const currentScore = current.evaluationResult ? current.evaluationResult.overallScore : 0;
      const prevScore = previous?.evaluationResult ? previous.evaluationResult.overallScore : 0;
      const scoreDelta = previous && current.evaluationResult ? Math.round((currentScore - prevScore) * 10) / 10 : 0;

      const criteriaDeltas: CriterionProgression[] = [];
      if (current.evaluationResult) {
        for (const currCrit of current.evaluationResult.criteriaFeedback) {
          const prevCrit = previous?.evaluationResult?.criteriaFeedback.find(c => c.criterionId === currCrit.criterionId);
          const delta = prevCrit ? Math.round((currCrit.score - prevCrit.score) * 10) / 10 : 0;

          criteriaDeltas.push({
            criterionId: currCrit.criterionId,
            criterionName: currCrit.criterionName,
            previousScore: prevCrit?.score,
            currentScore: currCrit.score,
            delta,
            maxScore: currCrit.maxScore,
          });
        }
      }

      let highlight = 'First attempt recorded.';
      if (previous && scoreDelta > 0) {
        highlight = `Score improved by +${scoreDelta} points across iterations!`;
      } else if (previous && scoreDelta < 0) {
        highlight = `Score dropped by ${Math.abs(scoreDelta)} points. Check updated concerns.`;
      } else if (previous) {
        highlight = 'Identical overall score. Review specific criterion advice.';
      }

      reports.push({
        currentAttempt: current,
        previousAttempt: previous,
        scoreDelta,
        criteriaDeltas,
        highlight,
      });
    }

    return reports;
  }
}
