import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import analyzeRouter from './routes/analyze';
import recommendRouter from './routes/recommend';
import referenceRouter from './routes/reference';
import logger from './utils/logger';

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fasalrakshak';

const app = express();

// ---------------------------------------------------------------------------
// Security Middleware
// ---------------------------------------------------------------------------

// CORS — must come before helmet so preflight OPTIONS are handled first
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

// Helmet — set security headers (configured to allow cross-origin API access)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
  contentSecurityPolicy: false,  // CSP handled by frontend meta tags
}));

// Rate limiting — 100 requests per 15 minutes per IP on /api/ routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests',
    retryAfter: 900, // seconds in the window
  },
});
app.use('/api/', apiLimiter);

app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.use('/api/analyze', analyzeRouter);
app.use('/api/recommend', recommendRouter);
app.use('/api', referenceRouter);

// ---------------------------------------------------------------------------
// Health check — pings MongoDB, Open-Meteo, and checks Gemini API key
// ---------------------------------------------------------------------------

interface ServiceHealth {
  status: 'ok' | 'degraded' | 'down';
  latencyMs: number;
}

app.get('/api/health', async (_req, res) => {
  const services: Record<string, ServiceHealth> = {};

  // 1. MongoDB
  const mongoStart = Date.now();
  const mongoReady = mongoose.connection.readyState === 1;
  services.mongodb = {
    status: mongoReady ? 'ok' : 'down',
    latencyMs: Date.now() - mongoStart,
  };

  // 2. Open-Meteo — quick probe with a 3-second timeout
  const meteoStart = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const meteoRes = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=15&longitude=75&current=temperature_2m',
      { signal: controller.signal },
    );
    clearTimeout(timeout);
    services.openMeteo = {
      status: meteoRes.ok ? 'ok' : 'degraded',
      latencyMs: Date.now() - meteoStart,
    };
  } catch {
    services.openMeteo = {
      status: 'down',
      latencyMs: Date.now() - meteoStart,
    };
  }

  // 3. AI API key check (Gemini or Groq — presence only, no network call)
  const hasAiKey = !!(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY);
  services.ai = {
    status: hasAiKey ? 'ok' : 'down',
    latencyMs: 0,
  };

  const overallStatus = Object.values(services).every(s => s.status === 'ok')
    ? 'ok'
    : Object.values(services).some(s => s.status === 'down')
      ? 'degraded'
      : 'ok';

  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services,
  });
});

// ---------------------------------------------------------------------------
// Database & Start
// ---------------------------------------------------------------------------

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
