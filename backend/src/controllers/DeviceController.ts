import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class DeviceController {
  private db = DatabaseService.getInstance();

  public getAllDevices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 20, search, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (search) {
        where.OR = [
          { model: { contains: search as string } },
          { serialNumber: { contains: search as string } },
        ];
      }
      if (status) {
        where.status = status;
      }

      const [devices, total] = await Promise.all([
        this.db.prisma.device.findMany({
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
              },
            },
          },
        }),
        this.db.prisma.device.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          devices,
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

  public getDeviceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const device = await this.db.prisma.device.findUnique({
        where: { id },
        include: {
          customer: true,
          workOrders: {
            include: {
              technician: {
                include: {
                  user: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          warranties: {
            include: {
              warrantyType: true,
            },
            orderBy: { startDate: 'desc' },
          },
        },
      });

      if (!device) {
        throw new CustomError('Device not found', 404);
      }

      res.json({
        success: true,
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  };

  public createDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deviceData = req.body;

      const device = await this.db.prisma.device.create({
        data: deviceData,
      });

      logger.info(`Device created: ${device.model} - ${device.serialNumber}`);

      res.status(201).json({
        success: true,
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * สร้างอุปกรณ์แบบ Quick Add (สำหรับรับงาน)
   * รับข้อมูลขั้นต่ำ: customerId, model
   * Optional: serialNumber, purchaseDate, warrantyExpiry
   * Auto-set status = ACTIVE
   */
  public quickCreateDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { customerId, model, serialNumber, purchaseDate, warrantyExpiry } = req.body;

      // Generate unique serialNumber if not provided
      // Since serialNumber is required and unique, generate one if missing
      const finalSerialNumber = serialNumber || `TEMP_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Verify customer exists
      const customer = await this.db.prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new CustomError('Customer not found', 404);
      }

      // Create device with minimal data - สร้างอุปกรณ์ด้วยข้อมูลขั้นต่ำ
      const device = await this.db.prisma.device.create({
        data: {
          customerId,
          model,
          serialNumber: finalSerialNumber,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
          warrantyEndDate: warrantyExpiry ? new Date(warrantyExpiry) : null,
          status: 'ACTIVE',  // Auto-set status to ACTIVE
        },
      });

      logger.info(`Device quick created: ${device.model} - ${device.serialNumber || 'N/A'}`);

      res.status(201).json({
        success: true,
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const device = await this.db.prisma.device.update({
        where: { id },
        data: updateData,
      });

      logger.info(`Device updated: ${device.model} - ${device.serialNumber}`);

      res.json({
        success: true,
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      await this.db.prisma.device.delete({
        where: { id },
      });

      logger.info(`Device deleted: ${id}`);

      res.json({
        success: true,
        message: 'Device deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getDeviceBySerialNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { serialNumber } = req.params;

      const device = await this.db.prisma.device.findUnique({
        where: { serialNumber },
        include: {
          customer: true,
          workOrders: {
            include: {
              technician: {
                include: {
                  user: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!device) {
        throw new CustomError('Device not found', 404);
      }

      res.json({
        success: true,
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  };

  public getDeviceWorkOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const workOrders = await this.db.prisma.workOrder.findMany({
        where: { deviceId: id },
        include: {
          customer: true,
          technician: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: { workOrders },
      });
    } catch (error) {
      next(error);
    }
  };

  public getDeviceWarranties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const warranties = await this.db.prisma.warranty.findMany({
        where: { deviceId: id },
        include: {
          warrantyType: true,
          workOrder: true,
        },
        orderBy: { startDate: 'desc' },
      });

      res.json({
        success: true,
        data: { warranties },
      });
    } catch (error) {
      next(error);
    }
  };

  public createWarranty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const warrantyData = req.body;

      const warranty = await this.db.prisma.warranty.create({
        data: {
          ...warrantyData,
          deviceId: id,
        },
        include: {
          warrantyType: true,
        },
      });

      logger.info(`Warranty created for device ${id}`);

      res.status(201).json({
        success: true,
        data: { warranty },
      });
    } catch (error) {
      next(error);
    }
  };

  public getStatsSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const totalDevices = await this.db.prisma.device.count();
      const activeDevices = await this.db.prisma.device.count({
        where: { status: 'ACTIVE' },
      });
      const repairDevices = await this.db.prisma.device.count({
        where: { status: 'REPAIR' },
      });
      const retiredDevices = await this.db.prisma.device.count({
        where: { status: 'RETIRED' },
      });

      const stats = {
        totalDevices,
        activeDevices,
        repairDevices,
        retiredDevices,
      };

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  };
}
