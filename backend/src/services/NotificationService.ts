import nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import { config } from '../config/config';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}

interface SMSOptions {
  to: string;
  body: string;
}

class NotificationService {
  private static instance: NotificationService;
  private emailTransporter: nodemailer.Transporter | null = null;
  private twilioClient: Twilio | null = null;

  private constructor() {
    this.initializeEmail();
    this.initializeSMS();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public static async initialize(): Promise<void> {
    try {
      const notification = NotificationService.getInstance();
      await notification.initializeEmail();
      await notification.initializeSMS();
      logger.info('Notification service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize notification service:', error);
      throw error;
    }
  }

  private async initializeEmail(): Promise<void> {
    try {
      if (config.email.user && config.email.pass) {
        this.emailTransporter = nodemailer.createTransport({
          host: config.email.host,
          port: config.email.port,
          secure: false, // true for 465, false for other ports
          auth: {
            user: config.email.user,
            pass: config.email.pass,
          },
        });

        // Verify connection
        if (this.emailTransporter) {
          await this.emailTransporter.verify();
        }
        logger.info('Email service initialized successfully');
      } else {
        logger.warn('Email credentials not provided, email service disabled');
      }
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.emailTransporter = null;
    }
  }

  private async initializeSMS(): Promise<void> {
    try {
      if (config.sms.accountSid && config.sms.authToken) {
        this.twilioClient = new Twilio(config.sms.accountSid, config.sms.authToken);
        logger.info('SMS service initialized successfully');
      } else {
        logger.warn('SMS credentials not provided, SMS service disabled');
      }
    } catch (error) {
      logger.error('Failed to initialize SMS service:', error);
      this.twilioClient = null;
    }
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.emailTransporter) {
        logger.warn('Email service not available');
        return false;
      }

      const mailOptions = {
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}:`, result.messageId);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  public async sendSMS(options: SMSOptions): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        logger.warn('SMS service not available');
        return false;
      }

      const message = await this.twilioClient.messages.create({
        body: options.body,
        from: config.sms.phoneNumber,
        to: options.to,
      });

      logger.info(`SMS sent successfully to ${options.to}:`, message.sid);
      return true;
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      return false;
    }
  }

  // Work Order specific notifications
  public async notifyWorkOrderCreated(workOrder: any, customer: any): Promise<void> {
    try {
      const subject = `Work Order Created - ${workOrder.wo_id}`;
      const html = `
        <h2>Work Order Created</h2>
        <p>Dear ${customer.company_name},</p>
        <p>Your work order has been created successfully.</p>
        <p><strong>Work Order ID:</strong> ${workOrder.wo_id}</p>
        <p><strong>Device:</strong> ${workOrder.device?.model || 'N/A'}</p>
        <p><strong>Priority:</strong> ${workOrder.priority}</p>
        <p><strong>Status:</strong> ${workOrder.status}</p>
        <p>We will keep you updated on the progress.</p>
        <p>Thank you for choosing our service.</p>
      `;

      await this.sendEmail({
        to: customer.email,
        subject,
        html,
      });
    } catch (error) {
      logger.error('Failed to send work order created notification:', error);
    }
  }

  public async notifyWorkOrderStatusUpdate(workOrder: any, customer: any, oldStatus: string): Promise<void> {
    try {
      const subject = `Work Order Status Update - ${workOrder.wo_id}`;
      const html = `
        <h2>Work Order Status Updated</h2>
        <p>Dear ${customer.company_name},</p>
        <p>Your work order status has been updated.</p>
        <p><strong>Work Order ID:</strong> ${workOrder.wo_id}</p>
        <p><strong>Previous Status:</strong> ${oldStatus}</p>
        <p><strong>New Status:</strong> ${workOrder.status}</p>
        <p>We will continue to keep you updated on the progress.</p>
        <p>Thank you for your patience.</p>
      `;

      await this.sendEmail({
        to: customer.email,
        subject,
        html,
      });
    } catch (error) {
      logger.error('Failed to send work order status update notification:', error);
    }
  }

  public async notifyLowStock(parts: any[]): Promise<void> {
    try {
      const subject = 'Low Stock Alert';
      const html = `
        <h2>Low Stock Alert</h2>
        <p>The following parts are running low on stock:</p>
        <ul>
          ${parts.map(part => `<li>${part.part_number} - ${part.name} (${part.quantity_in_stock} remaining)</li>`).join('')}
        </ul>
        <p>Please consider reordering these parts.</p>
      `;

      // Send to admin email (you might want to add admin email to config)
      await this.sendEmail({
        to: config.email.from,
        subject,
        html,
      });
    } catch (error) {
      logger.error('Failed to send low stock notification:', error);
    }
  }

  public async notifyWarrantyExpiring(warranties: any[]): Promise<void> {
    try {
      const subject = 'Warranty Expiring Soon';
      const html = `
        <h2>Warranty Expiring Soon</h2>
        <p>The following warranties are expiring within 30 days:</p>
        <ul>
          ${warranties.map(warranty => `
            <li>
              <strong>Device:</strong> ${warranty.device?.model || 'N/A'}<br>
              <strong>Serial Number:</strong> ${warranty.device?.serial_number || 'N/A'}<br>
              <strong>Expires:</strong> ${warranty.end_date}
            </li>
          `).join('')}
        </ul>
        <p>Please contact the customer to discuss renewal options.</p>
      `;

      await this.sendEmail({
        to: config.email.from,
        subject,
        html,
      });
    } catch (error) {
      logger.error('Failed to send warranty expiring notification:', error);
    }
  }
}

export { NotificationService };
