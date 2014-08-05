<?php
/*Here we are going to declare the variables*/
$name = $_POST['name'];
$email = $_POST['email'];
$message = $_POST['message'];
//Save visitor name and entered message into one variable:
$formcontent="VISITOR NAME: $name\\n\\nFEEDBACK: $message";
$recipient = "jitendrachaudhary@iitj.ac.in";
$subject = "Contact Form";
$mailheader = "From: $email\\r\\n";
$mailheader .= "Reply-To: $email\\r\\n";
$mailheader .= "MIME-Version: 1.0\\r\\n";
mail($recipient, $subject, $formcontent, $mailheader) or die("Failure!");
echo "Thank You!";
?>