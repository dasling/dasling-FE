-- MySQL dump 10.14  Distrib 10.0.2-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: dasling 
-- ------------------------------------------------------
-- Server version	10.0.2-MariaDB-1~precise-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `analyses`
--

DROP TABLE IF EXISTS `analyses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `analyses` (
  `organization_id` tinyint(3) unsigned NOT NULL,
  `analysis_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `description` text NOT NULL,
  `created_at_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status_id` int(10) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`organization_id`,`analysis_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Each row in the analyses table represents an analysis experiment.\nI.e. if you want to make sure you can perform the same analysis multiple times:\n+ Make a new MY_ANALYSIS\n+ link each reading you want included via the map_analyses_readings table\nand only perform your analysis on the readings MY_ANALYSIS';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `channels`
--

DROP TABLE IF EXISTS `channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `channels` (
  `organization_id` tinyint(3) unsigned NOT NULL,
  `channel_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `device_id` int(10) unsigned DEFAULT NULL,
  `channel_user_given_id` text,
  `description` text,
  `status_id` int(10) unsigned NOT NULL DEFAULT '1',
  `user_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`organization_id`,`channel_id`),
  KEY `channels_device_id_fk_idx` (`device_id`,`organization_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Each row in the channels table refers to 1 physical sensor delivering 1 type of value.\nI.e. 1 physical device can feature multiple channels (sensors)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `device_auth`
--

DROP TABLE IF EXISTS `device_auth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `device_auth` (
  `organization_id` tinyint(4) NOT NULL,
  `device_auth_id` int(11) NOT NULL AUTO_INCREMENT,
  `device_id` int(11) DEFAULT NULL,
  `protocol_id` int(11) DEFAULT NULL,
  `username` varchar(45) DEFAULT NULL,
  `password` varchar(45) DEFAULT NULL,
  `client_id` varchar(45) DEFAULT NULL,
  `status_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`device_auth_id`,`organization_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `devices` (
  `organization_id` tinyint(3) unsigned NOT NULL,
  `device_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `device_manufacturer_identification` varchar(45) DEFAULT NULL,
  `description` text NOT NULL,
  `created_at_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status_id` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`organization_id`,`device_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `map_analyses_readings`
--

DROP TABLE IF EXISTS `map_analyses_readings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `map_analyses_readings` (
  `organization_id` tinyint(3) unsigned NOT NULL,
  `analysis_id` int(10) unsigned NOT NULL,
  `reading_id` bigint(19) unsigned NOT NULL,
  `status_id` int(10) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`organization_id`,`analysis_id`,`reading_id`),
  KEY `map_analyses_readings_reading_id_fk_idx` (`reading_id`,`organization_id`),
  KEY `map_analyses_readings_analysis_id_fk_idx` (`analysis_id`,`organization_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `map_analyses_variable`
--

DROP TABLE IF EXISTS `map_analyses_variable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `map_analyses_variable` (
  `organization_id` tinyint(3) unsigned NOT NULL,
  `analysis_id` int(10) unsigned NOT NULL,
  `variable_id` int(10) unsigned NOT NULL,
  `status_id` int(10) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`organization_id`,`analysis_id`,`variable_id`),
  KEY `map_analyses_variable_analysis_id_fk_idx` (`analysis_id`,`organization_id`),
  KEY `map_analyses_variable_variable_id_fk_idx` (`variable_id`,`organization_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `map_users_devices`
--

DROP TABLE IF EXISTS `map_users_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `map_users_devices` (
  `organization_id` tinyint(3) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `device_id` int(10) unsigned NOT NULL,
  `status_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`organization_id`,`user_id`,`device_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organizations` (
  `organization_id` tinyint(3) unsigned NOT NULL,
  `name` text NOT NULL,
  `status_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`organization_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Each row represents a research organisation performing analyses or collection of data.\nEach table (except statuses) in the DB refers in its primary key to one of these organizations (otherwise we cannot\n work with unique identifiers ) over all DBs used in the organizations. ';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `readings`
--

DROP TABLE IF EXISTS `readings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `readings` (
  `organization_id` tinyint(3) unsigned NOT NULL,
  `reading_id` bigint(19) unsigned NOT NULL AUTO_INCREMENT,
  `measured_at_timestamp` bigint(19) unsigned NOT NULL,
  PRIMARY KEY (`reading_id`,`organization_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3399689 DEFAULT CHARSET=latin1 COMMENT='Table readings contains the values of readings (of a sensor channel setup) at a certain moment in time';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `statuses`
--

DROP TABLE IF EXISTS `statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `statuses` (
  `status_id` int(10) unsigned NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`status_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Each status represents how you should treat this data.\nbtw: 255 = "Deleted", that also means don''t ever delete data from the DB !!!\n(just put in on status 255)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `units` (
  `organization_id` tinyint(3) unsigned NOT NULL,
  `unit_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` tinytext NOT NULL,
  `description` varchar(45) DEFAULT NULL,
  `status_id` int(10) unsigned NOT NULL DEFAULT '1',
  `user_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`unit_id`,`organization_id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `organization_id` tinyint(3) unsigned NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`organization_id`,`user_id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `value`
--

DROP TABLE IF EXISTS `value`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `value` (
  `organization_id` tinyint(3) unsigned NOT NULL,
  `reading_id` bigint(19) unsigned NOT NULL,
  `variable_id` int(10) unsigned NOT NULL,
  `channel_id` int(10) unsigned NOT NULL,
  `value` double DEFAULT NULL,
  PRIMARY KEY (`organization_id`,`reading_id`,`variable_id`,`channel_id`),
  KEY `value_readings_id_fk_idx_idx` (`reading_id`,`organization_id`),
  KEY `value_variable_id_fk_idx_idx` (`organization_id`,`variable_id`),
  KEY `value_channel_id_fk_idx_idx2` (`organization_id`,`channel_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `variable`
--

DROP TABLE IF EXISTS `variable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `variable` (
  `organization_id` tinyint(3) unsigned NOT NULL,
  `variable_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` int(10) unsigned DEFAULT NULL,
  `name` varchar(45) NOT NULL,
  `description` text,
  `current_channel_id` int(10) unsigned DEFAULT NULL,
  `republish_topic` text,
  `created_at_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `setup_installed_at_time` timestamp NULL DEFAULT NULL,
  `status_id` int(10) unsigned NOT NULL DEFAULT '1',
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`organization_id`,`variable_id`),
  KEY `variable_unit_id_fk_idx` (`unit_id`,`organization_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Each row in the variable table identifies a measured variable (printed nr of pages) or a measurement setup of a sensor. \nI.e. each time a sensor (e.g. channel on a Flukso) is moved to a different machine this represents a new sensor setup.';
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-09-30 11:11:42
