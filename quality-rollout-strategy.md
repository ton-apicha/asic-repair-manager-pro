# Test Strategy, Observability และแผน Rollout

## 1. Test Strategy

### 1.1 Testing Pyramid
```
┌─────────────────────────────────────────────────────────────┐
│                    E2E Tests (10%)                         │
│  - User Journey Tests                                      │
│  - Cross-browser Testing                                   │
│  - Mobile Testing                                          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                 Integration Tests (20%)                    │
│  - API Integration Tests                                   │
│  - Database Integration Tests                              │
│  - External Service Integration Tests                      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   Unit Tests (70%)                         │
│  - Component Tests                                         │
│  - Function Tests                                          │
│  - Business Logic Tests                                    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Unit Testing Strategy

#### 1.2.1 Frontend Testing
```typescript
// Component Testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkOrderCard } from '../WorkOrderCard';

describe('WorkOrderCard', () => {
  it('should display work order information correctly', () => {
    const mockWorkOrder = {
      wo_id: 'WO-2024-0101',
      customer_name: 'ABC Corp',
      device_model: 'S19 Pro',
      status: 'TRIAGE',
      priority: 'HIGH'
    };

    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    
    expect(screen.getByText('WO-2024-0101')).toBeInTheDocument();
    expect(screen.getByText('ABC Corp')).toBeInTheDocument();
    expect(screen.getByText('S19 Pro')).toBeInTheDocument();
  });

  it('should call onStatusChange when status is updated', () => {
    const mockOnStatusChange = jest.fn();
    const mockWorkOrder = { /* ... */ };

    render(
      <WorkOrderCard 
        workOrder={mockWorkOrder} 
        onStatusChange={mockOnStatusChange} 
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /change status/i }));
    fireEvent.click(screen.getByText('QUOTATION'));

    expect(mockOnStatusChange).toHaveBeenCalledWith('QUOTATION');
  });
});
```

#### 1.2.2 Backend Testing
```typescript
// API Testing with Jest and Supertest
import request from 'supertest';
import { app } from '../app';
import { WorkOrderService } from '../services/WorkOrderService';

describe('Work Orders API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/work-orders', () => {
    it('should create a new work order', async () => {
      const workOrderData = {
        customer_id: 'uuid-123',
        device_id: 'uuid-456',
        priority: 'HIGH',
        description: 'Hash board failure'
      };

      const response = await request(app)
        .post('/api/v1/work-orders')
        .send(workOrderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.wo_id).toMatch(/^WO-\d{8}-\d{3}$/);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        customer_id: 'invalid-uuid',
        priority: 'INVALID'
      };

      const response = await request(app)
        .post('/api/v1/work-orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

#### 1.2.3 Business Logic Testing
```typescript
// Service Layer Testing
import { WorkOrderService } from '../services/WorkOrderService';
import { WorkOrderRepository } from '../repositories/WorkOrderRepository';

describe('WorkOrderService', () => {
  let workOrderService: WorkOrderService;
  let mockRepository: jest.Mocked<WorkOrderRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as any;

    workOrderService = new WorkOrderService(mockRepository);
  });

  describe('createWorkOrder', () => {
    it('should create work order with generated WO_ID', async () => {
      const workOrderData = {
        customer_id: 'uuid-123',
        device_id: 'uuid-456',
        priority: 'HIGH'
      };

      mockRepository.create.mockResolvedValue({
        wo_id: 'WO-2024-0101-001',
        ...workOrderData,
        status: 'TRIAGE',
        created_at: new Date()
      });

      const result = await workOrderService.createWorkOrder(workOrderData);

      expect(result.wo_id).toMatch(/^WO-\d{8}-\d{3}$/);
      expect(result.status).toBe('TRIAGE');
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(workOrderData)
      );
    });
  });
});
```

### 1.3 Integration Testing

#### 1.3.1 API Integration Tests
```typescript
// Full API Integration Testing
import { setupTestDatabase, cleanupTestDatabase } from '../test-utils/database';
import { app } from '../app';

describe('Work Order Integration', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should complete full work order lifecycle', async () => {
    // 1. Create customer
    const customerResponse = await request(app)
      .post('/api/v1/customers')
      .send({
        company_name: 'Test Corp',
        email: 'test@example.com'
      });

    const customerId = customerResponse.body.data.customer_id;

    // 2. Create device
    const deviceResponse = await request(app)
      .post('/api/v1/devices')
      .send({
        customer_id: customerId,
        model: 'S19 Pro',
        serial_number: 'TEST123456'
      });

    const deviceId = deviceResponse.body.data.device_id;

    // 3. Create work order
    const woResponse = await request(app)
      .post('/api/v1/work-orders')
      .send({
        customer_id: customerId,
        device_id: deviceId,
        priority: 'HIGH'
      });

    const woId = woResponse.body.data.wo_id;

    // 4. Update status through workflow
    await request(app)
      .put(`/api/v1/work-orders/${woId}`)
      .send({ status: 'QUOTATION' })
      .expect(200);

    await request(app)
      .put(`/api/v1/work-orders/${woId}`)
      .send({ status: 'EXECUTION' })
      .expect(200);

    await request(app)
      .put(`/api/v1/work-orders/${woId}`)
      .send({ status: 'CLOSURE' })
      .expect(200);

    // 5. Verify final state
    const finalResponse = await request(app)
      .get(`/api/v1/work-orders/${woId}`)
      .expect(200);

    expect(finalResponse.body.data.status).toBe('CLOSURE');
  });
});
```

#### 1.3.2 Database Integration Tests
```typescript
// Database Integration Testing
import { Database } from '../database';
import { WorkOrderRepository } from '../repositories/WorkOrderRepository';

describe('Database Integration', () => {
  let db: Database;
  let workOrderRepo: WorkOrderRepository;

  beforeAll(async () => {
    db = new Database(process.env.TEST_DATABASE_URL);
    await db.connect();
    workOrderRepo = new WorkOrderRepository(db);
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('should handle concurrent work order creation', async () => {
    const promises = Array.from({ length: 10 }, (_, i) => 
      workOrderRepo.create({
        customer_id: 'uuid-123',
        device_id: 'uuid-456',
        priority: 'HIGH',
        wo_id: `WO-${Date.now()}-${i.toString().padStart(3, '0')}`
      })
    );

    const results = await Promise.all(promises);
    
    // Verify all work orders were created with unique IDs
    const woIds = results.map(r => r.wo_id);
    const uniqueIds = new Set(woIds);
    expect(uniqueIds.size).toBe(woIds.length);
  });
});
```

### 1.4 End-to-End Testing

#### 1.4.1 Cypress E2E Tests
```typescript
// Cypress E2E Testing
describe('Work Order Management E2E', () => {
  beforeEach(() => {
    cy.login('technician@example.com', 'password');
    cy.visit('/work-orders');
  });

  it('should create and manage work order', () => {
    // Create new work order
    cy.get('[data-testid="new-work-order-btn"]').click();
    cy.get('[data-testid="customer-select"]').click();
    cy.get('[data-testid="customer-option-1"]').click();
    cy.get('[data-testid="device-select"]').click();
    cy.get('[data-testid="device-option-1"]').click();
    cy.get('[data-testid="priority-select"]').select('HIGH');
    cy.get('[data-testid="description-input"]').type('Hash board failure');
    cy.get('[data-testid="create-btn"]').click();

    // Verify work order was created
    cy.get('[data-testid="work-order-list"]').should('contain', 'WO-');
    cy.get('[data-testid="success-message"]').should('be.visible');

    // Update work order status
    cy.get('[data-testid="work-order-row-0"]').click();
    cy.get('[data-testid="status-select"]').select('QUOTATION');
    cy.get('[data-testid="save-btn"]').click();

    // Verify status was updated
    cy.get('[data-testid="status-badge"]').should('contain', 'QUOTATION');
  });

  it('should handle work order search and filtering', () => {
    // Search by WO ID
    cy.get('[data-testid="search-input"]').type('WO-2024');
    cy.get('[data-testid="search-btn"]').click();
    cy.get('[data-testid="work-order-list"]').should('not.be.empty');

    // Filter by status
    cy.get('[data-testid="status-filter"]').select('TRIAGE');
    cy.get('[data-testid="work-order-list"]').should('contain', 'TRIAGE');

    // Clear filters
    cy.get('[data-testid="clear-filters-btn"]').click();
    cy.get('[data-testid="work-order-list"]').should('not.be.empty');
  });
});
```

### 1.5 Performance Testing

#### 1.5.1 Load Testing with Artillery
```yaml
# artillery-load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "Work Order API Load Test"
    weight: 70
    flow:
      - post:
          url: "/api/v1/work-orders"
          json:
            customer_id: "{{ $randomString() }}"
            device_id: "{{ $randomString() }}"
            priority: "HIGH"
      - get:
          url: "/api/v1/work-orders"
      - put:
          url: "/api/v1/work-orders/{{ $randomString() }}"
          json:
            status: "QUOTATION"

  - name: "Inventory API Load Test"
    weight: 30
    flow:
      - get:
          url: "/api/v1/parts"
      - post:
          url: "/api/v1/parts"
          json:
            part_number: "{{ $randomString() }}"
            cost: 1000
            quantity_in_stock: 10
```

#### 1.5.2 Stress Testing
```typescript
// Stress Testing with k6
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.1'],     // Error rate under 10%
  },
};

export default function() {
  // Test work order creation
  let response = http.post('http://localhost:3000/api/v1/work-orders', {
    customer_id: 'uuid-123',
    device_id: 'uuid-456',
    priority: 'HIGH'
  });

  check(response, {
    'status is 201': (r) => r.status === 201,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

## 2. Observability Strategy

### 2.1 Logging Strategy

#### 2.1.1 Structured Logging
```typescript
// Winston Logger Configuration
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'asic-repair-pro' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage in application
logger.info('Work order created', {
  wo_id: 'WO-2024-0101',
  customer_id: 'uuid-123',
  user_id: 'uuid-456',
  action: 'CREATE_WORK_ORDER'
});

logger.error('Failed to create work order', {
  error: error.message,
  stack: error.stack,
  wo_id: 'WO-2024-0101',
  user_id: 'uuid-456'
});
```

#### 2.1.2 Log Aggregation
```yaml
# ELK Stack Configuration
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

### 2.2 Metrics Collection

#### 2.2.1 Application Metrics
```typescript
// Prometheus Metrics
import client from 'prom-client';

// Create metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const workOrderCounter = new client.Counter({
  name: 'work_orders_total',
  help: 'Total number of work orders created',
  labelNames: ['status', 'priority']
});

const activeWorkOrders = new client.Gauge({
  name: 'active_work_orders',
  help: 'Number of active work orders'
});

// Usage in middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
});
```

#### 2.2.2 Business Metrics
```typescript
// Custom Business Metrics
class BusinessMetrics {
  private static instance: BusinessMetrics;
  private metrics: Map<string, client.Metric>;

  private constructor() {
    this.metrics = new Map();
    this.initializeMetrics();
  }

  static getInstance(): BusinessMetrics {
    if (!BusinessMetrics.instance) {
      BusinessMetrics.instance = new BusinessMetrics();
    }
    return BusinessMetrics.instance;
  }

  private initializeMetrics() {
    // ATTR (Average Time to Repair)
    this.metrics.set('attr_hours', new client.Gauge({
      name: 'attr_hours',
      help: 'Average Time to Repair in hours'
    }));

    // FTFR (First-Time Fix Rate)
    this.metrics.set('ftfr_percentage', new client.Gauge({
      name: 'ftfr_percentage',
      help: 'First-Time Fix Rate percentage'
    }));

    // Parts availability
    this.metrics.set('parts_availability', new client.Gauge({
      name: 'parts_availability_percentage',
      help: 'Parts availability percentage'
    }));
  }

  updateATTR(hours: number) {
    this.metrics.get('attr_hours')?.set(hours);
  }

  updateFTFR(percentage: number) {
    this.metrics.get('ftfr_percentage')?.set(percentage);
  }

  updatePartsAvailability(percentage: number) {
    this.metrics.get('parts_availability')?.set(percentage);
  }
}
```

### 2.3 Distributed Tracing

#### 2.3.1 Jaeger Integration
```typescript
// Jaeger Tracing Setup
import { initTracer } from 'jaeger-client';

const config = {
  serviceName: 'asic-repair-pro',
  sampler: {
    type: 'const',
    param: 1,
  },
  reporter: {
    logSpans: true,
    agentHost: 'localhost',
    agentPort: 6832,
  },
};

const tracer = initTracer(config);

// Usage in services
import { trace, context } from '@opentelemetry/api';

export class WorkOrderService {
  async createWorkOrder(data: CreateWorkOrderData) {
    const span = tracer.startSpan('createWorkOrder');
    
    try {
      span.setTag('customer_id', data.customer_id);
      span.setTag('priority', data.priority);
      
      const result = await this.repository.create(data);
      
      span.setTag('wo_id', result.wo_id);
      span.setTag('status', 'success');
      
      return result;
    } catch (error) {
      span.setTag('error', true);
      span.setTag('error.message', error.message);
      throw error;
    } finally {
      span.finish();
    }
  }
}
```

### 2.4 Health Checks

#### 2.4.1 Application Health
```typescript
// Health Check Endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});

app.get('/health/ready', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    // Check external services
    await Promise.all([
      checkRedisConnection(),
      checkFileStorageConnection()
    ]);

    res.json({
      status: 'ready',
      checks: {
        database: 'healthy',
        redis: 'healthy',
        fileStorage: 'healthy'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message
    });
  }
});

app.get('/health/live', (req, res) => {
  res.json({ status: 'alive' });
});
```

## 3. Deployment Strategy

### 3.1 CI/CD Pipeline

#### 3.1.1 GitHub Actions Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          TEST_DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CYPRESS_BASE_URL: http://localhost:3000
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Build Docker image
        run: |
          docker build -t asic-repair-pro:${{ github.sha }} .
          docker tag asic-repair-pro:${{ github.sha }} asic-repair-pro:latest
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push asic-repair-pro:${{ github.sha }}
          docker push asic-repair-pro:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to staging
        run: |
          # Deploy to staging environment
          kubectl apply -f k8s/staging/
      
      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: https://staging.asic-repair-pro.com
      
      - name: Deploy to production
        run: |
          # Deploy to production environment
          kubectl apply -f k8s/production/
```

### 3.2 Container Strategy

#### 3.2.1 Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

USER nextjs

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

#### 3.2.2 Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=asic_repair_pro
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 3.3 Kubernetes Deployment

#### 3.3.1 Deployment Configuration
```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: asic-repair-pro
  labels:
    app: asic-repair-pro
spec:
  replicas: 3
  selector:
    matchLabels:
      app: asic-repair-pro
  template:
    metadata:
      labels:
        app: asic-repair-pro
    spec:
      containers:
      - name: app
        image: asic-repair-pro:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### 3.3.2 Service Configuration
```yaml
# k8s/service.yml
apiVersion: v1
kind: Service
metadata:
  name: asic-repair-pro-service
spec:
  selector:
    app: asic-repair-pro
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### 3.4 Rollout Strategy

#### 3.4.1 Blue-Green Deployment
```yaml
# Blue-Green Deployment Script
#!/bin/bash

# Deploy to green environment
kubectl apply -f k8s/green/

# Wait for green to be ready
kubectl wait --for=condition=available --timeout=300s deployment/asic-repair-pro-green

# Run smoke tests on green
npm run test:smoke -- --base-url=https://green.asic-repair-pro.com

# Switch traffic to green
kubectl patch service asic-repair-pro-service -p '{"spec":{"selector":{"version":"green"}}}'

# Wait for traffic to stabilize
sleep 60

# Run full test suite
npm run test:e2e -- --base-url=https://asic-repair-pro.com

# If tests pass, keep green; otherwise rollback
if [ $? -eq 0 ]; then
  echo "Deployment successful"
  kubectl delete deployment asic-repair-pro-blue
else
  echo "Deployment failed, rolling back"
  kubectl patch service asic-repair-pro-service -p '{"spec":{"selector":{"version":"blue"}}}'
  kubectl delete deployment asic-repair-pro-green
fi
```

#### 3.4.2 Canary Deployment
```yaml
# Istio Canary Configuration
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: asic-repair-pro
spec:
  hosts:
  - asic-repair-pro.com
  http:
  - match:
    - headers:
        canary:
          exact: "true"
    route:
    - destination:
        host: asic-repair-pro
        subset: canary
  - route:
    - destination:
        host: asic-repair-pro
        subset: stable
      weight: 90
    - destination:
        host: asic-repair-pro
        subset: canary
      weight: 10
```

## 4. Monitoring and Alerting

### 4.1 Monitoring Stack
- **Prometheus** - Metrics collection
- **Grafana** - Visualization and dashboards
- **AlertManager** - Alert routing and management
- **Jaeger** - Distributed tracing
- **ELK Stack** - Log aggregation and analysis

### 4.2 Alert Rules
```yaml
# prometheus-alerts.yml
groups:
- name: asic-repair-pro
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} errors per second"

  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is {{ $value }} seconds"

  - alert: LowPartsAvailability
    expr: parts_availability_percentage < 80
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "Low parts availability"
      description: "Parts availability is {{ $value }}%"
```

## 5. Security Considerations

### 5.1 Security Testing
- **SAST** - Static Application Security Testing
- **DAST** - Dynamic Application Security Testing
- **Dependency Scanning** - Vulnerability scanning
- **Container Scanning** - Docker image security

### 5.2 Security Headers
```typescript
// Security middleware
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 6. Disaster Recovery

### 6.1 Backup Strategy
- **Database Backups** - Daily full backups + WAL archiving
- **File Storage Backups** - Daily incremental backups
- **Configuration Backups** - Version controlled configurations
- **Disaster Recovery Testing** - Monthly recovery drills

### 6.2 Recovery Procedures
```bash
#!/bin/bash
# Disaster Recovery Script

# 1. Restore database
pg_restore -d asic_repair_pro /backups/db/latest.dump

# 2. Restore file storage
aws s3 sync s3://backup-bucket/files/ /app/uploads/

# 3. Restart services
kubectl rollout restart deployment/asic-repair-pro

# 4. Verify recovery
npm run test:smoke -- --base-url=https://asic-repair-pro.com
```
