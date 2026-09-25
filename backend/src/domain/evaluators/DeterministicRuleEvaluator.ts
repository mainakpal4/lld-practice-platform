import { IEvaluator } from '../interfaces/IEvaluator';
import { Problem } from '../models/Problem';
import { Submission } from '../models/Submission';
import { EvaluationResult, CriterionFeedback } from '../models/EvaluationResult';

export class DeterministicRuleEvaluator implements IEvaluator {
  public readonly name = 'DeterministicRuleEvaluator';

  public async evaluate(problem: Problem, submission: Submission): Promise<EvaluationResult> {
    const content = submission.content;
    const assumptions = content.getAssumptions() || '';
    const classCode = content.getClassSkeletonCode() || '';
    const patterns = content.getDesignPatterns() || '';
    const edgeCases = content.getTradeOffsAndEdgeCases() || '';
    const rawText = content.getRawText();

    const criteriaFeedback: CriterionFeedback[] = [];
    const strengths: string[] = [];
    const suggestions: string[] = [];

    // 1. Requirements Understanding & Scope
    const hasAssumptions = assumptions.trim().length > 30;
    const mentionsScope = /scope|in-scope|out-of-scope|assume|assumptions/i.test(assumptions);
    let reqScore = hasAssumptions ? (mentionsScope ? 9 : 7) : 4;
    const reqEvidence = hasAssumptions
      ? `Found ${assumptions.split('\n').filter(l => l.trim()).length} assumption lines.`
      : 'Assumptions section is very brief or omitted.';
    const reqConcern = hasAssumptions ? '' : 'Implicit assumptions can lead to mismatched architectural scope.';
    const reqSuggestion = hasAssumptions
      ? 'Ensure you explicitly bound capacity limits and external system dependencies.'
      : 'Clearly list explicit assumptions regarding physical limits, concurrency, and payment integrations.';
    
    criteriaFeedback.push({
      criterionId: 'req_understanding',
      criterionName: 'Requirements & Scope Definition',
      score: reqScore,
      maxScore: 10,
      weight: 15,
      evidence: reqEvidence,
      concern: reqConcern,
      suggestion: reqSuggestion,
      confidence: 'HIGH',
    });

    if (reqScore >= 7) strengths.push('Clear scoping and explicit domain assumptions.');
    else suggestions.push(reqSuggestion);

    // 2. Class Responsibilities & Separation of Concerns
    const classMatches = classCode.match(/class\s+([A-Za-z0-9_]+)/g) || [];
    const classCount = classMatches.length;
    let srpScore = 5;
    let srpEvidence = `Declared ${classCount} distinct classes: ${classMatches.map(c => c.replace('class ', '')).slice(0, 5).join(', ')}`;
    let srpConcern = '';
    let srpSuggestion = '';

    if (classCount >= 4 && classCount <= 12) {
      srpScore = 8;
      strengths.push(`Good decomposition with ${classCount} cohesive classes.`);
      srpSuggestion = 'Keep monitoring God-object tendencies in central coordinator classes.';
    } else if (classCount < 4) {
      srpScore = 4;
      srpConcern = 'Too few classes indicates overloaded responsibilities (God Object anti-pattern).';
      srpSuggestion = 'Decompose complex responsibilities into dedicated domain entities and services.';
    } else {
      srpScore = 6;
      srpConcern = 'Potential over-engineering with too many granular classes.';
      srpSuggestion = 'Group related data and operations to avoid anemic domain models.';
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
      confidence: 'HIGH',
    });

    // 3. Coupling, Encapsulation & Interfaces
    const interfaceMatches = classCode.match(/interface\s+([A-Za-z0-9_]+)|abstract\s+class\s+([A-Za-z0-9_]+)/g) || [];
    const interfaceCount = interfaceMatches.length;
    let coupScore = interfaceCount >= 2 ? 9 : (interfaceCount === 1 ? 7 : 4);
    let coupEvidence = interfaceCount > 0
      ? `Defined ${interfaceCount} abstractions/interfaces: ${interfaceMatches.slice(0, 3).join(', ')}`
      : 'No interfaces or abstract classes found in code skeleton.';
    let coupConcern = interfaceCount === 0 ? 'Tight coupling to concrete classes violates Dependency Inversion.' : '';
    let coupSuggestion = interfaceCount === 0
      ? 'Introduce interfaces for replaceable strategies (e.g. AllocationStrategy, PricingStrategy, SchedulingStrategy).'
      : 'Ensure client classes depend on abstractions rather than concrete implementations.';

    criteriaFeedback.push({
      criterionId: 'coupling_interfaces',
      criterionName: 'Coupling, Encapsulation & Interfaces',
      score: coupScore,
      maxScore: 10,
      weight: 20,
      evidence: coupEvidence,
      concern: coupConcern,
      suggestion: coupSuggestion,
      confidence: 'HIGH',
    });

    if (coupScore >= 7) strengths.push('Polymorphic design utilizing interfaces to invert dependencies.');
    else suggestions.push(coupSuggestion);

    // 4. Design Pattern Appropriateness
    const recognizedPatterns = ['strategy', 'state', 'factory', 'observer', 'singleton', 'command', 'decorator', 'builder'];
    const detectedPatterns = recognizedPatterns.filter(p => new RegExp(`\\b${p}\\b`, 'i').test(patterns + ' ' + classCode));
    let patScore = detectedPatterns.length >= 2 ? 9 : (detectedPatterns.length === 1 ? 7 : 4);
    let patEvidence = detectedPatterns.length > 0
      ? `Referenced patterns: ${detectedPatterns.join(', ')}`
      : 'No recognized design patterns explicitly applied.';
    let patConcern = detectedPatterns.length === 0 ? 'Design may lack flexibility points for varying algorithms or state.' : '';
    let patSuggestion = detectedPatterns.length === 0
      ? 'Evaluate if Strategy Pattern (for algorithms) or State Pattern (for lifecycle) fits the problem.'
      : 'Verify that pattern usage directly addresses requirement variance rather than speculative complexity.';

    criteriaFeedback.push({
      criterionId: 'pattern_usage',
      criterionName: 'Design Pattern Appropriateness',
      score: patScore,
      maxScore: 10,
      weight: 15,
      evidence: patEvidence,
      concern: patConcern,
      suggestion: patSuggestion,
      confidence: 'HIGH',
    });

    if (detectedPatterns.length > 0) strengths.push(`Identified practical design patterns (${detectedPatterns.join(', ')}).`);
    else suggestions.push(patSuggestion);

    // 5. Extensibility
    const hasExtensibility = /extensib|open\/closed|future|add new|pluggable/i.test(rawText);
    let extScore = (interfaceCount >= 2 && hasExtensibility) ? 9 : (interfaceCount >= 1 ? 7 : 5);
    criteriaFeedback.push({
      criterionId: 'extensibility',
      criterionName: 'Extensibility & Evolution (OCP)',
      score: extScore,
      maxScore: 10,
      weight: 15,
      evidence: hasExtensibility ? 'Explicitly discussed extensible design paths.' : 'Implicit extensibility through class structure.',
      concern: extScore < 7 ? 'Adding new types or rules might require modifying existing core classes.' : '',
      suggestion: 'Ensure open-closed principle allows adding new domain subtypes without modifying coordinator logic.',
      confidence: 'MEDIUM',
    });

    // 6. Concurrency & Edge Cases
    const concurrencyTerms = ['lock', 'mutex', 'thread', 'concurrent', 'race condition', 'atomic', 'synchronized', 'transaction', 'reentrant'];
    const detectedConcurrency = concurrencyTerms.filter(t => new RegExp(`\\b${t}\\b`, 'i').test(edgeCases + ' ' + classCode));
    let concScore = detectedConcurrency.length >= 2 ? 9 : (detectedConcurrency.length === 1 ? 7 : 4);
    let concEvidence = detectedConcurrency.length > 0
      ? `Addressed concurrency aspects: ${detectedConcurrency.join(', ')}`
      : 'No concurrency, locking, or race-condition handling discussed.';
    let concConcern = detectedConcurrency.length === 0 ? 'In real-world multi-user execution, simultaneous requests will cause race conditions.' : '';
    let concSuggestion = detectedConcurrency.length === 0
      ? 'Detail how your design handles race conditions (e.g., synchronized slot assignment or optimistic locking).'
      : 'Specify the granularity of locks to avoid bottlenecks under peak load.';

    criteriaFeedback.push({
      criterionId: 'concurrency_edge_cases',
      criterionName: 'Concurrency & Edge Cases',
      score: concScore,
      maxScore: 10,
      weight: 10,
      evidence: concEvidence,
      concern: concConcern,
      suggestion: concSuggestion,
      confidence: 'HIGH',
    });

    if (concScore >= 7) strengths.push('Thoughtful consideration of concurrency and thread safety.');
    else suggestions.push(concSuggestion);

    const overallScore = EvaluationResult.calculateOverallScore(criteriaFeedback);

    return new EvaluationResult(
      `eval-${Date.now()}`,
      submission.id,
      overallScore,
      criteriaFeedback,
      strengths,
      suggestions,
      this.name
    );
  }
}
