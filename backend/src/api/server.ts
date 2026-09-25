import express, { Express } from 'express';
import cors from 'cors';
import { InMemoryProblemRepository } from '../infrastructure/InMemoryProblemRepository';
import { InMemoryAttemptRepository } from '../infrastructure/InMemoryAttemptRepository';
import { EvaluationJobRunner } from '../infrastructure/EvaluationJobRunner';
import { PracticeService } from '../services/PracticeService';
import { createRouter } from './routes';

export function createServer(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Dependency Injection Composition Root
  const problemRepo = new InMemoryProblemRepository();
  const attemptRepo = new InMemoryAttemptRepository();
  const jobRunner = new EvaluationJobRunner(attemptRepo, 1200); // 1.2s delay for realistic async evaluation experience
  const practiceService = new PracticeService(problemRepo, attemptRepo, jobRunner);

  app.use('/api', createRouter(problemRepo, practiceService));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}
