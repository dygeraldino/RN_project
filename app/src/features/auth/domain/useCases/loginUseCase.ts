import { AuthRepository } from '../repositories/authRepository';
import { User } from '../models/user';

export class LoginUseCase {
  constructor(private readonly repository: AuthRepository) {}

  execute(email: string, password: string): Promise<User | null> {
    return this.repository.login(email, password);
  }
}
