<?php
	error_reporting(E_ALL^E_NOTICE);//屏蔽NOTICE提示，此提示并非错误
	include_once("../DB.php");
	$conn = new DB();
	$conn->open();
	$db = $conn->link;
	$dep_id = "01";
	$payyear = "2017";
	$sql="SELECT total FROM Annual_total,department WHERE years = '$payyear' AND department.department_id = '$dep_id'";
	$result=$db->query($sql);     //执行sql语句
	$row=$result->fetch_assoc();
	echo $row["total"];
	$db->close;
?>