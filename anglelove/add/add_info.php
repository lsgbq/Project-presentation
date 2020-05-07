<?php
	error_reporting(E_ALL^E_NOTICE);//屏蔽NOTICE提示，此提示并非错误
	include_once("../DB.php");
	$db = new DB();
	$ID = $_POST["ID"];
	$info = $_POST["info"];
	$year = $_POST["year"];
	$db->addCompensationInfo($ID, $year, $info);
?>