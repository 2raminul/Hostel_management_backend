-- Run after main migration. Adds admin flag + per-module permissions for non-admin users.

ALTER TABLE users
  ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0
  AFTER is_active;

CREATE TABLE IF NOT EXISTS user_permissions (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  module_key    VARCHAR(64)   NOT NULL,
  can_view      TINYINT(1)    NOT NULL DEFAULT 0,
  can_edit      TINYINT(1)    NOT NULL DEFAULT 0,
  can_delete    TINYINT(1)    NOT NULL DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_module (user_id, module_key),
  CONSTRAINT fk_user_permissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- First user (seed admin) becomes system admin
UPDATE users SET is_admin = 1 WHERE id = 1;
