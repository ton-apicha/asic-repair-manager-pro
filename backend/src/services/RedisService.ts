/**
 * Redis Service
 * 
 * จัดการการเชื่อมต่อ Redis สำหรับ:
 * - Caching: เก็บข้อมูลชั่วคราว
 * - Session Management: จัดการ session และ refresh tokens
 * - Real-time Data: ข้อมูลที่ต้องอัปเดตแบบ real-time
 * 
 * ใช้ Singleton Pattern เพื่อให้มี instance เดียวทั่วทั้งแอป
 */
import { createClient, RedisClientType } from 'redis';
import { config } from '../config/config';
import { logger } from '../utils/logger';

class RedisService {
  private static instance: RedisService;
  public client: RedisClientType;

  private constructor() {
    // สร้าง Redis client instance
    this.client = createClient({
      url: config.redis.url,
    });

    // Handle connection events - จัดการ events การเชื่อมต่อ
    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('error', (error) => {
      logger.error('Redis client error:', error);
    });

    this.client.on('end', () => {
      logger.info('Redis client disconnected');
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public static async initialize(): Promise<void> {
    try {
      const redis = RedisService.getInstance();
      await redis.client.connect();
      logger.info('Redis connected successfully');
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      logger.info('Redis disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  // ==================== Cache Methods ====================
  
  /**
   * Get value from Redis
   * ดึงข้อมูลจาก Redis ตาม key
   */
  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set value to Redis
   * เก็บข้อมูลใน Redis พร้อม TTL (Time To Live) ถ้ากำหนด
   */
  public async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);  // Set with expiration
      } else {
        await this.client.set(key, value);         // Set without expiration
      }
      return true;
    } catch (error) {
      logger.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * Delete key from Redis
   * ลบข้อมูลออกจาก Redis
   */
  public async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis del error:', error);
      return false;
    }
  }

  /**
   * Check if key exists in Redis
   * ตรวจสอบว่ามี key นี้ใน Redis หรือไม่
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error:', error);
      return false;
    }
  }

  // ==================== Session Methods ====================
  
  /**
   * Set session data
   * เก็บ session data ใน Redis พร้อม TTL
   */
  public async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<boolean> {
    try {
      const key = `session:${sessionId}`;
      const value = JSON.stringify(data);
      return await this.set(key, value, ttl);
    } catch (error) {
      logger.error('Redis setSession error:', error);
      return false;
    }
  }

  /**
   * Get session data
   * ดึง session data จาก Redis
   */
  public async getSession(sessionId: string): Promise<any | null> {
    try {
      const key = `session:${sessionId}`;
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis getSession error:', error);
      return null;
    }
  }

  /**
   * Delete session
   * ลบ session data ออกจาก Redis
   */
  public async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const key = `session:${sessionId}`;
      return await this.del(key);
    } catch (error) {
      logger.error('Redis deleteSession error:', error);
      return false;
    }
  }
}

export { RedisService };
