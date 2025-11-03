import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class PartsController {
  private db = DatabaseService.getInstance();

  public getAllParts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 20, search, categoryId, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (search) {
        where.OR = [
          { partNumber: { contains: search as string } },
          { serialNumber: { contains: search as string } },
          { model: { contains: search as string } },
        ];
      }
      if (categoryId) {
        where.categoryId = categoryId;
      }
      if (status) {
        where.status = status;
      }

      const [parts, total] = await Promise.all([
        this.db.prisma.part.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            category: true,
          },
        }),
        this.db.prisma.part.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          parts,
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

  public getPartById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const part = await this.db.prisma.part.findUnique({
        where: { id },
        include: {
          category: true,
          partsUsage: {
            include: {
              workOrder: {
                include: {
                  customer: true,
                  device: true,
                },
              },
            },
            orderBy: { usedAt: 'desc' },
          },
        },
      });

      if (!part) {
        throw new CustomError('Part not found', 404);
      }

      res.json({
        success: true,
        data: { part },
      });
    } catch (error) {
      next(error);
    }
  };

  public createPart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const partData = req.body;

      const part = await this.db.prisma.part.create({
        data: partData,
        include: {
          category: true,
        },
      });

      logger.info(`Part created: ${part.partNumber}`);

      res.status(201).json({
        success: true,
        data: { part },
      });
    } catch (error) {
      next(error);
    }
  };

  public updatePart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const part = await this.db.prisma.part.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
        },
      });

      logger.info(`Part updated: ${part.partNumber}`);

      res.json({
        success: true,
        data: { part },
      });
    } catch (error) {
      next(error);
    }
  };

  public deletePart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      await this.db.prisma.part.delete({
        where: { id },
      });

      logger.info(`Part deleted: ${id}`);

      res.json({
        success: true,
        message: 'Part deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getPartBySerialNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { serialNumber } = req.params;

      const part = await this.db.prisma.part.findUnique({
        where: { serialNumber },
        include: {
          category: true,
        },
      });

      if (!part) {
        throw new CustomError('Part not found', 404);
      }

      res.json({
        success: true,
        data: { part },
      });
    } catch (error) {
      next(error);
    }
  };

  public getPartsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { categoryId } = req.params;

      const parts = await this.db.prisma.part.findMany({
        where: { categoryId },
        include: {
          category: true,
        },
        orderBy: { partNumber: 'asc' },
      });

      res.json({
        success: true,
        data: { parts },
      });
    } catch (error) {
      next(error);
    }
  };

  public issuePart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { workOrderId, quantity, usedBy } = req.body;

      const part = await this.db.prisma.part.findUnique({
        where: { id },
      });

      if (!part) {
        throw new CustomError('Part not found', 404);
      }

      if (part.quantityInStock < quantity) {
        throw new CustomError('Insufficient stock', 400);
      }

      // Update stock
      await this.db.prisma.part.update({
        where: { id },
        data: {
          quantityInStock: part.quantityInStock - quantity,
        },
      });

      // Create parts usage record
      const partsUsage = await this.db.prisma.partsUsage.create({
        data: {
          workOrderId,
          partId: id,
          quantity,
          unitCost: part.cost,
          totalCost: Number(part.cost) * quantity,
          usedBy,
        },
      });

      logger.info(`Part issued: ${part.partNumber} - Quantity: ${quantity}`);

      res.json({
        success: true,
        data: { partsUsage },
      });
    } catch (error) {
      next(error);
    }
  };

  public returnPart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const part = await this.db.prisma.part.findUnique({
        where: { id },
      });

      if (!part) {
        throw new CustomError('Part not found', 404);
      }

      // Update stock
      await this.db.prisma.part.update({
        where: { id },
        data: {
          quantityInStock: part.quantityInStock + quantity,
        },
      });

      logger.info(`Part returned: ${part.partNumber} - Quantity: ${quantity}`);

      res.json({
        success: true,
        message: 'Part returned successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getPartUsageHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const usageHistory = await this.db.prisma.partsUsage.findMany({
        where: { partId: id },
        include: {
          workOrder: {
            include: {
              customer: true,
              device: true,
            },
          },
        },
        orderBy: { usedAt: 'desc' },
      });

      res.json({
        success: true,
        data: { usageHistory },
      });
    } catch (error) {
      next(error);
    }
  };

  public getLowStockParts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lowStockParts = await this.db.prisma.part.findMany({
        where: {
          quantityInStock: {
            lte: this.db.prisma.part.fields.minStockLevel,
          },
        },
        include: {
          category: true,
        },
        orderBy: { quantityInStock: 'asc' },
      });

      res.json({
        success: true,
        data: { lowStockParts },
      });
    } catch (error) {
      next(error);
    }
  };

  public adjustStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { partId, adjustment, reason, adjustedBy } = req.body;

      const part = await this.db.prisma.part.findUnique({
        where: { id: partId },
      });

      if (!part) {
        throw new CustomError('Part not found', 404);
      }

      const newQuantity = part.quantityInStock + adjustment;

      if (newQuantity < 0) {
        throw new CustomError('Stock adjustment would result in negative quantity', 400);
      }

      await this.db.prisma.part.update({
        where: { id: partId },
        data: {
          quantityInStock: newQuantity,
        },
      });

      logger.info(`Stock adjusted for part ${part.partNumber}: ${adjustment} (${reason})`);

      res.json({
        success: true,
        message: 'Stock adjusted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.db.prisma.partCategory.findMany({
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  };

  public createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryData = req.body;

      const category = await this.db.prisma.partCategory.create({
        data: categoryData,
      });

      logger.info(`Part category created: ${category.name}`);

      res.status(201).json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const category = await this.db.prisma.partCategory.update({
        where: { id },
        data: updateData,
      });

      logger.info(`Part category updated: ${category.name}`);

      res.json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      await this.db.prisma.partCategory.delete({
        where: { id },
      });

      logger.info(`Part category deleted: ${id}`);

      res.json({
        success: true,
        message: 'Part category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getStatsSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const totalParts = await this.db.prisma.part.count();
      const lowStockParts = await this.db.prisma.part.count({
        where: {
          quantityInStock: {
            lte: this.db.prisma.part.fields.minStockLevel,
          },
        },
      });
      const outOfStockParts = await this.db.prisma.part.count({
        where: {
          quantityInStock: 0,
        },
      });

      const stats = {
        totalParts,
        lowStockParts,
        outOfStockParts,
        availableParts: totalParts - outOfStockParts,
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
