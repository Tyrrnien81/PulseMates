import { PrismaClient } from '@prisma/client';
import { SentimentResult } from '../types';

export interface CoachingSessionEntry {
  id: number;
  sessionId: string;
  ttsText: string;
  audioUrl: string | null;
  audioMetadata: Record<string, unknown> | null;
  voiceConfig: Record<string, unknown> | null;
  processingTime: number | null;
  fileSize: number | null;
  duration: number | null;
  cleanup: boolean;
  createdAt: Date;
  expiresAt: Date;
}

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
   * Create coaching session record with TTS data (Phase 5)
   */
  async createCoachingSession(data: {
    sessionId: string;
    ttsText: string;
    audioUrl?: string;
    audioMetadata?: Record<string, unknown>;
    voiceConfig?: Record<string, unknown>;
    processingTime?: number;
    fileSize?: number;
    duration?: number;
  }): Promise<void> {
    try {
      console.log(`🎙️ Creating coaching session record: ${data.sessionId}`);

      // Set expiration time to 1 hour from now
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await this.prisma.coachingSession.create({
        data: {
          sessionId: data.sessionId,
          ttsText: data.ttsText,
          audioUrl: data.audioUrl || null,
          audioMetadata: data.audioMetadata || null,
          voiceConfig: data.voiceConfig || null,
          processingTime: data.processingTime || null,
          fileSize: data.fileSize || null,
          duration: data.duration || null,
          expiresAt,
        },
      });

      console.log(`✅ Coaching session record created successfully`);
    } catch (error) {
      console.error(`❌ Failed to create coaching session:`, error);
      throw new Error(
        `Coaching session creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get coaching session by sessionId
   */
  async getCoachingSession(
    sessionId: string
  ): Promise<CoachingSessionEntry | null> {
    try {
      const session = await this.prisma.coachingSession.findUnique({
        where: { sessionId },
      });

      return session as CoachingSessionEntry | null;
    } catch (error) {
      console.error(`❌ Failed to get coaching session:`, error);
      throw new Error(
        `Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Mark coaching session file as cleaned up
   */
  async markSessionCleaned(sessionId: string): Promise<void> {
    try {
      await this.prisma.coachingSession.update({
        where: { sessionId },
        data: { cleanup: true },
      });

      console.log(`🧹 Session ${sessionId} marked as cleaned`);
    } catch (error) {
      console.error(`❌ Failed to mark session as cleaned:`, error);
      // Don't throw error for cleanup operations to avoid disrupting main flow
    }
  }

  /**
   * Get expired coaching sessions that need cleanup
   */
  async getExpiredSessions(): Promise<CoachingSessionEntry[]> {
    try {
      const now = new Date();

      const expiredSessions = await this.prisma.coachingSession.findMany({
        where: {
          expiresAt: { lt: now },
          cleanup: false,
        },
      });

      return expiredSessions as CoachingSessionEntry[];
    } catch (error) {
      console.error(`❌ Failed to get expired sessions:`, error);
      return [];
    }
  }

  /**
   * Delete old coaching sessions (data retention)
   */
  async cleanupOldCoachingSessions(hoursToKeep: number = 24): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - hoursToKeep * 60 * 60 * 1000);

      const result = await this.prisma.coachingSession.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
        },
      });

      console.log(`🧹 Cleaned up ${result.count} old coaching sessions`);
      return result.count;
    } catch (error) {
      console.error(`❌ Failed to cleanup old coaching sessions:`, error);
      throw new Error(
        `Coaching session cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get coaching session statistics
   */
  async getCoachingSessionStats(hours: number = 24): Promise<{
    total: number;
    withAudio: number;
    averageProcessingTime: number;
    totalFileSize: number;
    averageDuration: number;
  }> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);

      const sessions = await this.prisma.coachingSession.findMany({
        where: {
          createdAt: { gte: since },
        },
      });

      const withAudio = sessions.filter(
        (s: CoachingSessionEntry) => s.audioUrl
      ).length;
      const totalProcessingTime = sessions
        .filter((s: CoachingSessionEntry) => s.processingTime)
        .reduce(
          (sum: number, s: CoachingSessionEntry) =>
            sum + (s.processingTime || 0),
          0
        );
      const totalFileSize = sessions
        .filter((s: CoachingSessionEntry) => s.fileSize)
        .reduce(
          (sum: number, s: CoachingSessionEntry) => sum + (s.fileSize || 0),
          0
        );
      const totalDuration = sessions
        .filter((s: CoachingSessionEntry) => s.duration)
        .reduce(
          (sum: number, s: CoachingSessionEntry) => sum + (s.duration || 0),
          0
        );

      return {
        total: sessions.length,
        withAudio,
        averageProcessingTime:
          withAudio > 0 ? totalProcessingTime / withAudio : 0,
        totalFileSize,
        averageDuration: withAudio > 0 ? totalDuration / withAudio : 0,
      };
    } catch (error) {
      console.error(`❌ Failed to get coaching session stats:`, error);
      throw new Error(
        `Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
