<?php 
$loadcontent = "jkciitj.txt"; 
    if($_POST['save_file']) { 
        $savecontent = stripslashes($_POST['savecontent']); 
        $fp = @fopen($loadcontent, "w"); 
        if ($fp) { 
            fwrite($fp, $savecontent); 
            fclose($fp);
print '<a href='.$_SERVER[PHP_SELF].'>Refresh</a>'; 
print "<html><head><META http-equiv=\"refresh\" content=\"0;URL=$_SERVER[PHP_SELF]\"></head><body>"; 
 
} 
} 
    $fp = @fopen($loadcontent, "r"); 
        $loadcontent = fread($fp, filesize($loadcontent)); 
$lines = explode("\n", $loadcontent);
$count = count($lines);
        $loadcontent = htmlspecialchars($loadcontent); 
        fclose($fp); 
for ($a = 1; $a < $count+1; $a++) {
$line .= "$a\n";
}
?> 
<form method=post action="<?=$_SERVER['PHP_SELF']?>"> 

<table width="100%" valign="top" border="0" cellspacing="1" cellpadding="1">
  <tr>
    <td width="3%" align="right" valign="top"><pre style="text-align: right; padding: 4px; overflow: auto; border: 0px groove; font-size: 12px" name="lines" cols="4" rows="<?=$count+3;?>"><?=$line;?></pre></td>
    <td width="97%" align="left" valign="top">
	<textarea style="text-align: left; padding: 0px; overflow: auto; border: 3px groove; font-size: 12px" name="savecontent" cols="100" rows="<?=$count;?>" wrap="OFF"><?=$loadcontent?>
	</textarea></td>
  </tr>
</table>
 
<br> 
<input type="submit" name="save_file" value="Save">    
</form>