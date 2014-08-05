<?php
$q=$_GET["q"];

$con = mysql_connect('172.16.100.4:3306', 'parivartan', 'p@r!v@rt@n');
if (!$con)
  {
  die('Could not connect: ' . mysql_error());
  }

mysql_select_db("parivartan", $con);

$sql="SELECT * FROM par_member WHERE part = '".$q."'";

$result = mysql_query($sql);

echo "<table border='1'>
<tr>
<th>Id</th>
<th>Firstname</th>
<th>Lastname</th>
<th>Roll no.</th>
<th>E-mail</th>

</tr>";

while($row = mysql_fetch_array($result))
  {
  echo "<tr>";
  echo "<td>" . $row['id'] . "</td>";
  echo "<td>" . $row['fname'] . "</td>";
  echo "<td>" . $row['lname'] . "</td>";
  echo "<td>" . $row['roll'] . "</td>";
  echo "<td>" . $row['email'] . "</td>";

  echo "</tr>";
  }
echo "</table>";

mysql_close($con);
?>