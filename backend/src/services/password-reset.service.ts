import { eq, and, gt, lt } from 'drizzle-orm';
import { db } from '../utils/database';
import { users, passwordResetTokens } from '../models/schema';
import { UserService } from './user.service';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export class PasswordResetService {
  // Generate a secure random token
  private static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create a password reset token for a user
  static async createResetToken(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find user by email
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          message:
            'If an account with that email exists, a password reset link has been sent.',
        };
      }

      // Generate reset token
      const token = this.generateResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Invalidate any existing tokens for this user
      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.userId, user.id));

      // Create new reset token
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
        used: false,
      });

      // TODO: Send email with reset link
      // For now, we'll just log the token (in production, this should be sent via email)
      console.log(`Password reset token for ${email}: ${token}`);
      console.log(
        `Reset link: ${process.env['FRONTEND_URL'] || 'http://localhost:5173'}/reset-password?token=${token}`
      );

      return {
        success: true,
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    } catch (error) {
      console.error('Error creating reset token:', error);
      throw new Error('Failed to create password reset token');
    }
  }

  // Verify and use a reset token to change password
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find valid, unused token
      const resetToken = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, token),
            eq(passwordResetTokens.used, false),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (resetToken.length === 0) {
        return {
          success: false,
          message: 'Invalid or expired reset token.',
        };
      }

      const tokenData = resetToken[0];
      if (!tokenData) {
        return {
          success: false,
          message: 'Invalid or expired reset token.',
        };
      }

      // Hash the new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update user's password
      await db
        .update(users)
        .set({
          passwordHash: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, tokenData.userId));

      // Mark token as used
      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, tokenData.id));

      return {
        success: true,
        message: 'Password has been reset successfully.',
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new Error('Failed to reset password');
    }
  }

  // Verify if a reset token is valid (without using it)
  static async verifyResetToken(
    token: string
  ): Promise<{ valid: boolean; message: string }> {
    try {
      const resetToken = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, token),
            eq(passwordResetTokens.used, false),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (resetToken.length === 0) {
        return {
          valid: false,
          message: 'Invalid or expired reset token.',
        };
      }

      return {
        valid: true,
        message: 'Token is valid.',
      };
    } catch (error) {
      console.error('Error verifying reset token:', error);
      return {
        valid: false,
        message: 'Error verifying token.',
      };
    }
  }

  // Clean up expired tokens (should be run periodically)
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await db
        .delete(passwordResetTokens)
        .where(lt(passwordResetTokens.expiresAt, new Date()));

      return result.rowCount || 0;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }
}
