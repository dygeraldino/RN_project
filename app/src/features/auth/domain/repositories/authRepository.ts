import { User } from "../models/user";

export interface AuthRepository {
  login(email: string, password: string): Promise<User | null>;
  signUp(name: string, email: string, password: string): Promise<User | null>;
  signUpDirect(
    name: string,
    email: string,
    password: string
  ): Promise<User | null>;
  verifyEmail(email: string, code: string): Promise<boolean>;
  forgotPassword(email: string): Promise<boolean>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
  logout(): Promise<boolean>;
  isAuthenticated(): Promise<boolean>;
  getCurrentUser(): Promise<User | null>;
}
