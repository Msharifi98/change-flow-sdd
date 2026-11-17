import { Request, Response } from 'express';
import { RequestService } from '../services/request.service';
import { CreateRequestDTO } from '../dtos/CreateRequestDTO';
import { SubmitRequestDTO } from '../dtos/SubmitRequestDTO';
import { ReviewRequestDTO } from '../dtos/ReviewRequestDTO';
import { AppError, ERRORS } from '../errors/AppError';

export class RequestController {
  constructor(private requestService: RequestService) {}

  async createRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string; username: string; role: string };
      if (!user) {
        return res.status(401).json({ success: false, error: ERRORS.UNAUTHORIZED, statusCode: 401 });
      }

      const dto: CreateRequestDTO = req.body;
      if (!dto.title || !dto.description || !dto.reason) {
        return res.status(400).json({ success: false, error: ERRORS.VALIDATION_ERROR, statusCode: 400 });
      }

      const changeRequest = await this.requestService.createRequest({
        title: dto.title,
        description: dto.description,
        reason: dto.reason,
        requesterId: user.id,
      });

      return res.status(201).json({
        success: true,
        data: {
          id: changeRequest.id,
          title: changeRequest.title,
          description: changeRequest.description,
          reason: changeRequest.reason,
          requesterId: changeRequest.requesterId,
          status: changeRequest.status,
          version: changeRequest.version,
          createdAt: changeRequest.createdAt.toISOString(),
        },
        statusCode: 201,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, error: error.message, statusCode: error.statusCode });
      }
      return res.status(500).json({ success: false, error: 'Internal server error', statusCode: 500 });
    }
  }

  async submitRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string; username: string; role: string };
      if (!user) {
        return res.status(401).json({ success: false, error: ERRORS.UNAUTHORIZED, statusCode: 401 });
      }

      const { id } = req.params;
      const dto: SubmitRequestDTO = req.body;

      const changeRequest = await this.requestService.submitRequest(id, user.id);

      return res.status(200).json({
        success: true,
        data: {
          id: changeRequest.id,
          status: changeRequest.status,
          version: changeRequest.version,
        },
        statusCode: 200,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, error: error.message, statusCode: error.statusCode });
      }
      return res.status(500).json({ success: false, error: 'Internal server error', statusCode: 500 });
    }
  }

  async reviewRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string; username: string; role: string };
      if (!user) {
        return res.status(401).json({ success: false, error: ERRORS.UNAUTHORIZED, statusCode: 401 });
      }

      const { id } = req.params;
      const dto: ReviewRequestDTO = req.body;

      if (!dto.decision) {
        return res.status(400).json({ success: false, error: ERRORS.VALIDATION_ERROR, statusCode: 400 });
      }

      if (dto.decision === 'REQUEST_CHANGES' && !dto.comments) {
        return res.status(400).json({ success: false, error: ERRORS.VALIDATION_ERROR, statusCode: 400 });
      }

      const changeRequest = await this.requestService.reviewRequest(
        id,
        user.id,
        dto.decision,
        dto.comments
      );

      return res.status(200).json({
        success: true,
        data: {
          id: changeRequest.id,
          status: changeRequest.status,
          version: changeRequest.version,
        },
        statusCode: 200,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, error: error.message, statusCode: error.statusCode });
      }
      return res.status(500).json({ success: false, error: 'Internal server error', statusCode: 500 });
    }
  }

  async getRequest(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string; username: string; role: string };
      if (!user) {
        return res.status(401).json({ success: false, error: ERRORS.UNAUTHORIZED, statusCode: 401 });
      }

      const { id } = req.params;
      const changeRequest = await this.requestService.getRequest(id);

      if (!changeRequest) {
        return res.status(404).json({ success: false, error: ERRORS.NOT_FOUND, statusCode: 404 });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: changeRequest.id,
          title: changeRequest.title,
          description: changeRequest.description,
          reason: changeRequest.reason,
          requesterId: changeRequest.requesterId,
          status: changeRequest.status,
          version: changeRequest.version,
          createdAt: changeRequest.createdAt.toISOString(),
          updatedAt: changeRequest.updatedAt.toISOString(),
          reviews: changeRequest.reviews?.map((r: any) => ({
            id: r.id,
            reviewerId: r.reviewerId,
            decision: r.decision,
            comments: r.comments,
            createdAt: r.createdAt.toISOString(),
          })) || [],
        },
        statusCode: 200,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, error: error.message, statusCode: error.statusCode });
      }
      return res.status(500).json({ success: false, error: 'Internal server error', statusCode: 500 });
    }
  }

  async listRequests(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as { id: string; username: string; role: string };
      if (!user) {
        return res.status(401).json({ success: false, error: ERRORS.UNAUTHORIZED, statusCode: 401 });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string | undefined;
      const requesterId = req.query.requesterId as string | undefined;

      const { requests, total } = await this.requestService.listRequests({ status, requesterId, page, limit });

      return res.status(200).json({
        success: true,
        data: {
          requests: requests.map((r: any) => ({
            id: r.id,
            title: r.title,
            status: r.status,
            requesterId: r.requesterId,
            createdAt: r.createdAt.toISOString(),
          })),
          total,
          page,
          limit,
        },
        statusCode: 200,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, error: error.message, statusCode: error.statusCode });
      }
      return res.status(500).json({ success: false, error: 'Internal server error', statusCode: 500 });
    }
  }
}


