import { AuthRepository } from '../../domain/repositories/authRepository';
import { User } from '../../domain/models/user';
import { RobleAuthService, robleAuthService } from '../services/robleAuthService';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly service: RobleAuthService = robleAuthService) {}

  async login(email: string, password: string): Promise<User | null> {
    try {
      return await this.service.login(email, password);
    } catch (error) {
      console.warn('AuthRepositoryImpl.login error', error);
      return null;
    }
  }

  async signUp(name: string, email: string, password: string): Promise<User | null> {
    try {
      const success = await this.service.signup(email, password, name);
      if (!success) return null;
      return this.login(email, password);
    } catch (error) {
      console.warn('AuthRepositoryImpl.signUp error', error);
      return null;
    }
  }

  async signUpDirect(name: string, email: string, password: string): Promise<User | null> {
    try {
      const success = await this.service.signupDirect(email, password, name);
      if (!success) return null;
      return this.login(email, password);
    } catch (error) {
      console.warn('AuthRepositoryImpl.signUpDirect error', error);
      return null;
    }
  }

  verifyEmail(email: string, code: string): Promise<boolean> {
    return this.service.verifyEmail(email, code);
  }

  forgotPassword(email: string): Promise<boolean> {
    return this.service.forgotPassword(email);
  }

  resetPassword(token: string, newPassword: string): Promise<boolean> {
    return this.service.resetPassword(token, newPassword);
  }

  logout(): Promise<boolean> {
    return this.service.logout();
  }

  isAuthenticated(): Promise<boolean> {
    return this.service.isAuthenticated();
  }

  getCurrentUser(): Promise<User | null> {
    return this.service.getUserInfo();
  }
}

export const authRepository = new AuthRepositoryImpl();
