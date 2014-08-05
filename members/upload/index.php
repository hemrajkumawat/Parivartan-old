<?php

// Start a session for displaying any form errors

session_start();

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"

      "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

 

<html xmlns="http://www.w3.org/1999/xhtml">

    <head>

        <title>Dream in code tutorial</title>

 

        <style type="text/css">

            label

            {

                float: left;

                text-align: right;

                margin-right: 10px;

                width: 100px;

                color: black;

            }

 

            #submit

            {

                float: left;

                margin-top: 5px;

              position: relative;

                left: 110px;

            }

 

            #error
            {

                color: red;

                font-weight: bold;

                font-size: 16pt;

            }

       </style>

   </head>

 

    <body>

     

        <div>

                <?php

                if (isset($_SESSION['error']))

                {

                    echo "<span id=\"error\"><p>" . $_SESSION['error'] . "</p></span>";

                    unset($_SESSION['error']);

                }

                ?>

                <form action="upload.php" method="post" enctype="multipart/form-data">

                <p>

                    <label>First Name</label>

                    <input type="text" name="fname" /><br />

 

                    <label>Last Name</label>

                    <input type="text" name="lname" /><br />

 

                    <label>Upload Image</label>

                    <input type="file" name="image" /><br />

                    <input type="hidden" name="MAX_FILE_SIZE" value="100000" />

                    <input type="submit" id="submit" value="Upload" />

                </p>

                </form>

        </div>

    </body>

</html>
