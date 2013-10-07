-- -----------------------------------------------------
-- Data for table `dasling`.`statuses`
-- -----------------------------------------------------
START TRANSACTION;
USE `dasling`;
INSERT INTO `dasling`.`statuses` (`status_id`, `description`) VALUES (1, 'Enabled');
INSERT INTO `dasling`.`statuses` (`status_id`, `description`) VALUES (16, 'Disabled');
INSERT INTO `dasling`.`statuses` (`status_id`, `description`) VALUES (100, 'Information missing');
INSERT INTO `dasling`.`statuses` (`status_id`, `description`) VALUES (255, 'Deleted');

COMMIT;

-- -----------------------------------------------------
-- Data for table `dasling`.`organizations`
-- -----------------------------------------------------
START TRANSACTION;
USE `dasling`;
INSERT INTO `dasling`.`organizations` (`organization_id`, `name`, `status_id`) VALUES (1, 'KU Leuven/CIB', 1);
INSERT INTO `dasling`.`organizations` (`organization_id`, `name`, `status_id`) VALUES (2, 'FMTC', 1);
INSERT INTO `dasling`.`organizations` (`organization_id`, `name`, `status_id`) VALUES (3, 'VUB/COMO', 1);

COMMIT;


