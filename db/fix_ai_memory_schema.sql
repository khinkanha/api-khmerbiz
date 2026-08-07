-- =============================================================================
-- AI Conversation-Memory schema fix
-- =============================================================================
-- Problem
--   aiChat.service.ts logs & reads conversation memory using:
--       operation_type = 'conversation'   and   target_type = 'chat'
--   but the original table definition (see ../../aiplan.md) used ENUMs WITHOUT
--   those values:
--       operation_type ENUM('create','update','delete','ui_change')
--       target_type    ENUM('content','menu','banner','setting','seo')
--   In strict MySQL this makes EVERY memory save fail. The failure is caught and
--   swallowed in aiChat.service.ts (processMessage), so
--   getRecentConversationHistory() always returns [] and the AI has ZERO memory
--   between turns — i.e. the "keeps re-asking for the photo links" bug.
--
-- This script is IDEMPOTENT — safe to run multiple times.
--
-- How to run (against the khmerbiz MySQL DB), e.g. via CapRover:
--   docker exec -i srv-captain--mysql-db.1.<id> mysql -u root -p<pw> khmerbiz \
--     < db/fix_ai_memory_schema.sql
-- =============================================================================

-- (Diagnostic) Inspect current column definitions BEFORE running, to confirm the
-- values are missing on your DB:
-- SHOW COLUMNS FROM ai_operation_logs WHERE Field IN ('operation_type','target_type');

-- 1) Safety net: create the table if it does not exist at all (with the corrected
--    ENUMs already included).
CREATE TABLE IF NOT EXISTS ai_operation_logs (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  user_id       INT NOT NULL,
  domain_id     INT NOT NULL,
  operation_type ENUM('create','update','delete','ui_change','conversation') NOT NULL,
  target_type    ENUM('content','menu','banner','setting','seo','chat') NOT NULL,
  target_id     INT,
  operation_data JSON,
  status        ENUM('pending','completed','failed','rolled_back') DEFAULT 'completed',
  ip_address    VARCHAR(45),
  user_agent    TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) Add the missing ENUM values to an EXISTING table. Redefines the columns to
--    the full value set; existing data remains valid. Idempotent.
ALTER TABLE ai_operation_logs
  MODIFY COLUMN operation_type
    ENUM('create','update','delete','ui_change','conversation') NOT NULL,
  MODIFY COLUMN target_type
    ENUM('content','menu','banner','setting','seo','chat') NOT NULL;

-- 3) (Performance) Composite index for the per-message memory lookup:
--      WHERE user_id=? AND domain_id=? AND operation_type='conversation'
--        AND status='completed' ORDER BY id DESC LIMIT n
--    Guarded via information_schema so the script stays idempotent.
SET @idx := (SELECT COUNT(*) FROM information_schema.statistics
             WHERE table_schema = DATABASE()
               AND table_name  = 'ai_operation_logs'
               AND index_name  = 'idx_conversation_memory');
SET @sql := IF(@idx = 0,
  'ALTER TABLE ai_operation_logs ADD INDEX idx_conversation_memory (user_id, domain_id, operation_type, status, id)',
  'SELECT ''idx_conversation_memory already exists'' AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- (Diagnostic) AFTER running, confirm a conversation row can now be written & read:
-- INSERT INTO ai_operation_logs (user_id, domain_id, operation_type, target_type, operation_data, status)
--   VALUES (0, 0, 'conversation', 'chat', '{"userMessage":"test","aiResponse":"ok"}', 'completed');
-- SELECT id, operation_type, target_type FROM ai_operation_logs
--   WHERE user_id=0 AND domain_id=0 ORDER BY id DESC LIMIT 1;
-- DELETE FROM ai_operation_logs WHERE user_id=0 AND domain_id=0;
