<?php
	error_reporting(E_ALL^E_NOTICE);//屏蔽NOTICE提示，此提示并非错误
	include_once("../DB.php");
	$db = new DB();
	$sql="SELECT * FROM department";
	$str=array();
	$str=$db->query($sql);
	$str = json_encode($str);
	echo $str;
	$db->close;
?>