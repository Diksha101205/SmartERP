import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found-handler.js';
import authRoutes from './routes/auth-routes.js';
import companyRoutes from './routes/company-routes.js';
import groupRoutes from './routes/group-routes.js';
import healthRoutes from './routes/health-routes.js';
import ledgerRoutes from './routes/ledger-routes.js';
import stockRoutes from './routes/stock-routes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/companies/:companyId/groups', groupRoutes);
  app.use('/api/companies/:companyId/ledgers', ledgerRoutes);
  app.use('/api/companies/:companyId/stock', stockRoutes);
  app.use('/api/companies', companyRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
