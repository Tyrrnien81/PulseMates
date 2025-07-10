import { PrismaClient } from '@prisma/client';
import { SentimentResult } from '../types';

export interface StressLogEntry {
  id: number;
  uuid: string;
  score: number;
  label: string;
  createdAt: Date;
}

export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Log sentiment data anonymously to the stress_logs table
   */
  async logSentimentData(
    sessionId: string,
    sentiment: SentimentResult
  ): Promise<void> {
    try {
      console.log(`📊 Logging sentiment data for session: ${sessionId}`);

      await this.prisma.stressLog.create({
        data: {
          uuid: sessionId,
          score: sentiment.score,
          label: sentiment.label,
        },
      });

      console.log(
        `✅ Sentiment data logged successfully: ${sentiment.label} (${sentiment.score})`
      );
    } catch (error) {
      console.error(`❌ Failed to log sentiment data:`, error);
      throw new Error(
        `Database logging failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get recent sentiment statistics (for analytics)
   */
  async getSentimentStats(hours: number = 24): Promise<{
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    averageScore: number;
  }> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);

      const logs = await this.prisma.stressLog.findMany({
        where: {
          createdAt: {
            gte: since,
          },
        },
      });

      const stats = {
        total: logs.length,
        positive: logs.filter((log: StressLogEntry) => log.label === 'positive')
          .length,
        negative: logs.filter((log: StressLogEntry) => log.label === 'negative')
          .length,
        neutral: logs.filter((log: StressLogEntry) => log.label === 'neutral')
          .length,
        averageScore:
          logs.length > 0
            ? logs.reduce(
                (sum: number, log: StressLogEntry) => sum + log.score,
                0
              ) / logs.length
            : 0,
      };

      return stats;
    } catch (error) {
      console.error(`❌ Failed to get sentiment stats:`, error);
      throw new Error(
        `Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check database connection health
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Clean up old entries (data retention)
   */
  async cleanupOldEntries(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date(
        Date.now() - daysToKeep * 24 * 60 * 60 * 1000
      );

      const result = await this.prisma.stressLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      console.log(`🧹 Cleaned up ${result.count} old sentiment logs`);
      return result.count;
    } catch (error) {
      console.error(`❌ Failed to cleanup old entries:`, error);
      throw new Error(
        `Database cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Close database connection
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
