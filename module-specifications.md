# รายละเอียดโมดูลและ API Specifications

## 1. Work Job Management (WJM) Module

### 1.1 ภาพรวมโมดูล
โมดูล WJM เป็นศูนย์กลางของระบบ รับผิดชอบการสร้างและติดตาม Work Order ผ่าน 6 ขั้นตอนหลัก

### 1.2 ฟังก์ชันหลัก

#### 1.2.1 Work Order Management
- **สร้าง Work Order** - สร้าง WO_ID ใหม่และบันทึกข้อมูลเบื้องต้น
- **อัปเดตสถานะ** - เปลี่ยนสถานะตาม workflow 6 ขั้นตอน
- **ติดตามความคืบหน้า** - แสดงสถานะปัจจุบันและประวัติการเปลี่ยนแปลง
- **ค้นหาและกรอง** - ค้นหา WO ตามเกณฑ์ต่างๆ

#### 1.2.2 Diagnostic Management
- **บันทึกการวินิจฉัย** - บันทึกข้อมูลการตรวจสอบและสาเหตุความเสียหาย
- **อัปโหลดหลักฐาน** - เก็บภาพถ่ายและเอกสารประกอบ
- **ประเมินต้นทุน** - คำนวณต้นทุนเบื้องต้นจากการวินิจฉัย

### 1.3 API Endpoints

#### 1.3.1 Work Orders
```typescript
// สร้าง Work Order ใหม่
POST /api/v1/work-orders
{
  "customer_id": "uuid",
  "device_id": "uuid",
  "priority": "HIGH|MEDIUM|LOW|URGENT",
  "description": "string",
  "diagnostic_notes": "string"
}

// ดึงรายการ Work Orders
GET /api/v1/work-orders?status=TRIAGE&customer_id=uuid&page=1&limit=20

// ดึงรายละเอียด Work Order
GET /api/v1/work-orders/{wo_id}

// อัปเดต Work Order
PUT /api/v1/work-orders/{wo_id}
{
  "status": "QUOTATION|EXECUTION|QA|CLOSURE|WARRANTY",
  "technician_id": "uuid",
  "notes": "string"
}

// ลบ Work Order
DELETE /api/v1/work-orders/{wo_id}
```

#### 1.3.2 Diagnostics
```typescript
// บันทึกการวินิจฉัย
POST /api/v1/work-orders/{wo_id}/diagnostics
{
  "fault_type": "HASH_BOARD|PSU|FAN|CONTROL_BOARD",
  "fault_description": "string",
  "diagnosis_notes": "string",
  "recommended_parts": ["uuid1", "uuid2"],
  "estimated_repair_time": 120
}

// อัปโหลดหลักฐาน
POST /api/v1/work-orders/{wo_id}/documents
{
  "document_type": "BEFORE_PHOTO|AFTER_PHOTO|DIAGNOSTIC_REPORT",
  "file": "multipart/form-data"
}
```

### 1.4 Business Logic
- **Workflow State Machine** - ควบคุมการเปลี่ยนสถานะตามกฎเกณฑ์
- **Cost Calculation** - คำนวณต้นทุนรวมจากอะไหล่และแรงงาน
- **Notification Triggers** - ส่งการแจ้งเตือนเมื่อเปลี่ยนสถานะ

## 2. Customer Relationship Management (CRM) Module

### 2.1 ภาพรวมโมดูล
โมดูล CRM จัดการข้อมูลลูกค้าและการสื่อสาร รวมถึงการส่งการแจ้งเตือนอัตโนมัติ

### 2.2 ฟังก์ชันหลัก

#### 2.2.1 Customer Management
- **จัดการโปรไฟล์ลูกค้า** - ข้อมูลติดต่อและประวัติ
- **ประวัติการซ่อม** - รายการ Work Orders ทั้งหมดของลูกค้า
- **การจัดกลุ่มลูกค้า** - แบ่งตามประเภทและความสำคัญ

#### 2.2.2 Communication Management
- **ระบบแจ้งเตือน** - ส่งอีเมลและ SMS อัตโนมัติ
- **การติดตามการตอบสนอง** - ติดตามการเปิดอ่านและตอบกลับ
- **Template Management** - จัดการเทมเพลตข้อความ

### 2.3 API Endpoints

#### 2.3.1 Customers
```typescript
// สร้างลูกค้าใหม่
POST /api/v1/customers
{
  "company_name": "string",
  "contact_person": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "tax_id": "string"
}

// ดึงรายการลูกค้า
GET /api/v1/customers?search=company&page=1&limit=20

// ดึงรายละเอียดลูกค้า
GET /api/v1/customers/{customer_id}

// อัปเดตข้อมูลลูกค้า
PUT /api/v1/customers/{customer_id}
{
  "company_name": "string",
  "contact_person": "string",
  "email": "string",
  "phone": "string",
  "address": "string"
}

// ดึงประวัติการซ่อมของลูกค้า
GET /api/v1/customers/{customer_id}/work-orders
```

#### 2.3.2 Communications
```typescript
// ส่งการแจ้งเตือน
POST /api/v1/communications
{
  "customer_id": "uuid",
  "type": "EMAIL|SMS|PUSH",
  "template_id": "uuid",
  "work_order_id": "string",
  "variables": {
    "customer_name": "string",
    "wo_id": "string",
    "status": "string"
  }
}

// ดึงประวัติการสื่อสาร
GET /api/v1/customers/{customer_id}/communications

// อัปเดตสถานะการตอบสนอง
PUT /api/v1/communications/{communication_id}/status
{
  "status": "SENT|DELIVERED|READ|REPLIED"
}
```

### 2.4 Business Logic
- **Auto-notification Rules** - กฎการส่งการแจ้งเตือนอัตโนมัติ
- **Customer Segmentation** - การจัดกลุ่มลูกค้าตามพฤติกรรม
- **Communication Tracking** - ติดตามประสิทธิภาพการสื่อสาร

## 3. Inventory & Parts Management (IPM) Module

### 3.1 ภาพรวมโมดูล
โมดูล IPM จัดการอะไหล่และสต็อก รวมถึงการติดตาม Serial Number และการแจ้งเตือนจุดสั่งซื้อ

### 3.2 ฟังก์ชันหลัก

#### 3.2.1 Parts Management
- **จัดการอะไหล่** - เพิ่ม แก้ไข ลบอะไหล่
- **ติดตาม Serial Number** - ระบบติดตามเฉพาะของอะไหล่
- **การจัดเก็บ** - จัดการตำแหน่งและสถานะการจัดเก็บ

#### 3.2.2 Stock Management
- **ควบคุมสต็อก** - ติดตามจำนวนคงเหลือแบบเรียลไทม์
- **จุดสั่งซื้อ** - แจ้งเตือนเมื่อสต็อกต่ำ
- **การเบิกใช้** - บันทึกการเบิกอะไหล่สำหรับ Work Order

### 3.3 API Endpoints

#### 3.3.1 Parts
```typescript
// สร้างอะไหล่ใหม่
POST /api/v1/parts
{
  "category_id": "uuid",
  "part_number": "string",
  "serial_number": "string",
  "model": "string",
  "cost": 1000.00,
  "selling_price": 1200.00,
  "quantity_in_stock": 10,
  "min_stock_level": 2,
  "location": "string",
  "supplier": "string"
}

// ดึงรายการอะไหล่
GET /api/v1/parts?category_id=uuid&status=AVAILABLE&page=1&limit=20

// ดึงรายละเอียดอะไหล่
GET /api/v1/parts/{part_id}

// อัปเดตอะไหล่
PUT /api/v1/parts/{part_id}
{
  "quantity_in_stock": 15,
  "location": "string",
  "status": "AVAILABLE|IN_USE|DEFECTIVE"
}

// เบิกอะไหล่
POST /api/v1/parts/{part_id}/issue
{
  "wo_id": "string",
  "quantity": 1,
  "issued_by": "uuid"
}
```

#### 3.3.2 Stock Management
```typescript
// ตรวจสอบสต็อก
GET /api/v1/parts/stock-check?part_id=uuid

// ดึงรายการสต็อกต่ำ
GET /api/v1/parts/low-stock

// อัปเดตสต็อก
POST /api/v1/parts/{part_id}/stock-adjustment
{
  "adjustment_type": "IN|OUT|TRANSFER",
  "quantity": 5,
  "reason": "string",
  "reference": "string"
}

// ดึงประวัติการเบิกใช้
GET /api/v1/parts/{part_id}/usage-history
```

### 3.4 Business Logic
- **Stock Level Monitoring** - ตรวจสอบระดับสต็อกแบบเรียลไทม์
- **Reorder Point Calculation** - คำนวณจุดสั่งซื้อซ้ำ
- **Serial Number Tracking** - ติดตามอะไหล่แต่ละชิ้น

## 4. Resource & Scheduling Management (RSM) Module

### 4.1 ภาพรวมโมดูล
โมดูล RSM จัดการช่างเทคนิค การจัดตารางงาน และการบันทึกเวลาทำงาน

### 4.2 ฟังก์ชันหลัก

#### 4.2.1 Technician Management
- **จัดการช่างเทคนิค** - ข้อมูลส่วนตัวและทักษะ
- **การมอบหมายงาน** - มอบหมาย Work Order ตามทักษะ
- **ติดตามประสิทธิภาพ** - วัดผลงานและเวลาทำงาน

#### 4.2.2 Scheduling Management
- **ปฏิทินงาน** - แสดงตารางงานแบบภาพ
- **การจัดตาราง** - ลากและวางงานในปฏิทิน
- **การจัดการความขัดแย้ง** - ตรวจสอบความพร้อมของช่าง

### 4.3 API Endpoints

#### 4.3.1 Technicians
```typescript
// สร้างช่างเทคนิคใหม่
POST /api/v1/technicians
{
  "employee_id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone": "string",
  "skills": ["HASH_BOARD", "PSU", "FAN"],
  "hourly_rate": 500.00
}

// ดึงรายการช่างเทคนิค
GET /api/v1/technicians?skills=HASH_BOARD&available=true

// ดึงรายละเอียดช่างเทคนิค
GET /api/v1/technicians/{technician_id}

// อัปเดตข้อมูลช่างเทคนิค
PUT /api/v1/technicians/{technician_id}
{
  "skills": ["HASH_BOARD", "PSU", "FAN", "CONTROL_BOARD"],
  "hourly_rate": 550.00
}
```

#### 4.3.2 Scheduling
```typescript
// สร้างตารางงาน
POST /api/v1/schedule
{
  "wo_id": "string",
  "technician_id": "uuid",
  "scheduled_date": "2024-01-15",
  "start_time": "09:00",
  "end_time": "17:00"
}

// ดึงตารางงาน
GET /api/v1/schedule?technician_id=uuid&date=2024-01-15

// อัปเดตตารางงาน
PUT /api/v1/schedule/{schedule_id}
{
  "scheduled_date": "2024-01-16",
  "start_time": "10:00",
  "end_time": "18:00"
}

// ยกเลิกตารางงาน
DELETE /api/v1/schedule/{schedule_id}
```

#### 4.3.3 Time Logging
```typescript
// เริ่มบันทึกเวลา
POST /api/v1/time-logs/start
{
  "wo_id": "string",
  "technician_id": "uuid",
  "activity_type": "DIAGNOSIS|REPAIR|TESTING"
}

// หยุดบันทึกเวลา
PUT /api/v1/time-logs/{log_id}/stop
{
  "end_time": "2024-01-15T17:00:00Z",
  "notes": "string"
}

// ดึงรายการเวลาทำงาน
GET /api/v1/time-logs?wo_id=string&technician_id=uuid&date=2024-01-15
```

### 4.4 Business Logic
- **Skill Matching** - จับคู่งานกับทักษะช่างเทคนิค
- **Availability Checking** - ตรวจสอบความพร้อมของช่าง
- **Time Tracking** - บันทึกและคำนวณเวลาทำงาน

## 5. Warranty Management System (WMS) Module

### 5.1 ภาพรวมโมดูล
โมดูล WMS จัดการการรับประกันและการติดตามสัญญาการรับประกัน

### 5.2 ฟังก์ชันหลัก

#### 5.2.1 Warranty Management
- **ลงทะเบียนการรับประกัน** - สร้างการรับประกันใหม่จาก Work Order
- **ติดตามสถานะ** - ตรวจสอบสถานะการรับประกัน
- **การแจ้งเตือน** - แจ้งเตือนการหมดอายุ

#### 5.2.2 Warranty Types Management
- **จัดการประเภทการรับประกัน** - สร้างและแก้ไขประเภท
- **เงื่อนไขการรับประกัน** - กำหนดเงื่อนไขและข้อยกเว้น

### 5.3 API Endpoints

#### 5.3.1 Warranties
```typescript
// สร้างการรับประกันใหม่
POST /api/v1/warranties
{
  "wo_id": "string",
  "device_id": "uuid",
  "warranty_type_id": "uuid",
  "start_date": "2024-01-15",
  "end_date": "2025-01-15",
  "terms": "string"
}

// ดึงรายการการรับประกัน
GET /api/v1/warranties?device_id=uuid&status=ACTIVE

// ดึงรายละเอียดการรับประกัน
GET /api/v1/warranties/{warranty_id}

// อัปเดตสถานะการรับประกัน
PUT /api/v1/warranties/{warranty_id}
{
  "status": "ACTIVE|EXPIRED|VOID",
  "end_date": "2025-01-15"
}
```

#### 5.3.2 Warranty Types
```typescript
// สร้างประเภทการรับประกัน
POST /api/v1/warranty-types
{
  "name": "Standard Warranty",
  "duration_days": 365,
  "coverage_type": "PARTS|LABOR|BOTH",
  "description": "string"
}

// ดึงรายการประเภทการรับประกัน
GET /api/v1/warranty-types

// อัปเดตประเภทการรับประกัน
PUT /api/v1/warranty-types/{type_id}
{
  "name": "Extended Warranty",
  "duration_days": 730,
  "coverage_type": "BOTH"
}
```

### 5.4 Business Logic
- **Warranty Validation** - ตรวจสอบความถูกต้องของการรับประกัน
- **Expiration Monitoring** - ติดตามการหมดอายุ
- **Coverage Calculation** - คำนวณขอบเขตการรับประกัน

## 6. Cross-Module Integration

### 6.1 Event-Driven Communication
```typescript
// Work Order Status Changed Event
interface WorkOrderStatusChangedEvent {
  wo_id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  timestamp: Date;
}

// Parts Issued Event
interface PartsIssuedEvent {
  wo_id: string;
  part_id: string;
  quantity: number;
  issued_by: string;
  timestamp: Date;
}

// Warranty Created Event
interface WarrantyCreatedEvent {
  warranty_id: string;
  wo_id: string;
  device_id: string;
  start_date: Date;
  end_date: Date;
}
```

### 6.2 Shared Services
- **Notification Service** - บริการส่งการแจ้งเตือน
- **File Storage Service** - บริการจัดเก็บไฟล์
- **Audit Service** - บริการบันทึก audit log
- **Report Service** - บริการสร้างรายงาน

### 6.3 Data Consistency
- **Transaction Management** - ใช้ database transactions
- **Event Sourcing** - บันทึกทุกการเปลี่ยนแปลง
- **CQRS** - แยก Command และ Query operations
- **Saga Pattern** - จัดการ distributed transactions

## 7. API Standards

### 7.1 Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 7.2 Error Handling
- **HTTP Status Codes** - ใช้ status code มาตรฐาน
- **Error Codes** - กำหนด error code เฉพาะ
- **Validation Errors** - แสดงข้อผิดพลาดการตรวจสอบ
- **Business Logic Errors** - แสดงข้อผิดพลาดทางธุรกิจ

### 7.3 Authentication & Authorization
- **JWT Tokens** - ใช้ JWT สำหรับ authentication
- **Role-Based Access** - ควบคุมการเข้าถึงตาม role
- **API Rate Limiting** - จำกัดการเรียก API
- **Request Logging** - บันทึกการเรียก API
