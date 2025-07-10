import path from 'path';
import fs from 'fs';
import { AssemblyAIService } from '../services/assemblyaiService';
import { DatabaseService } from '../services/databaseService';
import { CacheService } from '../services/cacheService';

// Skip these tests by default to avoid API costs during regular testing
// To run these tests: npm test -- --testNamePattern="AssemblyAI Integration"
describe.skip('AssemblyAI Integration Tests', () => {
  let assemblyaiService: AssemblyAIService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;
  const mockAudioFilePath = path.join(__dirname, 'mock-audio-integration.wav');

  beforeAll(async () => {
    // Create services
    assemblyaiService = new AssemblyAIService();
    databaseService = new DatabaseService();
    cacheService = new CacheService();

    // Create a larger mock audio file for realistic testing
    const mockWavContent = Buffer.from([
      0x52,
      0x49,
      0x46,
      0x46, // "RIFF"
      0x24,
      0x08,
      0x00,
      0x00, // File size (larger)
      0x57,
      0x41,
      0x56,
      0x45, // "WAVE"
      0x66,
      0x6d,
      0x74,
      0x20, // "fmt "
      0x10,
      0x00,
      0x00,
      0x00, // Chunk size
      0x01,
      0x00,
      0x01,
      0x00, // Audio format and channels
      0x44,
      0xac,
      0x00,
      0x00, // Sample rate (44100)
      0x88,
      0x58,
      0x01,
      0x00, // Byte rate
      0x02,
      0x00,
      0x10,
      0x00, // Block align and bits per sample
      0x64,
      0x61,
      0x74,
      0x61, // "data"
      0x00,
      0x08,
      0x00,
      0x00, // Data size
      // Add some sample data
      ...Array(2048)
        .fill(0)
        .map(() => Math.floor(Math.random() * 256)),
    ]);

    fs.writeFileSync(mockAudioFilePath, mockWavContent);
  });

  afterAll(async () => {
    // Clean up
    if (fs.existsSync(mockAudioFilePath)) {
      fs.unlinkSync(mockAudioFilePath);
    }
    await databaseService.disconnect();
  });

  it('should successfully connect to AssemblyAI API', async () => {
    const isHealthy = await assemblyaiService.healthCheck();
    expect(isHealthy).toBe(true);
  }, 10000);

  it('should transcribe audio and analyze sentiment', async () => {
    const result =
      await assemblyaiService.transcribeWithSentiment(mockAudioFilePath);

    // Validate structure
    expect(result).toBeDefined();
    expect(result.transcript).toBeDefined();
    expect(typeof result.transcript).toBe('string');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.processingTime).toBeGreaterThan(0);

    // Validate sentiment
    expect(result.sentiment).toBeDefined();
    expect(result.sentiment.score).toBeGreaterThanOrEqual(0);
    expect(result.sentiment.score).toBeLessThanOrEqual(1);
    expect(['positive', 'negative', 'neutral']).toContain(
      result.sentiment.label
    );
    expect(result.sentiment.confidence).toBeGreaterThanOrEqual(0);
    expect(result.sentiment.confidence).toBeLessThanOrEqual(1);

    console.log('AssemblyAI Result:', {
      transcript: result.transcript.substring(0, 100) + '...',
      sentiment: result.sentiment,
      processingTime: result.processingTime,
    });
  }, 30000); // 30 second timeout for API calls

  it('should handle database logging correctly', async () => {
    const sessionId = 'test-session-' + Date.now();
    const mockSentiment = {
      score: 0.75,
      label: 'positive' as const,
      confidence: 0.95,
    };

    // Test logging
    await expect(
      databaseService.logSentimentData(sessionId, mockSentiment)
    ).resolves.not.toThrow();

    // Test retrieval (if we can access the data)
    const stats = await databaseService.getSentimentStats(1); // Last 1 hour
    expect(stats.total).toBeGreaterThanOrEqual(1);
  }, 15000);

  it('should implement caching correctly', async () => {
    // First call - should hit API
    const result1 = await cacheService.getCachedResult(mockAudioFilePath);
    expect(result1).toBeNull(); // No cache initially

    // Mock a result and cache it
    const mockResult = {
      transcript: 'This is a test transcript',
      confidence: 0.95,
      sentiment: {
        score: 0.6,
        label: 'neutral' as const,
        confidence: 0.85,
      },
      processingTime: 2000,
    };

    await cacheService.setCachedResult(mockAudioFilePath, mockResult);

    // Second call - should hit cache
    const result2 = await cacheService.getCachedResult(mockAudioFilePath);
    expect(result2).toEqual(mockResult);

    // Verify cache stats
    const stats = cacheService.getCacheStats();
    expect(stats.totalEntries).toBeGreaterThanOrEqual(1);
  }, 10000);

  it('should handle API errors gracefully with retry logic', async () => {
    // Create an invalid service with wrong API key
    const invalidService = new AssemblyAIService();
    // Override the API key to simulate failure
    (invalidService as any).client = {
      transcripts: {
        transcribe: jest.fn().mockRejectedValue(new Error('API Error')),
      },
    };

    await expect(
      invalidService.transcribeWithSentiment(mockAudioFilePath)
    ).rejects.toThrow('AssemblyAI service error');
  }, 15000);

  it('should manage service costs effectively', async () => {
    const serviceInfo = assemblyaiService.getServiceInfo();

    expect(serviceInfo.provider).toBe('AssemblyAI');
    expect(serviceInfo.features).toContain('transcription');
    expect(serviceInfo.features).toContain('sentiment_analysis');

    // Cache should reduce API calls
    const cacheStats = cacheService.getCacheStats();
    console.log('Cache efficiency:', {
      totalEntries: cacheStats.totalEntries,
      memoryUsage: cacheStats.memoryUsage,
    });

    // Clean up cache for next test
    cacheService.clearCache();
  });

  it('should perform end-to-end pipeline test', async () => {
    const sessionId = 'e2e-test-' + Date.now();

    try {
      // 1. Check cache (should be empty after clear)
      let result = await cacheService.getCachedResult(mockAudioFilePath);
      expect(result).toBeNull();

      // 2. Call real API
      result =
        await assemblyaiService.transcribeWithSentiment(mockAudioFilePath);
      expect(result).toBeDefined();

      // 3. Cache the result
      await cacheService.setCachedResult(mockAudioFilePath, result);

      // 4. Log to database
      await databaseService.logSentimentData(sessionId, result.sentiment);

      // 5. Verify cache hit on second call
      const cachedResult =
        await cacheService.getCachedResult(mockAudioFilePath);
      expect(cachedResult).toEqual(result);

      console.log('E2E Test Success:', {
        sessionId,
        transcriptLength: result.transcript.length,
        sentiment: result.sentiment.label,
        cached: true,
      });
    } catch (error) {
      console.error('E2E Test Error:', error);
      throw error;
    }
  }, 45000); // Extended timeout for full pipeline
});

// Separate test suite for database-only tests (always run)
describe('Database Integration Tests', () => {
  let databaseService: DatabaseService;

  beforeAll(() => {
    databaseService = new DatabaseService();
  });

  afterAll(async () => {
    await databaseService.disconnect();
  });

  it('should connect to database successfully', async () => {
    const isHealthy = await databaseService.healthCheck();
    expect(isHealthy).toBe(true);
  });

  it('should handle sentiment logging and retrieval', async () => {
    const sessionId = 'db-test-' + Date.now();
    const testSentiment = {
      score: 0.3,
      label: 'negative' as const,
      confidence: 0.9,
    };

    // Log sentiment
    await expect(
      databaseService.logSentimentData(sessionId, testSentiment)
    ).resolves.not.toThrow();

    // Get stats
    const stats = await databaseService.getSentimentStats(24);
    expect(stats.total).toBeGreaterThanOrEqual(1);
    expect(stats.negative).toBeGreaterThanOrEqual(1);
  });
});
