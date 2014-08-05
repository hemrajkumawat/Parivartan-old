<?php

// Get our database connector

require("includes/conn.php");

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"

      "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

 

<html xmlns="http://www.w3.org/1999/xhtml">

    <head>

        <title>Dream in code tutorial - List of Images</title>

    </head>

 

    <body>

     

        <div>

 

            <?php   

                // Grab the data from our people table

                $sql = "select * from people";

                $result = mysql_query($sql) or die ("Could not access DB: " . mysql_error());

 

                while ($row = mysql_fetch_assoc($result))

                {

                    echo "<div class=\"picture\">";

                    echo "<p>";

 

                    // Note that we are building our src string using the filename from the database

                    echo "<img src=\"images_upload/" . $row['filename'] . "\" alt=\"\" /><br />";

                    echo $row['fname'] . " " . $row['lname'] . "<br />";

                    echo "</p>";

                    echo "</div>";

                }

 

            ?>

         

        </div>

    </body>

</html>
