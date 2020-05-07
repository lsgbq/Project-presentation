<?php
	error_reporting(E_ALL^E_NOTICE);//屏蔽NOTICE提示，此提示并非错误
	include_once("../DB.php");
	$db = new DB();
	$depa = $_POST["depa"];
	$name = $_POST["name"];
	$ID = $_POST["ID"];
	$sex = $_POST["sex"];
	$fee = $_POST["fee"];
	$year = $_POST["year"];
	$after_payment = $_POST["afterPayment"];
	$note = $_POST["note"];
	$arr=array(0,$depa,$name,$ID,$sex,$fee,$year,$after_payment,$note);
	$rArr = array();
	$rArr[0] = $arr;
	$result = $db->preInsertUser($rArr);
	if($result)
		$db->preInsertFee($rArr);
?>