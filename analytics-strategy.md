# กลยุทธ์ข้อมูลและ Analytics Pipeline

## 1. ภาพรวม Analytics Strategy

### 1.1 วัตถุประสงค์หลัก
- **Real-time Monitoring** - ติดตาม KPI แบบเรียลไทม์
- **Predictive Analytics** - คาดการณ์แนวโน้มและปัญหา
- **Performance Optimization** - ปรับปรุงประสิทธิภาพการทำงาน
- **Decision Support** - สนับสนุนการตัดสินใจเชิงกลยุทธ์

### 1.2 Data Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Data Sources                            │
├─────────────────────────────────────────────────────────────┤
│  Application DB │  Log Files │  External APIs │  IoT Data  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Data Processing Layer                       │
├─────────────────────────────────────────────────────────────┤
│  ETL Pipeline │  Stream Processing │  Data Validation      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Data Storage Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Data Warehouse │  Data Lake │  Time Series DB │  Cache    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Analytics Layer                           │
├─────────────────────────────────────────────────────────────┤
│  BI Tools │  ML Models │  Alerting │  Reporting            │
└─────────────────────────────────────────────────────────────┘
```

## 2. KPI Dashboard Design

### 2.1 Executive Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Executive Summary Dashboard                               │
├─────────────────────────────────────────────────────────────┤
│  Key Metrics Row                                           │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐      │
│  │ Revenue │  ATTR   │  FTFR   │  ATCR   │ Revenue │      │
│  │  Today  │ (Days)  │   (%)   │ (฿)     │/Tech    │      │
│  │ ฿50,000 │  2.5    │  87%    │ 12,500  │ ฿200K   │      │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘      │
├─────────────────────────────────────────────────────────────┤
│  Charts Row                                                │
│  ┌─────────────────────┐ ┌─────────────────────┐          │
│  │  Revenue Trend      │ │  Work Order Status  │          │
│  │  (Last 30 Days)     │ │  Distribution       │          │
│  └─────────────────────┘ └─────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Performance Indicators                                    │
│  ┌─────────────────────┐ ┌─────────────────────┐          │
│  │  Technician         │ │  Inventory          │          │
│  │  Performance        │ │  Health             │          │
│  └─────────────────────┘ └─────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Operational Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Operations Dashboard                                      │
├─────────────────────────────────────────────────────────────┤
│  Work Order Management                                     │
│  ┌─────────────────────┐ ┌─────────────────────┐          │
│  │  Active Work Orders │ │  Work Order Queue   │          │
│  │  - In Progress: 15  │ │  - Pending: 8       │          │
│  │  - Today: 12        │ │  - Overdue: 2       │          │
│  │  - This Week: 45    │ │  - High Priority: 3 │          │
│  └─────────────────────┘ └─────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Resource Utilization                                      │
│  ┌─────────────────────┐ ┌─────────────────────┐          │
│  │  Technician         │ │  Equipment          │          │
│  │  Workload           │ │  Utilization        │          │
│  └─────────────────────┘ └─────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Inventory Status                                          │
│  ┌─────────────────────┐ ┌─────────────────────┐          │
│  │  Stock Levels       │ │  Reorder Alerts     │          │
│  │  - Critical: 5      │ │  - Hash Board: 2    │          │
│  │  - Low: 12          │ │  - PSU: 1           │          │
│  │  - Normal: 45       │ │  - Fan: 3           │          │
│  └─────────────────────┘ └─────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Financial Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Financial Dashboard                                       │
├─────────────────────────────────────────────────────────────┤
│  Revenue Analysis                                          │
│  ┌─────────────────────┐ ┌─────────────────────┐          │
│  │  Daily Revenue      │ │  Revenue by         │          │
│  │  Trend              │ │  Service Type       │          │
│  └─────────────────────┘ └─────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Cost Analysis                                             │
│  ┌─────────────────────┐ ┌─────────────────────┐          │
│  │  Cost Breakdown     │ │  Profit Margin      │          │
│  │  - Parts: 60%       │ │  Trend              │          │
│  │  - Labor: 30%       │ │                     │          │
│  │  - Overhead: 10%    │ │                     │          │
│  └─────────────────────┘ └─────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Customer Analysis                                         │
│  ┌─────────────────────┐ ┌─────────────────────┐          │
│  │  Top Customers      │ │  Customer           │          │
│  │  by Revenue         │ │  Lifetime Value     │          │
│  └─────────────────────┘ └─────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 3. KPI Definitions และ Calculations

### 3.1 Primary KPIs

#### 3.1.1 Average Time to Repair (ATTR)
```sql
-- Calculation: Total repair time / Number of completed repairs
SELECT 
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as attr_hours
FROM work_orders 
WHERE status = 'CLOSURE' 
    AND completed_at IS NOT NULL
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';
```

#### 3.1.2 First-Time Fix Rate (FTFR)
```sql
-- Calculation: (Repairs completed without rework) / (Total repairs)
SELECT 
    COUNT(CASE WHEN rework_count = 0 THEN 1 END) * 100.0 / COUNT(*) as ftfr_percentage
FROM work_orders 
WHERE status = 'CLOSURE' 
    AND completed_at >= CURRENT_DATE - INTERVAL '30 days';
```

#### 3.1.3 Average Total Cost per Repair (ATCR)
```sql
-- Calculation: (Total parts cost + Total labor cost) / Number of repairs
SELECT 
    AVG(parts_cost + labor_cost) as atcr_baht
FROM (
    SELECT 
        wo.wo_id,
        COALESCE(SUM(pu.total_cost), 0) as parts_cost,
        COALESCE(SUM(tl.total_cost), 0) as labor_cost
    FROM work_orders wo
    LEFT JOIN parts_usage pu ON wo.wo_id = pu.wo_id
    LEFT JOIN time_logs tl ON wo.wo_id = tl.wo_id
    WHERE wo.status = 'CLOSURE'
        AND wo.completed_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY wo.wo_id
) cost_summary;
```

#### 3.1.4 Revenue per Technician
```sql
-- Calculation: Total revenue / Number of active technicians
SELECT 
    SUM(wo.actual_cost) / COUNT(DISTINCT wo.technician_id) as revenue_per_tech
FROM work_orders wo
WHERE wo.status = 'CLOSURE' 
    AND wo.completed_at >= CURRENT_DATE - INTERVAL '30 days';
```

### 3.2 Secondary KPIs

#### 3.2.1 Work Order Completion Rate
```sql
SELECT 
    COUNT(CASE WHEN status = 'CLOSURE' THEN 1 END) * 100.0 / COUNT(*) as completion_rate
FROM work_orders 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
```

#### 3.2.2 Parts Availability Rate
```sql
SELECT 
    COUNT(CASE WHEN quantity_in_stock > min_stock_level THEN 1 END) * 100.0 / COUNT(*) as availability_rate
FROM parts 
WHERE status = 'AVAILABLE';
```

#### 3.2.3 Technician Utilization Rate
```sql
SELECT 
    AVG(utilization_rate) as avg_utilization
FROM (
    SELECT 
        technician_id,
        (SUM(EXTRACT(EPOCH FROM (end_time - start_time))/3600) / (8 * 5)) * 100 as utilization_rate
    FROM time_logs 
    WHERE start_time >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY technician_id
) tech_util;
```

## 4. Data Pipeline Architecture

### 4.1 Data Collection Layer
```typescript
// Real-time data collection
interface DataCollector {
  collectWorkOrderData(): Promise<WorkOrderEvent[]>;
  collectInventoryData(): Promise<InventoryEvent[]>;
  collectTimeLogData(): Promise<TimeLogEvent[]>;
  collectCustomerData(): Promise<CustomerEvent[]>;
}

// Event streaming
interface EventStream {
  publish(event: AnalyticsEvent): Promise<void>;
  subscribe(callback: (event: AnalyticsEvent) => void): void;
}
```

### 4.2 Data Processing Layer
```typescript
// ETL Pipeline
interface ETLPipeline {
  extract(): Promise<RawData[]>;
  transform(data: RawData[]): Promise<ProcessedData[]>;
  load(data: ProcessedData[]): Promise<void>;
}

// Stream Processing
interface StreamProcessor {
  processRealTime(event: StreamEvent): Promise<void>;
  aggregateMetrics(events: StreamEvent[]): Promise<AggregatedMetrics>;
}
```

### 4.3 Data Storage Layer
```sql
-- Time series data for metrics
CREATE TABLE metrics_time_series (
    metric_name VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    tags JSONB,
    PRIMARY KEY (metric_name, timestamp)
);

-- Aggregated metrics for reporting
CREATE TABLE metrics_aggregated (
    metric_name VARCHAR(100) NOT NULL,
    period_type VARCHAR(20) NOT NULL, -- HOUR, DAY, WEEK, MONTH
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    count INTEGER,
    min_value DECIMAL(15,4),
    max_value DECIMAL(15,4),
    avg_value DECIMAL(15,4),
    PRIMARY KEY (metric_name, period_type, period_start)
);
```

## 5. Alerting System

### 5.1 Alert Rules
```typescript
interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // seconds
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[]; // email, sms, slack, webhook
}

// Example alert rules
const alertRules: AlertRule[] = [
  {
    id: 'attr_high',
    name: 'ATTR Too High',
    metric: 'attr_hours',
    condition: 'gt',
    threshold: 4, // hours
    duration: 300, // 5 minutes
    severity: 'high',
    channels: ['email', 'slack']
  },
  {
    id: 'ftfr_low',
    name: 'FTFR Too Low',
    metric: 'ftfr_percentage',
    condition: 'lt',
    threshold: 80, // percentage
    duration: 600, // 10 minutes
    severity: 'medium',
    channels: ['email']
  },
  {
    id: 'stock_critical',
    name: 'Critical Stock Level',
    metric: 'parts_low_stock',
    condition: 'gt',
    threshold: 0,
    duration: 60, // 1 minute
    severity: 'critical',
    channels: ['email', 'sms', 'slack']
  }
];
```

### 5.2 Alert Processing
```typescript
interface AlertProcessor {
  evaluateRules(): Promise<void>;
  sendAlert(alert: Alert): Promise<void>;
  acknowledgeAlert(alertId: string): Promise<void>;
  resolveAlert(alertId: string): Promise<void>;
}

// Alert notification channels
interface NotificationChannel {
  sendEmail(alert: Alert): Promise<void>;
  sendSMS(alert: Alert): Promise<void>;
  sendSlack(alert: Alert): Promise<void>;
  sendWebhook(alert: Alert): Promise<void>;
}
```

## 6. Reporting System

### 6.1 Report Types
- **Daily Reports** - สรุปประจำวัน
- **Weekly Reports** - สรุปประจำสัปดาห์
- **Monthly Reports** - สรุปประจำเดือน
- **Ad-hoc Reports** - รายงานตามต้องการ

### 6.2 Report Generation
```typescript
interface ReportGenerator {
  generateDailyReport(date: Date): Promise<DailyReport>;
  generateWeeklyReport(weekStart: Date): Promise<WeeklyReport>;
  generateMonthlyReport(month: number, year: number): Promise<MonthlyReport>;
  generateCustomReport(criteria: ReportCriteria): Promise<CustomReport>;
}

// Report scheduling
interface ReportScheduler {
  scheduleReport(reportConfig: ReportConfig): Promise<void>;
  cancelReport(reportId: string): Promise<void>;
  getReportStatus(reportId: string): Promise<ReportStatus>;
}
```

### 6.3 Report Templates
```typescript
interface ReportTemplate {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  sections: ReportSection[];
  recipients: string[];
  schedule?: CronExpression;
}

interface ReportSection {
  title: string;
  type: 'kpi' | 'chart' | 'table' | 'text';
  data: any;
  format?: 'number' | 'percentage' | 'currency' | 'text';
}
```

## 7. Machine Learning Integration

### 7.1 Predictive Models
```python
# Demand forecasting for parts
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression

class PartsDemandForecaster:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100)
    
    def train(self, historical_data):
        # Train model on historical usage data
        X = historical_data[['month', 'day_of_week', 'season', 'wo_count']]
        y = historical_data['parts_used']
        self.model.fit(X, y)
    
    def predict(self, features):
        return self.model.predict(features)

# Work order completion time prediction
class CompletionTimePredictor:
    def __init__(self):
        self.model = LinearRegression()
    
    def train(self, wo_data):
        # Train on work order characteristics
        X = wo_data[['device_age', 'fault_type', 'technician_experience']]
        y = wo_data['completion_hours']
        self.model.fit(X, y)
    
    def predict(self, wo_features):
        return self.model.predict(wo_features)
```

### 7.2 Anomaly Detection
```python
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1)
        self.scaler = StandardScaler()
    
    def train(self, normal_data):
        # Train on normal operational data
        scaled_data = self.scaler.fit_transform(normal_data)
        self.model.fit(scaled_data)
    
    def detect_anomalies(self, new_data):
        scaled_data = self.scaler.transform(new_data)
        predictions = self.model.predict(scaled_data)
        return predictions == -1  # -1 indicates anomaly
```

## 8. Data Visualization

### 8.1 Chart Types
- **Line Charts** - แสดงแนวโน้มตามเวลา
- **Bar Charts** - เปรียบเทียบข้อมูล
- **Pie Charts** - แสดงสัดส่วน
- **Heatmaps** - แสดงความหนาแน่นของข้อมูล
- **Gauges** - แสดงค่า KPI แบบ real-time

### 8.2 Interactive Features
- **Drill-down** - ดูรายละเอียดลึกขึ้น
- **Filtering** - กรองข้อมูลตามเงื่อนไข
- **Time Range Selection** - เลือกช่วงเวลา
- **Export** - ส่งออกข้อมูล

## 9. Performance Optimization

### 9.1 Caching Strategy
```typescript
interface CacheManager {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
  warmup(): Promise<void>;
}

// Cache keys for different data types
const CACHE_KEYS = {
  KPI_METRICS: 'kpi:metrics',
  WORK_ORDERS: 'wo:list',
  INVENTORY_STATUS: 'inv:status',
  TECHNICIAN_PERFORMANCE: 'tech:performance'
};
```

### 9.2 Query Optimization
```sql
-- Create materialized views for complex queries
CREATE MATERIALIZED VIEW mv_work_order_summary AS
SELECT 
    wo.wo_id,
    wo.status,
    wo.created_at,
    wo.completed_at,
    c.company_name,
    d.model,
    t.first_name || ' ' || t.last_name as technician_name,
    wo.estimated_cost,
    wo.actual_cost
FROM work_orders wo
JOIN customers c ON wo.customer_id = c.customer_id
JOIN devices d ON wo.device_id = d.device_id
LEFT JOIN technicians t ON wo.technician_id = t.technician_id;

-- Refresh materialized view periodically
REFRESH MATERIALIZED VIEW mv_work_order_summary;
```

## 10. Data Governance

### 10.1 Data Quality
- **Validation Rules** - ตรวจสอบความถูกต้องของข้อมูล
- **Data Cleansing** - ทำความสะอาดข้อมูล
- **Duplicate Detection** - ตรวจสอบข้อมูลซ้ำ
- **Completeness Check** - ตรวจสอบความครบถ้วน

### 10.2 Data Security
- **Access Control** - ควบคุมการเข้าถึงข้อมูล
- **Data Encryption** - เข้ารหัสข้อมูลสำคัญ
- **Audit Logging** - บันทึกการเข้าถึงข้อมูล
- **Data Retention** - นโยบายการเก็บข้อมูล
