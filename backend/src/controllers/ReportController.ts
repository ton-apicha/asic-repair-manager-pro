import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class ReportController {
  private db = DatabaseService.getInstance();

  public getDashboardData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        totalCustomers,
        totalTechnicians,
        totalDevices,
        totalParts,
      ] = await Promise.all([
        this.db.prisma.workOrder.count({ where }),
        this.db.prisma.workOrder.count({ where: { ...where, status: 'CLOSURE' } }),
        this.db.prisma.workOrder.count({ where: { ...where, status: 'EXECUTION' } }),
        this.db.prisma.customer.count(),
        this.db.prisma.technician.count({ where: { isActive: true } }),
        this.db.prisma.device.count(),
        this.db.prisma.part.count(),
      ]);

      const dashboardData = {
        workOrders: {
          total: totalWorkOrders,
          completed: completedWorkOrders,
          inProgress: inProgressWorkOrders,
          completionRate: totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0,
        },
        customers: {
          total: totalCustomers,
        },
        technicians: {
          total: totalTechnicians,
        },
        devices: {
          total: totalDevices,
        },
        parts: {
          total: totalParts,
        },
      };

      res.json({
        success: true,
        data: { dashboardData },
      });
    } catch (error) {
      next(error);
    }
  };

  public getWorkOrderReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, status, priority } = req.query;

      const where: any = {};
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }
      if (status) {
        where.status = status;
      }
      if (priority) {
        where.priority = priority;
      }

      const workOrders = await this.db.prisma.workOrder.findMany({
        where,
        include: {
          customer: true,
          device: true,
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

  public getTechnicianPerformanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const technicians = await this.db.prisma.technician.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          workOrders: {
            where,
            include: {
              timeLogs: true,
            },
          },
        },
      });

      const performance = technicians.map(tech => {
        const workOrders = tech.workOrders;
        const completedWorkOrders = workOrders.filter(wo => wo.status === 'CLOSURE');
        const totalHours = workOrders.reduce((sum, wo) => {
          return sum + wo.timeLogs.reduce((logSum, log) => logSum + (log.duration || 0), 0);
        }, 0) / 60;

        return {
          id: tech.id,
          employeeId: tech.employeeId,
          name: `${tech.user.firstName} ${tech.user.lastName}`,
          totalWorkOrders: workOrders.length,
          completedWorkOrders: completedWorkOrders.length,
          completionRate: workOrders.length > 0 ? (completedWorkOrders.length / workOrders.length) * 100 : 0,
          totalHours,
          averageHoursPerWorkOrder: workOrders.length > 0 ? totalHours / workOrders.length : 0,
        };
      });

      res.json({
        success: true,
        data: { performance },
      });
    } catch (error) {
      next(error);
    }
  };

  public getInventoryReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { categoryId, status } = req.query;

      const where: any = {};
      if (categoryId) {
        where.categoryId = categoryId;
      }
      if (status) {
        where.status = status;
      }

      const parts = await this.db.prisma.part.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { partNumber: 'asc' },
      });

      const lowStockParts = parts.filter(part => part.quantityInStock <= part.minStockLevel);
      const outOfStockParts = parts.filter(part => part.quantityInStock === 0);

      const inventoryData = {
        totalParts: parts.length,
        lowStockParts: lowStockParts.length,
        outOfStockParts: outOfStockParts.length,
        parts,
        lowStockPartsList: lowStockParts,
        outOfStockPartsList: outOfStockParts,
      };

      res.json({
        success: true,
        data: { inventoryData },
      });
    } catch (error) {
      next(error);
    }
  };

  public getFinancialReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const workOrders = await this.db.prisma.workOrder.findMany({
        where,
        include: {
          partsUsage: {
            include: {
              part: true,
            },
          },
          timeLogs: true,
        },
      });

      const totalRevenue = workOrders.reduce((sum, wo) => sum + Number(wo.actualCost || 0), 0);
      const totalPartsCost = workOrders.reduce((sum, wo) => {
        return sum + wo.partsUsage.reduce((partSum, part) => partSum + Number(part.totalCost), 0);
      }, 0);
      const totalLaborCost = workOrders.reduce((sum, wo) => {
        return sum + wo.timeLogs.reduce((logSum, log) => logSum + Number(log.totalCost || 0), 0);
      }, 0);

      const financialData = {
        totalRevenue,
        totalPartsCost,
        totalLaborCost,
        grossProfit: totalRevenue - totalPartsCost - totalLaborCost,
        profitMargin: totalRevenue > 0 ? ((totalRevenue - totalPartsCost - totalLaborCost) / totalRevenue) * 100 : 0,
        workOrders: workOrders.length,
      };

      res.json({
        success: true,
        data: { financialData },
      });
    } catch (error) {
      next(error);
    }
  };

  public getCustomerReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const customers = await this.db.prisma.customer.findMany({
        include: {
          workOrders: {
            where,
            include: {
              device: true,
            },
          },
        },
      });

      const customerData = customers.map(customer => {
        const workOrders = customer.workOrders;
        const totalSpent = workOrders.reduce((sum, wo) => sum + Number(wo.actualCost || 0), 0);
        const completedWorkOrders = workOrders.filter(wo => wo.status === 'CLOSURE');

        return {
          id: customer.id,
          companyName: customer.companyName,
          email: customer.email,
          totalWorkOrders: workOrders.length,
          completedWorkOrders: completedWorkOrders.length,
          totalSpent,
          averageSpentPerWorkOrder: workOrders.length > 0 ? totalSpent / workOrders.length : 0,
        };
      });

      res.json({
        success: true,
        data: { customerData },
      });
    } catch (error) {
      next(error);
    }
  };

  public getWarrantyReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.query;

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const warranties = await this.db.prisma.warranty.findMany({
        where,
        include: {
          device: {
            include: {
              customer: true,
            },
          },
          workOrder: true,
          warrantyType: true,
        },
        orderBy: { startDate: 'desc' },
      });

      const expiringWarranties = warranties.filter(warranty => {
        const daysUntilExpiry = Math.ceil((warranty.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      });

      const warrantyData = {
        totalWarranties: warranties.length,
        activeWarranties: warranties.filter(w => w.status === 'ACTIVE').length,
        expiredWarranties: warranties.filter(w => w.status === 'EXPIRED').length,
        expiringWarranties: expiringWarranties.length,
        warranties,
        expiringWarrantiesList: expiringWarranties,
      };

      res.json({
        success: true,
        data: { warrantyData },
      });
    } catch (error) {
      next(error);
    }
  };

  public getKPIReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const workOrders = await this.db.prisma.workOrder.findMany({
        where,
        include: {
          timeLogs: true,
        },
      });

      const completedWorkOrders = workOrders.filter(wo => wo.status === 'CLOSURE');
      const totalWorkOrders = workOrders.length;

      // Calculate ATTR (Average Time to Repair)
      const totalRepairTime = completedWorkOrders.reduce((sum, wo) => {
        const timeLogs = wo.timeLogs;
        const totalMinutes = timeLogs.reduce((logSum, log) => logSum + (log.duration || 0), 0);
        return sum + totalMinutes;
      }, 0);

      const averageTimeToRepair = completedWorkOrders.length > 0 ? totalRepairTime / completedWorkOrders.length : 0;

      // Calculate FTFR (First-Time Fix Rate)
      const firstTimeFixRate = totalWorkOrders > 0 ? (completedWorkOrders.length / totalWorkOrders) * 100 : 0;

      // Calculate ATCR (Average Total Cost per Repair)
      const totalCost = completedWorkOrders.reduce((sum, wo) => sum + Number(wo.actualCost || 0), 0);
      const averageTotalCostPerRepair = completedWorkOrders.length > 0 ? totalCost / completedWorkOrders.length : 0;

      const kpiData = {
        averageTimeToRepair: Math.round(averageTimeToRepair), // in minutes
        firstTimeFixRate: Math.round(firstTimeFixRate * 100) / 100, // percentage
        averageTotalCostPerRepair: Math.round(averageTotalCostPerRepair * 100) / 100, // currency
        totalWorkOrders,
        completedWorkOrders: completedWorkOrders.length,
        completionRate: totalWorkOrders > 0 ? (completedWorkOrders.length / totalWorkOrders) * 100 : 0,
      };

      res.json({
        success: true,
        data: { kpiData },
      });
    } catch (error) {
      next(error);
    }
  };

  // Dashboard API Endpoints
  public getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        totalCustomers,
        activeCustomers,
        totalTechnicians,
        activeTechnicians,
        totalDevices,
        activeDevices,
        totalParts,
        lowStockParts,
        outOfStockParts,
        totalRevenue,
        thisMonthRevenue,
        lastMonthRevenue,
      ] = await Promise.all([
        this.db.prisma.workOrder.count({ where }),
        this.db.prisma.workOrder.count({ where: { ...where, status: 'CLOSURE' } }),
        this.db.prisma.workOrder.count({ where: { ...where, status: 'EXECUTION' } }),
        this.db.prisma.workOrder.count({ where: { ...where, status: { in: ['TRIAGE', 'QUOTATION'] } } }),
        this.db.prisma.customer.count(),
        this.db.prisma.customer.count({ where: { isActive: true } }),
        this.db.prisma.technician.count(),
        this.db.prisma.technician.count({ where: { isActive: true } }),
        this.db.prisma.device.count(),
        this.db.prisma.device.count({ where: { status: 'ACTIVE' } }),
        this.db.prisma.part.count(),
        this.db.prisma.part.count({ where: { quantityInStock: { lte: this.db.prisma.part.fields.minStockLevel } } }),
        this.db.prisma.part.count({ where: { quantityInStock: 0 } }),
        this.db.prisma.workOrder.aggregate({
          where: { ...where, status: 'CLOSURE' },
          _sum: { actualCost: true },
        }),
        this.db.prisma.workOrder.aggregate({
          where: {
            status: 'CLOSURE',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
            },
          },
          _sum: { actualCost: true },
        }),
        this.db.prisma.workOrder.aggregate({
          where: {
            status: 'CLOSURE',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { actualCost: true },
        }),
      ]);

      const kpis = {
        workOrders: {
          total: totalWorkOrders,
          completed: completedWorkOrders,
          inProgress: inProgressWorkOrders,
          pending: pendingWorkOrders,
          completionRate: totalWorkOrders > 0 ? Math.round((completedWorkOrders / totalWorkOrders) * 100) : 0,
          averageCompletionTime: await this.calculateAverageCompletionTime(where),
        },
        technicians: {
          total: totalTechnicians,
          active: activeTechnicians,
          available: await this.calculateAvailableTechnicians(),
          utilizationRate: await this.calculateTechnicianUtilizationRate(),
        },
        inventory: {
          totalParts: totalParts,
          lowStock: lowStockParts,
          outOfStock: outOfStockParts,
          availabilityRate: totalParts > 0 ? Math.round(((totalParts - outOfStockParts) / totalParts) * 100) : 0,
        },
        revenue: {
          total: Number(totalRevenue._sum.actualCost || 0),
          thisMonth: Number(thisMonthRevenue._sum.actualCost || 0),
          lastMonth: Number(lastMonthRevenue._sum.actualCost || 0),
          growthRate: lastMonthRevenue._sum.actualCost ? 
            Math.round(((Number(thisMonthRevenue._sum.actualCost) - Number(lastMonthRevenue._sum.actualCost)) / Number(lastMonthRevenue._sum.actualCost)) * 100) : 0,
          averagePerWorkOrder: completedWorkOrders > 0 ? Math.round(Number(totalRevenue._sum.actualCost || 0) / completedWorkOrders) : 0,
        },
        performance: {
          averageTimeToRepair: await this.calculateATTR(where),
          firstTimeFixRate: await this.calculateFTFR(where),
          averageTotalCostPerRepair: await this.calculateATCR(where),
          revenuePerTechnician: activeTechnicians > 0 ? Math.round(Number(totalRevenue._sum.actualCost || 0) / activeTechnicians) : 0,
        },
      };

      res.json({
        success: true,
        data: { kpis },
      });
    } catch (error) {
      next(error);
    }
  };

  public getPerformanceChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, period = 'monthly' } = req.query;

      const data = await this.generatePerformanceChartData(
        startDate as string,
        endDate as string,
        period as string
      );

      res.json({
        success: true,
        data: { data },
      });
    } catch (error) {
      next(error);
    }
  };

  public getStatusDistribution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const statusCounts = await this.db.prisma.workOrder.groupBy({
        by: ['status'],
        _count: { status: true },
      });

      const total = statusCounts.reduce((sum, item) => sum + item._count.status, 0);

      const data = statusCounts.map(item => ({
        name: item.status,
        value: item._count.status,
        percentage: total > 0 ? Math.round((item._count.status / total) * 100) : 0,
        color: this.getStatusColor(item.status),
      }));

      res.json({
        success: true,
        data: { data },
      });
    } catch (error) {
      next(error);
    }
  };

  public getTechnicianUtilization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const technicians = await this.db.prisma.technician.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          workOrders: {
            where: {
              status: { in: ['EXECUTION', 'QA'] },
            },
          },
          timeLogs: {
            where: {
              startTime: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          },
        },
      });

      const data = technicians.map(tech => {
        const totalHours = tech.timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / 60;
        const workOrders = tech.workOrders.length;
        const efficiency = totalHours > 0 ? workOrders / totalHours : 0;

        return {
          id: tech.id,
          name: `${tech.user.firstName} ${tech.user.lastName}`,
          utilizationRate: Math.min(totalHours / 40 * 100, 100), // Assuming 40 hours per week
          totalHours: Math.round(totalHours * 100) / 100,
          workOrders,
          efficiency: Math.round(efficiency * 100) / 100,
        };
      });

      res.json({
        success: true,
        data: { data },
      });
    } catch (error) {
      next(error);
    }
  };

  public getRevenueChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, period = 'monthly' } = req.query;

      const data = await this.generateRevenueChartData(
        startDate as string,
        endDate as string,
        period as string
      );

      res.json({
        success: true,
        data: { data },
      });
    } catch (error) {
      next(error);
    }
  };

  public getRecentActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = 10 } = req.query;

      const recentWorkOrders = await this.db.prisma.workOrder.findMany({
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          customer: {
            select: {
              companyName: true,
            },
          },
          device: {
            select: {
              model: true,
            },
          },
          technician: {
            include: {
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

      const activities = recentWorkOrders.map(wo => ({
        id: wo.id,
        type: 'work_order_updated',
        title: `Work Order ${wo.woId} Updated`,
        description: `Status changed to ${wo.status} for ${wo.customer.companyName}`,
        timestamp: wo.updatedAt.toISOString(),
        user: wo.technician ? `${wo.technician.user.firstName} ${wo.technician.user.lastName}` : 'System',
        workOrderId: wo.id,
        priority: wo.priority,
        status: wo.status,
      }));

      res.json({
        success: true,
        data: { activities },
      });
    } catch (error) {
      next(error);
    }
  };

  public getSystemAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alerts = [];

      // Low stock alert
      const lowStockParts = await this.db.prisma.part.findMany({
        where: {
          AND: [
            { quantityInStock: { lte: this.db.prisma.part.fields.minStockLevel } },
            { quantityInStock: { gt: 0 } },
          ],
        },
        take: 5,
      });

      if (lowStockParts.length > 0) {
        alerts.push({
          id: 'low-stock',
          type: 'warning',
          title: 'Low Stock Alert',
          message: `${lowStockParts.length} parts are running low on stock`,
          timestamp: new Date().toISOString(),
          isRead: false,
          actionRequired: true,
          category: 'inventory',
        });
      }

      // Out of stock alert
      const outOfStockParts = await this.db.prisma.part.findMany({
        where: { quantityInStock: 0 },
        take: 5,
      });

      if (outOfStockParts.length > 0) {
        alerts.push({
          id: 'out-of-stock',
          type: 'error',
          title: 'Out of Stock Alert',
          message: `${outOfStockParts.length} parts are out of stock`,
          timestamp: new Date().toISOString(),
          isRead: false,
          actionRequired: true,
          category: 'inventory',
        });
      }

      // Overdue work orders
      const overdueWorkOrders = await this.db.prisma.workOrder.count({
        where: {
          status: { in: ['TRIAGE', 'QUOTATION', 'EXECUTION'] },
          createdAt: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Older than 7 days
          },
        },
      });

      if (overdueWorkOrders > 0) {
        alerts.push({
          id: 'overdue-workorders',
          type: 'warning',
          title: 'Overdue Work Orders',
          message: `${overdueWorkOrders} work orders are overdue`,
          timestamp: new Date().toISOString(),
          isRead: false,
          actionRequired: true,
          category: 'work_order',
        });
      }

      res.json({
        success: true,
        data: { alerts },
      });
    } catch (error) {
      next(error);
    }
  };

  public getInventoryAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lowStockParts = await this.db.prisma.part.findMany({
        where: {
          quantityInStock: { lte: this.db.prisma.part.fields.minStockLevel },
        },
        include: {
          category: true,
        },
        orderBy: { quantityInStock: 'asc' },
      });

      const alerts = lowStockParts.map(part => ({
        id: part.id,
        partId: part.id,
        partNumber: part.partNumber,
        partName: part.model || part.partNumber,
        currentStock: part.quantityInStock,
        minStockLevel: part.minStockLevel,
        status: part.quantityInStock === 0 ? 'out_of_stock' : 'low_stock',
        urgency: part.quantityInStock === 0 ? 'high' : part.quantityInStock <= part.minStockLevel / 2 ? 'medium' : 'low',
        lastRestocked: part.purchaseDate?.toISOString(),
        supplier: part.supplier,
      }));

      res.json({
        success: true,
        data: { alerts },
      });
    } catch (error) {
      next(error);
    }
  };

  // Helper methods
  private async calculateAverageCompletionTime(where: any): Promise<number> {
    const completedWorkOrders = await this.db.prisma.workOrder.findMany({
      where: { ...where, status: 'CLOSURE' },
      select: { createdAt: true, completedAt: true },
    });

    if (completedWorkOrders.length === 0) return 0;

    const totalHours = completedWorkOrders.reduce((sum, wo) => {
      if (!wo.completedAt) return sum;
      const hours = (wo.completedAt.getTime() - wo.createdAt.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    return Math.round(totalHours / completedWorkOrders.length);
  }

  private async calculateAvailableTechnicians(): Promise<number> {
    const technicians = await this.db.prisma.technician.findMany({
      where: { isActive: true },
      include: {
        workOrders: {
          where: {
            status: { in: ['EXECUTION', 'QA'] },
          },
        },
      },
    });

    return technicians.filter(tech => tech.workOrders.length < 3).length; // Assuming max 3 concurrent work orders
  }

  private async calculateTechnicianUtilizationRate(): Promise<number> {
    const technicians = await this.db.prisma.technician.findMany({
      where: { isActive: true },
      include: {
        timeLogs: {
          where: {
            startTime: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        },
      },
    });

    if (technicians.length === 0) return 0;

    const totalUtilization = technicians.reduce((sum, tech) => {
      const totalHours = tech.timeLogs.reduce((logSum, log) => logSum + (log.duration || 0), 0) / 60;
      const utilization = Math.min((totalHours / 40) * 100, 100); // Assuming 40 hours per week
      return sum + utilization;
    }, 0);

    return Math.round(totalUtilization / technicians.length);
  }

  private async calculateATTR(where: any): Promise<number> {
    return await this.calculateAverageCompletionTime(where);
  }

  private async calculateFTFR(where: any): Promise<number> {
    const workOrders = await this.db.prisma.workOrder.findMany({
      where,
      select: { status: true },
    });

    const completedWorkOrders = workOrders.filter(wo => wo.status === 'CLOSURE').length;
    return workOrders.length > 0 ? Math.round((completedWorkOrders / workOrders.length) * 100) : 0;
  }

  private async calculateATCR(where: any): Promise<number> {
    const completedWorkOrders = await this.db.prisma.workOrder.findMany({
      where: { ...where, status: 'CLOSURE' },
      select: { actualCost: true },
    });

    if (completedWorkOrders.length === 0) return 0;

    const totalCost = completedWorkOrders.reduce((sum, wo) => sum + Number(wo.actualCost || 0), 0);
    return Math.round(totalCost / completedWorkOrders.length);
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      TRIAGE: '#757575',
      QUOTATION: '#2196f3',
      EXECUTION: '#ff9800',
      QA: '#9c27b0',
      CLOSURE: '#4caf50',
      WARRANTY: '#00bcd4',
    };
    return colors[status] || '#757575';
  }

  private async generatePerformanceChartData(startDate?: string, endDate?: string, period: string = 'monthly'): Promise<any[]> {
    // This would generate time-series data for performance charts
    // For now, return mock data
    return [
      { date: '2024-01', workOrders: 45, completed: 38, revenue: 15000, cost: 12000 },
      { date: '2024-02', workOrders: 52, completed: 41, revenue: 18000, cost: 14000 },
      { date: '2024-03', workOrders: 48, completed: 42, revenue: 16000, cost: 13000 },
      { date: '2024-04', workOrders: 61, completed: 48, revenue: 20000, cost: 16000 },
      { date: '2024-05', workOrders: 55, completed: 46, revenue: 19000, cost: 15000 },
      { date: '2024-06', workOrders: 58, completed: 52, revenue: 21000, cost: 17000 },
    ];
  }

  private async generateRevenueChartData(startDate?: string, endDate?: string, period: string = 'monthly'): Promise<any[]> {
    // This would generate time-series data for revenue charts
    // For now, return mock data
    return [
      { date: '2024-01', revenue: 15000, cost: 12000, profit: 3000, workOrders: 45 },
      { date: '2024-02', revenue: 18000, cost: 14000, profit: 4000, workOrders: 52 },
      { date: '2024-03', revenue: 16000, cost: 13000, profit: 3000, workOrders: 48 },
      { date: '2024-04', revenue: 20000, cost: 16000, profit: 4000, workOrders: 61 },
      { date: '2024-05', revenue: 19000, cost: 15000, profit: 4000, workOrders: 55 },
      { date: '2024-06', revenue: 21000, cost: 17000, profit: 4000, workOrders: 58 },
    ];
  }

  public exportReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.params;

      // This would implement actual export functionality (CSV, PDF, Excel, etc.)
      logger.info(`Exporting report: ${type}`);

      res.json({
        success: true,
        message: `Report ${type} exported successfully`,
        downloadUrl: `/downloads/report-${type}-${Date.now()}.csv`,
      });
    } catch (error) {
      next(error);
    }
  };
}
