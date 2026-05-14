-- ============================================================
-- Hostel Management System — Seed Data
-- Run after migration.sql
-- ============================================================

-- Admin user (password: Admin@123)
INSERT INTO users (name, email, password, is_active) VALUES
('Admin User', 'admin@hostel.com', '$2b$10$X7v8t5q2mZcD3nJ9pL6kIeA4wF1rN0sUhBcGdEiKlMoVyTzPjQxW', 1);

UPDATE users SET is_admin = 1 WHERE id = 1;

-- Categories
INSERT INTO categories (name, is_inventory_item, is_sale_item, reusable, unit, created_by, updated_by) VALUES
('Food & Groceries',  0, 0, 0, 'kg',    1, 1),
('Cleaning Supplies', 1, 0, 0, 'piece', 1, 1),
('Bedding',           1, 0, 1, 'piece', 1, 1),
('Beverages',         1, 1, 0, 'bottle',1, 1),
('Utilities',         0, 0, 0, NULL,    1, 1);

-- Booking Platforms
INSERT INTO booking_platforms (name, status) VALUES
('Booking.com', 1),
('Airbnb',      1),
('Direct',      1),
('Hostelworld', 1);

-- Bank Info
INSERT INTO bank_info (account_number, status) VALUES
('GB29NWBK60161331926819', 1),
('DE89370400440532013000', 1);

-- Online Cards
INSERT INTO online_cards (name, bank_id, card_number, status) VALUES
('Wise',    1, '4111111111111111', 1),
('Revolut', 2, '4242424242424242', 1);

-- Payment Methods
INSERT INTO payment_methods (name, description, is_active) VALUES
('Cash',          'Cash payment at reception',     1),
('Bank Transfer', 'Direct bank transfer',          1),
('Card',          'Credit/Debit card payment',     1),
('Wise',          'Wise international transfer',   1),
('Revolut',       'Revolut transfer',              1);

-- Rooms
INSERT INTO rooms (room_number, description, total_beds, created_by, updated_by) VALUES
('101', 'Ground floor room A', 4, 1, 1),
('102', 'Ground floor room B', 6, 1, 1),
('201', 'First floor room A',  8, 1, 1),
('202', 'First floor room B',  6, 1, 1);

-- Beds for Room 101 (4 beds)
INSERT INTO beds (room_id, bed_label, is_occupied, created_by, updated_by) VALUES
(1, 'A', 1, 1, 1),
(1, 'B', 1, 1, 1),
(1, 'C', 0, 1, 1),
(1, 'D', 0, 1, 1);

-- Beds for Room 102 (6 beds)
INSERT INTO beds (room_id, bed_label, is_occupied, created_by, updated_by) VALUES
(2, 'A', 1, 1, 1),
(2, 'B', 1, 1, 1),
(2, 'C', 1, 1, 1),
(2, 'D', 0, 1, 1),
(2, 'E', 0, 1, 1),
(2, 'F', 0, 1, 1);

-- Beds for Room 201 (8 beds)
INSERT INTO beds (room_id, bed_label, is_occupied, created_by, updated_by) VALUES
(3, 'A', 1, 1, 1),
(3, 'B', 1, 1, 1),
(3, 'C', 1, 1, 1),
(3, 'D', 1, 1, 1),
(3, 'E', 0, 1, 1),
(3, 'F', 0, 1, 1),
(3, 'G', 0, 1, 1),
(3, 'H', 0, 1, 1);

-- Beds for Room 202 (6 beds)
INSERT INTO beds (room_id, bed_label, is_occupied, created_by, updated_by) VALUES
(4, 'A', 1, 1, 1),
(4, 'B', 0, 1, 1),
(4, 'C', 0, 1, 1),
(4, 'D', 0, 1, 1),
(4, 'E', 0, 1, 1),
(4, 'F', 0, 1, 1);

-- Sample expenses
INSERT INTO expenses (category_id, category_name, brand, quantity, unit_price, total_price, expense_date, remarks, created_by, updated_by) VALUES
(1, 'Food & Groceries',  'Local Market',   50.00, 2.50,  125.00, '2026-03-01', 'Weekly grocery run',        1, 1),
(2, 'Cleaning Supplies', 'Dettol',         10.00, 3.99,   39.90, '2026-03-05', 'Monthly cleaning stock',    1, 1),
(5, 'Utilities',         NULL,              1.00, 85.00,  85.00, '2026-03-01', 'March electricity bill',    1, 1),
(5, 'Utilities',         NULL,              1.00, 45.00,  45.00, '2026-03-01', 'March water bill',          1, 1);

-- Sample inventory
INSERT INTO inventory_items (category_id, category_name, brand, in_stock_count, reusable_available_count, remarks, created_by, updated_by) VALUES
(2, 'Cleaning Supplies', 'Dettol',   10.00, NULL,  'Cleaning supplies stock', 1, 1),
(3, 'Bedding',           'Generic',  20.00, 18.00, 'Bedsheets and pillows',   1, 1),
(4, 'Beverages',         'Coca-Cola', 24.00, NULL,  'Soft drinks stock',       1, 1);

-- Sample income entries
INSERT INTO income_entries (bed_id, room_id, payment_method_id, booking_platform_id, amount, income_date, remarks, created_by, updated_by) VALUES
(1, 1, 1, 3, 350.00, '2026-03-01', 'March rent bed 101-A', 1, 1),
(2, 1, 2, 1, 350.00, '2026-03-01', 'March rent bed 101-B', 1, 1),
(5, 2, 1, 3, 320.00, '2026-03-01', 'March rent bed 102-A', 1, 1),
(6, 2, 3, NULL, 320.00, '2026-03-01', 'March rent bed 102-B', 1, 1),
(7, 2, 1, 3, 320.00, '2026-03-01', 'March rent bed 102-C', 1, 1);

-- Daily income summaries
INSERT INTO daily_income_summary (room_id, summary_date, total_amount, total_entries) VALUES
(1, '2026-03-01', 700.00,  2),
(2, '2026-03-01', 960.00,  3);
