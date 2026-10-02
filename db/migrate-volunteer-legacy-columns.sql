-- Run once against the same database used by the backend.
-- Back up the database before applying this compatibility migration.
-- The current volunteer model is club-scoped; older schemas may still require
-- `approved` and `event_id` on inserts. Preserve those columns and existing rows.

SET @has_approved = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'volunteers'
      AND column_name = 'approved'
);
SET @sql = IF(
    @has_approved > 0,
    'ALTER TABLE `volunteers` ALTER COLUMN `approved` SET DEFAULT 1',
    'SELECT ''Skipped: legacy approved column not present'''
);
PREPARE volunteer_schema_stmt FROM @sql;
EXECUTE volunteer_schema_stmt;
DEALLOCATE PREPARE volunteer_schema_stmt;

SET @has_event_id = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'volunteers'
      AND column_name = 'event_id'
);
SET @sql = IF(
    @has_event_id > 0,
    'ALTER TABLE `volunteers` MODIFY COLUMN `event_id` BIGINT NULL DEFAULT NULL',
    'SELECT ''Skipped: legacy event_id column not present'''
);
PREPARE volunteer_schema_stmt FROM @sql;
EXECUTE volunteer_schema_stmt;
DEALLOCATE PREPARE volunteer_schema_stmt;