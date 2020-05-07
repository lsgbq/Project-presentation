<?php
	error_reporting(E_ALL^E_NOTICE);//屏蔽NOTICE提示，此提示并非错误
	include_once("../DB.php");
	$db = new DB();
	$IDNumber = $_POST["IDNumber"];
	$name = $_POST["name"];
	$sex = $_POST["sex"];
	$fee = $_POST["fee"];
	$year = $_POST["year"];
	$after = $_POST["afterPay"];
	$note = $_POST["note"];
	$id = $_POST["id"];
	$db->updateInfo($IDNumber, $name, $sex, $fee, $year, $after, $note, $id);
?>