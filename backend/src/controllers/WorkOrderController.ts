/**
 * Work Order Controller
 * 
 * จัดการใบงานซ่อม ASIC ทั้งหมด:
 * - CRUD operations: สร้าง, อ่าน, อัปเดต, ลบใบงาน
 * - Status management: จัดการสถานะใบงาน
 * - Technician assignment: มอบหมายงานให้ช่าง
 * - Diagnostics: บันทึกผลการวินิจฉัย
 * - Documents: จัดการเอกสารที่เกี่ยวข้อง
 * - Timeline: ติดตาม timeline ของงาน
 */

import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { NotificationService } from '../services/NotificationService';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class WorkOrderController {
  private db = DatabaseService.getInstance();           // Database service
  private notification = NotificationService.getInstance();  // Notification service

  /**
   * ดึงรายการใบงานทั้งหมด (พร้อม pagination และ filters)
   * รองรับการ filter ตาม: status, priority, technician, customer
   * รองรับการค้นหาจาก: work order ID, description, customer name, device model
   */
  public getAllWorkOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 20, search, status, priority, technicianId, customerId } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build where clause - สร้างเงื่อนไขการค้นหาและ filter
      const where: any = {};
      
      // Search filter - ค้นหาในหลายๆ ฟิลด์
      if (search) {
        where.OR = [
          { woId: { contains: search as string } },              // ค้นหาจาก Work Order ID
          { description: { contains: search as string } },       // ค้นหาจากคำอธิบาย
          { customer: { companyName: { contains: search as string } } },  // ค้นหาจากชื่อบริษัท
          { device: { model: { contains: search as string } } }, // ค้นหาจากรุ่นอุปกรณ์
        ];
      }

      // Status filter - กรองตามสถานะ
      if (status) {
        where.status = status;
      }

      // Priority filter - กรองตามความสำคัญ
      if (priority) {
        where.priority = priority;
      }

      // Technician filter - กรองตามช่างซ่อม
      if (technicianId) {
        where.technicianId = technicianId;
      }

      // Customer filter - กรองตามลูกค้า
      if (customerId) {
        where.customerId = customerId;
      }

      const [workOrders, total] = await Promise.all([
        this.db.prisma.workOrder.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                id: true,
                companyName: true,
                email: true,
                phone: true,
              },
            },
            device: {
              select: {
                id: true,
                model: true,
                serialNumber: true,
              },
            },
            technician: {
              select: {
                id: true,
                employeeId: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            _count: {
              select: {
                diagnostics: true,
                partsUsage: true,
                timeLogs: true,
                documents: true,
              },
            },
          },
        }),
        this.db.prisma.workOrder.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          workOrders,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ดึงข้อมูลใบงานตาม ID (พร้อม relations ทั้งหมด)
   * รวมข้อมูล: customer, device, technician, diagnostics, parts usage, time logs, documents, warranties
   */
  public getWorkOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Find work order with all relations - ดึงข้อมูลใบงานพร้อม relations ทั้งหมด
      const workOrder = await this.db.prisma.workOrder.findUnique({
        where: { id },
        include: {
          // Customer information - ข้อมูลลูกค้า
          customer: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              email: true,
              phone: true,
              address: true,
            },
          },
          // Device information - ข้อมูลอุปกรณ์
          device: {
            select: {
              id: true,
              model: true,
              serialNumber: true,
              hashrate: true,
              powerConsumption: true,
              purchaseDate: true,
              warrantyStartDate: true,
              warrantyEndDate: true,
              status: true,
            },
          },
          // Technician information - ข้อมูลช่างซ่อม
          technician: {
            select: {
              id: true,
              employeeId: true,
              skills: true,
              hourlyRate: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          // Diagnostics - ผลการวินิจฉัย
          diagnostics: {
            orderBy: { createdAt: 'desc' },
          },
          // Parts usage - การใช้อะไหล่
          partsUsage: {
            include: {
              part: {
                select: {
                  id: true,
                  partNumber: true,
                  model: true,
                  cost: true,
                },
              },
            },
          },
          // Time logs - บันทึกเวลา
          timeLogs: {
            include: {
              technician: {
                select: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
            orderBy: { startTime: 'desc' },
          },
          // Documents - เอกสารที่เกี่ยวข้อง
          documents: {
            orderBy: { uploadedAt: 'desc' },
          },
          // Warranties - การรับประกัน
          warranties: {
            include: {
              warrantyType: true,
            },
          },
        },
      });

      if (!workOrder) {
        throw new CustomError('Work order not found', 404);
      }

      res.json({
        success: true,
        data: { workOrder },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * สร้างใบงานใหม่
   * สร้าง Work Order ID แบบ auto-increment
   * ส่ง notification ไปยังลูกค้าเมื่อสร้างใบงานสำเร็จ
   */
  public createWorkOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { customerId, deviceId, description, priority = 'MEDIUM' } = req.body;
      const userId = (req as any).user.id;  // ผู้ใช้ที่สร้างใบงาน

      // Generate WO_ID - สร้าง Work Order ID แบบ auto-increment
      const woId = await this.generateWorkOrderId();

      const workOrder = await this.db.prisma.workOrder.create({
        data: {
          woId,
          customerId,
          deviceId,
          description,
          priority,
          status: 'TRIAGE',  // Auto-set status to TRIAGE
          createdBy: userId,
          updatedBy: userId,
        },
        include: {
          customer: {
            select: {
              id: true,
              companyName: true,
              email: true,
            },
          },
          device: {
            select: {
              id: true,
              model: true,
              serialNumber: true,
            },
          },
          technician: {
            select: {
              id: true,
              employeeId: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      // Send notification to customer - ส่ง notification ไปยังลูกค้า
      await this.notification.notifyWorkOrderCreated(workOrder, workOrder.customer);

      logger.info(`Work order created: ${woId}`);

      res.status(201).json({
        success: true,
        data: { workOrder },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateWorkOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = (req as any).user.id;

      // Get current work order to check status change
      const currentWorkOrder = await this.db.prisma.workOrder.findUnique({
        where: { id },
        include: {
          customer: true,
        },
      });

      if (!currentWorkOrder) {
        throw new CustomError('Work order not found', 404);
      }

      const workOrder = await this.db.prisma.workOrder.update({
        where: { id },
        data: {
          ...updateData,
          updatedBy: userId,
          updatedAt: new Date(),
        },
        include: {
          customer: {
            select: {
              id: true,
              companyName: true,
              email: true,
            },
          },
          device: {
            select: {
              id: true,
              model: true,
              serialNumber: true,
            },
          },
          technician: {
            select: {
              id: true,
              employeeId: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      // Send notification if status changed
      if (updateData.status && updateData.status !== currentWorkOrder.status) {
        await this.notification.notifyWorkOrderStatusUpdate(
          workOrder,
          workOrder.customer,
          currentWorkOrder.status
        );
      }

      logger.info(`Work order updated: ${workOrder.woId}`);

      res.json({
        success: true,
        data: { workOrder },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteWorkOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const workOrder = await this.db.prisma.workOrder.findUnique({
        where: { id },
      });

      if (!workOrder) {
        throw new CustomError('Work order not found', 404);
      }

      // Check if work order can be deleted (only if status is TRIAGE)
      if (workOrder.status !== 'TRIAGE') {
        throw new CustomError('Cannot delete work order that is not in TRIAGE status', 400);
      }

      await this.db.prisma.workOrder.delete({
        where: { id },
      });

      logger.info(`Work order deleted: ${workOrder.woId}`);

      res.json({
        success: true,
        message: 'Work order deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public createDiagnostic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { faultType, faultDescription, diagnosisNotes, recommendedParts, estimatedRepairTime } = req.body;
      const userId = (req as any).user.id;

      const diagnostic = await this.db.prisma.diagnostic.create({
        data: {
          workOrderId: id,
          faultType,
          faultDescription,
          diagnosisNotes,
          recommendedParts,
          estimatedRepairTime,
          createdBy: userId,
        },
      });

      logger.info(`Diagnostic created for work order: ${id}`);

      res.status(201).json({
        success: true,
        data: { diagnostic },
      });
    } catch (error) {
      next(error);
    }
  };

  public getDiagnostics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const diagnostics = await this.db.prisma.diagnostic.findMany({
        where: { workOrderId: id },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: { diagnostics },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = (req as any).user.id;

      const workOrder = await this.db.prisma.workOrder.update({
        where: { id },
        data: {
          status,
          updatedBy: userId,
          updatedAt: new Date(),
          ...(status === 'CLOSURE' && { completedAt: new Date() }),
        },
        include: {
          customer: true,
        },
      });

      logger.info(`Work order status updated: ${workOrder.woId} -> ${status}`);

      res.json({
        success: true,
        data: { workOrder },
      });
    } catch (error) {
      next(error);
    }
  };

  public assignTechnician = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { technicianId } = req.body;
      const userId = (req as any).user.id;

      const workOrder = await this.db.prisma.workOrder.update({
        where: { id },
        data: {
          technicianId,
          updatedBy: userId,
          updatedAt: new Date(),
        },
        include: {
          technician: {
            select: {
              id: true,
              employeeId: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      logger.info(`Technician assigned to work order: ${workOrder.woId}`);

      res.json({
        success: true,
        data: { workOrder },
      });
    } catch (error) {
      next(error);
    }
  };

  public getTimeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const timeline = await this.db.prisma.workOrder.findUnique({
        where: { id },
        select: {
          woId: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
          diagnostics: {
            select: {
              faultType: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
          },
          timeLogs: {
            select: {
              activityType: true,
              startTime: true,
              endTime: true,
              duration: true,
              technician: {
                select: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
            orderBy: { startTime: 'asc' },
          },
        },
      });

      if (!timeline) {
        throw new CustomError('Work order not found', 404);
      }

      res.json({
        success: true,
        data: { timeline },
      });
    } catch (error) {
      next(error);
    }
  };

  public uploadDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { documentType } = req.body;
      const userId = (req as any).user.id;

      // This would typically handle file upload
      // For now, we'll just create a placeholder
      const document = await this.db.prisma.workOrderDocument.create({
        data: {
          workOrderId: id,
          documentType,
          filePath: 'placeholder/path',
          fileName: 'placeholder.pdf',
          fileSize: 0,
          mimeType: 'application/pdf',
          uploadedBy: userId,
        },
      });

      logger.info(`Document uploaded for work order: ${id}`);

      res.status(201).json({
        success: true,
        data: { document },
      });
    } catch (error) {
      next(error);
    }
  };

  public getDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const documents = await this.db.prisma.workOrderDocument.findMany({
        where: { workOrderId: id },
        orderBy: { uploadedAt: 'desc' },
      });

      res.json({
        success: true,
        data: { documents },
      });
    } catch (error) {
      next(error);
    }
  };

  public getStatsSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const [
        totalWorkOrders,
        completedWorkOrders,
        inProgressWorkOrders,
        pendingWorkOrders,
        averageCompletionTime,
      ] = await Promise.all([
        this.db.prisma.workOrder.count({ where }),
        this.db.prisma.workOrder.count({ where: { ...where, status: 'CLOSURE' } }),
        this.db.prisma.workOrder.count({ where: { ...where, status: 'EXECUTION' } }),
        this.db.prisma.workOrder.count({ where: { ...where, status: 'TRIAGE' } }),
        this.db.prisma.workOrder.aggregate({
          where: { ...where, status: 'CLOSURE' },
          _avg: {
            // This would need to be calculated based on createdAt and completedAt
          },
        }),
      ]);

      const stats = {
        totalWorkOrders,
        completedWorkOrders,
        inProgressWorkOrders,
        pendingWorkOrders,
        completionRate: totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0,
        averageCompletionTime: 0, // Would need proper calculation
      };

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  };

  public getTechnicianPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const technicianPerformance = await this.db.prisma.technician.findMany({
        where: { isActive: true },
        select: {
          id: true,
          employeeId: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          workOrders: {
            where: { ...where },
            select: {
              id: true,
              status: true,
              createdAt: true,
              completedAt: true,
            },
          },
          timeLogs: {
            where: { ...where },
            select: {
              duration: true,
              totalCost: true,
            },
          },
        },
      });

      const performance = technicianPerformance.map(tech => ({
        id: tech.id,
        employeeId: tech.employeeId,
        name: `${tech.user.firstName} ${tech.user.lastName}`,
        totalWorkOrders: tech.workOrders.length,
        completedWorkOrders: tech.workOrders.filter(wo => wo.status === 'CLOSURE').length,
        totalHours: tech.timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / 60,
        totalCost: tech.timeLogs.reduce((sum, log) => sum + Number(log.totalCost || 0), 0),
      }));

      res.json({
        success: true,
        data: { performance },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * สร้าง Work Order ID แบบ auto-increment
   * Format: YYMMDDXXX
   * ตัวอย่าง: 241230001 (วันที่ 30 ธันวาคม 2024, งานแรก)
   * - YY: ปี 2 หลัก (24 = 2024)
   * - MMDD: เดือน-วัน (1230 = 30 ธันวาคม)
   * - XXX: เลขรัน 001-999
   */
  private async generateWorkOrderId(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);  // YY (ปี 2 หลัก)
    const month = (today.getMonth() + 1).toString().padStart(2, '0');  // MM
    const day = today.getDate().toString().padStart(2, '0');  // DD
    const datePrefix = `${year}${month}${day}`;  // YYMMDD
    
    // Get the last work order for today - ดึงใบงานล่าสุดของวันนี้
    const lastWorkOrder = await this.db.prisma.workOrder.findFirst({
      where: {
        woId: {
          startsWith: datePrefix,
        },
      },
      orderBy: { woId: 'desc' },
    });

    // Calculate sequence - คำนวณ sequence number
    let sequence = 1;
    if (lastWorkOrder) {
      // Extract sequence from last WO_ID (last 3 digits)
      const lastSequence = parseInt(lastWorkOrder.woId.slice(-3));
      sequence = lastSequence + 1;
    }

    // Check if sequence exceeds 999 - ตรวจสอบว่าลำดับเกิน 999 หรือไม่
    if (sequence > 999) {
      throw new CustomError(
        `Maximum work orders per day reached (999). Cannot create more work orders for today.`,
        400
      );
    }

    // Format: YYMMDDXXX
    return `${datePrefix}${sequence.toString().padStart(3, '0')}`;
  }
}
