# โดเมนโมเดลและโครงสร้างฐานข้อมูล ASIC Repair Pro

## 1. ภาพรวมโดเมนโมเดล

### 1.1 Core Entities
```
WorkOrder (WO_ID) - เอนทิตี้หลัก
├── Customer
├── Device (ASIC Miner)
├── Technician
├── Parts (Inventory Items)
├── Warranty
├── TimeLog
└── Documents
```

### 1.2 Domain Relationships
- **WorkOrder** เป็นศูนย์กลางของระบบ
- **Customer** มี WorkOrder หลายรายการ
- **Device** ถูกซ่อมใน WorkOrder หลายครั้ง
- **Parts** ถูกใช้ใน WorkOrder หลายครั้ง
- **Warranty** ถูกสร้างจาก WorkOrder

## 2. โครงสร้างฐานข้อมูลหลัก

### 2.1 ตารางหลัก (Core Tables)

#### 2.1.1 Work Orders
```sql
CREATE TABLE work_orders (
    wo_id VARCHAR(20) PRIMARY KEY,           -- WO-YYYYMMDD-001
    customer_id UUID NOT NULL,
    device_id UUID NOT NULL,
    technician_id UUID,
    status VARCHAR(20) NOT NULL,             -- TRIAGE, QUOTATION, EXECUTION, QA, CLOSURE, WARRANTY
    priority VARCHAR(10) NOT NULL,           -- LOW, MEDIUM, HIGH, URGENT
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    notes TEXT,
    created_by UUID NOT NULL,
    updated_by UUID
);
```

#### 2.1.2 Customers
```sql
CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    tax_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

#### 2.1.3 Devices (ASIC Miners)
```sql
CREATE TABLE devices (
    device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    model VARCHAR(100) NOT NULL,             -- Antminer S19 Pro, etc.
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    hashrate DECIMAL(10,2),                  -- TH/s
    power_consumption INTEGER,               -- Watts
    purchase_date DATE,
    warranty_start_date DATE,
    warranty_end_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',     -- ACTIVE, REPAIR, RETIRED
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
```

#### 2.1.4 Technicians
```sql
CREATE TABLE technicians (
    technician_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    skills TEXT[],                           -- Array of skills
    hourly_rate DECIMAL(8,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 ตาราง Inventory & Parts

#### 2.2.1 Parts Categories
```sql
CREATE TABLE part_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,              -- Hash Board, PSU, Fan, etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.2.2 Parts Inventory
```sql
CREATE TABLE parts (
    part_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL,
    part_number VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    model VARCHAR(100),
    cost DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2),
    quantity_in_stock INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    location VARCHAR(100),                   -- Warehouse location
    supplier VARCHAR(255),
    purchase_date DATE,
    warranty_period INTEGER,                 -- Days
    status VARCHAR(20) DEFAULT 'AVAILABLE',  -- AVAILABLE, IN_USE, DEFECTIVE, RETIRED
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (category_id) REFERENCES part_categories(category_id)
);
```

#### 2.2.3 Parts Usage
```sql
CREATE TABLE parts_usage (
    usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id VARCHAR(20) NOT NULL,
    part_id UUID NOT NULL,
    quantity_used INTEGER NOT NULL DEFAULT 1,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT NOW(),
    used_by UUID NOT NULL,
    FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id)
);
```

### 2.3 ตาราง Scheduling & Time Management

#### 2.3.1 Time Logs
```sql
CREATE TABLE time_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id VARCHAR(20) NOT NULL,
    technician_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL,      -- DIAGNOSIS, REPAIR, TESTING, etc.
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    hourly_rate DECIMAL(8,2),
    total_cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id),
    FOREIGN KEY (technician_id) REFERENCES technicians(technician_id)
);
```

#### 2.3.2 Work Schedule
```sql
CREATE TABLE work_schedule (
    schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id VARCHAR(20) NOT NULL,
    technician_id UUID NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED',  -- SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id),
    FOREIGN KEY (technician_id) REFERENCES technicians(technician_id)
);
```

### 2.4 ตาราง Warranty Management

#### 2.4.1 Warranty Types
```sql
CREATE TABLE warranty_types (
    type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,              -- Standard, Extended, Labor Only
    duration_days INTEGER NOT NULL,
    coverage_type VARCHAR(50) NOT NULL,      -- PARTS, LABOR, BOTH
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.4.2 Warranties
```sql
CREATE TABLE warranties (
    warranty_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id VARCHAR(20) NOT NULL,
    device_id UUID NOT NULL,
    warranty_type_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    terms TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',     -- ACTIVE, EXPIRED, VOID
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id),
    FOREIGN KEY (device_id) REFERENCES devices(device_id),
    FOREIGN KEY (warranty_type_id) REFERENCES warranty_types(type_id)
);
```

### 2.5 ตาราง Documents & Media

#### 2.5.1 Work Order Documents
```sql
CREATE TABLE wo_documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id VARCHAR(20) NOT NULL,
    document_type VARCHAR(50) NOT NULL,      -- BEFORE_PHOTO, AFTER_PHOTO, QUOTATION, INVOICE
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id)
);
```

#### 2.5.2 Diagnostic Reports
```sql
CREATE TABLE diagnostic_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id VARCHAR(20) NOT NULL,
    fault_type VARCHAR(100) NOT NULL,        -- HASH_BOARD, PSU, FAN, CONTROL_BOARD
    fault_description TEXT,
    diagnosis_notes TEXT,
    recommended_parts TEXT[],                -- Array of part IDs
    estimated_repair_time INTEGER,           -- Minutes
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id)
);
```

### 2.6 ตาราง System & Audit

#### 2.6.1 Audit Logs
```sql
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL,             -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by UUID NOT NULL,
    changed_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

#### 2.6.2 System Settings
```sql
CREATE TABLE system_settings (
    setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    data_type VARCHAR(20) NOT NULL,          -- STRING, NUMBER, BOOLEAN, JSON
    description TEXT,
    updated_by UUID,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 3. Indexes และ Constraints

### 3.1 Primary Indexes
```sql
-- Work Orders
CREATE INDEX idx_wo_customer ON work_orders(customer_id);
CREATE INDEX idx_wo_device ON work_orders(device_id);
CREATE INDEX idx_wo_technician ON work_orders(technician_id);
CREATE INDEX idx_wo_status ON work_orders(status);
CREATE INDEX idx_wo_created_at ON work_orders(created_at);

-- Devices
CREATE INDEX idx_device_serial ON devices(serial_number);
CREATE INDEX idx_device_customer ON devices(customer_id);
CREATE INDEX idx_device_status ON devices(status);

-- Parts
CREATE INDEX idx_parts_category ON parts(category_id);
CREATE INDEX idx_parts_serial ON parts(serial_number);
CREATE INDEX idx_parts_status ON parts(status);
CREATE INDEX idx_parts_stock ON parts(quantity_in_stock);

-- Time Logs
CREATE INDEX idx_time_wo ON time_logs(wo_id);
CREATE INDEX idx_time_technician ON time_logs(technician_id);
CREATE INDEX idx_time_date ON time_logs(start_time);
```

### 3.2 Unique Constraints
```sql
-- Ensure unique serial numbers
ALTER TABLE devices ADD CONSTRAINT uk_device_serial UNIQUE (serial_number);
ALTER TABLE parts ADD CONSTRAINT uk_part_serial UNIQUE (serial_number);

-- Ensure unique work order IDs
ALTER TABLE work_orders ADD CONSTRAINT uk_wo_id UNIQUE (wo_id);
```

## 4. Views สำหรับ Reporting

### 4.1 Work Order Summary View
```sql
CREATE VIEW v_work_order_summary AS
SELECT 
    wo.wo_id,
    wo.status,
    wo.priority,
    wo.created_at,
    wo.completed_at,
    c.company_name,
    d.model,
    d.serial_number,
    t.first_name || ' ' || t.last_name as technician_name,
    wo.estimated_cost,
    wo.actual_cost,
    EXTRACT(EPOCH FROM (wo.completed_at - wo.created_at))/3600 as hours_to_complete
FROM work_orders wo
JOIN customers c ON wo.customer_id = c.customer_id
JOIN devices d ON wo.device_id = d.device_id
LEFT JOIN technicians t ON wo.technician_id = t.technician_id;
```

### 4.2 Parts Usage Summary View
```sql
CREATE VIEW v_parts_usage_summary AS
SELECT 
    pu.wo_id,
    pc.name as part_category,
    p.part_number,
    p.serial_number,
    pu.quantity_used,
    pu.unit_cost,
    pu.total_cost,
    pu.used_at
FROM parts_usage pu
JOIN parts p ON pu.part_id = p.part_id
JOIN part_categories pc ON p.category_id = pc.category_id;
```

### 4.3 Technician Performance View
```sql
CREATE VIEW v_technician_performance AS
SELECT 
    t.technician_id,
    t.first_name || ' ' || t.last_name as technician_name,
    COUNT(wo.wo_id) as total_work_orders,
    AVG(EXTRACT(EPOCH FROM (wo.completed_at - wo.created_at))/3600) as avg_hours_per_wo,
    SUM(tl.total_cost) as total_labor_cost,
    AVG(tl.hourly_rate) as avg_hourly_rate
FROM technicians t
LEFT JOIN work_orders wo ON t.technician_id = wo.technician_id
LEFT JOIN time_logs tl ON t.technician_id = tl.technician_id
WHERE wo.status = 'CLOSURE'
GROUP BY t.technician_id, t.first_name, t.last_name;
```

## 5. Stored Procedures และ Functions

### 5.1 Generate Work Order ID
```sql
CREATE OR REPLACE FUNCTION generate_wo_id()
RETURNS VARCHAR(20) AS $$
DECLARE
    today_date VARCHAR(8);
    sequence_num INTEGER;
    wo_id VARCHAR(20);
BEGIN
    today_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(wo_id FROM 12) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM work_orders
    WHERE wo_id LIKE 'WO-' || today_date || '-%';
    
    wo_id := 'WO-' || today_date || '-' || LPAD(sequence_num::TEXT, 3, '0');
    
    RETURN wo_id;
END;
$$ LANGUAGE plpgsql;
```

### 5.2 Calculate Work Order Total Cost
```sql
CREATE OR REPLACE FUNCTION calculate_wo_total_cost(p_wo_id VARCHAR(20))
RETURNS DECIMAL(10,2) AS $$
DECLARE
    parts_cost DECIMAL(10,2) := 0;
    labor_cost DECIMAL(10,2) := 0;
    total_cost DECIMAL(10,2) := 0;
BEGIN
    -- Calculate parts cost
    SELECT COALESCE(SUM(total_cost), 0)
    INTO parts_cost
    FROM parts_usage
    WHERE wo_id = p_wo_id;
    
    -- Calculate labor cost
    SELECT COALESCE(SUM(total_cost), 0)
    INTO labor_cost
    FROM time_logs
    WHERE wo_id = p_wo_id;
    
    total_cost := parts_cost + labor_cost;
    
    RETURN total_cost;
END;
$$ LANGUAGE plpgsql;
```

## 6. Data Migration Strategy

### 6.1 Migration Scripts
- **Initial Data**: สร้างข้อมูลเริ่มต้น (part categories, warranty types, system settings)
- **Data Import**: Import ข้อมูลจากระบบเดิม (customers, devices, technicians)
- **Data Validation**: ตรวจสอบความถูกต้องของข้อมูลหลัง migration

### 6.2 Data Backup Strategy
- **Full Backup**: รายวัน (midnight)
- **Incremental Backup**: ทุก 6 ชั่วโมง
- **Point-in-time Recovery**: ใช้ WAL (Write-Ahead Logging)
- **Backup Retention**: เก็บ backup 30 วัน

## 7. Performance Optimization

### 7.1 Query Optimization
- ใช้ EXPLAIN ANALYZE เพื่อวิเคราะห์ query performance
- สร้าง composite indexes สำหรับ complex queries
- ใช้ materialized views สำหรับ reporting queries

### 7.2 Partitioning Strategy
- แบ่งตาราง `audit_logs` ตามเดือน
- แบ่งตาราง `time_logs` ตามไตรมาส
- ใช้ table inheritance สำหรับ historical data

### 7.3 Caching Strategy
- Cache frequently accessed data ใน Redis
- ใช้ database connection pooling
- Implement query result caching
