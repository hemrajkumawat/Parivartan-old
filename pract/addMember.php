 <?php
//This is the directory where images will be saved
$target = "img_upload/";
//$target = $target . basename( $_FILES['photo']['name']);

//This gets all the other information from the form
$name=$_POST['name'];
$place=$_POST['place'];
$pic=($_FILES['photo']['name']);
$about=$_POST['aboutimage'];
$location=$_POST['locat'];


// Connects to your Database
 mysql_connect("172.16.100.4:3306","parivartan","p@r!v@rt@n") or die(mysql_error()); 
 mysql_select_db("parivartan") or die(mysql_error()); 

//Writes the information to the database
mysql_query("INSERT INTO ph (name,place,photo,about,location)
VALUES ('$name', '$place', '$pic', '$about', '$location')") ;

//Writes the photo to the server
if(move_uploaded_file($_FILES['photo']['tmp_name'], $target))
{

//Tells you if its all ok
echo "The file ". basename( $_FILES['uploadedfile']['name']). " has been uploaded, and your information has been added to the directory";
}
else {

//Gives and error if its not
echo "Sorry, there was a problem uploading your file.";
}
?>