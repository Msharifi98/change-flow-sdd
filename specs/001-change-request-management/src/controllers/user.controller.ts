import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { User, CreateUserInput } from '../models/User';
import { AppError, ERRORS } from '../errors/AppError';

export class UserController {
  constructor(private userService: UserService) {}

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateUserInput = req.body;
      if (!dto.username || !dto.role) {
        return res.status(400).json({ success: false, error: ERRORS.VALIDATION_ERROR, statusCode: 400 });
      }
      const user = await this.userService.createUser(dto);
      return res.status(201).json({ success: true, data: user, statusCode: 201 });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, error: error.message, statusCode: error.statusCode });
      }
      return res.status(500).json({ success: false, error: 'Internal server error', statusCode: 500 });
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      if (!user) {
        return res.status(404).json({ success: false, error: ERRORS.NOT_FOUND, statusCode: 404 });
      }
      return res.status(200).json({ success: true, data: user, statusCode: 200 });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, error: error.message, statusCode: error.statusCode });
      }
      return res.status(500).json({ success: false, error: 'Internal server error', statusCode: 500 });
    }
  }

  async getUserByUsername(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      const user = await this.userService.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ success: false, error: ERRORS.NOT_FOUND, statusCode: 404 });
      }
      return res.status(200).json({ success: true, data: user, statusCode: 200 });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, error: error.message, statusCode: error.statusCode });
      }
      return res.status(500).json({ success: false, error: 'Internal server error', statusCode: 500 });
    }
  }

}
