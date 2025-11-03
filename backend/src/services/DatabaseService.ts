/**
 * Database Service
 * 
 * จัดการการเชื่อมต่อฐานข้อมูล PostgreSQL ผ่าน Prisma ORM
 * ใช้ Singleton Pattern เพื่อให้มี instance เดียวทั่วทั้งแอป
 */
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

class DatabaseService {
  private static instance: DatabaseService;
  public prisma: PrismaClient;

  private constructor() {
    // สร้าง Prisma Client instance พร้อมตั้งค่า logging
    this.prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },  // Log SQL queries
        { emit: 'event', level: 'error' },  // Log errors
        { emit: 'event', level: 'info' },   // Log info
        { emit: 'event', level: 'warn' },   // Log warnings
      ],
    });

    // Log database queries in development - บันทึก SQL queries ในโหมด development
    if (process.env.NODE_ENV === 'development') {
      (this.prisma as any).$on('query', (e: any) => {
        logger.debug(`Query: ${e.query}`);
        logger.debug(`Params: ${e.params}`);
        logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    // Log database errors - บันทึก error จากฐานข้อมูล
    (this.prisma as any).$on('error', (e: any) => {
      logger.error('Database error:', e);
    });

    // Log database info - บันทึกข้อมูลทั่วไปจากฐานข้อมูล
    (this.prisma as any).$on('info', (e: any) => {
      logger.info('Database info:', e);
    });

    // Log database warnings - บันทึก warnings จากฐานข้อมูล
    (this.prisma as any).$on('warn', (e: any) => {
      logger.warn('Database warning:', e);
    });
  }

  /**
   * Get Singleton Instance
   * ใช้ Singleton Pattern เพื่อให้มี instance เดียวทั่วทั้งแอป
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize Database Connection
   * เชื่อมต่อฐานข้อมูลและทดสอบการเชื่อมต่อ
   */
  public static async initialize(): Promise<void> {
    try {
      const db = DatabaseService.getInstance();
      
      // Test database connection - ทดสอบการเชื่อมต่อ
      await db.prisma.$connect();
      
      // Run database migrations - รัน SQL เพื่อทดสอบ
      await db.prisma.$executeRaw`SELECT 1`;
      
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Database
   * ปิดการเชื่อมต่อฐานข้อมูล
   */
  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  /**
   * Health Check
   * ตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}

export { DatabaseService };
