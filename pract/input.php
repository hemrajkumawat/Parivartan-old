<? 
 $name=$_POST['name']; 
 $email=$_POST['email']; 
 $location=$_POST['location']; 
 mysql_connect("172.16.100.4:3306","parivartan","p@r!v@rt@n") or die(mysql_error()); 
 mysql_select_db("parivartan") or die(mysql_error()); 

 mysql_query("INSERT INTO `pract` (`name`, `email`, `location`) VALUES ('".$name."', '".$email."', '".$location."')"); 

 Print "Your information has been successfully added to the database."; 
 ?> 