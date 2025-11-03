# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2025-01-30
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

