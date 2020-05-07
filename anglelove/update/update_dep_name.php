<?php
	error_reporting(E_ALL^E_NOTICE);//屏蔽NOTICE提示，此提示并非错误
	include_once("../DB.php");
	$db = new DB();
	$depId = $_POST["oldDepId"];
	$newDepName = $_POST["newDepName"];
	$db->updateDepName($depId, $newDepName);
?>