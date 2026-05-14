-- ============================================================
-- Hostel Management System - MySQL Migration
-- Run this once on a fresh hm_db database (MySQL 8+).
-- In DBeaver: connect to MySQL, select hm_db, then run the whole script
-- (e.g. Execute SQL Script). Do not use DELIMITER here; triggers are
-- written as single-statement bodies so JDBC/GUIs accept them.
-- ============================================================

CREATE DATABASE IF NOT EXISTS hm_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hm_db;

SET SESSION foreign_key_checks = 0;

-- --- Users ---------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  is_active   TINYINT(1)    NOT NULL DEFAULT 1,
  is_admin    TINYINT(1)    NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME      NULL
);

-- --- User module permissions (non-admin rows) -----------------
CREATE TABLE IF NOT EXISTS user_permissions (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED  NOT NULL,
  module_key    VARCHAR(64)   NOT NULL,
  can_view      TINYINT(1)    NOT NULL DEFAULT 0,
  can_edit      TINYINT(1)    NOT NULL DEFAULT 0,
  can_delete    TINYINT(1)    NOT NULL DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_module (user_id, module_key),
  CONSTRAINT fk_user_permissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- --- Categories ----------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(150)  NOT NULL,
  is_inventory_item TINYINT(1)    NOT NULL DEFAULT 0,
  is_sale_item      TINYINT(1)    NOT NULL DEFAULT 0,
  reusable          TINYINT(1)    NOT NULL DEFAULT 0,
  unit              VARCHAR(50)   NULL,
  created_by        INT UNSIGNED  NULL,
  updated_by        INT UNSIGNED  NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME      NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- --- Expenses -------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id   INT UNSIGNED  NULL,
  category_name VARCHAR(150)  NOT NULL,
  brand         VARCHAR(150)  NULL,
  quantity      DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_price    DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price   DECIMAL(10,2) NOT NULL DEFAULT 0,
  expense_date  DATE          NOT NULL,
  remarks       TEXT          NULL,
  created_by    INT UNSIGNED  NULL,
  updated_by    INT UNSIGNED  NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME      NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by)  REFERENCES users(id) ON DELETE SET NULL
);

-- --- Expenses History (populated by trigger) ------------------
CREATE TABLE IF NOT EXISTS expenses_history (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  expenses_id   INT UNSIGNED  NOT NULL,
  category_id   INT UNSIGNED  NULL,
  category_name VARCHAR(150)  NOT NULL,
  brand         VARCHAR(150)  NULL,
  quantity      DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_price    DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price   DECIMAL(10,2) NOT NULL DEFAULT 0,
  expense_date  DATE          NOT NULL,
  remarks       TEXT          NULL,
  updated_by    INT UNSIGNED  NULL,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger: create history record when an expense row is updated
-- (Single-statement body: works with DBeaver/JDBC without DELIMITER.)
DROP TRIGGER IF EXISTS trg_expenses_after_update;
CREATE TRIGGER trg_expenses_after_update
  AFTER UPDATE ON expenses
  FOR EACH ROW
  INSERT INTO expenses_history (
    expenses_id, category_id, category_name, brand,
    quantity, unit_price, total_price, expense_date,
    remarks, updated_by, updated_at
  ) VALUES (
    OLD.id, OLD.category_id, OLD.category_name, OLD.brand,
    OLD.quantity, OLD.unit_price, OLD.total_price, OLD.expense_date,
    OLD.remarks, OLD.updated_by, OLD.updated_at
  );

-- --- Inventory Items ------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_items (
  id                        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id               INT UNSIGNED  NULL,
  category_name             VARCHAR(150)  NOT NULL,
  brand                     VARCHAR(150)  NULL,
  in_stock_count            DECIMAL(10,2) NOT NULL DEFAULT 0,
  reusable_available_count  DECIMAL(10,2) NULL,
  remarks                   TEXT          NULL,
  created_by                INT UNSIGNED  NULL,
  updated_by                INT UNSIGNED  NULL,
  created_at                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at                DATETIME      NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by)  REFERENCES users(id) ON DELETE SET NULL
);

-- --- Settings: Booking Platforms -----------------------------
CREATE TABLE IF NOT EXISTS booking_platforms (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  status      TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME      NULL
);

-- --- Settings: Bank Info -------------------------------------
CREATE TABLE IF NOT EXISTS bank_info (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  account_number  VARCHAR(100)  NULL,
  status          TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME      NULL
);

-- --- Settings: Online Cards -----------------------------------
CREATE TABLE IF NOT EXISTS online_cards (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150)  NOT NULL,
  bank_id         INT UNSIGNED  NULL,
  card_number     VARCHAR(100)  NULL,
  status          TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME      NULL,
  FOREIGN KEY (bank_id) REFERENCES bank_info(id) ON DELETE SET NULL
);

-- --- Rooms ---------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(20)   NOT NULL UNIQUE,
  description TEXT          NULL,
  total_beds  INT UNSIGNED  NOT NULL DEFAULT 0,
  created_by  INT UNSIGNED  NULL,
  updated_by  INT UNSIGNED  NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME      NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- --- Beds ----------------------------------------------------
CREATE TABLE IF NOT EXISTS beds (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id     INT UNSIGNED  NOT NULL,
  bed_label   VARCHAR(10)   NOT NULL,
  is_occupied TINYINT(1)    NOT NULL DEFAULT 0,
  remarks     TEXT          NULL,
  created_by  INT UNSIGNED  NULL,
  updated_by  INT UNSIGNED  NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME      NULL,
  FOREIGN KEY (room_id)    REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- --- Payment Methods -----------------------------------------
CREATE TABLE IF NOT EXISTS payment_methods (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL UNIQUE,
  description TEXT          NULL,
  is_active   TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --- Income Entries -------------------------------------------
CREATE TABLE IF NOT EXISTS income_entries (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bed_id              INT UNSIGNED  NOT NULL,
  room_id             INT UNSIGNED  NOT NULL,
  payment_method_id   INT UNSIGNED  NOT NULL,
  booking_platform_id INT UNSIGNED  NULL,
  amount              DECIMAL(12,2) NOT NULL DEFAULT 0,
  income_date         DATE          NOT NULL,
  remarks             TEXT          NULL,
  created_by          INT UNSIGNED  NULL,
  updated_by          INT UNSIGNED  NULL,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          DATETIME      NULL,
  FOREIGN KEY (bed_id)              REFERENCES beds(id)              ON DELETE RESTRICT,
  FOREIGN KEY (room_id)             REFERENCES rooms(id)             ON DELETE RESTRICT,
  FOREIGN KEY (payment_method_id)   REFERENCES payment_methods(id)  ON DELETE RESTRICT,
  FOREIGN KEY (booking_platform_id) REFERENCES booking_platforms(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)          REFERENCES users(id)             ON DELETE SET NULL,
  FOREIGN KEY (updated_by)          REFERENCES users(id)             ON DELETE SET NULL
);

-- --- Income Entries History (populated by trigger) ------------
CREATE TABLE IF NOT EXISTS income_entries_history (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  income_entry_id     INT UNSIGNED  NOT NULL,
  bed_id              INT UNSIGNED  NOT NULL,
  room_id             INT UNSIGNED  NOT NULL,
  payment_method_id   INT UNSIGNED  NOT NULL,
  booking_platform_id INT UNSIGNED  NULL,
  amount              DECIMAL(12,2) NOT NULL DEFAULT 0,
  income_date         DATE          NOT NULL,
  remarks             TEXT          NULL,
  updated_by          INT UNSIGNED  NULL,
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trg_income_entries_after_update;
CREATE TRIGGER trg_income_entries_after_update
  AFTER UPDATE ON income_entries
  FOR EACH ROW
  INSERT INTO income_entries_history (
    income_entry_id, bed_id, room_id, payment_method_id,
    booking_platform_id, amount, income_date, remarks,
    updated_by, updated_at
  ) VALUES (
    OLD.id, OLD.bed_id, OLD.room_id, OLD.payment_method_id,
    OLD.booking_platform_id, OLD.amount, OLD.income_date, OLD.remarks,
    OLD.updated_by, OLD.updated_at
  );

-- --- Daily Income Summary -------------------------------------
CREATE TABLE IF NOT EXISTS daily_income_summary (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id       INT UNSIGNED  NOT NULL,
  summary_date  DATE          NOT NULL,
  total_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_entries INT UNSIGNED  NOT NULL DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_room_date (room_id, summary_date),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

SET SESSION foreign_key_checks = 1;
