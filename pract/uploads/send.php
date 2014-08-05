<?php
require("smtp/smtp.php");
require("sasl/sasl.php");
$from = 'jkciitj@gmail.com';
$to = 'jitendrachaudhary@iitj.ac.in';

$smtp=new smtp_class;
$smtp->host_name="smtp.gmail.com";
$smtp->host_port='465';
$smtp->user='mk30303030@gmail.com';
$smtp->password='1111155555';
$smtp->ssl=1;
$smtp->debug=1;       //0 here in production
$smtp->html_debug=1; //same

$smtp->SendMessage($from,array($to),array(
"From: $from",
"To: $to",
"Subject: Testing Manuel Lemos' SMTP class",
"Date: ".strftime("%a, %d %b %Y %H:%M:%S %Z")
),
"Hello $to,\n\nIt is just to let you know that your SMTP class is working just fine.\n\nBye.\n"));
?>