import { PrismaClient } from '@prisma/client';
import { ChangeRequest, CreateChangeRequestInput } from '../models/ChangeRequest';

export class RequestRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateChangeRequestInput): Promise<ChangeRequest> {
    return this.prisma.changeRequest.create({
      data: {
        title: data.title,
        description: data.description,
        reason: data.reason,
        requesterId: data.requesterId,
        status: 'DRAFT',
        version: 1,
      },
    });
  }

  async findById(id: string): Promise<ChangeRequest | null> {
    return this.prisma.changeRequest.findUnique({
      where: { id },
      include: {
        requester: true,
        reviews: {
          include: {
            reviewer: true,
          },
        },
      },
    });
  }

  async findByRequester(requesterId: string): Promise<ChangeRequest[]> {
    return this.prisma.changeRequest.findMany({
      where: { requesterId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Partial<ChangeRequest>): Promise<ChangeRequest> {
    return this.prisma.changeRequest.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: string): Promise<ChangeRequest> {
    return this.prisma.changeRequest.update({
      where: { id },
      data: { status },
    });
  }

  async findAll(options: { status?: string; requesterId?: string; page?: number; limit?: number }): Promise<{ requests: ChangeRequest[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.requesterId) where.requesterId = options.requesterId;

    const [requests, total] = await this.prisma.([
      this.prisma.changeRequest.findMany({
        where,
        skip: ((options.page || 1) - 1) * (options.limit || 10),
        take: options.limit || 10,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.changeRequest.count({ where }),
    ]);

    return { requests, total };
  }
}
