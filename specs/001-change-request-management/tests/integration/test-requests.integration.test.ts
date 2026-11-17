import request from 'supertest';
import app from '../../src/routes';

describe('Request Controller Integration', () => {
  let userId: string;
  let requestId: string;

  beforeAll(async () => {
    // Create a requester user
    const userResp = await request(app)
      .post('/api/users')
      .send({ username: 'alice', role: 'REQUESTER' });
    // Note: /api/users endpoint is not implemented yet, using mock
    userId = 'user-alice';
  });

  describe('POST /api/requests', () => {
    it('should create a new change request', async () => {
      const response = await request(app)
        .post('/api/requests')
        .set('X-User-Id', userId)
        .send({
          title: 'Test Request',
          description: 'Test description',
          reason: 'Test reason',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Request');
      expect(response.body.data.status).toBe('DRAFT');
      requestId = response.body.data.id;
    });

    it('should reject missing auth header', async () => {
      const response = await request(app)
        .post('/api/requests')
        .send({
          title: 'Test',
          description: 'Desc',
          reason: 'Reason',
        });

      expect(response.status).toBe(401);
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/requests')
        .set('X-User-Id', userId)
        .send({
          title: 'Test',
          // missing description and reason
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/requests/:id/submit', () => {
    it('should submit a draft request', async () => {
      const response = await request(app)
        .post(/api/requests//submit)
        .set('X-User-Id', userId);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('PENDING_REVIEW');
    });

    it('should reject if user is not the requester', async () => {
      const response = await request(app)
        .post(/api/requests//submit)
        .set('X-User-Id', 'user-other');

      expect(response.status).toBe(403);
    });

    it('should reject if request is not in DRAFT', async () => {
      // First submit to make it PENDING_REVIEW
      await request(app).post(/api/requests//submit).set('X-User-Id', userId);

      const response = await request(app)
        .post(/api/requests//submit)
        .set('X-User-Id', userId);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/requests/:id/review', () => {
    it('should approve a request', async () => {
      // First submit the request
      await request(app).post(/api/requests//submit).set('X-User-Id', userId);

      const response = await request(app)
        .post(/api/requests//review)
        .set('X-User-Id', 'user-bob')
        .send({ decision: 'APPROVE' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('APPROVED');
    });

    it('should reject self-approval', async () => {
      // Create a new request and submit it
      const createResp = await request(app)
        .post('/api/requests')
        .set('X-User-Id', userId)
        .send({ title: 'Self Test', description: 'Desc', reason: 'Reason' });
      const selfRequestId = createResp.body.data.id;
      await request(app).post(/api/requests//submit).set('X-User-Id', userId);

      const response = await request(app)
        .post(/api/requests//review)
        .set('X-User-Id', userId)
        .send({ decision: 'APPROVE' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Self-approval is not allowed');
    });

    it('should require comments for REQUEST_CHANGES', async () => {
      await request(app).post(/api/requests//submit).set('X-User-Id', userId);

      const response = await request(app)
        .post(/api/requests//review)
        .set('X-User-Id', 'user-bob')
        .send({ decision: 'REQUEST_CHANGES' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/requests/:id', () => {
    it('should get a request by id', async () => {
      const response = await request(app)
        .get(/api/requests/)
        .set('X-User-Id', userId);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(requestId);
    });

    it('should return 404 for non-existent request', async () => {
      const response = await request(app)
        .get('/api/requests/non-existent')
        .set('X-User-Id', userId);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/requests', () => {
    it('should list requests', async () => {
      const response = await request(app)
        .get('/api/requests')
        .set('X-User-Id', userId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});


