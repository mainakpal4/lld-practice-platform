import { Router, Request, Response } from 'express';
import { IProblemRepository } from '../domain/interfaces/IProblemRepository';
import { PracticeService } from '../services/PracticeService';

export function createRouter(
  problemRepo: IProblemRepository,
  practiceService: PracticeService
): Router {
  const router = Router();

  // List all LLD problems
  router.get('/problems', async (_req: Request, res: Response) => {
    try {
      const problems = await problemRepo.getAll();
      const summaries = problems.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        difficulty: p.difficulty,
        domain: p.domain,
        keyConcepts: p.keyConcepts,
        requirementsCount: p.requirements.length,
      }));
      res.json(summaries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get problem details by ID or slug
  router.get('/problems/:id', async (req: Request, res: Response) => {
    try {
      let problem = await problemRepo.getById(req.params.id);
      if (!problem) {
        problem = await problemRepo.getBySlug(req.params.id);
      }
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json(problem);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Start a new practice attempt
  router.post('/attempts/start', async (req: Request, res: Response) => {
    try {
      const { problemId, learnerId = 'default-learner' } = req.body;
      if (!problemId) {
        return res.status(400).json({ error: 'problemId is required' });
      }
      const attempt = await practiceService.startAttempt(problemId, learnerId);
      res.status(201).json(attempt);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Submit attempt for evaluation (202 Accepted)
  router.post('/attempts/:id/submit', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        assumptions = '',
        classDiagramMermaid = '',
        classSkeletonCode = '',
        designPatterns = '',
        tradeOffsAndEdgeCases = '',
        evaluator = 'composite',
      } = req.body;

      const attempt = await practiceService.submitAttempt(
        id,
        {
          assumptions,
          classDiagramMermaid,
          classSkeletonCode,
          designPatterns,
          tradeOffsAndEdgeCases,
        },
        evaluator
      );

      res.status(202).json({
        message: 'Submission received and queued for evaluation.',
        attemptId: attempt.id,
        status: attempt.status,
      });
    } catch (err: any) {
      const statusCode = err.message.includes('Validation failed') ? 422 : 400;
      res.status(statusCode).json({ error: err.message });
    }
  });

  // Check attempt status & evaluation result
  router.get('/attempts/:id', async (req: Request, res: Response) => {
    try {
      const attempt = await practiceService.getAttempt(req.params.id);
      if (!attempt) {
        return res.status(404).json({ error: 'Attempt not found' });
      }
      res.json(attempt);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Retry evaluation on failure
  router.post('/attempts/:id/retry', async (req: Request, res: Response) => {
    try {
      const attempt = await practiceService.retryEvaluation(req.params.id);
      res.status(202).json({
        message: 'Evaluation retry enqueued.',
        attemptId: attempt.id,
        status: attempt.status,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get attempt history and progression delta for a problem
  router.get('/problems/:problemId/history', async (req: Request, res: Response) => {
    try {
      const { problemId } = req.params;
      const learnerId = (req.query.learnerId as string) || 'default-learner';
      const history = await practiceService.getAttemptHistory(learnerId, problemId);
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
