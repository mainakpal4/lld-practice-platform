export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export type SubmissionFormatType = 'STRUCTURED_TEXT' | 'DIAGRAM' | 'HYBRID';

export interface ISubmissionContent {
  readonly format: SubmissionFormatType;
  
  validate(): ValidationReport;
  getAssumptions(): string;
  getClassDiagramMermaid(): string;
  getClassSkeletonCode(): string;
  getDesignPatterns(): string;
  getTradeOffsAndEdgeCases(): string;
  getRawText(): string;
  getSummary(): string;
}

export interface StructuredTextPayload {
  assumptions: string;
  classDiagramMermaid: string;
  classSkeletonCode: string;
  designPatterns: string;
  tradeOffsAndEdgeCases: string;
}

export class StructuredTextSubmissionContent implements ISubmissionContent {
  public readonly format: SubmissionFormatType = 'STRUCTURED_TEXT';

  constructor(private readonly payload: StructuredTextPayload) {}

  public validate(): ValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.payload.assumptions || this.payload.assumptions.trim().length < 10) {
      errors.push('Assumptions & Scope must be provided (at least 10 characters).');
    }

    if (!this.payload.classSkeletonCode || this.payload.classSkeletonCode.trim().length < 20) {
      errors.push('Class and interface structure must be provided (at least 20 characters).');
    }

    if (!this.payload.designPatterns || this.payload.designPatterns.trim().length < 5) {
      warnings.push('Design patterns and architectural rationale are sparse.');
    }

    if (!this.payload.tradeOffsAndEdgeCases || this.payload.tradeOffsAndEdgeCases.trim().length < 10) {
      warnings.push('Edge cases and trade-offs section is very brief.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public getAssumptions(): string {
    return this.payload.assumptions;
  }

  public getClassDiagramMermaid(): string {
    return this.payload.classDiagramMermaid;
  }

  public getClassSkeletonCode(): string {
    return this.payload.classSkeletonCode;
  }

  public getDesignPatterns(): string {
    return this.payload.designPatterns;
  }

  public getTradeOffsAndEdgeCases(): string {
    return this.payload.tradeOffsAndEdgeCases;
  }

  public getRawText(): string {
    return `### Assumptions & Scope:\n${this.payload.assumptions}\n\n` +
      `### Class Diagram (Mermaid):\n${this.payload.classDiagramMermaid}\n\n` +
      `### Classes & Interfaces:\n${this.payload.classSkeletonCode}\n\n` +
      `### Design Patterns & Justification:\n${this.payload.designPatterns}\n\n` +
      `### Trade-offs & Edge Cases:\n${this.payload.tradeOffsAndEdgeCases}`;
  }

  public getSummary(): string {
    return `Structured Submission (${this.payload.classSkeletonCode.split('\n').length} lines of code/definitions)`;
  }
}
