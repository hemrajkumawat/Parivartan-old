<? 
 $fname=$_POST['fname'];
 $lname=$_POST['lname'];
 $roll=$_POST['roll'];  
 $email=$_POST['email']; 
 $contact=$_POST['contact']; 
 $part=$_POST['part']; 
 $msg=$_POST['msg'];
$myemail='noreply@parivartan.iitj.ac.in';

 mysql_connect("172.16.100.4:3306","parivartan","p@r!v@rt@n") or die(mysql_error()); 
 mysql_select_db("parivartan") or die(mysql_error()); 

mysql_query("INSERT INTO par_member (fname,lname,roll,email,contact,part,msg)
VALUES ('$fname', '$lname', '$roll', '$email', '$contact','$part','$msg')") ;

$to = $email; 
	$email_subject = "Registration form confirmation for parivartan 
  Dear: $fname";
	$email_body = "Thank you ! Your registration has been successful".
	" Here are the details of the registration form:\n First Name: $fname \n Last Name: $lname \n E-mail: $email \n Roll Number: $roll \n Contact: $contact \n Intrested Parivartan Part: $part \n \n".
"Your these above information will be use further \n".
"If you want to change and edit your above  account information Please contact  to Jitendra Chaudhary(jitendrachaudhary@iitj.ac.in,Contact:9610840149)\n".
"Please submit your regstration fee(Rs:30) to Aayush Verma (aayush@iitj.ac.in,Contact:8003259958)\n".
"Thanks \n".
" Regards\n".
"Parivartan Team \n".
"IIT Rajastnan \n".
"http://parivartan.iitj.ac.in";
 
	
	$headers = "From: $myemail\n"; 
	$headers .= "Reply-To: $myemail";
	
	mail($to,$email_subject,$email_body,$headers);

header("Location: confirm.html");
 ?> 