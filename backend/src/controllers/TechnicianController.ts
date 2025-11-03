import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class TechnicianController {
  private db = DatabaseService.getInstance();

  public getAllTechnicians = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (search) {
        where.OR = [
          { employeeId: { contains: search as string } },
          { user: { firstName: { contains: search as string } } },
          { user: { lastName: { contains: search as string } } },
        ];
      }

      const [technicians, total] = await Promise.all([
        this.db.prisma.technician.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                isActive: true,
              },
            },
          },
        }),
        this.db.prisma.technician.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          technicians,
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

  public getTechnicianById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const technician = await this.db.prisma.technician.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isActive: true,
            },
          },
          workOrders: {
            include: {
              customer: true,
              device: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!technician) {
        throw new CustomError('Technician not found', 404);
      }

      res.json({
        success: true,
        data: { technician },
      });
    } catch (error) {
      next(error);
    }
  };

  public createTechnician = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const technicianData = req.body;

      const technician = await this.db.prisma.technician.create({
        data: technicianData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isActive: true,
            },
          },
        },
      });

      logger.info(`Technician created: ${technician.employeeId}`);

      res.status(201).json({
        success: true,
        data: { technician },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateTechnician = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const technician = await this.db.prisma.technician.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isActive: true,
            },
          },
        },
      });

      logger.info(`Technician updated: ${technician.employeeId}`);

      res.json({
        success: true,
        data: { technician },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteTechnician = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      await this.db.prisma.technician.delete({
        where: { id },
      });

      logger.info(`Technician deleted: ${id}`);

      res.json({
        success: true,
        message: 'Technician deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getTechnicianWorkOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const workOrders = await this.db.prisma.workOrder.findMany({
        where: { technicianId: id },
        include: {
          customer: true,
          device: true,
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

  public getTechnicianSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const schedule = await this.db.prisma.workSchedule.findMany({
        where: { technicianId: id },
        include: {
          workOrder: {
            include: {
              customer: true,
              device: true,
            },
          },
        },
        orderBy: { scheduledDate: 'asc' },
      });

      res.json({
        success: true,
        data: { schedule },
      });
    } catch (error) {
      next(error);
    }
  };

  public getTechnicianTimeLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const timeLogs = await this.db.prisma.timeLog.findMany({
        where: { technicianId: id },
        include: {
          workOrder: {
            include: {
              customer: true,
              device: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
      });

      res.json({
        success: true,
        data: { timeLogs },
      });
    } catch (error) {
      next(error);
    }
  };

  public createTimeLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const timeLogData = req.body;

      const timeLog = await this.db.prisma.timeLog.create({
        data: {
          ...timeLogData,
          technicianId: id,
        },
        include: {
          workOrder: {
            include: {
              customer: true,
              device: true,
            },
          },
        },
      });

      logger.info(`Time log created for technician ${id}`);

      res.status(201).json({
        success: true,
        data: { timeLog },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateTimeLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, logId } = req.params;
      const updateData = req.body;

      const timeLog = await this.db.prisma.timeLog.update({
        where: { id: logId },
        data: updateData,
        include: {
          workOrder: {
            include: {
              customer: true,
              device: true,
            },
          },
        },
      });

      logger.info(`Time log updated: ${logId}`);

      res.json({
        success: true,
        data: { timeLog },
      });
    } catch (error) {
      next(error);
    }
  };

  public getTechnicianPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const workOrders = await this.db.prisma.workOrder.findMany({
        where: { technicianId: id },
        include: {
          timeLogs: true,
        },
      });

      const totalWorkOrders = workOrders.length;
      const completedWorkOrders = workOrders.filter(wo => wo.status === 'CLOSURE').length;
      const totalHours = workOrders.reduce((sum, wo) => {
        return sum + wo.timeLogs.reduce((logSum, log) => logSum + (log.duration || 0), 0);
      }, 0) / 60;

      const performance = {
        totalWorkOrders,
        completedWorkOrders,
        completionRate: totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0,
        totalHours,
        averageHoursPerWorkOrder: totalWorkOrders > 0 ? totalHours / totalWorkOrders : 0,
      };

      res.json({
        success: true,
        data: { performance },
      });
    } catch (error) {
      next(error);
    }
  };

  public getStatsSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const totalTechnicians = await this.db.prisma.technician.count();
      const activeTechnicians = await this.db.prisma.technician.count({
        where: { isActive: true },
      });

      const stats = {
        totalTechnicians,
        activeTechnicians,
        inactiveTechnicians: totalTechnicians - activeTechnicians,
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
