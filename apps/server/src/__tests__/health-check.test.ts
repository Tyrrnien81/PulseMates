import request from 'supertest';
import app from '../app';

describe('Health Check Endpoints', () => {
  describe('GET /ping', () => {
    it('should return pong with success message', async () => {
      const response = await request(app).get('/ping').expect(200);

      expect(response.body).toHaveProperty('pong', true);
      expect(response.body).toHaveProperty(
        'message',
        'PulseMates API Server is running!'
      );
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should respond within reasonable time', async () => {
      const start = Date.now();
      await request(app).get('/ping').expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // Should respond in under 100ms
    });
  });

  describe('GET /api/health', () => {
    it('should return detailed health status', async () => {
      const response = await request(app).get('/api/health').expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'PulseMates API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should return correct content type', async () => {
      await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });
});
