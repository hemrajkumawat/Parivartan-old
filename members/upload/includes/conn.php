<?php

 

// Input your information for the database here

 

// Host name

$host = "172.16.100.4:3306";

 

// Database username

$username = "parivartan";

 

// Database password

$password = "p@r!v@rt@n";

 

// Name of database

$database = "parivartan";

 

$conn = mysql_connect($host, $username, $password) or die ("Could not connect");

$db = mysql_select_db($database, $conn) or die ("Could not select DB");

 

?>
