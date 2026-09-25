export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type AttemptStatus = 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Requirement {
  id: string;
  text: string;
  type: 'FUNCTIONAL' | 'NON_FUNCTIONAL';
}

export interface RubricCriterion {
  id: string;
  name: string;
  weight: number;
  description: string;
  maxScore: number;
}

export interface Rubric {
  id: string;
  problemId: string;
  criteria: RubricCriterion[];
}

export interface ProblemSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  domain: string;
  keyConcepts: string[];
  requirementsCount: number;
}

export interface StarterTemplate {
  assumptions: string;
  classDiagramMermaid: string;
  classSkeletonCode: string;
  designPatterns: string;
  tradeOffsAndEdgeCases: string;
}

export interface ProblemDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  domain: string;
  requirements: Requirement[];
  rubric: Rubric;
  starterTemplate: StarterTemplate;
  keyConcepts: string[];
}

export interface CriterionFeedback {
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
  weight: number;
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: ConfidenceLevel;
}

export interface EvaluationResult {
  id: string;
  submissionId: string;
  overallScore: number;
  criteriaFeedback: CriterionFeedback[];
  keyStrengths: string[];
  improvementSuggestions: string[];
  evaluatorType: string;
  evaluatedAt: string;
}

export interface SubmissionPayload {
  assumptions: string;
  classDiagramMermaid: string;
  classSkeletonCode: string;
  designPatterns: string;
  tradeOffsAndEdgeCases: string;
  evaluator?: string;
}

export interface Attempt {
  id: string;
  problemId: string;
  learnerId: string;
  attemptNumber: number;
  status: AttemptStatus;
  errorMessage?: string;
  evaluationResult?: EvaluationResult;
  currentSubmission?: {
    id: string;
    submittedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

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
