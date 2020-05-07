<?php
	error_reporting(E_ALL^E_NOTICE);//屏蔽NOTICE提示，此提示并非错误
	include_once("../ExcelToMysql.php");
	include_once("../DB.php");
	if(($_FILES["file"]["type"]=="application/vnd.ms-excel") || ($_FILES["file"]["type"]=="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")){
		
		if($_FILES["file"]["error"]>0){     //如果图片上传不成功，为0代表上传成功
			echo "31001";
		}else{
				$filePath = "tmp.xls";
				move_uploaded_file($_FILES["file"]["tmp_name"], $filePath);
				//echo "31000";
		}
	}else{
		echo "31002";
	}
	
	$fee = new ExcelToMysql();
	$arr = $fee->read($filePath);
	$db = new DB();
	$result = $db->preInsertUser($arr);
	if($result)
		$db->preInsertFee($arr);
	else
		echo "20011";
?>