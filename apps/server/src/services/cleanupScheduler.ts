import { OptimizedCoachingService } from './optimizedCoachingService';
import { DatabaseService } from './databaseService';

export class CleanupScheduler {
  private optimizedCoachingService: OptimizedCoachingService;
  private databaseService: DatabaseService;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly intervalMs: number;

  constructor(intervalMinutes: number = 30) {
    this.optimizedCoachingService = new OptimizedCoachingService();
    this.databaseService = new DatabaseService();
    this.intervalMs = intervalMinutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Start automated cleanup scheduler
   */
  start(): void {
    if (this.cleanupInterval) {
      console.log('🧹 Cleanup scheduler already running');
      return;
    }

    console.log(
      `🧹 Starting cleanup scheduler (every ${this.intervalMs / 60000} minutes)`
    );

    // Run initial cleanup
    this.runCleanupTasks();

    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.runCleanupTasks();
    }, this.intervalMs);

    console.log('✅ Cleanup scheduler started');
  }

  /**
   * Stop cleanup scheduler
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('🛑 Cleanup scheduler stopped');
    }
  }

  /**
   * Run all cleanup tasks
   */
  private async runCleanupTasks(): Promise<void> {
    const startTime = Date.now();
    console.log('🧹 Starting automated cleanup tasks...');

    try {
      // Task 1: Clean up expired TTS sessions
      const ttsCleanupResult =
        await this.optimizedCoachingService.cleanupExpiredTTSSessions();
      console.log(
        `   🗑️ TTS cleanup: ${ttsCleanupResult.filesCleanedUp} files, ${ttsCleanupResult.sessionsMarked} sessions`
      );

      // Task 2: Clean up old stress logs (keep 30 days)
      const stressLogsCleanup =
        await this.databaseService.cleanupOldEntries(30);
      console.log(
        `   📊 Stress logs cleanup: ${stressLogsCleanup} old entries removed`
      );

      // Task 3: Clean up old coaching sessions (keep 24 hours)
      const coachingSessionsCleanup =
        await this.databaseService.cleanupOldCoachingSessions(24);
      console.log(
        `   🎙️ Coaching sessions cleanup: ${coachingSessionsCleanup} old sessions removed`
      );

      const elapsedTime = Date.now() - startTime;
      console.log(`✅ Automated cleanup completed in ${elapsedTime}ms`);
    } catch (error) {
      console.error('❌ Automated cleanup failed:', error);
    }
  }

  /**
   * Manual cleanup trigger for immediate execution
   */
  async runManualCleanup(): Promise<{
    ttsCleanup: { filesCleanedUp: number; sessionsMarked: number };
    stressLogsCleanup: number;
    coachingSessionsCleanup: number;
    processingTime: number;
  }> {
    const startTime = Date.now();
    console.log('🧹 Running manual cleanup...');

    try {
      const ttsCleanup =
        await this.optimizedCoachingService.cleanupExpiredTTSSessions();
      const stressLogsCleanup =
        await this.databaseService.cleanupOldEntries(30);
      const coachingSessionsCleanup =
        await this.databaseService.cleanupOldCoachingSessions(24);

      const processingTime = Date.now() - startTime;

      console.log(`✅ Manual cleanup completed in ${processingTime}ms`);

      return {
        ttsCleanup,
        stressLogsCleanup,
        coachingSessionsCleanup,
        processingTime,
      };
    } catch (error) {
      console.error('❌ Manual cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Get cleanup scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    intervalMinutes: number;
    nextRunTime?: Date;
  } {
    const isRunning = this.cleanupInterval !== null;
    const intervalMinutes = this.intervalMs / 60000;

    const status: {
      isRunning: boolean;
      intervalMinutes: number;
      nextRunTime?: Date;
    } = {
      isRunning,
      intervalMinutes,
    };

    if (isRunning) {
      status.nextRunTime = new Date(Date.now() + this.intervalMs);
    }

    return status;
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🧹 Shutting down cleanup scheduler...');

    this.stop();

    // Run final cleanup
    await this.runCleanupTasks();

    // Disconnect database
    await this.databaseService.disconnect();

    console.log('✅ Cleanup scheduler shutdown completed');
  }
}
