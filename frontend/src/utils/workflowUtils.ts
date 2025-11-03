import { WorkOrderStatus } from '../types/common';

/**
 * Workflow validation utilities
 * กำหนด allowed status transitions และ prerequisites
 */

export const WORKFLOW_STAGES: WorkOrderStatus[] = [
  'TRIAGE',
  'QUOTATION',
  'EXECUTION',
  'QA',
  'CLOSURE',
  'WARRANTY',
];

export const STAGE_LABELS: Record<WorkOrderStatus, string> = {
  TRIAGE: 'วินิจฉัย',
  QUOTATION: 'เสนอราคา',
  EXECUTION: 'ดำเนินการ',
  QA: 'ตรวจสอบ',
  CLOSURE: 'ปิดงาน',
  WARRANTY: 'รับประกัน',
};

export const STAGE_DESCRIPTIONS: Record<WorkOrderStatus, string> = {
  TRIAGE: 'ขั้นตอนการวินิจฉัยปัญหาและบันทึกข้อมูลเบื้องต้น',
  QUOTATION: 'ขั้นตอนการเสนอราคาและขออนุมัติจากลูกค้า',
  EXECUTION: 'ขั้นตอนการดำเนินการซ่อม',
  QA: 'ขั้นตอนการตรวจสอบคุณภาพหลังการซ่อม',
  CLOSURE: 'ขั้นตอนการปิดงานและส่งมอบอุปกรณ์',
  WARRANTY: 'ขั้นตอนการรับประกันหลังการซ่อม',
};

/**
 * กำหนด allowed transitions ระหว่าง stages
 */
export const ALLOWED_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  TRIAGE: ['QUOTATION'],
  QUOTATION: ['EXECUTION', 'TRIAGE'], // สามารถย้อนกลับไป TRIAGE ได้
  EXECUTION: ['QA', 'QUOTATION'], // สามารถย้อนกลับไป QUOTATION ได้
  QA: ['CLOSURE', 'EXECUTION'], // สามารถย้อนกลับไป EXECUTION ได้
  CLOSURE: ['WARRANTY'],
  WARRANTY: [], // WARRANTY คือ stage สุดท้าย
};

/**
 * ตรวจสอบว่าสามารถเปลี่ยน status ได้หรือไม่
 */
export const canTransitionTo = (
  currentStatus: WorkOrderStatus,
  targetStatus: WorkOrderStatus
): boolean => {
  return ALLOWED_TRANSITIONS[currentStatus]?.includes(targetStatus) || false;
};

/**
 * ตรวจสอบ prerequisites สำหรับ status transition
 */
export interface PrerequisitesResult {
  canTransition: boolean;
  missingRequirements: string[];
}

export const checkPrerequisites = (
  currentStatus: WorkOrderStatus,
  targetStatus: WorkOrderStatus,
  workOrder: {
    estimatedCost?: number | null;
    actualCost?: number | null;
    technicianId?: string | null;
    diagnostics?: Array<{ id: string }>;
  }
): PrerequisitesResult => {
  const missingRequirements: string[] = [];

  // QUOTATION requires estimatedCost
  if (targetStatus === 'QUOTATION' && !workOrder.estimatedCost) {
    missingRequirements.push('ต้องระบุราคาประมาณการก่อน');
  }

  // EXECUTION requires technician assignment
  if (targetStatus === 'EXECUTION' && !workOrder.technicianId) {
    missingRequirements.push('ต้องมอบหมายช่างซ่อมก่อน');
  }

  // QA requires at least one diagnostic
  if (targetStatus === 'QA' && (!workOrder.diagnostics || workOrder.diagnostics.length === 0)) {
    missingRequirements.push('ต้องมีผลการวินิจฉัยอย่างน้อย 1 รายการ');
  }

  // CLOSURE requires actualCost
  if (targetStatus === 'CLOSURE' && !workOrder.actualCost) {
    missingRequirements.push('ต้องระบุราคาจริงก่อน');
  }

  // Check if transition is allowed
  if (!canTransitionTo(currentStatus, targetStatus)) {
    missingRequirements.push(`ไม่สามารถเปลี่ยนจาก ${STAGE_LABELS[currentStatus]} ไป ${STAGE_LABELS[targetStatus]} ได้`);
  }

  return {
    canTransition: missingRequirements.length === 0,
    missingRequirements,
  };
};

/**
 * ดึงรายการ next possible statuses
 */
export const getNextPossibleStatuses = (
  currentStatus: WorkOrderStatus
): WorkOrderStatus[] => {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
};

/**
 * ดึง stage index สำหรับ UI
 */
export const getStageIndex = (status: WorkOrderStatus): number => {
  return WORKFLOW_STAGES.indexOf(status);
};

/**
 * ตรวจสอบว่า stage นี้เป็น stage ปัจจุบันหรือไม่
 */
export const isCurrentStage = (
  status: WorkOrderStatus,
  currentStatus: WorkOrderStatus
): boolean => {
  return status === currentStatus;
};

/**
 * ตรวจสอบว่า stage นี้ผ่านไปแล้วหรือไม่
 */
export const isCompletedStage = (
  status: WorkOrderStatus,
  currentStatus: WorkOrderStatus
): boolean => {
  const currentIndex = getStageIndex(currentStatus);
  const statusIndex = getStageIndex(status);
  return statusIndex < currentIndex;
};

/**
 * ตรวจสอบว่า stage นี้ยังไม่ถึงหรือไม่
 */
export const isFutureStage = (
  status: WorkOrderStatus,
  currentStatus: WorkOrderStatus
): boolean => {
  const currentIndex = getStageIndex(currentStatus);
  const statusIndex = getStageIndex(status);
  return statusIndex > currentIndex;
};

