-- =====================================================================
--  CampusConnect — Clean-slate database reset
-- =====================================================================
--  WHAT THIS DOES
--    Deletes ALL rows from every CampusConnect table while KEEPING the
--    schema (tables, columns, indexes, foreign keys) fully intact. After
--    running it the database is empty but the application starts normally —
--    Hibernate (spring.jpa.hibernate.ddl-auto=update) has nothing to rebuild.
--    TRUNCATE also resets each table's AUTO_INCREMENT back to 1.
--
--  WHAT THIS IS NOT
--    It does NOT drop tables and it does NOT drop or recreate the database.
--    It does NOT alter any structure.
--
--  ⚠  DESTRUCTIVE AND IRREVERSIBLE
--    Every user, club, event, registration, payment, certificate, team,
--    notification, etc. is permanently removed. BACK UP FIRST:
--
--        mysqldump -u root -p campusconnect > campusconnect-backup.sql
--
--    This script is NEVER run by the application. You run it yourself,
--    deliberately, against the database you intend to wipe.
--
--  HOW TO RUN
--    CLI :  mysql -u root -p campusconnect < db/reset-database.sql
--    GUI :  open in MySQL Workbench / DBeaver and execute the whole script.
--
--  AFTER RUNNING
--    • If app.seed.enabled=true  → restart the backend and the demo data
--        (accounts, clubs, events) is recreated automatically on startup.
--    • If app.seed.enabled=false → the database stays empty; register a new
--        account to begin. The first self-registered user is a STUDENT, so to
--        obtain an ADMIN either enable seeding once, or promote a user after
--        they register:
--            UPDATE `user` SET role = 'ADMIN' WHERE email = 'you@college.edu';
-- =====================================================================

-- Target the CampusConnect schema. Change this if you deploy under a
-- different database name (see SPRING_DATASOURCE_URL in application.yml).
USE `campusconnect`;

-- Disabling FK checks lets us TRUNCATE parent tables that are referenced by
-- child tables, and makes the statement order below irrelevant. It is turned
-- back on at the end so normal integrity rules resume immediately.
SET FOREIGN_KEY_CHECKS = 0;

-- --- Wipe every table (listed alphabetically for easy scanning) ------------
-- Names are back-quoted because `user` is a reserved word in MySQL.
TRUNCATE TABLE `announcement`;
TRUNCATE TABLE `attendance`;
TRUNCATE TABLE `audit_log`;
TRUNCATE TABLE `certificate`;
TRUNCATE TABLE `certificate_template`;
TRUNCATE TABLE `club`;
TRUNCATE TABLE `club_follow`;
TRUNCATE TABLE `club_member`;
TRUNCATE TABLE `comment`;
TRUNCATE TABLE `competition`;
TRUNCATE TABLE `competition_round`;
TRUNCATE TABLE `event`;
TRUNCATE TABLE `event_schedule`;
TRUNCATE TABLE `feedback`;
TRUNCATE TABLE `judge`;
TRUNCATE TABLE `media`;
TRUNCATE TABLE `notification`;
TRUNCATE TABLE `notification_preference`;
TRUNCATE TABLE `payment`;
TRUNCATE TABLE `registration`;
TRUNCATE TABLE `saved_event`;
TRUNCATE TABLE `score`;
TRUNCATE TABLE `team`;
TRUNCATE TABLE `team_member`;
TRUNCATE TABLE `user`;
TRUNCATE TABLE `volunteer`;
TRUNCATE TABLE `volunteer_assignment`;
TRUNCATE TABLE `volunteer_attendance`;
TRUNCATE TABLE `volunteer_task`;

SET FOREIGN_KEY_CHECKS = 1;

-- Optional sanity check — every count should be 0 after the wipe.
-- SELECT
--   (SELECT COUNT(*) FROM `user`)         AS users,
--   (SELECT COUNT(*) FROM `event`)        AS events,
--   (SELECT COUNT(*) FROM `club`)         AS clubs,
--   (SELECT COUNT(*) FROM `registration`) AS registrations,
--   (SELECT COUNT(*) FROM `payment`)      AS payments;


-- =====================================================================
--  OPTIONAL — future-proof dynamic reset
-- =====================================================================
--  The block above lists tables explicitly. If you later add new entities,
--  this alternative wipes EVERY base table in the current schema so nothing
--  can be missed. Uncomment the whole block (remove the leading "-- ") and
--  run it INSTEAD of the explicit TRUNCATEs above.
--
--  DELIMITER $$
--  DROP PROCEDURE IF EXISTS cc_wipe_all $$
--  CREATE PROCEDURE cc_wipe_all()
--  BEGIN
--    DECLARE done INT DEFAULT 0;
--    DECLARE tbl VARCHAR(255);
--    DECLARE cur CURSOR FOR
--      SELECT table_name FROM information_schema.tables
--      WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE';
--    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
--    SET FOREIGN_KEY_CHECKS = 0;
--    OPEN cur;
--    read_loop: LOOP
--      FETCH cur INTO tbl;
--      IF done THEN LEAVE read_loop; END IF;
--      SET @s = CONCAT('TRUNCATE TABLE `', tbl, '`');
--      PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
--    END LOOP;
--    CLOSE cur;
--    SET FOREIGN_KEY_CHECKS = 1;
--  END $$
--  DELIMITER ;
--  CALL cc_wipe_all();
--  DROP PROCEDURE IF EXISTS cc_wipe_all;
-- =====================================================================
