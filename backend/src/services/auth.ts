import { auth } from '../utils/auth';
import { SignUpRequest, SignInRequest, AuthResponse } from '../types/api';

export class AuthService {
  /**
   * Register a new user
   */
  static async signUp(data: SignUpRequest): Promise<AuthResponse> {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: data.email,
          password: data.password,
          name:
            data.firstName && data.lastName
              ? `${data.firstName} ${data.lastName}`
              : data.firstName || data.lastName || '',
        },
      });

      if (!result.user) {
        throw new Error('Failed to create user');
      }

      // Get session after signup
      const session = await auth.api.getSession({
        headers: new Headers(),
      });

      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: data.firstName || undefined,
          lastName: data.lastName || undefined,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
        },
        session: session
          ? {
              id: session.session.id,
              userId: session.session.userId,
              expiresAt: session.session.expiresAt,
              createdAt: session.session.createdAt,
            }
          : {
              id: '',
              userId: result.user.id,
              expiresAt: new Date(),
              createdAt: new Date(),
            },
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Registration failed'
      );
    }
  }

  /**
   * Sign in a user
   */
  static async signIn(data: SignInRequest): Promise<AuthResponse> {
    try {
      const result = await auth.api.signInEmail({
        body: {
          email: data.email,
          password: data.password,
        },
      });

      if (!result.user) {
        throw new Error('Invalid credentials');
      }

      // Get session after signin
      const session = await auth.api.getSession({
        headers: new Headers(),
      });

      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.name?.split(' ')[0] || undefined,
          lastName:
            result.user.name?.split(' ').slice(1).join(' ') || undefined,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
        },
        session: session
          ? {
              id: session.session.id,
              userId: session.session.userId,
              expiresAt: session.session.expiresAt,
              createdAt: session.session.createdAt,
            }
          : {
              id: '',
              userId: result.user.id,
              expiresAt: new Date(),
              createdAt: new Date(),
            },
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  /**
   * Get current session
   */
  static async getSession(headers: Record<string, string>) {
    try {
      const headersObj = new Headers();
      Object.entries(headers).forEach(([key, value]) => {
        headersObj.set(key, value);
      });
      return await auth.api.getSession({ headers: headersObj });
    } catch (error) {
      return null;
    }
  }

  /**
   * Sign out user
   */
  static async signOut(headers: Record<string, string>) {
    try {
      const headersObj = new Headers();
      Object.entries(headers).forEach(([key, value]) => {
        headersObj.set(key, value);
      });
      await auth.api.signOut({ headers: headersObj });
      return { success: true };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Sign out failed'
      );
    }
  }
}
