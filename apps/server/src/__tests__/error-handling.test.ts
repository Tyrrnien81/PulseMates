import request from 'supertest';
import app from '../app';

describe('Error Handling', () => {
  describe('Global Error Handler', () => {
    it('should handle 404 errors for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });

    it('should handle 404 errors for non-existent API routes', async () => {
      const response = await request(app).get('/api/non-existent').expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });

  describe('Validation Error Handling', () => {
    it('should return structured validation errors', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: '', email: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
      expect(response.body.details.length).toBeGreaterThan(0);
    });

    it('should include specific field errors', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: expect.arrayContaining(['name']),
          }),
          expect.objectContaining({
            path: expect.arrayContaining(['email']),
          }),
        ])
      );
    });
  });

  describe('Content Type Handling', () => {
    it('should handle unsupported content types gracefully', async () => {
      const response = await request(app)
        .post('/api/users')
        .send('plain text data')
        .set('Content-Type', 'text/plain')
        .expect(400);

      // Express should reject unsupported content types
      expect(response.status).toBe(400);
    });
  });

  describe('Request Size Limits', () => {
    it('should handle normal-sized requests', async () => {
      const normalData = {
        name: 'Test User',
        email: 'test@example.com',
        description: 'A'.repeat(1000), // 1KB description
      };

      await request(app).post('/api/users').send(normalData).expect(201);
    });

    // Note: Testing actual payload size limits would require very large payloads
    // and might timeout in test environment
  });

  describe('Method Not Allowed', () => {
    it('should handle unsupported HTTP methods gracefully', async () => {
      // Try PATCH on an endpoint that only supports GET
      const response = await request(app).patch('/ping').expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });

    it('should handle DELETE on non-DELETE endpoints', async () => {
      const response = await request(app).delete('/api/health').expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});
