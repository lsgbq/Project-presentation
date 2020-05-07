<?php
	error_reporting(E_ALL^E_NOTICE);//屏蔽NOTICE提示，此提示并非错误
	include_once("../DB.php");
	$db = new DB();
	$ID = $_POST["ID"];
	$payyear = $_POST["payyear"];
	$db->deleteFee($ID,$payyear);
?>