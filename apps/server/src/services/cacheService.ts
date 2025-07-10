import crypto from 'crypto';
import fs from 'fs';
import { UnifiedResult } from './assemblyaiService';

interface CacheEntry {
  data: UnifiedResult;
  timestamp: number;
  expiresAt: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly MAX_CACHE_SIZE = 1000; // Maximum number of cached entries

  /**
   * Generate a hash key for an audio file
   */
  private async generateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('error', reject);
      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
    });
  }

  /**
   * Get cached transcription result if available
   */
  async getCachedResult(audioFilePath: string): Promise<UnifiedResult | null> {
    try {
      const fileHash = await this.generateFileHash(audioFilePath);
      const entry = this.cache.get(fileHash);

      if (!entry) {
        return null;
      }

      // Check if cache entry has expired
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(fileHash);
        console.log(
          `🗑️ Expired cache entry removed for hash: ${fileHash.substring(0, 8)}...`
        );
        return null;
      }

      console.log(
        `💾 Cache hit for audio file: ${fileHash.substring(0, 8)}...`
      );
      return entry.data;
    } catch (error) {
      console.error('Error checking cache:', error);
      return null;
    }
  }

  /**
   * Store transcription result in cache
   */
  async setCachedResult(
    audioFilePath: string,
    result: UnifiedResult
  ): Promise<void> {
    try {
      const fileHash = await this.generateFileHash(audioFilePath);

      // Check cache size and evict oldest entries if necessary
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        this.evictOldestEntries(Math.floor(this.MAX_CACHE_SIZE * 0.1)); // Remove 10% of entries
      }

      const entry: CacheEntry = {
        data: result,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.TTL,
      };

      this.cache.set(fileHash, entry);
      console.log(
        `💾 Cached transcription result for hash: ${fileHash.substring(0, 8)}...`
      );
    } catch (error) {
      console.error('Error storing in cache:', error);
    }
  }

  /**
   * Evict oldest cache entries
   */
  private evictOldestEntries(count: number): void {
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    for (let i = 0; i < count && i < entries.length; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
    }

    console.log(`🗑️ Evicted ${count} oldest cache entries`);
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpiredEntries(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`🗑️ Cleaned up ${removedCount} expired cache entries`);
    }

    return removedCount;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalEntries: number;
    memoryUsage: string;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(entry => entry.timestamp);

    const stats: {
      totalEntries: number;
      memoryUsage: string;
      oldestEntry?: Date;
      newestEntry?: Date;
    } = {
      totalEntries: this.cache.size,
      memoryUsage: `${Math.round(JSON.stringify(entries).length / 1024)} KB`,
    };

    if (timestamps.length > 0) {
      stats.oldestEntry = new Date(Math.min(...timestamps));
      stats.newestEntry = new Date(Math.max(...timestamps));
    }

    return stats;
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ Cleared all ${size} cache entries`);
  }

  /**
   * Start periodic cleanup of expired entries
   */
  startPeriodicCleanup(intervalMinutes: number = 60): NodeJS.Timeout {
    const interval = intervalMinutes * 60 * 1000;

    return setInterval(() => {
      this.cleanupExpiredEntries();
    }, interval);
  }
}
