<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />

<title>PARIVARTAN:A SOCIAL INITIATIVE BY IIT RAJASTHAN</title>
<meta name="keywords" content="parivartan.iitj,parivartan,iit rajasthan social initiative" />
<meta name="description" content="The Social Initiative is started by IIT Rajasthan Community.
 We are working in the direction of making an educated and well informed society around us.
 It is an initiative to improve education level and awareness in the poor and deprived section
 of society through tecahing , youth counselling and parent counseling." />
<link href="styles.css" rel="stylesheet" type="text/css" />
<link rel="stylesheet" href="nivo-slider.css" type="text/css" media="screen" />
<style type="text/css">
html .jqueryslidemenu{height: 1%;} /*Holly Hack for IE7 and below*/
</style>
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
<style>
ul.svertical{
width: 200px; /* width of menu */
overflow: auto;
background: none; /* background of menu */
margin: 0;
padding: 0;
padding-top: 30px; /* top padding */
list-style-type: none;
}

ul.svertical li{
text-align: right; /* right align menu links */
}

ul.svertical li a{
position: relative;
display: inline-block;
text-indent: 30px;
overflow: hidden;
background: rgb(127, 201, 68); /* initial background color of links */
font: bold 16px Germand;
text-decoration: none;
padding: 5px;
margin-bottom: 10px; /* spacing between links */
color: black;
-moz-box-shadow: inset -7px 0 5px rgba(114,114,114, 0.8); /* inner right shadow added to each link */
-webkit-box-shadow: inset -7px 0 5px rgba(114,114,114, 0.8);
box-shadow: inset -20px 0 5px rgba(114,114,114, 0.8);
-moz-transition: all 0.2s ease-in-out; /* CSS3 transition of hover properties */
-webkit-transition: all 0.2s ease-in-out;
-o-transition: all 0.2s ease-in-out;
-ms-transition: all 0.2s ease-in-out;
transition: all 0.2s ease-in-out;
}

ul.svertical li a:hover{
padding-right: 50px; /* add right padding to expand link horizontally to the left */
color: black;
background: rgb(153,249,75);
-moz-box-shadow: inset -3px 0 2px rgba(114,114,114, 0.8); /* contract inner right shadow */
-webkit-box-shadow: inset -3px 0 5px rgba(114,114,114, 0.8);
box-shadow: inset -3px 0 5px rgba(114,114,114, 0.8);
}

ul.svertical li a:before{ /* CSS generated content: slanted right edge */
content: "";
position: absolute;
left: 0;
top: 0;
border-style: solid; 
border-width: 70px 0 0 20px; /* Play around with 1st and 4th value to change slant degree */
border-color: transparent transparent transparent black; /* change black to match the background color of the menu UL */

}
</style>




<?php 

    include ("phpmydatagrid.class.php"); 
     
    $objGrid = new datagrid; 
     

    $objGrid -> pathtoimages("./imag/"); 

    $objGrid -> closeTags(true);   

    $objGrid -> form('par-member', true); 
     
    /* Defines the "method" through the data will be sent. May be defined as "post" or "get" */ 
    $objGrid -> methodForm("post");  
     
         
    /* To enable search, add each searchable column separated by comma */ 
    $objGrid -> searchby("id,fname,lname,email,part"); 
     
    /* To forward your own parameters, add them in the GET format */ 
     
    $objGrid -> decimalDigits(2); 
     
    $objGrid -> decimalPoint(","); 
     
    $objGrid -> conectadb("172.16.100.4:3306","parivartan", "p@r!v@rt@n","parivartan"); 
     
    $objGrid -> tabla ("par_member"); 

    $objGrid -> FormatColumn("id", "S.N.", 5, 5, 1, "50", "center", "integer"); 
    $objGrid -> FormatColumn("fname", "Name", 30, 30, 0, "130", "left"); 
    $objGrid -> FormatColumn("lname", "Last name", 30, 30, 0, "130", "left"); 
    $objGrid -> FormatColumn("roll", "Roll no.", 5, 5, 0, "100", "left"); 
    $objGrid -> FormatColumn("email", "E-mail ", 10, 10, 0, "180", "center"); 
    $objGrid -> FormatColumn("part", "Parivartan Part", 5, 5, 0, "80", "left"); 
    
    $objGrid -> setHeader(); 
?> 


</head>
<body>

<div id="bg">
<div id="bg_top_bg">
<div id="bg_logo">
<div id="iitj_logo">
<div id="bg_top">
<div id="bg_bot">


<div id="main">
<!-- header begins -->
<div id="header">
	<div id="buttons">
      <a href="index.html" class="but but_t"  title=""><font color="white";>Home</font></a>
      <a href="struct.html" class="but" title=""><font color="white";>About us</font></a>
      <a href="gallery.html"  class="but" title=""><font color="white";>Gallery</font></a>
	  <a href="member_reg.html"  class="but" title=""><font color="white";>join us</font></a>
      <a href="msg.html" class="but" title=""><font color="white";>Contact us</font></a>
	  
    </div>
	</div>

<div id="locator">
<ul class="svertical">
<li><a href="founders.html" >Founders</a></li>
<li><a href="contact.html" >Core Team</a></li>
<li><a href="members.php" >Members</a></li>
		
</ul>
</div>
<?php  
    $objGrid -> grid(); 
     
    $objGrid -> desconectar(); 
?>

  <!--              	
 <div id="footer">
    <div class="footer_resize">
    <div class="text">

     <div class="fb">
<a href="https://www.facebook.com/parivartan.iitj">
<img src="images/fb.png" /></a>&nbsp;&nbsp;&nbsp;<a href="https://twitter.com/#!/Parivartan_iitj"><img src="images/twitter.png" width="32" height="32" /></a>
</div>

</div

     
      <div class="text2">&copy; Copyright Parivartan team.All Rights Reserved.</div>
      <div class="clr"></div>
    </div>-->




    </div>
    <div class="clr"></div>
  </div>
  </div>
  </div>
  </div>
  </div>
  </div>
  </div>
  </div>
  </body>
  </html>
  