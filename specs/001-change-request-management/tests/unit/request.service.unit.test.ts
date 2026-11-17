import { RequestService } from '../../src/services/request.service';
import { RequestRepository } from '../../src/repositories/request.repository';
import { ReviewRepository } from '../../src/repositories/review.repository';
import { UserRepository } from '../../src/repositories/user.repository';
import { PrismaClient } from '@prisma/client';
import { AppError, ERRORS } from '../../src/errors/AppError';

describe('RequestService', () => {
  let mockRequestRepo: jest.Mocked<RequestRepository>;
  let mockReviewRepo: jest.Mocked<ReviewRepository>;
  let mockUserRepo: jest.Mocked<UserRepository>;
  let service: RequestService;

  beforeEach(() => {
    mockRequestRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByRequester: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      findAll: jest.fn(),
    } as any;
    mockReviewRepo = {
      create: jest.fn(),
      findByChangeRequest: jest.fn(),
      findByReviewer: jest.fn(),
    } as any;
    mockUserRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUsername: jest.fn(),
    } as any;
    service = new RequestService(mockRequestRepo, mockReviewRepo, mockUserRepo);
  });

  describe('createRequest', () => {
    it('should create a request when requester exists', async () => {
      const input = { title: 'Test', description: 'Desc', reason: 'Reason', requesterId: 'user-1' };
      const expectedRequest = { id: 'req-1', ...input, status: 'DRAFT', version: 1, createdAt: new Date(), updatedAt: new Date() };
      mockUserRepo.findById.mockResolvedValue({ id: 'user-1', username: 'alice', role: 'REQUESTER', createdAt: new Date() });
      mockRequestRepo.create.mockResolvedValue(expectedRequest);

      const result = await service.createRequest(input);
      expect(result).toEqual(expectedRequest);
      expect(mockUserRepo.findById).toHaveBeenCalledWith('user-1');
      expect(mockRequestRepo.create).toHaveBeenCalledWith(input);
    });

    it('should throw 404 if requester not found', async () => {
      const input = { title: 'Test', description: 'Desc', reason: 'Reason', requesterId: 'user-999' };
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(service.createRequest(input)).rejects.toMatchObject({
        statusCode: 404,
        message: ERRORS.NOT_FOUND,
      });
    });
  });

  describe('submitRequest', () => {
    it('should submit a draft request', async () => {
      const request = { id: 'req-1', requesterId: 'user-1', status: 'DRAFT', version: 1 };
      const updated = { ...request, status: 'PENDING_REVIEW', version: 2 };
      mockRequestRepo.findById.mockResolvedValue(request);
      mockRequestRepo.updateStatus.mockResolvedValue(updated);

      const result = await service.submitRequest('req-1', 'user-1');
      expect(result).toEqual(updated);
      expect(mockRequestRepo.updateStatus).toHaveBeenCalledWith('req-1', 'PENDING_REVIEW', 1);
    });

    it('should reject if user is not the requester', async () => {
      const request = { id: 'req-1', requesterId: 'user-1', status: 'DRAFT', version: 1 };
      mockRequestRepo.findById.mockResolvedValue(request);

      await expect(service.submitRequest('req-1', 'user-2')).rejects.toMatchObject({
        statusCode: 403,
        message: ERRORS.FORBIDDEN,
      });
    });

    it('should reject if request is not in DRAFT status', async () => {
      const request = { id: 'req-1', requesterId: 'user-1', status: 'PENDING_REVIEW', version: 1 };
      mockRequestRepo.findById.mockResolvedValue(request);

      await expect(service.submitRequest('req-1', 'user-1')).rejects.toMatchObject({
        statusCode: 400,
        message: ERRORS.INVALID_STATUS_TRANSITION,
      });
    });

    it('should throw 404 if request not found', async () => {
      mockRequestRepo.findById.mockResolvedValue(null);

      await expect(service.submitRequest('req-999', 'user-1')).rejects.toMatchObject({
        statusCode: 404,
        message: ERRORS.NOT_FOUND,
      });
    });
  });

  describe('reviewRequest', () => {
    it('should approve a request', async () => {
      const request = { id: 'req-1', requesterId: 'user-1', status: 'PENDING_REVIEW', version: 1 };
      const updated = { ...request, status: 'APPROVED', version: 2 };
      mockRequestRepo.findById.mockResolvedValue(request);
      mockRequestRepo.updateStatus.mockResolvedValue(updated);
      mockUserRepo.findById.mockResolvedValue({ id: 'user-2', username: 'bob', role: 'REVIEWER', createdAt: new Date() });
      mockReviewRepo.create.mockResolvedValue({ id: 'review-1', changeRequestId: 'req-1', reviewerId: 'user-2', decision: 'APPROVE', comments: null, createdAt: new Date() });

      const result = await service.reviewRequest('req-1', 'user-2', 'APPROVE');
      expect(result).toEqual(updated);
      expect(mockRequestRepo.updateStatus).toHaveBeenCalledWith('req-1', 'APPROVED', 1);
      expect(mockReviewRepo.create).toHaveBeenCalledWith({ changeRequestId: 'req-1', reviewerId: 'user-2', decision: 'APPROVE', comments: undefined });
    });

    it('should reject self-approval', async () => {
      const request = { id: 'req-1', requesterId: 'user-1', status: 'PENDING_REVIEW', version: 1 };
      mockRequestRepo.findById.mockResolvedValue(request);

      await expect(service.reviewRequest('req-1', 'user-1', 'APPROVE')).rejects.toMatchObject({
        statusCode: 403,
        message: ERRORS.SELF_APPROVAL,
      });
    });

    it('should reject if user is not a reviewer', async () => {
      const request = { id: 'req-1', requesterId: 'user-1', status: 'PENDING_REVIEW', version: 1 };
      mockRequestRepo.findById.mockResolvedValue(request);
      mockUserRepo.findById.mockResolvedValue({ id: 'user-1', username: 'alice', role: 'REQUESTER', createdAt: new Date() });

      await expect(service.reviewRequest('req-1', 'user-1', 'APPROVE')).rejects.toMatchObject({
        statusCode: 403,
        message: ERRORS.FORBIDDEN,
      });
    });

    it('should require comments for REQUEST_CHANGES', async () => {
      const request = { id: 'req-1', requesterId: 'user-1', status: 'PENDING_REVIEW', version: 1 };
      mockRequestRepo.findById.mockResolvedValue(request);
      mockUserRepo.findById.mockResolvedValue({ id: 'user-2', username: 'bob', role: 'REVIEWER', createdAt: new Date() });

      await expect(service.reviewRequest('req-1', 'user-2', 'REQUEST_CHANGES')).rejects.toMatchObject({
        statusCode: 400,
        message: ERRORS.VALIDATION_ERROR,
      });
    });
  });

  describe('resubmitRequest', () => {
    it('should resubmit a changes_requested request', async () => {
      const request = { id: 'req-1', requesterId: 'user-1', status: 'CHANGES_REQUESTED', version: 1 };
      const updated = { ...request, status: 'PENDING_REVIEW', version: 2 };
      mockRequestRepo.findById.mockResolvedValue(request);
      mockRequestRepo.updateStatus.mockResolvedValue(updated);

      const result = await service.resubmitRequest('req-1', 'user-1');
      expect(result).toEqual(updated);
      expect(mockRequestRepo.updateStatus).toHaveBeenCalledWith('req-1', 'PENDING_REVIEW', 1);
    });

    it('should reject if user is not the requester', async () => {
      const request = { id: 'req-1', requesterId: 'user-1', status: 'CHANGES_REQUESTED', version: 1 };
      mockRequestRepo.findById.mockResolvedValue(request);

      await expect(service.resubmitRequest('req-1', 'user-2')).rejects.toMatchObject({
        statusCode: 403,
        message: ERRORS.FORBIDDEN,
      });
    });

    it('should reject if request is not in CHANGES_REQUESTED status', async () => {
      const request = { id: 'req-1', requesterId: 'user-1', status: 'APPROVED', version: 1 };
      mockRequestRepo.findById.mockResolvedValue(request);

      await expect(service.resubmitRequest('req-1', 'user-1')).rejects.toMatchObject({
        statusCode: 400,
        message: ERRORS.INVALID_STATUS_TRANSITION,
      });
    });
  });

  describe('getRequest', () => {
    it('should return a request by id', async () => {
      const request = { id: 'req-1', requesterId: 'user-1', status: 'DRAFT', version: 1 };
      mockRequestRepo.findById.mockResolvedValue(request);

      const result = await service.getRequest('req-1');
      expect(result).toEqual(request);
    });

    it('should return null if request not found', async () => {
      mockRequestRepo.findById.mockResolvedValue(null);

      const result = await service.getRequest('req-999');
      expect(result).toBeNull();
    });
  });

  describe('listRequests', () => {
    it('should list requests with filters', async () => {
      const result = { requests: [], total: 0 };
      mockRequestRepo.findAll.mockResolvedValue(result);

      const data = await service.listRequests({ status: 'DRAFT', requesterId: 'user-1', page: 1, limit: 10 });
      expect(data).toEqual(result);
      expect(mockRequestRepo.findAll).toHaveBeenCalledWith({ status: 'DRAFT', requesterId: 'user-1', page: 1, limit: 10 });
    });
  });
});


