import { AuthRepository } from '../repositories/authRepository';
import { User } from '../models/user';

export class SignUpUseCase {
  constructor(private readonly repository: AuthRepository) {}

  execute(name: string, email: string, password: string): Promise<User | null> {
    return this.repository.signUp(name, email, password);
  }
}
