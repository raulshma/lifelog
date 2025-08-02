import { auth } from '../utils/auth';
import { UserService } from './user.service';

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
}
