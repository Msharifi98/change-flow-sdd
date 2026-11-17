import request from 'supertest';
import app from '../../src/routes';

describe('Request API Contract', () => {
  let userId: string;

  beforeAll(async () => {
    userId = 'user-alice';
  });

  describe('POST /api/requests', () => {
    it('should return 201 for valid request', async () => {
      const response = await request(app)
        .post('/api/requests')
        .set('X-User-Id', userId)
        .send({
          title: 'Contract Test',
          description: 'Test description',
          reason: 'Test reason',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title', 'Contract Test');
      expect(response.body.data).toHaveProperty('status', 'DRAFT');
      expect(response.body.data).toHaveProperty('version', 1);
      expect(response.body.data).toHaveProperty('createdAt');
    });

    it('should return 401 without auth header', async () => {
      const response = await request(app)
        .post('/api/requests')
        .send({
          title: 'Test',
          description: 'Desc',
          reason: 'Reason',
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/requests')
        .set('X-User-Id', userId)
        .send({ title: 'Test' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/requests/:id/review', () => {
    it('should return 403 for self-approval', async () => {
      // Create and submit a request
      const createResp = await request(app)
        .post('/api/requests')
        .set('X-User-Id', userId)
        .send({ title: 'Test', description: 'Desc', reason: 'Reason' });
      await request(app).post(/api/requests//submit).set('X-User-Id', userId);

      const response = await request(app)
        .post(/api/requests//review)
        .set('X-User-Id', userId)
        .send({ decision: 'APPROVE' });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/requests/:id', () => {
    it('should return 404 for non-existent request', async () => {
      const response = await request(app)
        .get('/api/requests/non-existent')
        .set('X-User-Id', userId);

      expect(response.status).toBe(404);
    });
  });
});


