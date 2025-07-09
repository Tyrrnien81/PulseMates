import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

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

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PulseMates API Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/ping`);
  console.log(`🔗 API docs: http://localhost:${PORT}/api/health`);
});

export default app;
