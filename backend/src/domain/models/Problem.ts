import { Rubric } from './Rubric';
import { StructuredTextPayload } from '../interfaces/ISubmissionContent';

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Requirement {
  id: string;
  text: string;
  type: 'FUNCTIONAL' | 'NON_FUNCTIONAL';
}

export class Problem {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly difficulty: Difficulty,
    public readonly domain: string,
    public readonly requirements: Requirement[],
    public readonly rubric: Rubric,
    public readonly starterTemplate: StructuredTextPayload,
    public readonly keyConcepts: string[]
  ) {}

  public getFunctionalRequirements(): Requirement[] {
    return this.requirements.filter(r => r.type === 'FUNCTIONAL');
  }

  public getNonFunctionalRequirements(): Requirement[] {
    return this.requirements.filter(r => r.type === 'NON_FUNCTIONAL');
  }
}
