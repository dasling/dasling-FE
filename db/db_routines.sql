-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- --------------------------------------------------------------------------------
DELIMITER $$

CREATE DEFINER = 'dasling'@'localhost' 
FUNCTION `add_device` (user_id INT) RETURNS int(11)
    MODIFIES SQL DATA
    DETERMINISTIC
BEGIN
  DECLARE id INT default -1;
  INSERT INTO devices (organization_id, device_manufacturer_identification, description, status_id)
    VALUES ((SELECT organization_id FROM users u WHERE u.user_id = user_id), 
			'manufacturer_id', 
            'description', 
            100 
            );
  SET id = LAST_INSERT_ID();
  if id <> -1 then
	  INSERT INTO map_users_devices (organization_id, user_id, device_id, status_id)
		VALUES ((SELECT organization_id FROM users u WHERE u.user_id = user_id), 
				user_id, 
				id, 
				1 
				);
  END IF;
  RETURN id;
END
