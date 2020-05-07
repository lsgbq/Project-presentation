<?php
	error_reporting(E_ALL^E_NOTICE);//屏蔽NOTICE提示，此提示并非错误
	include_once("../DB.php");
	$db = new DB();
	$num = $_POST["num"];
	switch($num){
		//按身份证查询
		case "1":$ID = $_POST["ID"];
			   $sql="SELECT 
						department.department_name,
						worker_information.name,
						worker_information.sex,
						worker_information.IDNumber,
						Compensation_info.compenyear,
						Compensation_info.compensation_info,
						Compensation_info.id
					FROM 
						Compensation_info,department,worker_information 
					WHERE 
						worker_information.IDNumber = '$ID' 
						AND 
						worker_information.id = Compensation_info.userId
						AND 
						department.department_id = worker_information.department_id";
			   break;
		//按身份证和年份查询
		case "2":$ID = $_POST["ID"];
				 $year = $_POST["payYear"];
			     $sql="SELECT 
						department.department_name,
						worker_information.name,
						worker_information.sex,
						worker_information.IDNumber,
						Compensation_info.compenyear,
						Compensation_info.compensation_info,
						Compensation_info.id
					FROM 
						Compensation_info,department,worker_information 
					WHERE 
						worker_information.IDNumber = '$ID' 
						AND 
						Compensation_info.compenyear = '$year' 
						AND 
						worker_information.id = Compensation_info.userId
						AND 
						department.department_id = worker_information.department_id";
			   break;
		//按分工会和姓名查询
		case "3":$depid = $_POST["depid"];
			   $name = $_POST["name"];
			   $sql="SELECT 
						department.department_name,
						worker_information.name,
						worker_information.sex,
						worker_information.IDNumber,
						Compensation_info.compenyear,
						Compensation_info.compensation_info,
						Compensation_info.id
					FROM 
						Compensation_info,department,worker_information 
					WHERE 
						worker_information.name like '%$name%'
						AND 
						department.department_id = '$depid' 
						AND 
						worker_information.id = Compensation_info.userId
						AND 
						department.department_id = worker_information.department_id";
			   break;
		//按分工会、姓名和年份查询
		case "4":$depid = $_POST["depid"];
			   $year = $_POST["payYear"];
			   $name = $_POST["name"];
			   $sql="SELECT 
						department.department_name,
						worker_information.name,
						worker_information.sex,
						worker_information.IDNumber,
						Compensation_info.compenyear,
						Compensation_info.compensation_info,
						Compensation_info.id
					FROM 
						Compensation_info,department,worker_information 
					WHERE 
						worker_information.name like '%$name%'
						AND 
						department.department_id = '$depid' 
						AND 
						Compensation_info.compenyear = '$year' 
						AND 
						worker_information.id = Compensation_info.userId 
						AND 
						department.department_id = worker_information.department_id";
			   break;
		//按分工会查询
		case "5":$dep_id = $_POST["depid"];
			     $sql="SELECT 
						department.department_name,
						worker_information.name,
						worker_information.sex,
						worker_information.IDNumber,
						Compensation_info.compenyear,
						Compensation_info.compensation_info,
						Compensation_info.id
					FROM 
						Compensation_info,department,worker_information 
					WHERE 
						worker_information.id = Compensation_info.userId 
						AND 
						department.department_id = '$dep_id'
						AND 
						department.department_id = worker_information.department_id";
			   break;
		//按分工会和年份查询
		case "6":$dep_id = $_POST["depid"];
				 $payyear = $_POST["payYear"];
				 $sql="SELECT 
						department.department_name,
						worker_information.name,
						worker_information.sex,
						worker_information.IDNumber,
						Compensation_info.compenyear,
						Compensation_info.compensation_info,
						Compensation_info.id
					FROM 
						Compensation_info,department,worker_information 
					WHERE 
						worker_information.id = Compensation_info.userId 
						AND 
						department.department_id = '$dep_id'
						AND 
						department.department_id = worker_information.department_id
						AND
						Compensation_info.compenyear = '$payyear'";
				 break;
		//按姓名模糊查询
		case "7":$name = $_POST["name"];
				 $sql = "SELECT 
						department.department_name,
						worker_information.name,
						worker_information.sex,
						worker_information.IDNumber,
						Compensation_info.compenyear,
						Compensation_info.compensation_info,
						Compensation_info.id
					FROM 
						Compensation_info,department,worker_information 
					WHERE 
						worker_information.name like '%$name%' 
						AND 
						worker_information.id = Compensation_info.userId 
						AND 
						department.department_id = worker_information.department_id";
				 break;
		//按年份查询
		case "8":$year = $_POST["payYear"];
				$sql = "SELECT 
						department.department_name,
						worker_information.name,
						worker_information.sex,
						worker_information.IDNumber,
						Compensation_info.compenyear,
						Compensation_info.compensation_info,
						Compensation_info.id
					FROM 
						Compensation_info,department,worker_information 
					WHERE 
						Compensation_info.compenyear = '$year'
						AND
						Worker_information.department_id = department.department_id
						AND
						Worker_information.id = Compensation_info.userId";
				 break;
	}
	// echo $sql;
	$str=$db->query($sql);
	if($str != "21000"){
		$str = json_encode($str);
		echo $str;
	}else
		echo "21000";
?>