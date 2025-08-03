import { PasswordResetService } from '../services/password-reset.service';
import { UserService } from '../services/user.service';
import { db } from '../utils/database';
import { users, passwordResetTokens } from '../models/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Mock console.log to avoid noise in tests
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('PasswordResetService', () => {
  let testUser: any;
  const testEmail = 'test@example.com';

  beforeAll(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    const result = await db
      .insert(users)
      .values({
        email: testEmail,
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
      })
      .returning();
    testUser = result[0];
  });

  afterAll(async () => {
    // Clean up test data
    if (testUser) {
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUser.id));
      await db.delete(users).where(eq(users.id, testUser.id));
    }
  });

  afterEach(async () => {
    // Clean up password reset tokens after each test
    if (testUser) {
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUser.id));
    }
  });

  describe('createResetToken', () => {
    it('should create a reset token for existing user', async () => {
      const result = await PasswordResetService.createResetToken(testEmail);

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'If an account with that email exists, a password reset link has been sent.'
      );

      // Verify token was created in database
      const tokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUser.id));

      expect(tokens).toHaveLength(1);
      expect(tokens[0]?.used).toBe(false);
      expect(tokens[0]?.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return success message for non-existing user (security)', async () => {
      const result = await PasswordResetService.createResetToken(
        'nonexistent@example.com'
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'If an account with that email exists, a password reset link has been sent.'
      );
    });

    it('should invalidate existing tokens when creating new one', async () => {
      // Create first token
      await PasswordResetService.createResetToken(testEmail);

      // Create second token
      await PasswordResetService.createResetToken(testEmail);

      // Check that only one active token exists
      const activeTokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUser.id));

      const unusedTokens = activeTokens.filter(token => !token.used);
      expect(unusedTokens).toHaveLength(1);
    });
  });

  describe('verifyResetToken', () => {
    it('should verify valid token', async () => {
      // Create a token
      await PasswordResetService.createResetToken(testEmail);

      const tokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUser.id));

      const token = tokens[0]?.token;
      expect(token).toBeDefined();

      const result = await PasswordResetService.verifyResetToken(token!);

      expect(result.valid).toBe(true);
      expect(result.message).toBe('Token is valid.');
    });

    it('should reject invalid token', async () => {
      const result =
        await PasswordResetService.verifyResetToken('invalid-token');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid or expired reset token.');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const newPassword = 'newpassword123';

      // Create a token
      await PasswordResetService.createResetToken(testEmail);

      const tokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUser.id));

      const token = tokens[0]?.token;
      expect(token).toBeDefined();

      // Reset password
      const result = await PasswordResetService.resetPassword(
        token!,
        newPassword
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password has been reset successfully.');

      // Verify password was changed
      const updatedUser = await UserService.getUserById(testUser.id);
      expect(updatedUser).toBeTruthy();

      if (updatedUser) {
        const passwordMatch = await bcrypt.compare(
          newPassword,
          updatedUser.passwordHash
        );
        expect(passwordMatch).toBe(true);
      }

      // Verify token was marked as used
      const usedTokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUser.id));

      expect(usedTokens[0]?.used).toBe(true);
    });

    it('should reject invalid token', async () => {
      const result = await PasswordResetService.resetPassword(
        'invalid-token',
        'newpassword123'
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid or expired reset token.');
    });

    it('should reject used token', async () => {
      const newPassword = 'newpassword123';

      // Create and use a token
      await PasswordResetService.createResetToken(testEmail);

      const tokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUser.id));

      const token = tokens[0]?.token;
      expect(token).toBeDefined();

      // Use token once
      await PasswordResetService.resetPassword(token!, newPassword);

      // Try to use token again
      const result = await PasswordResetService.resetPassword(
        token!,
        'anothernewpassword123'
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid or expired reset token.');
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should remove expired tokens', async () => {
      // Create a token and manually set it as expired
      await PasswordResetService.createResetToken(testEmail);

      const tokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUser.id));

      // Set token as expired
      await db
        .update(passwordResetTokens)
        .set({ expiresAt: new Date(Date.now() - 1000) }) // 1 second ago
        .where(eq(passwordResetTokens.id, tokens[0]!.id));

      // Clean up expired tokens
      const cleanedCount = await PasswordResetService.cleanupExpiredTokens();

      expect(cleanedCount).toBeGreaterThan(0);

      // Verify token was removed
      const remainingTokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, testUser.id));

      expect(remainingTokens).toHaveLength(0);
    });
  });
});
