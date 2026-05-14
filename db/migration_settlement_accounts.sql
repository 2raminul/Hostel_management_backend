-- ============================================================
-- Settlement accounts (Option 2) — where money is tracked
-- Run once on existing hm_db after main migration.
-- If a statement fails with "Duplicate column", that part was already applied.
-- ============================================================

USE hm_db;

CREATE TABLE IF NOT EXISTS settlement_accounts (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150)  NOT NULL,
  account_kind  VARCHAR(32)   NOT NULL DEFAULT 'other',
  bank_info_id  INT UNSIGNED  NULL,
  sort_order    INT UNSIGNED  NOT NULL DEFAULT 0,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME      NULL,
  CONSTRAINT fk_settlement_accounts_bank FOREIGN KEY (bank_info_id) REFERENCES bank_info(id) ON DELETE SET NULL
);

ALTER TABLE income_entries
  ADD COLUMN settlement_account_id INT UNSIGNED NULL AFTER booking_platform_id;

ALTER TABLE income_entries
  ADD CONSTRAINT fk_income_settlement FOREIGN KEY (settlement_account_id) REFERENCES settlement_accounts(id) ON DELETE SET NULL;

ALTER TABLE expenses
  ADD COLUMN settlement_account_id INT UNSIGNED NULL AFTER remarks;

ALTER TABLE expenses
  ADD CONSTRAINT fk_expense_settlement FOREIGN KEY (settlement_account_id) REFERENCES settlement_accounts(id) ON DELETE SET NULL;

ALTER TABLE income_entries_history
  ADD COLUMN settlement_account_id INT UNSIGNED NULL AFTER booking_platform_id;

DROP TRIGGER IF EXISTS trg_income_entries_after_update;
CREATE TRIGGER trg_income_entries_after_update
  AFTER UPDATE ON income_entries
  FOR EACH ROW
  INSERT INTO income_entries_history (
    income_entry_id, bed_id, room_id, payment_method_id,
    booking_platform_id, settlement_account_id, amount, income_date, remarks,
    updated_by, updated_at
  ) VALUES (
    OLD.id, OLD.bed_id, OLD.room_id, OLD.payment_method_id,
    OLD.booking_platform_id, OLD.settlement_account_id, OLD.amount, OLD.income_date, OLD.remarks,
    OLD.updated_by, OLD.updated_at
  );
