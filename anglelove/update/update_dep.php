<?php
	error_reporting(E_ALL^E_NOTICE);//屏蔽NOTICE提示，此提示并非错误
	include_once("../DB.php");
	$db = new DB();
	$dep_id = $_POST["dep_id"];
	$id = json_decode($_POST["id"]);
	$payyear = json_decode($_POST["year"]);
	$db->updateDep($dep_id, $id, $payyear);
?>