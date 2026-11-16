import { PrismaClient } from '@prisma/client';
import { Review, CreateReviewInput } from '../models/Review';

export class ReviewRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateReviewInput): Promise<Review> {
    return this.prisma.review.create({
      data: {
        changeRequestId: data.changeRequestId,
        reviewerId: data.reviewerId,
        decision: data.decision,
        comments: data.comments || null,
      },
    });
  }

  async findByChangeRequest(changeRequestId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { changeRequestId },
      include: { reviewer: true },
    });
  }

  async findByReviewer(reviewerId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { reviewerId },
      include: { changeRequest: true },
    });
  }
}
