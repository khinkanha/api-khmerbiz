import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { Model } from 'objection';
import Knex from 'knex';
import { knexConfig } from './config/database';
import routes from './routes';
import { errorHandler } from './middleware/error-handler';
import { domainScope } from './middleware/domain-scope';
import { config } from './config/index';

export function createApp() {
  const app = express();

  // Initialize Knex + Objection
  const knex = Knex(knexConfig);
  Model.knex(knex);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: config.isDev ? false : undefined,
    crossOriginEmbedderPolicy: false,
  }));

  // Compression
  app.use(compression());

  // CORS
  app.use(cors({
    origin: true, // Allow all in development; restrict in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Forwarded-Host'],
    credentials: true,
    maxAge: 86400,
  }));

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));

  // Domain resolution middleware
  app.use(domainScope);

  // API routes
  app.use('/api/v1', routes);

  // 404 handler
  app.use('/api', (_req, res) => {
    res.status(404).json({ status: false, message: 'Endpoint not found' });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
