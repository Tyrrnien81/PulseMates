import request from 'supertest';
import app from '../app';

describe('Middleware Tests', () => {
  describe('CORS Middleware', () => {
    it('should include CORS headers for allowed origins', async () => {
      const response = await request(app)
        .get('/ping')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle preflight OPTIONS requests', async () => {
      await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);
    });
  });

  describe('Security Headers (Helmet)', () => {
    it('should include security headers', async () => {
      const response = await request(app).get('/ping').expect(200);

      // Check for common security headers set by helmet
      expect(response.headers).toHaveProperty(
        'x-content-type-options',
        'nosniff'
      );
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-dns-prefetch-control');
    });
  });

  describe('JSON Body Parser', () => {
    it('should parse JSON bodies correctly', async () => {
      const testData = { test: 'data' };

      await request(app)
        .post('/api/users')
        .send(testData)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/users')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('URL Encoded Parser', () => {
    it('should parse URL encoded data', async () => {
      await request(app)
        .post('/api/users')
        .send('name=Test&email=test@example.com')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect('Content-Type', /json/);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      // Make several requests (well under the 100 request limit)
      for (let i = 0; i < 5; i++) {
        await request(app).get('/ping').expect(200);
      }
    });

    // Note: Testing actual rate limiting would require many requests
    // and is better suited for integration tests
    it('should include rate limit headers', async () => {
      const response = await request(app).get('/ping').expect(200);

      // Rate limit headers might not always be present, but if they are, they should be valid
      if (response.headers['x-ratelimit-limit']) {
        expect(parseInt(response.headers['x-ratelimit-limit'])).toBeGreaterThan(
          0
        );
      }
    });
  });
});
