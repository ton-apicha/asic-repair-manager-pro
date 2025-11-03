# ASIC Repair Pro

ระบบ Field Service Management สำหรับงานซ่อมเครื่องขุด Bitcoin ASIC

## ภาพรวม

ASIC Repair Pro เป็นระบบจัดการงานซ่อมเครื่องขุด Bitcoin ASIC ที่ออกแบบมาเพื่อ:
- ลดระยะเวลาเฉลี่ยในการซ่อม (ATTR)
- เพิ่มความแม่นยำในการจัดการอะไหล่
- ควบคุมการรับประกันอย่างมีระบบ
- เพิ่มความโปร่งใสให้ลูกค้า

## เทคโนโลยีที่ใช้

### Backend
- Node.js 18+ with TypeScript
- Express.js
- PostgreSQL 14
- Redis 7
- Prisma ORM
- JWT Authentication

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) v5
- Redux Toolkit
- React Router v6
- Chart.js

### Infrastructure
- Docker & Docker Compose
- Nginx (Reverse Proxy)
- PostgreSQL
- Redis

## การติดตั้งและรัน

### ข้อกำหนดระบบ
- Docker Desktop
- Node.js 18+ (สำหรับ development)
- Git

### การติดตั้ง

1. **Clone repository**
```bash
git clone <repository-url>
cd asic-repair-pro
```

2. **Copy environment file**
```bash
cp env.example .env
```

3. **แก้ไข environment variables**
```bash
# แก้ไขไฟล์ .env ตามต้องการ
```

4. **รันด้วย Docker Compose**
```bash
# Build และ start containers
docker-compose up --build

# หรือรันใน background
docker-compose up -d --build
```

5. **เข้าถึงระบบ**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432
- Redis: localhost:6379

### การพัฒนา

1. **รัน development mode**
```bash
# รันทั้ง frontend และ backend
npm run dev

# หรือรันแยก
npm run dev:frontend
npm run dev:backend
```

2. **รัน tests**
```bash
npm test
```

3. **Build สำหรับ production**
```bash
npm run build
```

## โมดูลหลัก

### 1. Work Job Management (WJM)
- จัดการ Work Order และ Workflow
- ระบบวินิจฉัยและบันทึกข้อมูล
- ติดตามความคืบหน้างาน

### 2. Customer Relationship Management (CRM)
- จัดการข้อมูลลูกค้า
- ระบบแจ้งเตือนอัตโนมัติ
- ประวัติการซ่อม

### 3. Inventory & Parts Management (IPM)
- จัดการอะไหล่และสต็อก
- ติดตาม Serial Number
- ระบบแจ้งเตือนสต็อกต่ำ

### 4. Resource & Scheduling Management (RSM)
- จัดการช่างเทคนิค
- ระบบจัดตารางงาน
- บันทึกเวลาทำงาน

### 5. Warranty Management System (WMS)
- จัดการการรับประกัน
- ติดตามสถานะการรับประกัน
- ระบบแจ้งเตือนการหมดอายุ

## API Documentation

API Documentation จะพร้อมใช้งานที่:
- Swagger UI: http://localhost:3001/api-docs
- OpenAPI Spec: http://localhost:3001/api-docs.json

## การทดสอบ

### Unit Tests
```bash
npm run test:backend
npm run test:frontend
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## การ Deploy

### Development
```bash
docker-compose up -d
```

### Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## การ Monitor

### Logs
```bash
# ดู logs ทั้งหมด
docker-compose logs -f

# ดู logs ของ service เฉพาะ
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Health Checks
- Backend Health: http://localhost:3001/health
- Frontend Health: http://localhost:3000

## การแก้ไขปัญหา

### Database Connection Issues
```bash
# ตรวจสอบ database status
docker-compose ps postgres

# ดู database logs
docker-compose logs postgres
```

### Port Conflicts
```bash
# ตรวจสอบ ports ที่ใช้
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
```

### Container Issues
```bash
# Restart containers
docker-compose restart

# Rebuild containers
docker-compose up --build --force-recreate
```

## การมีส่วนร่วม

1. Fork repository
2. สร้าง feature branch
3. Commit changes
4. Push to branch
5. สร้าง Pull Request

## License

MIT License

## ติดต่อ

- Email: support@asic-repair-pro.com
- Website: https://asic-repair-pro.com
