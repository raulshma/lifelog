import { auth } from '../utils/auth';
import { UserService } from './user.service';
import { PasswordResetService } from './password-reset.service';

export class AuthService {
  // Validate user session
  static async validateSession(headers: Record<string, string>) {
    try {
      const session = await auth.api.getSession({
        headers: new Headers(headers),
      });
      return session;
    } catch (error) {
      console.error('Session validation failed:', error);
      return null;
    }
  }

  // Get user profile with session validation
  static async getUserProfile(headers: Record<string, string>) {
    try {
      const session = await this.validateSession(headers);
      if (!session) {
        throw new Error('Invalid session');
      }

      const user = await UserService.getUserById(session.user.id);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        session: session.session,
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Sign out user
  static async signOut(headers: Record<string, string>) {
    try {
      await auth.api.signOut({ headers });
      return { success: true };
    } catch (error) {
      console.error('Sign out failed:', error);
      throw new Error('Sign out failed');
    }
  }

  // Sign up user (placeholder - implement with Better Auth)
  static async signUp(_userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    try {
      // This should be implemented using Better Auth's sign up functionality
      // For now, we'll throw an error to indicate it needs implementation
      throw new Error(
        'Sign up functionality needs to be implemented with Better Auth'
      );
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  }

  // Sign in user (placeholder - implement with Better Auth)
  static async signIn(_credentials: { email: string; password: string }) {
    try {
      // This should be implemented using Better Auth's sign in functionality
      // For now, we'll throw an error to indicate it needs implementation
      throw new Error(
        'Sign in functionality needs to be implemented with Better Auth'
      );
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }

  // Password reset methods
  static async requestPasswordReset(email: string) {
    return PasswordResetService.createResetToken(email);
  }

  static async resetPassword(token: string, newPassword: string) {
    return PasswordResetService.resetPassword(token, newPassword);
  }

  static async verifyResetToken(token: string) {
    return PasswordResetService.verifyResetToken(token);
  }
}
