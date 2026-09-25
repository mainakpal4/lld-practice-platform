import { describe, it, expect } from 'vitest';
import { Attempt } from '../src/domain/models/Attempt';
import { Submission } from '../src/domain/models/Submission';
import { StructuredTextSubmissionContent } from '../src/domain/interfaces/ISubmissionContent';
import { EvaluationResult } from '../src/domain/models/EvaluationResult';

describe('Attempt Domain Entity & State Machine', () => {
  const createValidSubmission = (attemptId: string) => {
    return new Submission(
      'sub-1',
      attemptId,
      new StructuredTextSubmissionContent({
        assumptions: 'Valid assumptions covering scope and capacity.',
        classDiagramMermaid: 'classDiagram\nclass A',
        classSkeletonCode: 'public class ParkingLot {}\npublic class Spot {}',
        designPatterns: 'Strategy Pattern',
        tradeOffsAndEdgeCases: 'Concurrency locks handled with mutex.',
      })
    );
  };

  it('initializes in DRAFT state with correct attempt number', () => {
    const attempt = new Attempt('att-1', 'prob-1', 'learner-1', 1);
    expect(attempt.status).toBe('DRAFT');
    expect(attempt.attemptNumber).toBe(1);
    expect(attempt.currentSubmission).toBeUndefined();
    expect(attempt.evaluationResult).toBeUndefined();
  });

  it('transitions from DRAFT to SUBMITTED upon valid submission', () => {
    const attempt = new Attempt('att-1', 'prob-1', 'learner-1', 1);
    const submission = createValidSubmission(attempt.id);

    attempt.submit(submission);
    expect(attempt.status).toBe('SUBMITTED');
    expect(attempt.currentSubmission).toBe(submission);
  });

  it('rejects invalid submission with short assumptions or code', () => {
    const attempt = new Attempt('att-1', 'prob-1', 'learner-1', 1);
    const invalidSubmission = new Submission(
      'sub-invalid',
      attempt.id,
      new StructuredTextSubmissionContent({
        assumptions: 'short',
        classDiagramMermaid: '',
        classSkeletonCode: 'class A',
        designPatterns: '',
        tradeOffsAndEdgeCases: '',
      })
    );

    expect(() => attempt.submit(invalidSubmission)).toThrow(/Validation failed/);
    expect(attempt.status).toBe('DRAFT');
  });

  it('transitions SUBMITTED -> EVALUATING -> COMPLETED', () => {
    const attempt = new Attempt('att-1', 'prob-1', 'learner-1', 1);
    attempt.submit(createValidSubmission(attempt.id));

    attempt.markEvaluating();
    expect(attempt.status).toBe('EVALUATING');

    const result = new EvaluationResult('eval-1', 'sub-1', 85, [], ['Great SRP'], [], 'TestEvaluator');
    attempt.completeEvaluation(result);
    expect(attempt.status).toBe('COMPLETED');
    expect(attempt.evaluationResult).toBe(result);
  });

  it('prevents transitioning to EVALUATING from DRAFT', () => {
    const attempt = new Attempt('att-1', 'prob-1', 'learner-1', 1);
    expect(() => attempt.markEvaluating()).toThrow(/cannot transition to EVALUATING/);
  });

  it('handles FAILED state and allows retry', () => {
    const attempt = new Attempt('att-1', 'prob-1', 'learner-1', 1);
    attempt.submit(createValidSubmission(attempt.id));
    attempt.markEvaluating();

    attempt.failEvaluation('External AI Service Timeout');
    expect(attempt.status).toBe('FAILED');
    expect(attempt.errorMessage).toBe('External AI Service Timeout');

    attempt.retry();
    expect(attempt.status).toBe('SUBMITTED');
    expect(attempt.errorMessage).toBeUndefined();
  });
});
