import { RequestRepository } from '../repositories/request.repository';
import { ReviewRepository } from '../repositories/review.repository';
import { UserRepository } from '../repositories/user.repository';
import { ChangeRequest, CreateChangeRequestInput } from '../models/ChangeRequest';
import { Review, CreateReviewInput } from '../models/Review';
import { AppError, ERRORS } from '../errors/AppError';

export class RequestService {
  constructor(
    private requestRepo: RequestRepository,
    private reviewRepo: ReviewRepository,
    private userRepo: UserRepository
  ) {}

  async createRequest(data: CreateChangeRequestInput): Promise<ChangeRequest> {
    // Validate requester exists
    const requester = await this.userRepo.findById(data.requesterId);
    if (!requester) {
      throw new AppError(ERRORS.NOT_FOUND, 404);
    }

    return this.requestRepo.create(data);
  }

  async submitRequest(requestId: string, requesterId: string): Promise<ChangeRequest> {
    const request = await this.requestRepo.findById(requestId);
    if (!request) {
      throw new AppError(ERRORS.NOT_FOUND, 404);
    }

    // Only the requester can submit
    if (request.requesterId !== requesterId) {
      throw new AppError(ERRORS.FORBIDDEN, 403);
    }

    // Only DRAFT can be submitted
    if (request.status !== 'DRAFT') {
      throw new AppError(ERRORS.INVALID_STATUS_TRANSITION, 400);
    }

    // Optimistic locking: pass current version
    return this.requestRepo.updateStatus(requestId, 'PENDING_REVIEW', request.version);
  }

  async reviewRequest(
    requestId: string,
    reviewerId: string,
    decision: 'APPROVE' | 'REQUEST_CHANGES',
    comments?: string
  ): Promise<ChangeRequest> {
    const request = await this.requestRepo.findById(requestId);
    if (!request) {
      throw new AppError(ERRORS.NOT_FOUND, 404);
    }

    // Only PENDING_REVIEW can be reviewed
    if (request.status !== 'PENDING_REVIEW') {
      throw new AppError(ERRORS.INVALID_STATUS_TRANSITION, 400);
    }

    // Self-approval prevention
    if (request.requesterId === reviewerId) {
      throw new AppError(ERRORS.SELF_APPROVAL, 403);
    }

    // Only reviewers can review
    const reviewer = await this.userRepo.findById(reviewerId);
    if (!reviewer || reviewer.role !== 'REVIEWER') {
      throw new AppError(ERRORS.FORBIDDEN, 403);
    }

    // Validate comments for REQUEST_CHANGES
    if (decision === 'REQUEST_CHANGES' && !comments) {
      throw new AppError(ERRORS.VALIDATION_ERROR, 400);
    }

    // Create the review
    await this.reviewRepo.create({
      changeRequestId: requestId,
      reviewerId,
      decision,
      comments,
    });

    // Update request status with optimistic locking
    const newStatus = decision === 'APPROVE' ? 'APPROVED' : 'CHANGES_REQUESTED';
    return this.requestRepo.updateStatus(requestId, newStatus, request.version);
  }

  async resubmitRequest(requestId: string, requesterId: string): Promise<ChangeRequest> {
    const request = await this.requestRepo.findById(requestId);
    if (!request) {
      throw new AppError(ERRORS.NOT_FOUND, 404);
    }

    // Only the requester can resubmit
    if (request.requesterId !== requesterId) {
      throw new AppError(ERRORS.FORBIDDEN, 403);
    }

    // Only CHANGES_REQUESTED can be resubmitted
    if (request.status !== 'CHANGES_REQUESTED') {
      throw new AppError(ERRORS.INVALID_STATUS_TRANSITION, 400);
    }

    // Optimistic locking: pass current version
    return this.requestRepo.updateStatus(requestId, 'PENDING_REVIEW', request.version);
  }

  async getRequest(id: string): Promise<ChangeRequest | null> {
    return this.requestRepo.findById(id);
  }

  async listRequests(options: {
    status?: string;
    requesterId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ requests: ChangeRequest[]; total: number }> {
    return this.requestRepo.findAll(options);
  }
}


