import { UserRepository } from '../repositories/user.repository';
import { User, CreateUserInput } from '../models/User';
import { AppError, ERRORS } from '../errors/AppError';

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async createUser(data: CreateUserInput): Promise<User> {
    const existing = await this.userRepo.findByUsername(data.username);
    if (existing) {
      throw new AppError('User already exists', 400);
    }
    return this.userRepo.create(data);
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepo.findById(userId);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.userRepo.findByUsername(username);
  }

}
