import { ISubmissionContent, ValidationReport } from '../interfaces/ISubmissionContent';

export class Submission {
  public readonly id: string;
  public readonly attemptId: string;
  public readonly content: ISubmissionContent;
  public readonly submittedAt: Date;

  constructor(id: string, attemptId: string, content: ISubmissionContent, submittedAt: Date = new Date()) {
    this.id = id;
    this.attemptId = attemptId;
    this.content = content;
    this.submittedAt = submittedAt;
  }

  public validate(): ValidationReport {
    return this.content.validate();
  }
}
