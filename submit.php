<?php
include("db.php");
if($_SERVER["REQUEST_METHOD"] == "POST")
{
$name=mysql_real_escape_string($_POST['name']);
$email=mysql_real_escape_string($_POST['email']);
$message=mysql_real_escape_string($_POST['message']);
if(strlen($name)>0 && strlen($email)>0 && strlen($message)>0)
{
$time=time();
mysql_query("INSERT INTO contact (name,email,message,created_date) VALUES('$name','$email','$message','$time')");
echo "<h1>Thank You !</h1>";
}
}
?>