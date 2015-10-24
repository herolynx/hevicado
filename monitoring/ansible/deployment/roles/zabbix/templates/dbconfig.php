<?php

/* This file is used by the Zabbix PHP web frontend.
 * It is pre-filled with the information asked during
 * installation of the zabbix-server-* package.
 */

global $DB;

$DB["TYPE"]      = "mysql";
$DB["SERVER"]    = "{{ mysql_host }}";
$DB["PORT"]      = "{{ mysql_port }}";
$DB["DATABASE"]  = "{{ mysql_zabbix_db }}";
$DB["USER"]      = "{{ mysql_zabbix_user }}";
$DB["PASSWORD"]  = "{{ mysql_zabbix_user_pass }}";

$ZBX_SERVER      = "{{ zabbix_host }}";
$ZBX_SERVER_PORT = "{{ zabbix_agent_port1 }}";

$IMAGE_FORMAT_DEFAULT    = IMAGE_FORMAT_PNG;

/* dbconfig-common uses the database types (e.g. "sqlite3")
 * in lowercase. But Zabbix expects these in uppercase.
 */
## dont remove this!
## This is a work-around for dbconfig-common
if($DB["TYPE"] == "mysql")
	$DB["TYPE"] = "MYSQL";

if($DB["TYPE"] == "pgsql")
	$DB["TYPE"] = "POSTGRESQL";

if($DB["TYPE"] == "sqlite3")
	$DB["TYPE"] = "SQLITE3";
##
?>
