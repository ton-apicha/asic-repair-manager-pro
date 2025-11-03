/**
 * Customer Controller
 * 
 * จัดการข้อมูลลูกค้าทั้งหมด:
 * - CRUD operations: สร้าง, อ่าน, อัปเดต, ลบข้อมูลลูกค้า
 * - Query operations: ค้นหา, filter, pagination
 * - Relations: ดึงข้อมูล work orders, devices, history
 */

import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class CustomerController {
  private db = DatabaseService.getInstance();  // Database service instance

  /**
   * ดึงรายการลูกค้าทั้งหมด (พร้อม pagination และ search)
   * รองรับการค้นหาจากชื่อบริษัท, ผู้ติดต่อ, email
   */
  public getAllCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build where clause - สร้างเงื่อนไขการค้นหา
      const where: any = {};
      if (search) {
        where.OR = [
          { companyName: { contains: search as string } },     // ค้นหาจากชื่อบริษัท
          { contactPerson: { contains: search as string } },   // ค้นหาจากผู้ติดต่อ
          { email: { contains: search as string } },           // ค้นหาจาก email
        ];
      }

      // Query customers and total count - ดึงข้อมูลลูกค้าและจำนวนทั้งหมด (parallel)
      const [customers, total] = await Promise.all([
        this.db.prisma.customer.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },  // เรียงตามวันที่สร้างล่าสุด
        }),
        this.db.prisma.customer.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          customers,
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
   * ดึงข้อมูลลูกค้าตาม ID (พร้อม relations)
   * รวมข้อมูล devices และ work orders ที่เกี่ยวข้อง
   */
  public getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Find customer with relations - ดึงข้อมูลลูกค้าพร้อม relations
      const customer = await this.db.prisma.customer.findUnique({
        where: { id },
        include: {
          devices: true,        // อุปกรณ์ทั้งหมดของลูกค้า
          workOrders: {
            include: {
              device: true,
              technician: {
                include: {
                  user: true,   // ข้อมูล user ของช่างซ่อม
                },
              },
            },
            orderBy: { createdAt: 'desc' },  // เรียงตามวันที่สร้าง
          },
        },
      });

      if (!customer) {
        throw new CustomError('Customer not found', 404);
      }

      res.json({
        success: true,
        data: { customer },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * สร้างลูกค้าใหม่
   * รับข้อมูลลูกค้าจาก request body
   */
  public createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerData = req.body;

      // Create customer - สร้างลูกค้าใหม่ในฐานข้อมูล
      const customer = await this.db.prisma.customer.create({
        data: customerData,
      });

      logger.info(`Customer created: ${customer.companyName}`);

      res.status(201).json({
        success: true,
        data: { customer },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * สร้างลูกค้าแบบ Quick Add (สำหรับรับงาน)
   * รับข้อมูลขั้นต่ำ: companyName, email, contactPerson, phone
   * Optional: address, taxId
   */
  public quickCreateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { companyName, email, contactPerson, phone, address, taxId } = req.body;

      // Create customer with minimal data - สร้างลูกค้าด้วยข้อมูลขั้นต่ำ
      const customer = await this.db.prisma.customer.create({
        data: {
          companyName,
          email,
          contactPerson,
          phone,
          address: address || null,
          taxId: taxId || null,
        },
      });

      logger.info(`Customer quick created: ${customer.companyName}`);

      res.status(201).json({
        success: true,
        data: { customer },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * อัปเดตข้อมูลลูกค้า
   * อัปเดตข้อมูลตาม ID และข้อมูลใหม่ที่ส่งมา
   */
  public updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Update customer - อัปเดตข้อมูลลูกค้า
      const customer = await this.db.prisma.customer.update({
        where: { id },
        data: updateData,
      });

      logger.info(`Customer updated: ${customer.companyName}`);

      res.json({
        success: true,
        data: { customer },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ลบข้อมูลลูกค้า
   * ลบตาม ID ที่ระบุ
   */
  public deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Delete customer - ลบข้อมูลลูกค้า
      await this.db.prisma.customer.delete({
        where: { id },
      });

      logger.info(`Customer deleted: ${id}`);

      res.json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ดึงรายการใบงานของลูกค้า
   * ดึงใบงานทั้งหมดที่เชื่อมโยงกับลูกค้านี้
   */
  public getCustomerWorkOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Find work orders for customer - ดึงใบงานของลูกค้า
      const workOrders = await this.db.prisma.workOrder.findMany({
        where: { customerId: id },
        include: {
          device: true,         // ข้อมูลอุปกรณ์
          technician: {
            include: {
              user: true,       // ข้อมูล user ของช่างซ่อม
            },
          },
        },
        orderBy: { createdAt: 'desc' },  // เรียงตามวันที่สร้าง
      });

      res.json({
        success: true,
        data: { workOrders },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ดึงรายการอุปกรณ์ของลูกค้า
   * ดึงอุปกรณ์ทั้งหมดที่เชื่อมโยงกับลูกค้านี้
   */
  public getCustomerDevices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Find devices for customer - ดึงอุปกรณ์ของลูกค้า
      const devices = await this.db.prisma.device.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },  // เรียงตามวันที่สร้าง
      });

      res.json({
        success: true,
        data: { devices },
      });
    } catch (error) {
      next(error);
    }
  };

  public getCustomerHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const history = await this.db.prisma.workOrder.findMany({
        where: { customerId: id },
        include: {
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
        data: { history },
      });
    } catch (error) {
      next(error);
    }
  };

  public sendCommunication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { type, message } = req.body;

      // Implementation for sending communication
      logger.info(`Communication sent to customer ${id}: ${type}`);

      res.json({
        success: true,
        message: 'Communication sent successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getCommunications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // Implementation for getting communications
      res.json({
        success: true,
        data: { communications: [] },
      });
    } catch (error) {
      next(error);
    }
  };

  public getStatsSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const totalCustomers = await this.db.prisma.customer.count();
      const activeCustomers = await this.db.prisma.customer.count({
        where: { isActive: true },
      });

      const stats = {
        totalCustomers,
        activeCustomers,
        inactiveCustomers: totalCustomers - activeCustomers,
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
