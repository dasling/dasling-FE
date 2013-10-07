-- -----------------------------------------------------
-- Data for table `dasling`.`statuses`
-- -----------------------------------------------------
START TRANSACTION;
USE `perp_v1`;
INSERT INTO `perp_v1`.`statuses` (`status_id`, `description`) VALUES (1, 'Enabled');
INSERT INTO `perp_v1`.`statuses` (`status_id`, `description`) VALUES (16, 'Disabled');
INSERT INTO `perp_v1`.`statuses` (`status_id`, `description`) VALUES (100, 'Information missing');
INSERT INTO `perp_v1`.`statuses` (`status_id`, `description`) VALUES (255, 'Deleted');

COMMIT;

-- -----------------------------------------------------
-- Data for table `dasling`.`organizations`
-- -----------------------------------------------------
START TRANSACTION;
USE `perp_v1`;
INSERT INTO `perp_v1`.`organizations` (`organization_id`, `name`, `status_id`) VALUES (1, 'KU Leuven/CIB', 1);
INSERT INTO `perp_v1`.`organizations` (`organization_id`, `name`, `status_id`) VALUES (2, 'FMTC', 1);
INSERT INTO `perp_v1`.`organizations` (`organization_id`, `name`, `status_id`) VALUES (3, 'VUB/COMO', 1);

COMMIT;


