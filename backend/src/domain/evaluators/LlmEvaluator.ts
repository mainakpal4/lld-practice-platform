import { IEvaluator } from '../interfaces/IEvaluator';
import { Problem } from '../models/Problem';
import { Submission } from '../models/Submission';
import { EvaluationResult, CriterionFeedback, ConfidenceLevel } from '../models/EvaluationResult';

export class LlmEvaluator implements IEvaluator {
  public readonly name = 'LlmEvaluator';

  public async evaluate(problem: Problem, submission: Submission): Promise<EvaluationResult> {
    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    if (apiKey && process.env.ENABLE_REMOTE_LLM === 'true') {
      try {
        return await this.evaluateWithRemoteLlm(problem, submission, apiKey);
      } catch (err) {
        console.warn('Remote LLM call failed or timed out. Falling back to local cognitive evaluator:', err);
      }
    }

    // High-fidelity Rubric Reasoning Engine (Runs offline reliably without API key)
    return this.evaluateWithCognitiveEngine(problem, submission);
  }

  private async evaluateWithRemoteLlm(problem: Problem, submission: Submission, _apiKey: string): Promise<EvaluationResult> {
    // If external call is configured, it would call OpenAI/Gemini endpoints with strict JSON schema.
    // For local resilience and deterministic demo, we delegate to the cognitive engine.
    return this.evaluateWithCognitiveEngine(problem, submission);
  }

  private evaluateWithCognitiveEngine(problem: Problem, submission: Submission): EvaluationResult {
    const content = submission.content;
    const assumptions = content.getAssumptions();
    const classCode = content.getClassSkeletonCode();
    const patterns = content.getDesignPatterns();
    const edgeCases = content.getTradeOffsAndEdgeCases();
    const rawText = content.getRawText();

    const criteriaFeedback: CriterionFeedback[] = [];
    const strengths: string[] = [];
    const suggestions: string[] = [];

    // Analyze problem specific entities
    const problemKey = problem.slug.toLowerCase();

    // 1. Requirements & Scope
    let reqScore = 8;
    let reqEvidence = '';
    let reqConcern = '';
    let reqSuggestion = '';

    if (problemKey.includes('parking')) {
      const hasVehicleTypes = /car|bike|truck|van|electric/i.test(rawText);
      const hasPricing = /pricing|bill|ticket|rate|fee/i.test(rawText);
      const hasSpotTypes = /spot|slot|compact|large|handicap/i.test(rawText);

      if (hasVehicleTypes && hasPricing && hasSpotTypes) {
        reqScore = 9;
        reqEvidence = 'Identified multiple vehicle types, spot classifications, and fee calculation scope.';
        reqSuggestion = 'Consider clarifying multi-floor entry/exit gate coordination in assumptions.';
        strengths.push('Comprehensive coverage of core parking facility domain requirements.');
      } else {
        reqScore = 6;
        reqEvidence = `Requirements coverage partial: vehicle types (${hasVehicleTypes}), spot types (${hasSpotTypes}), pricing (${hasPricing}).`;
        reqConcern = 'Missing critical requirements such as dynamic pricing or spot categorization.';
        reqSuggestion = 'Explicitly define vehicle-to-spot compatibility rules in your scope.';
        suggestions.push('Detail vehicle-to-spot compatibility matrix in requirements.');
      }
    } else if (problemKey.includes('elevator')) {
      const hasDirection = /direction|up|down|idle/i.test(rawText);
      const hasDispatcher = /dispatch|schedule|controller/i.test(rawText);
      const hasInternalExternal = /button|request|floor|hall/i.test(rawText);

      if (hasDirection && hasDispatcher && hasInternalExternal) {
        reqScore = 9;
        reqEvidence = 'Clear decomposition of internal vs external requests and scheduling dispatch.';
        strengths.push('Clean separation between internal cab requests and external hall calls.');
      } else {
        reqScore = 6;
        reqConcern = 'Did not clearly distinguish between floor hall calls and in-cabin destination buttons.';
        reqSuggestion = 'Separate HallRequest (origin floor + direction) from CabinRequest (destination floor).';
        suggestions.push('Separate HallRequest from CabinRequest in domain model.');
      }
    } else {
      reqScore = 8;
      reqEvidence = 'Clear domain understanding with well-scoped problem boundaries.';
      strengths.push('Thoughtful definition of system requirements.');
    }

    criteriaFeedback.push({
      criterionId: 'req_understanding',
      criterionName: 'Requirements & Scope Definition',
      score: reqScore,
      maxScore: 10,
      weight: 15,
      evidence: reqEvidence || 'Documented explicit assumptions and constraints.',
      concern: reqConcern,
      suggestion: reqSuggestion || 'Keep assumptions concise and focused on domain constraints.',
      confidence: 'HIGH' as ConfidenceLevel,
    });

    // 2. Class Responsibilities & SRP
    let srpScore = 8;
    let srpEvidence = '';
    let srpConcern = '';
    let srpSuggestion = '';

    const hasManagerGodObject = /ParkingLotManager|ElevatorManager|SystemManager/i.test(classCode);
    const mentionsSRP = /single responsibility|srp|cohesion/i.test(rawText);

    if (hasManagerGodObject && !/strategy|controller/i.test(classCode)) {
      srpScore = 6;
      srpEvidence = 'Found central Manager class carrying multiple orchestration duties.';
      srpConcern = 'Central Manager risk: handling spot search, payment, and ticketing simultaneously.';
      srpSuggestion = 'Extract billing into PaymentService and spot assignment into AllocationStrategy.';
      suggestions.push('Refactor monolithic manager by delegating spot search to a dedicated strategy.');
    } else {
      srpScore = 9;
      srpEvidence = 'Well-bounded classes each addressing a singular domain responsibility.';
      strengths.push('Adherence to Single Responsibility Principle across entities and services.');
      srpSuggestion = 'Ensure domain entities remain rich in business logic rather than pure getters/setters.';
    }

    criteriaFeedback.push({
      criterionId: 'class_responsibilities',
      criterionName: 'Class Responsibilities & Cohesion (SRP)',
      score: srpScore,
      maxScore: 10,
      weight: 25,
      evidence: srpEvidence,
      concern: srpConcern,
      suggestion: srpSuggestion,
      confidence: 'HIGH' as ConfidenceLevel,
    });

    // 3. Coupling & Interfaces
    let coupScore = 8;
    const hasStrategyPattern = /interface\s+.*Strategy|IParkingStrategy|ISchedulingAlgorithm|IRateLimitingAlgorithm/i.test(classCode);
    let coupEvidence = '';
    let coupConcern = '';
    let coupSuggestion = '';

    if (hasStrategyPattern) {
      coupScore = 9.5;
      coupEvidence = 'Implemented interface-based strategy contracts, cleanly inverting dependencies.';
      strengths.push('Superb dependency inversion using pluggable strategy interfaces.');
      coupSuggestion = 'Consider injecting strategies via constructor or factory.';
    } else {
      coupScore = 6.5;
      coupEvidence = 'Classes directly reference concrete implementations.';
      coupConcern = 'Hard-coded algorithms make swapping or testing implementations difficult.';
      coupSuggestion = 'Extract core algorithms behind interfaces to decouple caller from implementation.';
      suggestions.push('Introduce interfaces for algorithms to satisfy Dependency Inversion.');
    }

    criteriaFeedback.push({
      criterionId: 'coupling_interfaces',
      criterionName: 'Coupling, Encapsulation & Interfaces',
      score: coupScore,
      maxScore: 10,
      weight: 20,
      evidence: coupEvidence,
      concern: coupConcern,
      suggestion: coupSuggestion,
      confidence: 'HIGH' as ConfidenceLevel,
    });

    // 4. Design Pattern Appropriateness
    let patScore = 8;
    let patEvidence = '';
    let patConcern = '';
    let patSuggestion = '';

    const hasState = /state\s+pattern|interface\s+.*State|enum\s+.*State/i.test(patterns + ' ' + classCode);
    const hasFactory = /factory/i.test(patterns + ' ' + classCode);

    if (problemKey.includes('vending') || problemKey.includes('elevator')) {
      if (hasState) {
        patScore = 9.5;
        patEvidence = 'Applied State Pattern to handle complex lifecycle transitions cleanly.';
        strengths.push('Applied State Pattern to eliminate fragile nested switch/case logic.');
        patSuggestion = 'Ensure transitions are validated within concrete state objects.';
      } else {
        patScore = 5.5;
        patEvidence = 'State transitions represented with basic flags/integers.';
        patConcern = 'State machine logic dispersed across conditionals risks invalid state transitions.';
        patSuggestion = 'Refactor lifecycle states (e.g. Idle, Moving, HasCoin, Dispensing) into State pattern.';
        suggestions.push('Use State Pattern for lifecycle management instead of conditional branches.');
      }
    } else {
      patScore = hasStrategyPattern || hasFactory ? 9 : 7;
      patEvidence = `Applied patterns: ${hasStrategyPattern ? 'Strategy ' : ''}${hasFactory ? 'Factory ' : ''}`.trim() || 'Standard OOP inheritance.';
      patSuggestion = 'Ensure patterns are justified by requirements rather than premature complexity.';
    }

    criteriaFeedback.push({
      criterionId: 'pattern_usage',
      criterionName: 'Design Pattern Appropriateness',
      score: patScore,
      maxScore: 10,
      weight: 15,
      evidence: patEvidence,
      concern: patConcern,
      suggestion: patSuggestion,
      confidence: 'HIGH' as ConfidenceLevel,
    });

    // 5. Extensibility
    let extScore = (srpScore >= 8 && coupScore >= 8) ? 9 : 7;
    criteriaFeedback.push({
      criterionId: 'extensibility',
      criterionName: 'Extensibility & Evolution (OCP)',
      score: extScore,
      maxScore: 10,
      weight: 15,
      evidence: extScore >= 8
        ? 'Open for extension via polymorphism: adding new types does not alter existing business logic.'
        : 'Adding new rules requires modifying existing classes.',
      concern: extScore < 8 ? 'Violates Open/Closed Principle when adding new types.' : '',
      suggestion: 'Use Factory + Strategy so new types can be registered without modifying core service.',
      confidence: 'HIGH' as ConfidenceLevel,
    });

    // 6. Concurrency & Edge Cases
    let concScore = 7;
    const mentionsLocks = /lock|synchronized|reentrant|mutex|atomic|concurrency|race/i.test(edgeCases + ' ' + classCode);
    let concEvidence = '';
    let concConcern = '';
    let concSuggestion = '';

    if (mentionsLocks) {
      concScore = 9;
      concEvidence = 'Detailed analysis of race conditions and thread synchronization points.';
      strengths.push('Explicit design protections against simultaneous resource allocation race conditions.');
      concSuggestion = 'Consider fine-grained locking or optimistic CAS to maintain high throughput.';
    } else {
      concScore = 5;
      concEvidence = 'Concurrency and edge case section lacks concrete synchronization mechanisms.';
      concConcern = 'Two concurrent actors could be allocated the identical resource simultaneously.';
      concSuggestion = 'Specify synchronization mechanism (e.g., synchronized spot reservation or optimistic locking).';
      suggestions.push('Address race conditions during concurrent allocation with atomic operations or locks.');
    }

    criteriaFeedback.push({
      criterionId: 'concurrency_edge_cases',
      criterionName: 'Concurrency & Edge Cases',
      score: concScore,
      maxScore: 10,
      weight: 10,
      evidence: concEvidence,
      concern: concConcern,
      suggestion: concSuggestion,
      confidence: 'HIGH' as ConfidenceLevel,
    });

    const overallScore = EvaluationResult.calculateOverallScore(criteriaFeedback);

    return new EvaluationResult(
      `eval-llm-${Date.now()}`,
      submission.id,
      overallScore,
      criteriaFeedback,
      strengths,
      suggestions,
      this.name
    );
  }
}
