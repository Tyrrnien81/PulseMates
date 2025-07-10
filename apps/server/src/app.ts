import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import checkinRoutes from './routes/checkin';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',')
        : [
            'http://localhost:3000',
            'http://localhost:8081',
            'exp://localhost:8081',
          ],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requests
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});
app.use(limiter);

// Request logging
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for TTS audio files (Phase 5)
app.use(
  '/audio',
  express.static(path.join(__dirname, '../uploads/audio'), {
    maxAge: '1h', // Cache for 1 hour
    setHeaders: (res, filePath) => {
      if (path.extname(filePath) === '.mp3') {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
      }
    },
  })
);

// Health check endpoint
app.get('/ping', (_req, res) => {
  res.json({
    pong: true,
    message: 'PulseMates API Server is running!',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'PulseMates API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Voice check-in routes
app.use('/api/checkin', checkinRoutes);

// User creation example endpoint
app.post('/api/users', (req, res) => {
  const userSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email format'),
    age: z.number().min(1).max(120).optional(),
  });

  try {
    const parsed = userSchema.parse(req.body);

    // TODO: Implement actual DB logic
    const newUser = {
      id: Math.floor(Math.random() * 10000),
      ...parsed,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
);

export default app;
