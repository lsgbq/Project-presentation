<?php
	error_reporting(E_ALL^E_NOTICE);//屏蔽NOTICE提示，此提示并非错误
	include_once("../DB.php");
	$db = new DB();
	$id = $_POST["id"];
	$year = $_POST["year"];
	$compensationInfo = $_POST["compensationInfo"];
	$db->updateCompensationInfo($id,$year,$compensationInfo);
?>