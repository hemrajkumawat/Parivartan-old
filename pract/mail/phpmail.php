<?php
require("class.phpmailer.php");

$mail = new PHPMailer();

$mail->IsSMTP();                                      // set mailer to use SMTP

$mail->SMTPAuth = true;     // turn on SMTP authentication
$mail->Username = "webdesign@iitj.ac.in";  // SMTP username
$mail->Password = "wdciitj12-13"; // SMTP password
$webmaster_email = "no-reply@ignus.org"; 
$email="jitendrachaudhary@iitj.ac.in";
$name="Sachn kumar";

$mail->From = $webmaster_email;


$mail->FromName = "IGNUS 13";
$mail->AddAddress($email,$name);

             
$mail->AddReplyTo($webmaster_email, $mail->FromName);

$mail->WordWrap = 50;                                 // set word wrap to 50 characters
$mail->AddAttachment("jitu.JPG");         // add attachments

$mail->IsHTML(true);                                  // set email format to HTML

$mail->Subject = "Registration mail confirmation of IGNUS'13";
$mail->Body    = "Dear friends,Thanks for registration .We will be waiting of you in  <b>IGNUS</b>";
$mail->AltBody = "This is the body in plain text for non-HTML mail clients";

if(!$mail->Send())
{

   echo "Message could not be sent. <p>";
   echo "Mailer Error: " . $mail->ErrorInfo;
   exit;
}

echo "Message has been sent";
?>