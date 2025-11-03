import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class WarrantyController {
  private db = DatabaseService.getInstance();

  public getAllWarranties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 20, search, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (search) {
        where.OR = [
          { device: { model: { contains: search as string } } },
          { device: { serialNumber: { contains: search as string } } },
        ];
      }
      if (status) {
        where.status = status;
      }

      const [warranties, total] = await Promise.all([
        this.db.prisma.warranty.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { startDate: 'desc' },
          include: {
            device: {
              include: {
                customer: true,
              },
            },
            workOrder: true,
            warrantyType: true,
          },
        }),
        this.db.prisma.warranty.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          warranties,
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

  public getWarrantyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const warranty = await this.db.prisma.warranty.findUnique({
        where: { id },
        include: {
          device: {
            include: {
              customer: true,
            },
          },
          workOrder: true,
          warrantyType: true,
        },
      });

      if (!warranty) {
        throw new CustomError('Warranty not found', 404);
      }

      res.json({
        success: true,
        data: { warranty },
      });
    } catch (error) {
      next(error);
    }
  };

  public createWarranty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const warrantyData = req.body;

      const warranty = await this.db.prisma.warranty.create({
        data: warrantyData,
        include: {
          device: {
            include: {
              customer: true,
            },
          },
          workOrder: true,
          warrantyType: true,
        },
      });

      logger.info(`Warranty created: ${warranty.id}`);

      res.status(201).json({
        success: true,
        data: { warranty },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateWarranty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const warranty = await this.db.prisma.warranty.update({
        where: { id },
        data: updateData,
        include: {
          device: {
            include: {
              customer: true,
            },
          },
          workOrder: true,
          warrantyType: true,
        },
      });

      logger.info(`Warranty updated: ${warranty.id}`);

      res.json({
        success: true,
        data: { warranty },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteWarranty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      await this.db.prisma.warranty.delete({
        where: { id },
      });

      logger.info(`Warranty deleted: ${id}`);

      res.json({
        success: true,
        message: 'Warranty deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getDeviceWarranties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { deviceId } = req.params;

      const warranties = await this.db.prisma.warranty.findMany({
        where: { deviceId },
        include: {
          workOrder: true,
          warrantyType: true,
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

  public getWorkOrderWarranties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { workOrderId } = req.params;

      const warranties = await this.db.prisma.warranty.findMany({
        where: { workOrderId },
        include: {
          device: {
            include: {
              customer: true,
            },
          },
          warrantyType: true,
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

  public getExpiringWarranties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { days = 30 } = req.query;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + Number(days));

      const expiringWarranties = await this.db.prisma.warranty.findMany({
        where: {
          status: 'ACTIVE',
          endDate: {
            lte: futureDate,
          },
        },
        include: {
          device: {
            include: {
              customer: true,
            },
          },
          workOrder: true,
          warrantyType: true,
        },
        orderBy: { endDate: 'asc' },
      });

      res.json({
        success: true,
        data: { expiringWarranties },
      });
    } catch (error) {
      next(error);
    }
  };

  public createWarrantyClaim = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const claimData = req.body;

      // Check if warranty is still active
      const warranty = await this.db.prisma.warranty.findUnique({
        where: { id },
      });

      if (!warranty) {
        throw new CustomError('Warranty not found', 404);
      }

      if (warranty.status !== 'ACTIVE') {
        throw new CustomError('Warranty is not active', 400);
      }

      if (warranty.endDate < new Date()) {
        throw new CustomError('Warranty has expired', 400);
      }

      // Create warranty claim (this would need a separate table in a real implementation)
      logger.info(`Warranty claim created for warranty ${id}`);

      res.status(201).json({
        success: true,
        message: 'Warranty claim created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getWarrantyClaims = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // This would need a separate warranty claims table in a real implementation
      res.json({
        success: true,
        data: { claims: [] },
      });
    } catch (error) {
      next(error);
    }
  };

  public getAllWarrantyTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const warrantyTypes = await this.db.prisma.warrantyType.findMany({
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        data: { warrantyTypes },
      });
    } catch (error) {
      next(error);
    }
  };

  public createWarrantyType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const warrantyTypeData = req.body;

      const warrantyType = await this.db.prisma.warrantyType.create({
        data: warrantyTypeData,
      });

      logger.info(`Warranty type created: ${warrantyType.name}`);

      res.status(201).json({
        success: true,
        data: { warrantyType },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateWarrantyType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const warrantyType = await this.db.prisma.warrantyType.update({
        where: { id },
        data: updateData,
      });

      logger.info(`Warranty type updated: ${warrantyType.name}`);

      res.json({
        success: true,
        data: { warrantyType },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteWarrantyType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      await this.db.prisma.warrantyType.delete({
        where: { id },
      });

      logger.info(`Warranty type deleted: ${id}`);

      res.json({
        success: true,
        message: 'Warranty type deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getStatsSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const totalWarranties = await this.db.prisma.warranty.count();
      const activeWarranties = await this.db.prisma.warranty.count({
        where: { status: 'ACTIVE' },
      });
      const expiredWarranties = await this.db.prisma.warranty.count({
        where: { status: 'EXPIRED' },
      });
      const voidWarranties = await this.db.prisma.warranty.count({
        where: { status: 'VOID' },
      });

      const stats = {
        totalWarranties,
        activeWarranties,
        expiredWarranties,
        voidWarranties,
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
