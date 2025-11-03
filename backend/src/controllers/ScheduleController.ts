import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class ScheduleController {
  private db = DatabaseService.getInstance();

  public getAllSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 20, startDate, endDate } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (startDate && endDate) {
        where.scheduledDate = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const [schedules, total] = await Promise.all([
        this.db.prisma.workSchedule.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { scheduledDate: 'asc' },
          include: {
            workOrder: {
              include: {
                customer: true,
                device: true,
              },
            },
            technician: {
              include: {
                user: true,
              },
            },
          },
        }),
        this.db.prisma.workSchedule.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          schedules,
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

  public getScheduleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const schedule = await this.db.prisma.workSchedule.findUnique({
        where: { id },
        include: {
          workOrder: {
            include: {
              customer: true,
              device: true,
            },
          },
          technician: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!schedule) {
        throw new CustomError('Schedule not found', 404);
      }

      res.json({
        success: true,
        data: { schedule },
      });
    } catch (error) {
      next(error);
    }
  };

  public createSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const scheduleData = req.body;

      const schedule = await this.db.prisma.workSchedule.create({
        data: scheduleData,
        include: {
          workOrder: {
            include: {
              customer: true,
              device: true,
            },
          },
          technician: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.info(`Schedule created: ${schedule.id}`);

      res.status(201).json({
        success: true,
        data: { schedule },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const schedule = await this.db.prisma.workSchedule.update({
        where: { id },
        data: updateData,
        include: {
          workOrder: {
            include: {
              customer: true,
              device: true,
            },
          },
          technician: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.info(`Schedule updated: ${schedule.id}`);

      res.json({
        success: true,
        data: { schedule },
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      await this.db.prisma.workSchedule.delete({
        where: { id },
      });

      logger.info(`Schedule deleted: ${id}`);

      res.json({
        success: true,
        message: 'Schedule deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getTechnicianSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { technicianId } = req.params;
      const { startDate, endDate } = req.query;

      const where: any = { technicianId };
      if (startDate && endDate) {
        where.scheduledDate = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const schedules = await this.db.prisma.workSchedule.findMany({
        where,
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
        data: { schedules },
      });
    } catch (error) {
      next(error);
    }
  };

  public getScheduleByDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { date } = req.params;

      const schedules = await this.db.prisma.workSchedule.findMany({
        where: {
          scheduledDate: new Date(date),
        },
        include: {
          workOrder: {
            include: {
              customer: true,
              device: true,
            },
          },
          technician: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { startTime: 'asc' },
      });

      res.json({
        success: true,
        data: { schedules },
      });
    } catch (error) {
      next(error);
    }
  };

  public getScheduleByRange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const schedules = await this.db.prisma.workSchedule.findMany({
        where: {
          scheduledDate: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        },
        include: {
          workOrder: {
            include: {
              customer: true,
              device: true,
            },
          },
          technician: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { scheduledDate: 'asc' },
      });

      res.json({
        success: true,
        data: { schedules },
      });
    } catch (error) {
      next(error);
    }
  };

  public startSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const schedule = await this.db.prisma.workSchedule.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
        },
        include: {
          workOrder: {
            include: {
              customer: true,
              device: true,
            },
          },
          technician: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.info(`Schedule started: ${schedule.id}`);

      res.json({
        success: true,
        data: { schedule },
      });
    } catch (error) {
      next(error);
    }
  };

  public completeSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const schedule = await this.db.prisma.workSchedule.update({
        where: { id },
        data: {
          status: 'COMPLETED',
        },
        include: {
          workOrder: {
            include: {
              customer: true,
              device: true,
            },
          },
          technician: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.info(`Schedule completed: ${schedule.id}`);

      res.json({
        success: true,
        data: { schedule },
      });
    } catch (error) {
      next(error);
    }
  };

  public cancelSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const schedule = await this.db.prisma.workSchedule.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
        include: {
          workOrder: {
            include: {
              customer: true,
              device: true,
            },
          },
          technician: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.info(`Schedule cancelled: ${schedule.id}`);

      res.json({
        success: true,
        data: { schedule },
      });
    } catch (error) {
      next(error);
    }
  };

  public checkConflicts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { technicianId, startTime, endTime, scheduledDate } = req.query;

      const conflicts = await this.db.prisma.workSchedule.findMany({
        where: {
          technicianId: technicianId as string,
          scheduledDate: new Date(scheduledDate as string),
          status: {
            in: ['SCHEDULED', 'IN_PROGRESS'],
          },
          OR: [
            {
              startTime: {
                gte: new Date(startTime as string),
                lt: new Date(endTime as string),
              },
            },
            {
              endTime: {
                gt: new Date(startTime as string),
                lte: new Date(endTime as string),
              },
            },
          ],
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

      res.json({
        success: true,
        data: { conflicts },
      });
    } catch (error) {
      next(error);
    }
  };

  public getAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { date, technicianId } = req.query;

      const schedules = await this.db.prisma.workSchedule.findMany({
        where: {
          scheduledDate: new Date(date as string),
          technicianId: technicianId as string,
          status: {
            in: ['SCHEDULED', 'IN_PROGRESS'],
          },
        },
        orderBy: { startTime: 'asc' },
      });

      // Calculate available time slots
      const availableSlots = [];
      const startHour = 8; // 8 AM
      const endHour = 17; // 5 PM

      for (let hour = startHour; hour < endHour; hour++) {
        const slotStart = new Date(date as string);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(date as string);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        const hasConflict = schedules.some(schedule => {
          return (
            (schedule.startTime < slotEnd && schedule.endTime > slotStart)
          );
        });

        if (!hasConflict) {
          availableSlots.push({
            startTime: slotStart,
            endTime: slotEnd,
          });
        }
      }

      res.json({
        success: true,
        data: { availableSlots },
      });
    } catch (error) {
      next(error);
    }
  };

  public getStatsSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const totalSchedules = await this.db.prisma.workSchedule.count();
      const completedSchedules = await this.db.prisma.workSchedule.count({
        where: { status: 'COMPLETED' },
      });
      const inProgressSchedules = await this.db.prisma.workSchedule.count({
        where: { status: 'IN_PROGRESS' },
      });
      const cancelledSchedules = await this.db.prisma.workSchedule.count({
        where: { status: 'CANCELLED' },
      });

      const stats = {
        totalSchedules,
        completedSchedules,
        inProgressSchedules,
        cancelledSchedules,
        completionRate: totalSchedules > 0 ? (completedSchedules / totalSchedules) * 100 : 0,
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
