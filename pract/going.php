<? 
 $fname=$_POST['fname'];
 $lname=$_POST['lname'];  
 $email=$_POST['email']; 
 $contact=$_POST['contact']; 
 $part=$_POST['part']; 
 $msg=$_POST['msg']; 
 mysql_connect("172.16.100.4:3306","parivartan","p@r!v@rt@n") or die(mysql_error()); 
 mysql_select_db("parivartan") or die(mysql_error()); 

  mysql_query("INSERT INTO `reg1` (`fname`, `lname`, `email`,`contact`,`part`,`msg`) VALUES ('".$fname."','".$lname."','".$email."', '".$contact."','".$part."','".$msg."')");
 Print "Your information has been successfully added to the database."; 
 ?> 