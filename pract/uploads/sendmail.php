<?php
echo("up to ");
       require_once "mail.php";
echo("up to tis right");
        $from = "<jitendra291192@gmail.com>";
        $to = "<jitendrachaudhary@iitj.ac.in>";
        $subject = "Hi!";
        $body = "Hi,\n\nHow are you?";

        $host = "ssl://smtp.gmail.com";
        $port = "465";
        $username = "<mk30303030@gmail.com>";
        $password = "1111155555";

        $headers = array ('From' => $from,
          'To' => $to,
          'Subject' => $subject);
        $smtp = Mail::factory('smtp',
          array ('host' => $host,
            'port' => $port,
            'auth' => true,
            'username' => $username,
            'password' => $password));

echo("up to here i tis right");

        $mail = $smtp->send($to, $headers, $body);

        if (PEAR::isError($mail)) {
          echo("<p>" . $mail->getMessage() . "</p>");
         } else {
          echo("<p>Message successfully sent!</p>");
         }

    ?>  <!-- end of php tag-->