/**
 * Authentication Controller
 * 
 * จัดการระบบ authentication ทั้งหมด:
 * - Register: สมัครสมาชิกใหม่
 * - Login: เข้าสู่ระบบ
 * - Logout: ออกจากระบบ
 * - Refresh Token: ต่ออายุ token
 * - Profile Management: จัดการโปรไฟล์ผู้ใช้
 * - Password Management: เปลี่ยนรหัสผ่าน, ลืมรหัสผ่าน, รีเซ็ตรหัสผ่าน
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DatabaseService } from '../services/DatabaseService';
import { RedisService } from '../services/RedisService';
import { NotificationService } from '../services/NotificationService';
import { config } from '../config/config';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AuthController {
  private db = DatabaseService.getInstance();       // Database service instance
  private redis = RedisService.getInstance();       // Redis service instance
  private notification = NotificationService.getInstance();  // Notification service instance

  /**
   * สมัครสมาชิกใหม่
   * รับข้อมูล email, password, firstName, lastName, role
   * Hash password และสร้าง JWT tokens
   */
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Check if user already exists - ตรวจสอบว่ามี email นี้แล้วหรือยัง
      const existingUser = await this.db.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new CustomError('User with this email already exists', 409);
      }

      // Hash password - เข้ารหัสรหัสผ่านด้วย bcrypt
      const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

      // Create user - สร้างผู้ใช้ใหม่ในฐานข้อมูล
      const user = await this.db.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      // Generate tokens - สร้าง JWT tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Store refresh token in Redis - เก็บ refresh token ใน Redis ไว้ 7 วัน
      await this.redis.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

      logger.info(`User registered successfully: ${user.email}`);

      res.status(201).json({
        success: true,
        data: {
          user,
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * เข้าสู่ระบบ
   * ตรวจสอบ email และ password
   * สร้าง JWT tokens และส่งกลับไป
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user - ค้นหาผู้ใช้จาก email
      const user = await this.db.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new CustomError('Invalid credentials', 401);
      }

      // Check if account is active - ตรวจสอบว่าบัญชี active อยู่หรือไม่
      if (!user.isActive) {
        throw new CustomError('Account is deactivated', 401);
      }

      // Check password - เปรียบเทียบรหัสผ่าน
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new CustomError('Invalid credentials', 401);
      }

      // Generate tokens - สร้าง JWT tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Store refresh token in Redis - เก็บ refresh token ใน Redis ไว้ 7 วัน
      await this.redis.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

      // Update last login - อัปเดตเวลาล็อกอินล่าสุด
      await this.db.prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      });

      logger.info(`User logged in successfully: ${user.email}`);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ออกจากระบบ
   * ลบ refresh token จาก Redis
   */
  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, config.jwt.secret) as any;
        
        // Remove refresh token from Redis - ลบ refresh token ออกจาก Redis
        await this.redis.del(`refresh_token:${decoded.id}`);
      }

      logger.info('User logged out successfully');

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ต่ออายุ token
   * ตรวจสอบ refresh token และสร้าง tokens ใหม่
   */
  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new CustomError('Refresh token required', 400);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;

      // Check if refresh token exists in Redis
      const storedToken = await this.redis.get(`refresh_token:${decoded.id}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new CustomError('Invalid refresh token', 401);
      }

      // Get user
      const user = await this.db.prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new CustomError('User not found or inactive', 401);
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Update refresh token in Redis
      await this.redis.set(`refresh_token:${user.id}`, newRefreshToken, 7 * 24 * 60 * 60);

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;

      const user = await this.db.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          technician: {
            select: {
              id: true,
              employeeId: true,
              skills: true,
              hourlyRate: true,
              isActive: true,
            },
          },
        },
      });

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { firstName, lastName } = req.body;

      const user = await this.db.prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          updatedAt: true,
        },
      });

      logger.info(`User profile updated: ${user.email}`);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await this.db.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Check current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new CustomError('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

      // Update password
      await this.db.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedNewPassword,
          updatedAt: new Date(),
        },
      });

      logger.info(`Password changed for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      const user = await this.db.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists or not
        res.json({
          success: true,
          message: 'If an account with that email exists, we sent a password reset link.',
        });
        return;
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      // Store reset token in Redis
      await this.redis.set(`reset_token:${user.id}`, resetToken, 3600); // 1 hour

      // Send reset email
      await this.notification.sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${config.api.baseUrl}/reset-password?token=${resetToken}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });

      logger.info(`Password reset requested for user: ${user.email}`);

      res.json({
        success: true,
        message: 'If an account with that email exists, we sent a password reset link.',
      });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      // Verify reset token
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      // Check if reset token exists in Redis
      const storedToken = await this.redis.get(`reset_token:${decoded.id}`);
      if (!storedToken || storedToken !== token) {
        throw new CustomError('Invalid or expired reset token', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

      // Update password
      await this.db.prisma.user.update({
        where: { id: decoded.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });

      // Remove reset token from Redis
      await this.redis.del(`reset_token:${decoded.id}`);

      logger.info(`Password reset completed for user: ${decoded.email}`);

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * สร้าง Access Token
   * ใช้สำหรับการเรียก API ต่างๆ
   * มีอายุสั้น (ตาม config.jwt.expiresIn)
   */
  private generateAccessToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        technicianId: user.technician?.id,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as any
    );
  }

  /**
   * สร้าง Refresh Token
   * ใช้สำหรับต่ออายุ Access Token
   * มีอายุยาว (ตาม config.jwt.refreshExpiresIn)
   */
  private generateRefreshToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn } as any
    );
  }
}
