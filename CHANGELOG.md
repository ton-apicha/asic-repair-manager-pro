# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed - 2025-11-04
- **Authentication Persistence**: แก้ไขปัญหาการจำสถานะ login หลัง refresh page
  - เพิ่ม automatic token refresh เมื่อ token หมดอายุใน AuthContext
  - ปรับปรุง error handling ใน authentication initialization
  - ปรับ response interceptor ให้ไม่ redirect ไป login โดยตรง แต่ให้ AuthContext จัดการแทน
  - แก้ไข DeviceController quickCreateDevice เพื่อ generate serialNumber อัตโนมัติเมื่อไม่ได้ระบุ
  - ปรับปรุง E2E tests:
    - แก้ไข baseURL configuration ใน Playwright config
    - ปรับ Page Objects ให้รองรับ baseURL parameter
    - แก้ไข LoginPage locator เพื่อหลีกเลี่ยง strict mode violation
    - ปรับปรุง DashboardPage.isLoggedIn() เพื่อตรวจสอบหลาย indicators
    - Authentication tests: 7/7 passed ✅

### Added - 2025-01-30
- Work Order Detail Page - Phase 2 (Complete)
  - Work Order Detail Page with complete information display
  - Workflow 6 Stages System (TRIAGE → QUOTATION → EXECUTION → QA → CLOSURE → WARRANTY)
  - Workflow Stepper component with visual stage indicators
  - Status transition validation with prerequisites checking
  - Status Update Dialog with validation messages
  - Timeline view showing chronological events (created, status changes, diagnostics, time logs)
  - Document management (upload, view, download, delete)
  - Parts usage tracking with stock management and cost calculation
  - Time logs management with duration and cost calculation
  - Diagnostic information management (create, view, edit)
  - Technician assignment functionality (assign/unassign)
  - Edit Work Order form with permission-based field access
  - Navigation from List page to Detail page
  - Real-time data refresh after updates
  - Backend API endpoints:
    - POST /api/v1/work-orders/:id/parts - Add parts usage
    - GET /api/v1/work-orders/:id/parts - Get parts usage
    - DELETE /api/v1/work-orders/:id/parts/:partUsageId - Delete parts usage
    - POST /api/v1/work-orders/:id/time-logs - Add time log
    - GET /api/v1/work-orders/:id/time-logs - Get time logs
    - PUT /api/v1/work-orders/:id/time-logs/:logId - Update time log
    - DELETE /api/v1/work-orders/:id/time-logs/:logId - Delete time log
  - Frontend components:
    - useWorkOrder hook for fetching work order detail
    - WorkflowStepper component
    - StatusUpdateDialog component
    - WorkOrderEditForm component with permissions
    - DiagnosticsSection component
    - PartsUsageSection component
    - TimeLogsSection component
    - DocumentsSection component
    - TimelineComponent component
    - TechnicianAssignment component
  - Workflow utilities (workflowUtils.ts) for validation and transitions

- Work Order Reception System - Phase 1
  - WO_ID generation with format YYMMDDXXX (YY=year, MMDD=month-day, XXX=sequence 001-999)
  - Work Order creation with auto-set status to TRIAGE
  - Customer Quick Add functionality (inline form)
  - Device Quick Add functionality (inline form)
  - Work Order Create Form with integrated Quick Add
  - Work Orders List Page with DataGrid, filters, and search
  - Common components: ErrorDisplay, EmptyState, ConfirmDialog
  - Backend API endpoints for quick create:
    - POST /api/v1/customers/quick-create
    - POST /api/v1/devices/quick-create
  - Frontend services and hooks for quick create operations
  - Real-time validation in forms
  - Error handling with Snackbar notifications

### Changed
- Updated WorkOrderController.generateWorkOrderId() to use new YYMMDDXXX format
- Updated createWorkOrder schema to require only customerId, deviceId, description, and optional priority
- Updated WorkOrderCreate type definition to match new requirements

### Fixed
- Fixed duplicate property error in ReportController.getSystemAlerts()
- Fixed TypeScript type definitions for pagination and response types
- Fixed unused imports and variables in dashboard components

## [0.1.0] - 2025-01-29

### Added
- Initial project setup
- Docker configuration with multi-service setup
- Backend API with Express, TypeScript, Prisma
- Frontend with React, TypeScript, Vite, Material-UI
- Database schema with Prisma
- Authentication system with JWT
- Dashboard with real-time KPIs and charts
- Basic CRUD operations for Work Orders, Customers, Devices, Technicians
- API services and custom hooks for data fetching
- Nginx reverse proxy configuration

