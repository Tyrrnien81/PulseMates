import app from './app';
import { CleanupScheduler } from './services/cleanupScheduler';

const PORT = process.env.PORT || 4000;

// Initialize cleanup scheduler (Phase 5)
const cleanupScheduler = new CleanupScheduler(30); // Run every 30 minutes

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 PulseMates API Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/ping`);
  console.log(`🔗 API docs: http://localhost:${PORT}/api/health`);

  // Start cleanup scheduler
  cleanupScheduler.start();
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\n📶 Received ${signal}. Starting graceful shutdown...`);

  try {
    // Stop accepting new connections
    server.close(async () => {
      console.log('🔌 HTTP server closed');

      // Shutdown cleanup scheduler
      await cleanupScheduler.shutdown();

      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    });

    // Force shutdown if graceful shutdown takes too long
    setTimeout(() => {
      console.error('❌ Graceful shutdown timeout. Forcing exit...');
      process.exit(1);
    }, 10000); // 10 seconds timeout
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle various termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});
