-- Dummy settlement accounts + sample tags for UI testing (idempotent on fixed ids).
-- Run after migration_settlement_accounts.sql (schema matches that file — no organization_id).

USE hm_db;

INSERT INTO settlement_accounts (id, name, account_kind, bank_info_id, sort_order, is_active, created_at, updated_at)
VALUES
  (9001, 'Personal bank', 'personal_bank', NULL, 10, 1, NOW(), NOW()),
  (9002, 'Business bank', 'business_bank', NULL, 20, 1, NOW(), NOW()),
  (9003, 'Cash in hand', 'cash', NULL, 30, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  account_kind = VALUES(account_kind),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active),
  updated_at = NOW();

UPDATE income_entries
SET settlement_account_id = 9001
WHERE deleted_at IS NULL AND settlement_account_id IS NULL
ORDER BY id DESC
LIMIT 3;

UPDATE income_entries
SET settlement_account_id = 9002
WHERE deleted_at IS NULL AND settlement_account_id IS NULL
ORDER BY id DESC
LIMIT 2;

UPDATE expenses
SET settlement_account_id = 9003
WHERE deleted_at IS NULL AND settlement_account_id IS NULL
ORDER BY id DESC
LIMIT 4;

UPDATE expenses
SET settlement_account_id = 9001
WHERE deleted_at IS NULL AND settlement_account_id IS NULL
ORDER BY id DESC
LIMIT 2;
