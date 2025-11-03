/**
 * ASIC Repair Pro - Main Application Entry Point
 * 
 * ระบบจัดการซ่อม ASIC Mining แบบครบวงจร
 * จัดการลูกค้า อุปกรณ์ ใบงาน ช่างซ่อม พร้อมกับระบบแจ้งเตือนและรายงาน
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config } from './config/config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { authMiddleware } from './middleware/auth';

// Import routes - กำหนดเส้นทาง API ต่างๆ
import authRoutes from './routes/auth';
import workOrderRoutes from './routes/workOrders';
import customerRoutes from './routes/customers';
import deviceRoutes from './routes/devices';
import technicianRoutes from './routes/technicians';
import partsRoutes from './routes/parts';
import scheduleRoutes from './routes/schedule';
import warrantyRoutes from './routes/warranty';
import reportRoutes from './routes/reports';

// Import services - บริการหลักที่ใช้งาน
import { DatabaseService } from './services/DatabaseService';
import { RedisService } from './services/RedisService';
import { NotificationService } from './services/NotificationService';

/**
 * คลาสหลักของแอปพลิเคชัน
 * จัดการ middleware, routes, services และ Socket.IO
 */
class App {
  public app: express.Application;  // Express application instance
  public server: any;                // HTTP server instance
  public io: SocketIOServer;         // Socket.IO server สำหรับ real-time communication

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    
    // ตั้งค่า Socket.IO สำหรับ real-time communication
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    });

    // เริ่มต้นระบบต่างๆ
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeServices();
    this.initializeSocketIO();
  }

  /**
   * ตั้งค่า middleware ต่างๆ สำหรับ Express app
   * ครอบคลุม: security, CORS, rate limiting, compression, logging, body parsing
   */
  private initializeMiddlewares(): void {
    // Security middleware - ป้องกัน XSS, clickjacking และอื่นๆ
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration - อนุญาตให้ frontend เชื่อมต่อได้
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting - จำกัดจำนวน request เพื่อป้องกัน DDoS
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Compression - บีบอัด response เพื่อลด bandwidth
    this.app.use(compression());

    // Logging - บันทึก HTTP requests
    this.app.use(morgan('combined', {
      stream: { write: (message: string) => logger.info(message.trim()) }
    }));

    // Body parsing - แปลง JSON และ URL-encoded data
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Health check endpoint - ตรวจสอบสถานะของเซิร์ฟเวอร์
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API documentation endpoint - แสดงรายละเอียด API endpoints ทั้งหมด
    this.app.get('/api-docs', (req, res) => {
      res.json({
        message: 'API Documentation',
        version: '1.0.0',
        endpoints: {
          auth: '/api/v1/auth',
          workOrders: '/api/v1/work-orders',
          customers: '/api/v1/customers',
          devices: '/api/v1/devices',
          technicians: '/api/v1/technicians',
          parts: '/api/v1/parts',
          schedule: '/api/v1/schedule',
          warranty: '/api/v1/warranty',
          reports: '/api/v1/reports'
        }
      });
    });
  }

  /**
   * ตั้งค่า routes สำหรับ API endpoints ต่างๆ
   * ส่วนใหญ่ต้องการ authentication ยกเว้น auth route
   */
  private initializeRoutes(): void {
    // API routes - กำหนดเส้นทาง API ต่างๆ
    this.app.use('/api/v1/auth', authRoutes);                          // Authentication (ไม่ต้อง login)
    this.app.use('/api/v1/work-orders', authMiddleware, workOrderRoutes);  // ใบงานซ่อม
    this.app.use('/api/v1/customers', authMiddleware, customerRoutes);     // ลูกค้า
    this.app.use('/api/v1/devices', authMiddleware, deviceRoutes);         // อุปกรณ์ ASIC
    this.app.use('/api/v1/technicians', authMiddleware, technicianRoutes); // ช่างซ่อม
    this.app.use('/api/v1/parts', authMiddleware, partsRoutes);           // อะไหล่/สต็อค
    this.app.use('/api/v1/schedule', authMiddleware, scheduleRoutes);     // ตารางงาน
    this.app.use('/api/v1/warranty', authMiddleware, warrantyRoutes);     // การรับประกัน
    this.app.use('/api/v1/reports', authMiddleware, reportRoutes);        // รายงาน
  }

  /**
   * ตั้งค่า error handling
   * จัดการ 404 และ global error handler
   */
  private initializeErrorHandling(): void {
    // 404 handler - เมื่อไม่พบ route ที่กำหนด
    this.app.use(notFoundHandler);

    // Global error handler - จัดการ error ทุกประเภท
    this.app.use(errorHandler);
  }

  /**
   * เริ่มต้น services ต่างๆ
   * รวมถึง: Database, Redis, Notification Service
   */
  private async initializeServices(): Promise<void> {
    try {
      // Initialize database - เชื่อมต่อกับ PostgreSQL ผ่าน Prisma
      await DatabaseService.initialize();
      logger.info('Database connected successfully');

      // Initialize Redis - สำหรับ caching และ session management
      await RedisService.initialize();
      logger.info('Redis connected successfully');

      // Initialize notification service - สำหรับส่งอีเมลและ SMS
      await NotificationService.initialize();
      logger.info('Notification service initialized');

    } catch (error) {
      logger.error('Failed to initialize services:', error);
      process.exit(1);
    }
  }

  /**
   * ตั้งค่า Socket.IO สำหรับ real-time communication
   * จัดการ events: connection, join-user-room, work-order-update
   */
  private initializeSocketIO(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Join user to their room for notifications - ให้ user เข้าร่วมห้องของตัวเอง
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`);
        logger.info(`User ${userId} joined their room`);
      });

      // Handle work order updates - แจ้งเตือนเมื่อมีการอัปเดตใบงาน
      socket.on('work-order-update', (data) => {
        this.io.emit('work-order-updated', data);
      });

      // Handle disconnection - จัดการเมื่อ client disconnect
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * เริ่มต้นเซิร์ฟเวอร์บนพอร์ตที่กำหนด
   * แสดงข้อมูล URL ของ API Documentation และ Health Check
   */
  public listen(): void {
    this.server.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${config.port}/health`);
    });
  }
}

// Create and start the application
const app = new App();
app.listen();

// Graceful shutdown - ปิดระบบอย่างปลอดภัยเมื่อได้รับสัญญาณ SIGTERM หรือ SIGINT
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
