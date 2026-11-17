import { UserRepository } from '../repositories/user.repository';
import { AppError, ERRORS } from '../errors/AppError';

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  async getUserById(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError(ERRORS.NOT_FOUND, 404);
    }
    return user;
  }

  async getUserByUsername(username: string) {
    const user = await this.userRepo.findByUsername(username);
    if (!user) {
      throw new AppError(ERRORS.NOT_FOUND, 404);
    }
    return user;
  }
}


