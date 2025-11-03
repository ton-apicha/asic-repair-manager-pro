/**
 * Work Order Create Dialog Page Object Model
 */

import { Page, Locator } from '@playwright/test';

export class WorkOrderCreateDialog {
  readonly page: Page;
  readonly dialog: Locator;
  readonly customerAutocomplete: Locator;
  readonly customerInput: Locator;
  readonly addCustomerButton: Locator;
  readonly deviceAutocomplete: Locator;
  readonly deviceInput: Locator;
  readonly addDeviceButton: Locator;
  readonly descriptionInput: Locator;
  readonly prioritySelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly customerQuickAddForm: Locator;
  readonly deviceQuickAddForm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('[role="dialog"]');
    this.customerAutocomplete = this.dialog.locator('input[aria-label*="customer"]').or(this.dialog.getByLabel(/customer|ลูกค้า/i));
    this.customerInput = this.dialog.locator('input').filter({ hasText: /customer|ลูกค้า/i }).first();
    this.addCustomerButton = this.dialog.getByRole('button', { name: /\+ เพิ่มลูกค้า|add customer/i });
    this.deviceAutocomplete = this.dialog.locator('input[aria-label*="device"]').or(this.dialog.getByLabel(/device|อุปกรณ์/i));
    this.deviceInput = this.dialog.locator('input').filter({ hasText: /device|อุปกรณ์/i }).first();
    this.addDeviceButton = this.dialog.getByRole('button', { name: /\+ เพิ่มอุปกรณ์|add device/i });
    this.descriptionInput = this.dialog.getByLabel(/description|คำอธิบาย|ปัญหา/i).or(this.dialog.locator('textarea'));
    this.prioritySelect = this.dialog.locator('select').filter({ hasText: /priority|ความสำคัญ/i });
    this.submitButton = this.dialog.getByRole('button', { name: /สร้าง|create|submit/i });
    this.cancelButton = this.dialog.getByRole('button', { name: /ยกเลิก|cancel/i });
    this.customerQuickAddForm = this.dialog.locator('form').filter({ hasText: /เพิ่มลูกค้าใหม่/i });
    this.deviceQuickAddForm = this.dialog.locator('form').filter({ hasText: /เพิ่มอุปกรณ์ใหม่/i });
  }

  /**
   * Select customer from autocomplete
   */
  async selectCustomer(customerName: string): Promise<void> {
    await this.customerAutocomplete.click();
    await this.page.waitForTimeout(300);
    await this.page.getByText(customerName, { exact: false }).first().click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Click add customer button
   */
  async clickAddCustomer(): Promise<void> {
    await this.addCustomerButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Fill customer quick add form
   */
  async fillCustomerQuickAdd(data: {
    companyName: string;
    email: string;
    contactPerson: string;
    phone: string;
  }): Promise<void> {
    await this.customerQuickAddForm.getByLabel(/company|บริษัท/i).fill(data.companyName);
    await this.customerQuickAddForm.getByLabel(/email|อีเมล/i).fill(data.email);
    await this.customerQuickAddForm.getByLabel(/contact|ติดต่อ/i).fill(data.contactPerson);
    await this.customerQuickAddForm.getByLabel(/phone|โทร/i).fill(data.phone);
    await this.customerQuickAddForm.getByRole('button', { name: /เพิ่ม|add/i }).click();
    await this.page.waitForTimeout(1000); // Wait for customer to be created and selected
  }

  /**
   * Select device from autocomplete
   */
  async selectDevice(deviceModel: string): Promise<void> {
    await this.deviceAutocomplete.click();
    await this.page.waitForTimeout(300);
    await this.page.getByText(deviceModel, { exact: false }).first().click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Click add device button
   */
  async clickAddDevice(): Promise<void> {
    await this.addDeviceButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Fill device quick add form
   */
  async fillDeviceQuickAdd(data: {
    model: string;
    serialNumber?: string;
  }): Promise<void> {
    await this.deviceQuickAddForm.getByLabel(/model|รุ่น/i).fill(data.model);
    if (data.serialNumber) {
      await this.deviceQuickAddForm.getByLabel(/serial/i).fill(data.serialNumber);
    }
    await this.deviceQuickAddForm.getByRole('button', { name: /เพิ่ม|add/i }).click();
    await this.page.waitForTimeout(1000); // Wait for device to be created and selected
  }

  /**
   * Fill work order form
   */
  async fillForm(data: {
    description: string;
    priority?: string;
  }): Promise<void> {
    await this.descriptionInput.fill(data.description);
    if (data.priority) {
      await this.prioritySelect.selectOption(data.priority);
    }
  }

  /**
   * Submit form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Cancel dialog
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.page.waitForTimeout(300);
  }
}

