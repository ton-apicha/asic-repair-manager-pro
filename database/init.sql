-- ASIC Repair Pro Database Initialization Script
-- This script creates the initial database structure and sample data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database if it doesn't exist (this will be handled by Docker)
-- CREATE DATABASE asic_repair_pro;

-- Connect to the database
-- \c asic_repair_pro;

-- Create initial system settings
INSERT INTO system_settings (setting_key, setting_value, data_type, description) VALUES
('app_name', 'ASIC Repair Pro', 'STRING', 'Application name'),
('app_version', '1.0.0', 'STRING', 'Application version'),
('maintenance_mode', 'false', 'BOOLEAN', 'Maintenance mode flag'),
('max_work_orders_per_day', '100', 'NUMBER', 'Maximum work orders per day'),
('default_warranty_days', '365', 'NUMBER', 'Default warranty period in days'),
('low_stock_threshold', '5', 'NUMBER', 'Low stock alert threshold'),
('email_notifications', 'true', 'BOOLEAN', 'Enable email notifications'),
('sms_notifications', 'false', 'BOOLEAN', 'Enable SMS notifications')
ON CONFLICT (setting_key) DO NOTHING;

-- Create initial part categories
INSERT INTO part_categories (name, description) VALUES
('Hash Board', 'ASIC hash board components'),
('Power Supply Unit', 'PSU components'),
('Fan', 'Cooling fan components'),
('Control Board', 'Control board components'),
('Cable', 'Various cables and connectors'),
('Thermal Pad', 'Thermal interface materials'),
('Screw', 'Fasteners and screws'),
('Other', 'Other miscellaneous parts')
ON CONFLICT (name) DO NOTHING;

-- Create initial warranty types
INSERT INTO warranty_types (name, duration_days, coverage_type, description) VALUES
('Standard Warranty', 365, 'BOTH', 'Standard 1-year warranty covering both parts and labor'),
('Extended Warranty', 730, 'BOTH', 'Extended 2-year warranty covering both parts and labor'),
('Parts Only Warranty', 180, 'PARTS', 'Parts-only warranty for 6 months'),
('Labor Only Warranty', 90, 'LABOR', 'Labor-only warranty for 3 months'),
('Limited Warranty', 30, 'BOTH', 'Limited 30-day warranty')
ON CONFLICT (name) DO NOTHING;

-- Create sample users (for testing)
INSERT INTO users (id, email, password, first_name, last_name, role, is_active) VALUES
('admin-001', 'admin@asic-repair-pro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZqK2', 'Admin', 'User', 'ADMIN', true),
('manager-001', 'manager@asic-repair-pro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZqK2', 'Manager', 'User', 'MANAGER', true),
('tech-001', 'tech1@asic-repair-pro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZqK2', 'John', 'Doe', 'TECHNICIAN', true),
('tech-002', 'tech2@asic-repair-pro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZqK2', 'Jane', 'Smith', 'TECHNICIAN', true),
('user-001', 'user@asic-repair-pro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZqK2', 'Regular', 'User', 'USER', true)
ON CONFLICT (email) DO NOTHING;

-- Create sample technicians
INSERT INTO technicians (id, user_id, employee_id, skills, hourly_rate, is_active) VALUES
('tech-001', 'tech-001', 'EMP001', ARRAY['HASH_BOARD', 'PSU', 'FAN'], 500.00, true),
('tech-002', 'tech-002', 'EMP002', ARRAY['HASH_BOARD', 'CONTROL_BOARD', 'FAN'], 550.00, true)
ON CONFLICT (id) DO NOTHING;

-- Create sample customers
INSERT INTO customers (id, company_name, contact_person, email, phone, address, tax_id, is_active) VALUES
('cust-001', 'ABC Mining Corp', 'John Smith', 'john@abcmining.com', '081-234-5678', '123 Mining Street, Bangkok', '1234567890123', true),
('cust-002', 'XYZ Crypto Ltd', 'Jane Doe', 'jane@xyzcrypto.com', '082-345-6789', '456 Crypto Avenue, Chiang Mai', '2345678901234', true),
('cust-003', 'Bitcoin Farm Co', 'Bob Wilson', 'bob@bitcoinfarm.com', '083-456-7890', '789 Bitcoin Road, Phuket', '3456789012345', true)
ON CONFLICT (id) DO NOTHING;

-- Create sample devices
INSERT INTO devices (id, customer_id, model, serial_number, hashrate, power_consumption, purchase_date, warranty_start_date, warranty_end_date, status) VALUES
('dev-001', 'cust-001', 'Antminer S19 Pro', 'S19P-001-ABC123', 110.0, 3250, '2023-01-15', '2023-01-15', '2024-01-15', 'ACTIVE'),
('dev-002', 'cust-001', 'Antminer S19j Pro', 'S19JP-002-ABC456', 96.0, 3068, '2023-02-20', '2023-02-20', '2024-02-20', 'ACTIVE'),
('dev-003', 'cust-002', 'Antminer S19', 'S19-003-XYZ789', 95.0, 3250, '2023-03-10', '2023-03-10', '2024-03-10', 'REPAIR'),
('dev-004', 'cust-003', 'Antminer S19 Pro', 'S19P-004-BTC101', 110.0, 3250, '2023-04-05', '2023-04-05', '2024-04-05', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Create sample parts
INSERT INTO parts (id, category_id, part_number, serial_number, model, cost, selling_price, quantity_in_stock, min_stock_level, location, supplier, purchase_date, warranty_period, status) VALUES
('part-001', (SELECT id FROM part_categories WHERE name = 'Hash Board'), 'HB-S19-001', 'HB-001-ABC123', 'S19 Hash Board', 15000.00, 18000.00, 25, 5, 'A1-B2', 'Bitmain', '2023-01-01', 365, 'AVAILABLE'),
('part-002', (SELECT id FROM part_categories WHERE name = 'Power Supply Unit'), 'PSU-S19-001', 'PSU-001-ABC456', 'S19 PSU', 8000.00, 10000.00, 15, 3, 'A1-C3', 'Bitmain', '2023-01-01', 365, 'AVAILABLE'),
('part-003', (SELECT id FROM part_categories WHERE name = 'Fan'), 'FAN-S19-001', 'FAN-001-ABC789', 'S19 Fan', 500.00, 800.00, 50, 10, 'A2-B1', 'Bitmain', '2023-01-01', 180, 'AVAILABLE'),
('part-004', (SELECT id FROM part_categories WHERE name = 'Control Board'), 'CB-S19-001', 'CB-001-ABC012', 'S19 Control Board', 5000.00, 6500.00, 8, 2, 'A2-C2', 'Bitmain', '2023-01-01', 365, 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;

-- Create sample work orders
INSERT INTO work_orders (id, wo_id, customer_id, device_id, technician_id, status, priority, description, notes, estimated_cost, actual_cost, created_by, updated_by) VALUES
('wo-001', 'WO-2024-0101-001', 'cust-001', 'dev-001', 'tech-001', 'EXECUTION', 'HIGH', 'Hash board failure', 'Customer reported hash board not working', 15000.00, NULL, 'admin-001', 'admin-001'),
('wo-002', 'WO-2024-0101-002', 'cust-002', 'dev-003', 'tech-002', 'QA', 'MEDIUM', 'PSU replacement', 'Power supply unit needs replacement', 8000.00, 7500.00, 'manager-001', 'manager-001'),
('wo-003', 'WO-2024-0101-003', 'cust-003', 'dev-004', 'tech-001', 'CLOSURE', 'LOW', 'Fan replacement', 'Cooling fan replacement completed', 500.00, 450.00, 'tech-001', 'tech-001')
ON CONFLICT (id) DO NOTHING;

-- Create sample diagnostics
INSERT INTO diagnostics (id, work_order_id, fault_type, fault_description, diagnosis_notes, recommended_parts, estimated_repair_time, created_by) VALUES
('diag-001', 'wo-001', 'HASH_BOARD', 'Hash board not responding', 'Tested hash board, found faulty chips', ARRAY['part-001'], 120, 'tech-001'),
('diag-002', 'wo-002', 'PSU', 'Power supply unit failure', 'PSU not providing stable power', ARRAY['part-002'], 60, 'tech-002'),
('diag-003', 'wo-003', 'FAN', 'Cooling fan not working', 'Fan motor burned out', ARRAY['part-003'], 30, 'tech-001')
ON CONFLICT (id) DO NOTHING;

-- Create sample time logs
INSERT INTO time_logs (id, work_order_id, technician_id, activity_type, start_time, end_time, duration, hourly_rate, total_cost, notes) VALUES
('time-001', 'wo-001', 'tech-001', 'DIAGNOSIS', '2024-01-01 09:00:00', '2024-01-01 11:00:00', 120, 500.00, 1000.00, 'Initial diagnosis and testing'),
('time-002', 'wo-001', 'tech-001', 'REPAIR', '2024-01-01 13:00:00', '2024-01-01 17:00:00', 240, 500.00, 2000.00, 'Hash board replacement'),
('time-003', 'wo-002', 'tech-002', 'DIAGNOSIS', '2024-01-02 08:00:00', '2024-01-02 09:00:00', 60, 550.00, 550.00, 'PSU diagnosis'),
('time-004', 'wo-002', 'tech-002', 'REPAIR', '2024-01-02 10:00:00', '2024-01-02 12:00:00', 120, 550.00, 1100.00, 'PSU replacement')
ON CONFLICT (id) DO NOTHING;

-- Create sample warranties
INSERT INTO warranties (id, work_order_id, device_id, warranty_type_id, start_date, end_date, terms, status) VALUES
('warr-001', 'wo-001', 'dev-001', (SELECT id FROM warranty_types WHERE name = 'Standard Warranty'), '2024-01-01', '2025-01-01', 'Standard 1-year warranty for hash board replacement', 'ACTIVE'),
('warr-002', 'wo-002', 'dev-003', (SELECT id FROM warranty_types WHERE name = 'Standard Warranty'), '2024-01-02', '2025-01-02', 'Standard 1-year warranty for PSU replacement', 'ACTIVE'),
('warr-003', 'wo-003', 'dev-004', (SELECT id FROM warranty_types WHERE name = 'Parts Only Warranty'), '2024-01-03', '2024-07-03', '6-month parts warranty for fan replacement', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Create sample work schedule
INSERT INTO work_schedule (id, work_order_id, technician_id, scheduled_date, start_time, end_time, status) VALUES
('sched-001', 'wo-001', 'tech-001', '2024-01-01', '2024-01-01 09:00:00', '2024-01-01 17:00:00', 'COMPLETED'),
('sched-002', 'wo-002', 'tech-002', '2024-01-02', '2024-01-02 08:00:00', '2024-01-02 16:00:00', 'COMPLETED'),
('sched-003', 'wo-003', 'tech-001', '2024-01-03', '2024-01-03 10:00:00', '2024-01-03 14:00:00', 'COMPLETED')
ON CONFLICT (id) DO NOTHING;

-- Create sample audit logs
INSERT INTO audit_logs (id, table_name, record_id, action, old_values, new_values, changed_by, changed_at, ip_address, user_agent) VALUES
('audit-001', 'work_orders', 'wo-001', 'INSERT', NULL, '{"wo_id": "WO-2024-0101-001", "status": "TRIAGE"}', 'admin-001', '2024-01-01 08:00:00', '192.168.1.100', 'Mozilla/5.0'),
('audit-002', 'work_orders', 'wo-001', 'UPDATE', '{"status": "TRIAGE"}', '{"status": "EXECUTION"}', 'tech-001', '2024-01-01 09:00:00', '192.168.1.101', 'Mozilla/5.0'),
('audit-003', 'work_orders', 'wo-002', 'INSERT', NULL, '{"wo_id": "WO-2024-0101-002", "status": "TRIAGE"}', 'manager-001', '2024-01-02 08:00:00', '192.168.1.102', 'Mozilla/5.0')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_orders_customer_id ON work_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_device_id ON work_orders(device_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_technician_id ON work_orders(technician_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at ON work_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_devices_customer_id ON devices(customer_id);
CREATE INDEX IF NOT EXISTS idx_devices_serial_number ON devices(serial_number);
CREATE INDEX IF NOT EXISTS idx_parts_category_id ON parts(category_id);
CREATE INDEX IF NOT EXISTS idx_parts_serial_number ON parts(serial_number);
CREATE INDEX IF NOT EXISTS idx_time_logs_work_order_id ON time_logs(work_order_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_technician_id ON time_logs(technician_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at);

-- Create views for reporting
CREATE OR REPLACE VIEW v_work_order_summary AS
SELECT 
    wo.id,
    wo.wo_id,
    wo.status,
    wo.priority,
    wo.created_at,
    wo.completed_at,
    wo.estimated_cost,
    wo.actual_cost,
    c.company_name as customer_name,
    c.email as customer_email,
    d.model as device_model,
    d.serial_number as device_serial,
    CONCAT(t.user.first_name, ' ', t.user.last_name) as technician_name,
    EXTRACT(EPOCH FROM (wo.completed_at - wo.created_at))/3600 as hours_to_complete
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
LEFT JOIN devices d ON wo.device_id = d.id
LEFT JOIN technicians t ON wo.technician_id = t.id
LEFT JOIN users u ON t.user_id = u.id;

-- Create view for technician performance
CREATE OR REPLACE VIEW v_technician_performance AS
SELECT 
    t.id as technician_id,
    t.employee_id,
    CONCAT(u.first_name, ' ', u.last_name) as technician_name,
    COUNT(wo.id) as total_work_orders,
    COUNT(CASE WHEN wo.status = 'CLOSURE' THEN 1 END) as completed_work_orders,
    AVG(EXTRACT(EPOCH FROM (wo.completed_at - wo.created_at))/3600) as avg_hours_per_wo,
    SUM(tl.total_cost) as total_labor_cost,
    AVG(tl.hourly_rate) as avg_hourly_rate
FROM technicians t
LEFT JOIN users u ON t.user_id = u.id
LEFT JOIN work_orders wo ON t.id = wo.technician_id
LEFT JOIN time_logs tl ON t.id = tl.technician_id
WHERE t.is_active = true
GROUP BY t.id, t.employee_id, u.first_name, u.last_name;

-- Create view for inventory status
CREATE OR REPLACE VIEW v_inventory_status AS
SELECT 
    p.id,
    p.part_number,
    p.serial_number,
    p.model,
    p.cost,
    p.selling_price,
    p.quantity_in_stock,
    p.min_stock_level,
    p.location,
    p.status,
    pc.name as category_name,
    CASE 
        WHEN p.quantity_in_stock <= 0 THEN 'OUT_OF_STOCK'
        WHEN p.quantity_in_stock <= p.min_stock_level THEN 'LOW_STOCK'
        ELSE 'NORMAL'
    END as stock_status
FROM parts p
LEFT JOIN part_categories pc ON p.category_id = pc.id
WHERE p.status = 'AVAILABLE';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO asic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO asic_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO asic_user;

-- Insert completion message
INSERT INTO audit_logs (id, table_name, record_id, action, old_values, new_values, changed_by, changed_at, ip_address, user_agent) VALUES
('audit-init', 'system', 'database', 'INITIALIZE', NULL, '{"status": "initialized", "version": "1.0.0"}', 'system', NOW(), '127.0.0.1', 'PostgreSQL/14.0');

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE 'ASIC Repair Pro database initialization completed successfully!';
    RAISE NOTICE 'Sample data has been inserted.';
    RAISE NOTICE 'Database is ready for use.';
END $$;
