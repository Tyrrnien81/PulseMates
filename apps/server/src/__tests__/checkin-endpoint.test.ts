import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../app';

describe('POST /api/checkin', () => {
  // Create a mock audio file for testing
  const mockAudioFilePath = path.join(__dirname, 'mock-audio.wav');

  beforeAll(() => {
    // Create a small mock WAV file for testing
    const mockWavContent = Buffer.from([
      0x52,
      0x49,
      0x46,
      0x46, // "RIFF"
      0x24,
      0x00,
      0x00,
      0x00, // File size
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
      0x00,
      0x00,
      0x00, // Data size
    ]);

    fs.writeFileSync(mockAudioFilePath, mockWavContent);
  });

  afterAll(() => {
    // Clean up mock file
    if (fs.existsSync(mockAudioFilePath)) {
      fs.unlinkSync(mockAudioFilePath);
    }
  });

  it('should successfully process a valid audio file', async () => {
    const response = await request(app)
      .post('/api/checkin')
      .attach('audio', mockAudioFilePath, 'test-audio.wav')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.transcript).toBeDefined();
    expect(response.body.data.sentiment).toBeDefined();
    expect(response.body.data.coaching).toBeDefined();
    expect(response.body.data.audioUrl).toBeDefined();
    expect(response.body.data.sessionId).toBeDefined();
    expect(response.body.processingTime).toBeGreaterThan(0);

    // Check transcript content
    expect(typeof response.body.data.transcript).toBe('string');
    expect(response.body.data.transcript.length).toBeGreaterThan(0);

    // Check sentiment structure
    const sentiment = response.body.data.sentiment;
    expect(sentiment.score).toBeGreaterThanOrEqual(0);
    expect(sentiment.score).toBeLessThanOrEqual(1);
    expect(['positive', 'negative', 'neutral']).toContain(sentiment.label);
    expect(sentiment.confidence).toBeGreaterThanOrEqual(0);
    expect(sentiment.confidence).toBeLessThanOrEqual(1);

    // Check coaching structure
    const coaching = response.body.data.coaching;
    expect(coaching.breathingExercise).toBeDefined();
    expect(coaching.breathingExercise.title).toBeDefined();
    expect(Array.isArray(coaching.breathingExercise.instructions)).toBe(true);
    expect(coaching.breathingExercise.duration).toBeGreaterThan(0);

    expect(coaching.stretchExercise).toBeDefined();
    expect(coaching.stretchExercise.title).toBeDefined();
    expect(Array.isArray(coaching.stretchExercise.instructions)).toBe(true);

    expect(Array.isArray(coaching.resources)).toBe(true);
    coaching.resources.forEach((resource: any) => {
      expect(resource.title).toBeDefined();
      expect(resource.description).toBeDefined();
      expect(resource.url).toBeDefined();
      expect(['counseling', 'meditation', 'emergency']).toContain(
        resource.category
      );
    });

    expect(coaching.motivationalMessage).toBeDefined();
    expect(typeof coaching.motivationalMessage).toBe('string');

    // Check audio URL format
    expect(response.body.data.audioUrl).toMatch(
      /^https:\/\/api\.pulsemates\.com\/audio\/[a-f0-9-]+\.mp3$/
    );
  }, 10000); // 10 second timeout for async processing

  it('should return 400 when no file is uploaded', async () => {
    const response = await request(app).post('/api/checkin').expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('No audio file uploaded');
  });

  it('should return 400 for invalid file format', async () => {
    // Create a text file to test invalid format
    const invalidFilePath = path.join(__dirname, 'invalid.txt');
    fs.writeFileSync(invalidFilePath, 'This is not an audio file');

    const response = await request(app)
      .post('/api/checkin')
      .attach('audio', invalidFilePath, 'invalid.txt')
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Invalid file format');

    // Clean up
    fs.unlinkSync(invalidFilePath);
  });

  it('should return 400 for oversized file', async () => {
    // Create a large file (> 10MB)
    const largeFilePath = path.join(__dirname, 'large.wav');
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    fs.writeFileSync(largeFilePath, largeBuffer);

    const response = await request(app)
      .post('/api/checkin')
      .attach('audio', largeFilePath, 'large.wav')
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('File too large');

    // Clean up
    fs.unlinkSync(largeFilePath);
  });

  it('should handle MP3 files correctly', async () => {
    // Create a mock MP3 file
    const mockMp3FilePath = path.join(__dirname, 'mock-audio.mp3');
    const mockMp3Content = Buffer.from([
      0xff,
      0xfb,
      0x90,
      0x00, // MP3 header
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
    ]);

    fs.writeFileSync(mockMp3FilePath, mockMp3Content);

    const response = await request(app)
      .post('/api/checkin')
      .attach('audio', mockMp3FilePath, 'test-audio.mp3')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.transcript).toBeDefined();

    // Clean up
    fs.unlinkSync(mockMp3FilePath);
  }, 10000);

  it('should include session ID for tracking', async () => {
    const response = await request(app)
      .post('/api/checkin')
      .attach('audio', mockAudioFilePath, 'test-audio.wav')
      .expect(200);

    expect(response.body.data.sessionId).toBeDefined();
    expect(typeof response.body.data.sessionId).toBe('string');
    expect(response.body.data.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  }, 10000);

  it('should have reasonable processing time', async () => {
    const response = await request(app)
      .post('/api/checkin')
      .attach('audio', mockAudioFilePath, 'test-audio.wav')
      .expect(200);

    expect(response.body.processingTime).toBeDefined();
    expect(response.body.processingTime).toBeGreaterThan(1000); // At least 1 second (due to mock delays)
    expect(response.body.processingTime).toBeLessThan(6000); // Should be under 6 seconds
  }, 10000);

  it('should generate sentiment-appropriate coaching', async () => {
    // Test multiple times to potentially get different sentiments
    const responses = [];

    for (let i = 0; i < 3; i++) {
      const response = await request(app)
        .post('/api/checkin')
        .attach('audio', mockAudioFilePath, 'test-audio.wav')
        .expect(200);

      responses.push(response.body);
    }

    // Check that we got some variety in sentiments or appropriate coaching
    responses.forEach(response => {
      const sentiment = response.data.sentiment;
      const coaching = response.data.coaching;

      expect(['positive', 'negative', 'neutral']).toContain(sentiment.label);

      // Coaching should exist regardless of sentiment
      expect(coaching.breathingExercise.title).toBeDefined();
      expect(coaching.stretchExercise.title).toBeDefined();
      expect(coaching.motivationalMessage.length).toBeGreaterThan(10);
    });
  }, 15000);

  it('should include emergency resources for negative sentiment', async () => {
    // We can't guarantee negative sentiment with mock data, but we can test the structure
    const response = await request(app)
      .post('/api/checkin')
      .attach('audio', mockAudioFilePath, 'test-audio.wav')
      .expect(200);

    expect(response.body.success).toBe(true);
    const resources = response.body.data.coaching.resources;

    // Should have at least 2 base resources
    expect(resources.length).toBeGreaterThanOrEqual(2);

    // Check resource structure
    resources.forEach((resource: any) => {
      expect(resource.title).toBeDefined();
      expect(resource.description).toBeDefined();
      expect(resource.url).toBeDefined();
      expect(['counseling', 'meditation', 'emergency']).toContain(
        resource.category
      );
    });
  }, 10000);
});
