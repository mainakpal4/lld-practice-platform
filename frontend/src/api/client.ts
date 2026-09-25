import {
  ProblemSummary,
  ProblemDetail,
  Attempt,
  SubmissionPayload,
  AttemptProgressionReport,
} from '../types';

const API_BASE = '/api';

export const api = {
  async getProblems(): Promise<ProblemSummary[]> {
    const res = await fetch(`${API_BASE}/problems`);
    if (!res.ok) throw new Error('Failed to load problems');
    return res.json();
  },

  async getProblem(id: string): Promise<ProblemDetail> {
    const res = await fetch(`${API_BASE}/problems/${id}`);
    if (!res.ok) throw new Error('Failed to load problem details');
    return res.json();
  },

  async startAttempt(problemId: string, learnerId: string = 'default-learner'): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/attempts/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId, learnerId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to start attempt');
    }
    return res.json();
  },

  async submitAttempt(
    attemptId: string,
    payload: SubmissionPayload
  ): Promise<{ message: string; attemptId: string; status: string }> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit attempt');
    }
    return res.json();
  },

  async getAttempt(attemptId: string): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}`);
    if (!res.ok) throw new Error('Failed to fetch attempt');
    return res.json();
  },

  async retryAttempt(attemptId: string): Promise<{ message: string; attemptId: string; status: string }> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/retry`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to retry attempt');
    }
    return res.json();
  },

  async getProblemHistory(
    problemId: string,
    learnerId: string = 'default-learner'
  ): Promise<AttemptProgressionReport[]> {
    const res = await fetch(`${API_BASE}/problems/${problemId}/history?learnerId=${encodeURIComponent(learnerId)}`);
    if (!res.ok) throw new Error('Failed to fetch attempt history');
    return res.json();
  },
};
