<?php
	error_reporting(E_ALL^E_NOTICE);
	set_time_limit(0);//0表示不限时
	class DB{
		//构造函数
		function __construct(){}
		public $link;
		
		//连接数据库
		public function open(){
			$this->link = new mysqli("localhost","root","admin","love_fund");
			if($this->link->connect_errno){
				$content = date("Y-m-d H:i:s")." errorCode：00000，数据库连接失败\r\n".$stmt->error."\r\n";
				$this->log($content);
				exit();
			}
			$this->link->query("set names utf8");     //打印字符编码
		}
		
		//添加分工会
		public function addDepartment($depaname){
			//连接数据库
			$this->open();
			$db=$this->link;
			$sql="INSERT INTO 
					department(department_name) 
				  VALUES
					('$depaname')";
			$result=$db->query($sql);
			if($result===TRUE){
				echo "10030";
			}else{
				$content = date("Y-m-d H:i:s")." errorCode：10031，添加分工会失败，分工会名已存在\r\n".$stmt->error."\r\n";
				$this->log($content);
				echo "10031";
			}
			$db->close();
		}
		
		//删除分工会
		public function deleteDepartment($depa){
			//连接数据库
			$this->open();
			$db=$this->link;
			$sql1 = "DELETE FROM 
						annual_total 
					WHERE 
						department_id = '$depa'";
			$sql2 = "DELETE FROM department WHERE department_id = '$depa'";
			$result1=$db->query($sql1);
			$result2=$db->query($sql2);
			if($result2===TRUE){
				echo "10034";
			}
			else{
				$content = date("Y-m-d H:i:s")." errorCode：10035，删除分工会失败，还有会员在此分工会中\r\n".$stmt->error."\r\n";
				$this->log($content);
				echo "10035";
			}
			$db->close();
		}
		
		//添加补助信息
		public function addCompensationInfo($IDNumber,$year,$compensation_info){
			//连接数据库
			$this->open();
			$db=$this->link;
			$sql="INSERT INTO Compensation_info(userId,compensation_info, compenyear) 
					VALUES(
						(SELECT id FROM Worker_information WHERE IDNumber = '$IDNumber'),
						'$compensation_info', 
						'$year'
					)";
			$result=$db->query($sql);     //执行sql语句
			if($result==TRUE){
				echo "10020";
			}
			else{
				$content = date("Y-m-d H:i:s")." errorCode：10021，添加补助信息失败\r\n".$stmt->error."\r\n";
				$this->log($content);
				echo "10021";
			}
			$db->close();
		}
		
		//修改补助信息
		public function updateCompensationInfo($id,$year,$compensationInfo){
			//连接数据库
			$this->open();
			$db=$this->link;
			$sql = "UPDATE 
						Compensation_info 
					SET 
						compensation_info = ?, 
						compenyear = ? 
					WHERE 
						id = ?";
			$stmt = $db->prepare($sql);
			$stmt->bind_param("sss",$compensationInfo,$year,$id);
			$result = $stmt->execute();
			if($result==TRUE){
				echo "10112";
			}
			else{
				$content = date("Y-m-d H:i:s")." errorCode：10035，修改补助信息失败\r\n".$stmt->error."\r\n";
				$this->log($content);
				echo "10023";
			}
			$stmt->close();
			$db->close();
		}
		
		//删除补助信息
		public function delCompensationInfo($id){
			//连接数据库
			$this->open();
			$db = $this->link;
			$sql = "DELETE FROM Compensation_info WHERE id = ?";
			$stmt = $db->prepare($sql);
			$stmt->bind_param("s",$id);
			$result = $stmt->execute();
			//当执行失败时
			if(!$result){
				$content = date("Y-m-d H:i:s")." errorCode：10025，id为“".$id."”的补助记录删除失败\r\n".$stmt->error."\r\n";
				$this->log($content);
				echo "10025";
			}
			else
				echo "10024";
			//关闭预编译
			$stmt->close();
			//关闭数据库
			$db->close();
		}
		
		//读取旧费用
		public function queryOldFee($tablename,$id,$payyear){
			$this->open();
			$db=$this->link;
			$sql="SELECT fee 
					FROM $tablename 
					WHERE 
						id = '$id'
						AND 
						payyear = '$payyear'";
			//执行sql语句
			$result=$db->query($sql);
			$row=mysqli_fetch_row($result);
			$fee=$row[0];
			//释放结果集
			$result->free_result();
			//关闭数据库
			$db->close();
			return $fee;
		}
		
		//查询
		public function query($sqlstr){
			$this->open();
			$db=$this->link;
			//执行sql语句
			$result=$db->query($sqlstr);
			if(!$result){
				return "21000";
			}
			//将结果集放到一个二维数组中，i代表行数，j代表字段数
			for($i=0;$i<mysqli_num_rows($result);$i++){		//mysqli_num_rows获取结果集行数
				//读取结果集中的一行
				$row=mysqli_fetch_row($result);
				for($j=0;$j<mysqli_num_fields($result);$j++){	//mysqli_num_fields获取结果集字段数
					//第一维是数字数组，第二维是数字数组
					$str[$i][$j]=$row[$j];
				}
			}
			//释放结果集
			$result->free_result();
			//关闭数据库
			$db->close();
			return $str;
		}
		
		//$arr={序号，分工会，姓名，身份证，性别，缴费金额，缴费年份，是否补缴，备注}
		//预编译添加会员
		public function preInsertUser($arr){
			date_default_timezone_set("Asia/Shanghai");
			//标志是否插入成功
			$bool = true;
			//将插入成功的信息存放在这个数组，如果有哪个插入失败则根据这个数组删除刚刚插入的记录
			$arrInfo = array();
			//分工会名称改编号
			$arr = $this->depNameToNum($arr);
			//连接数据库
			$this->open();
			$db = $this->link;
			//插入语句
			$presql="INSERT INTO worker_information(department_id, IDNumber, name, sex) VALUES(?,?,?,?)";
			$stmt = $db->prepare($presql);
			for($i=0; $i<count($arr);$i++){
				//如果Excel表中的第一列不是数字（即不是序号），则跳过
				if(!is_numeric($arr[$i][0])){
					$arrInfo[$i] = null;
					continue;
				}
				//如果身份证为空
				if($arr[$i][3] == null){
					echo "20005";
					$content = date("Y-m-d H:i:s")." errorCode：20019，“".$arr[$i][2]."”身份证未填写\r\n";
					$this->log($content);
					$bool = false;
					$arrInfo[$i] = null;
					continue;
				}
				//查询语句
				$sql="SELECT 
							name 
						  FROM 
							Worker_information 
					      WHERE 
							IDNumber = '".$arr[$i][3]."'";
				$result = $this->query($sql);
				//如果身份证号已存在且名字不同，则写入日志并进入下一个循环
				if($result[0][0]!=$arr[$i][2] && $result[0][0] != null && is_numeric($arr[$i][0])){
					echo "20006";
					$content = date("Y-m-d H:i:s")." errorCode：20006，“".$arr[$i][2]."”的身份证号冲突未能插入。数据库的记录为：“".$result[0][0]."”的身份证号为“".$arr[$i][3]."”\r\n";
					$this->log($content);
					$bool = false;
					$arrInfo[$i] = null;
					continue;
				}
				//数据库已有这个人的记录，则跳过
				else if($result[0][0]==$arr[$i][2] && is_numeric($arr[$i][0])){
					$arrInfo[$i] = null;
					continue;
				}
				//添加新会员
				$stmt->bind_param("ssss",$arr[$i][1],$arr[$i][3],$arr[$i][2],$arr[$i][4]);
				$result2 = $stmt->execute();
				//如果插入失败则向日志写入失败信息
				if(!$result2 && is_numeric($arr[$i][0])){
					$content = date("Y-m-d H:i:s")." errorCode：20009，身份证号为“".$arr[$i][3]."”插入失败，错误信息：".$stmt->error."\r\n";
					$this->log($content);
					$bool = false;
					$arrInfo[$i] = null;
				}
				//插入成功，将插入成功的数据保存在数组中，若整体有插入失败的，根据这个数组删除成功插进去的数据
				else{
					//身份证号
					$arrInfo[$i] = $arr[$i][3];
				}
			}
			//全部插入成功
			if($bool){
				echo "20000";
			}
			//部分或全部插入失败
			else{
				$this->delWorkInfo($arrInfo);
				echo "20001";
			}
			//关闭预编译
			$stmt->close();
			//关闭数据库
			$db->close();
			return $bool;
		}
		
		//如果预编译插入失败，则删除整个这个excel表的所有数据
		public function delWorkInfo($arr){
			//连接数据库
			$this->open();
			$db = $this->link;
			$sql = "DELETE FROM Worker_information WHERE IDNumber = ?";
			$stmt = $db->prepare($sql);
			for($i=0; $i<count($arr); $i++){
				if($arr[$i] == null)
					continue;
				$stmt->bind_param("s",$arr[$i]);
				$result = $stmt->execute();
				//当执行失败时
				if(!$result){
					$content = date("Y-m-d H:i:s")." errorCode：20102，身份证为“".$arr[$i]."”的记录删除失败\r\n".$stmt->error."\r\n";
					$this->log($content);
				}
			}
			//关闭预编译
			$stmt->close();
			//关闭数据库
			$db->close();
		}
		
		//$arr={序号，分工会，姓名，身份证，性别，缴费金额，缴费年份，是否补缴，备注}
		//预编译添加缴费
		public function preInsertFee($arr){
			date_default_timezone_set("Asia/Shanghai");
			//标志是否插入成功
			$bool = true;
			//将插入成功的信息存放在这个数组，如果有哪个插入失败则根据这个数组删除刚刚插入的记录
			$arrInfo = array();
			//分工会名称改编号
			$arr = $this->depNameToNum($arr);
			//创建年度总额记录
			$this->preAnnualFee($arr);
			//连接数据库
			$this->open();
			$db = $this->link;
			//读取会员所在分工会号
			$presql0 = "SELECT 
							department_id 
						FROM 
							Worker_information 
						WHERE 
							IDNumber = ?";
			//插入缴费语句
			$presql1 = "INSERT INTO 
							payment_info(department_id, id, payyear, fee, after_payment, note) 
						VALUES
							(?,(SELECT id FROM Worker_information WHERE IDNumber = ?),?,?,?,?)";
			//更新年度总额语句
			$presql2 = "UPDATE Annual_total SET total = total + ?, total_number = total_number+1 WHERE department_id = ? AND years = ?";
			$stmt0 = $db->prepare($presql0);
			$stmt1 = $db->prepare($presql1);
			$stmt2 = $db->prepare($presql2);
			for($i=0; $i<count($arr);$i++){
				//如果Excel表中的第一列不是数字（即不是序号），则跳过
				if(!is_numeric($arr[$i][0])){
					$arrInfo[$i][1] = null;
					continue;
				}
				//如果备注为空，则设为“无”
				if($arr[$i][8] == null)
					$arr[$i][8] = "无";
				//如果是否补缴为空，则设为“否”
				if($arr[$i][7] == null)
					$arr[$i][7] = "否";
				$stmt0->bind_param("s",$arr[$i][3]);
				$stmt0->execute();
				//将结果绑定到$result变量
				$stmt0->bind_result($result0);
				//获取结果
				$stmt0->fetch();
				//释放结果集，要先释放，后面的才能用
				$stmt0->free_result();
				//如果会员所在的分工会与数据库信息不符，则更新会员所处分工会
				if($result0 != $arr[$i][1]){
					$updateSql = "UPDATE 
									Worker_information
								  SET 
									department_id = ? 
								  WHERE 
									IDNumber = ?";
					$updateStmt = $db->prepare($updateSql);
					$updateStmt->bind_param("ss",$arr[$i][1],$arr[$i][3]);
					$updateResult = $updateStmt->execute();
					if(!$updateResult){
						$content = date("Y-m-d H:i:s")." errorCode：20017，“".$arr[$i][3]."”转分工会失败\r\n";
						$this->log($content);
						$bool = false;
						$arrInfo[$i][1] = null;
						//插入失败，进入下一次循环
						continue;
					}
					//释放结果集
					$updateStmt->free_result();
				}
				//开始事务定义
				$db->query("BEGIN");
				$stmt1->bind_param("ssssss",$arr[$i][1],$arr[$i][3],$arr[$i][6],$arr[$i][5],$arr[$i][7],$arr[$i][8]);
				$stmt2->bind_param("dss",$arr[$i][5],$arr[$i][1],$arr[$i][6]);
				$result1 = $stmt1->execute();
				$result2 = $stmt2->execute();
				//当执行失败时回滚
				if((!$result1 || !$result2) && is_numeric($arr[$i][0])){
					$db->query("ROLLBACK");
					//身份证为空
					if($arr[$i][3] == null)
						$content = date("Y-m-d H:i:s")." errorCode：20019，“".$arr[$i][2]."”身份证未填写\r\n";
					//其他错误
					else
						$content = date("Y-m-d H:i:s")." errorCode：20019，“".$arr[$i][3]."”缴费插入失败，请检查是否已经插入这条记录或者excel表中记录重复。或者根据数据库错误信息自行百度原因：“".$stmt1->error."”\r\n";
					$this->log($content);
					$bool = false;
					$arrInfo[$i][1] = null;
					//插入失败，进入下一次循环
					continue;
				}
				//执行成功则提交
				else{
					$db->query("COMMIT");
					//分工会
					$arrInfo[$i][1] = $arr[$i][1];
					//身份证
					$arrInfo[$i][0] = $arr[$i][3];
					//缴费金额
					$arrInfo[$i][2] = $arr[$i][5];
					//缴费年份
					$arrInfo[$i][3] = $arr[$i][6];
				}
			}
			if($bool){
				echo "20010";
			}
			else{
				//部分插入失败，删除刚刚插入的记录
				$this->delInfo($arrInfo);
				echo "20011";
			}
			//关闭预编译
			$stmt1->close();
			$stmt2->close();
			//关闭数据库
			$db->close();
		}
		
		//$arr={身份证，分工会，缴费金额，缴费年份}
		//如果预编译插入失败，则删除整个这个excel表的所有数据
		public function delInfo($arr){
			//分工会名称改编号
			$arr = $this->depNameToNum($arr);
			//连接数据库
			$this->open();
			$db = $this->link;
			//删除缴费记录sql语句
			$sqlFee = "DELETE FROM 
						payment_info 
					WHERE 
						id = (
							SELECT 
								id 
							FROM 
								Worker_information
							WHERE
								IDNumber = ?)
					AND
						payyear = ?";
			//修改年度总额sql语句
			$sqlAnnual="UPDATE Annual_total SET total = total - ?, total_number = total_number - ? WHERE department_id = ? AND years = ?";
			$stmtFee = $db->prepare($sqlFee);
			$stmtAnnual = $db->prepare($sqlAnnual);
			//总金额
			$sum = 0;
			//总人数
			$totalNumber = 0;
			//部门号，$arr数组中有些部门号为null，需要设置一个变量存储部门号不为零的下标用于回退年度总额记录
			$num = 0;
			for($i=0; $i<count($arr);$i++){
				//不是插入的记录
				if($arr[$i][1] == null)
					continue;
				//总金额加相应数值
				$sum += $arr[$i][2];
				//总人数加1
				$totalNumber++;
				$num = $i;
				$stmtFee->bind_param("ss",$arr[$i][0], $arr[$i][3]);
				$resultFee = $stmtFee->execute();
				//当执行失败时
				if(!$resultFee){
					$content = date("Y-m-d H:i:s")." errorCode：20100，身份证为“".$arr[$i][0]."”的记录删除失败\r\n".$stmtFee->error."\r\n";
					$this->log($content);
				}
			}
			//关闭预编译
			$stmtFee->close();
			$stmtAnnual->bind_param("ssss",$sum, $totalNumber, $arr[$num][1], $arr[$num][3]);
			$resultAnnual = $stmtAnnual->execute();
			//当执行失败时
			if(!$resultAnnual){
				$content = date("Y-m-d H:i:s")." errorCode：20101，“".$arr[0][1]."”修改年度总额失败\r\n";
				$this->log($content);
			}
			//关闭预编译
			$stmtAnnual->close();
			//关闭数据库
			$db->close();
		}
		
		//分工会名字转编号
		public function depNameToNum($arr){
			$this->open();
			$db=$this->link;
			$sql = "SELECT * FROM department";
			$result=$db->query($sql);
			//读取数据库中分工会编号和名字并赋给二维数组，0为编号，1为名称
			$i = 0;
			while($row=$result->fetch_array()){
				for($j=0;$j<2;$j++){
					$array[$i][$j]=$row[$j];
				}
				$i++;
			}
			for($i = 0; $i < count($arr); $i++){
				//数组中分工会已经是数字，则跳过
				if(is_numeric($arr[$i][1]))
					continue;
				//匹配分工会名字，匹配到则用编号替换数字
				for($j = 0; $j < count($array); $j++){
					if($arr[$i][1] == $array[$j][1]){
						$arr[$i][1] = $array[$j][0];
						break;
					}
					//如果匹配不到名字，则写入日志
					if($j == (count($array) - 1) && $arr[$i][1] != null && $arr[$i][1] != "分工会" && $arr[$i][1] != "总计" && $arr[$i][1] != "合计"){
						$content = date("Y-m-d H:i:s")." errorCode：20118，分工会“".$arr[$i][1]."”不存在\r\n";
						$this->log($content);
					}
				}
			}
			return $arr;
		}
		
		//查询年度缴费总额记录是否存在，若不存在则添加一条记录
		public function preAnnualFee($arr){
			date_default_timezone_set("Asia/Shanghai");
			$this->open();
			$db=$this->link;
			$presql1 = "SELECT 
							years 
						FROM 
							annual_total 
						WHERE 
							department_id = ? 
						AND 
							years = ?";
			$presql2 = "INSERT INTO 
							annual_total(department_id,years) 
						VALUES
							(?,?)";
			$stmt1 = $db->prepare($presql1);
			$stmt2 = $db->prepare($presql2);
			for($i = 0; $i < count($arr); $i++){
				$stmt1->bind_param("ss",$arr[$i][1],$arr[$i][6]);
				$stmt1->execute();
				//将结果绑定到$result变量
				$stmt1->bind_result($result1);
				//获取结果
				$stmt1->fetch();
				//如果已有记录则进入下一个循环
				if($result1){
					continue;
				}
				//如果记录不存在，则创建
				if(!$result && is_numeric($arr[$i][0])){
					$stmt2->bind_param("ss",$arr[$i][1],$arr[$i][6]);
					$result2 = $stmt2->execute();
					if(!$result2){
						$depName = $this->queryDep($arr[$i][1]);
						$content = date("Y-m-d H:i:s")." errorCode：20018，创建“".$depName."”的年度总额记录失败\r\n";
						$this->log($content);
					}
				}
			}
			//关闭预编译
			$stmt1->close();
			$stmt2->close();
			//关闭数据库
			$db->close();
		}
		
		//预编译转分工会
		public function updateDep($dep_id, $id, $payyear){
			date_default_timezone_set("Asia/Shanghai");
			$bool = true;
			//分工会名称改编号
			$arr = $this->depNameToNum($arr);
			$this->open();
			$db=$this->link;
			$presql = "UPDATE payment_info SET department_id = ? WHERE id = ? AND payyear = ?";
			$stmt = $db->prepare($presql);
			for($i = 0; $i < count($id); $i++){
				$stmt->bind_param("sss",$dep_id, $id[$i], $payyear[$i]);
				$result = $stmt->execute();
				//当执行失败时
				if(!$result){
					$content = date("Y-m-d H:i:s")." errorCode：20009，“".$arr[$i][3]."”转分工会失败\r\n";
					$this->log($content);
					$bool = false;
				}
			}
			if($bool)
				echo "20008";
			else
				echo "20007";
			//关闭预编译
			$stmt->close();
			//关闭数据库
			$db->close();
		}
		
		//预编译修改分工会名称
		public function updateDepName($depId, $newDepName){
			date_default_timezone_set("Asia/Shanghai");
			$bool = true;
			$this->open();
			$db=$this->link;
			$presql = "UPDATE department SET department_name = ? WHERE department_id = ?";
			$stmt = $db->prepare($presql);
			$stmt->bind_param("ss",$newDepName, $depId);
			$result = $stmt->execute();
			//当执行失败时
			if(!$result){
				$depName = $this->queryDep($depId);
				$content = date("Y-m-d H:i:s")." errorCode：20038，分工会“".$depName."”修改名称失败\r\n";
				$this->log($content);
				$bool = false;
			}
			if($bool)
				echo "20036";
			else
				echo "20037";
			//关闭预编译
			$stmt->close();
			//关闭数据库
			$db->close();
		}
		
		//分工会编号转名字
		public function queryDep($depId){
			$depName = "";
			//连接数据库
			$this->open();
			$db=$this->link;
			$sql = "SELECT department_name FROM department WHERE department_id = ?";
			$stmt = $db->prepare($sql);
			$stmt->bind_param("s", $arr[$i][3]);
			$stmt->execute();
			//将结果绑定到$result变量
			$stmt->bind_result($result);
			//获取结果
			$stmt->fetch();
			$depName = $result;
			//释放结果集
			$stmt->free_result();
			//关闭数据库
			$db->close();
		}
		
		//日志
		public function log($content){
			header("Content-type: text/html; charset=utf-8");
			$file  = dirname(__FILE__).'\error.log';
			file_put_contents($file, $content,FILE_APPEND);
		}
		
		//修改信息
		public function updateInfo($IDNumber, $name, $sex, $fee, $year, $after, $note, $id){
			//连接数据库
			$this->open();
			$db=$this->link;
			$sql1="UPDATE 
						Worker_information 
					SET 
						IDNumber = '$IDNumber',
						name = '$name',
						sex = '$sex'
					WHERE 
						id = '$id'";
			$sql2="UPDATE 
						payment_info 
					SET 
						payyear = '$year', 
						fee = '$fee',
						after_payment = '$after',
						note = '$note'
					WHERE 
						id = '$id'
						AND 
						payyear = '$year'";
			$db->query("BEGIN");//开始事务定义
			$result1=$db->query($sql1);
			$result2=$db->query($sql2);
			//判断当执行失败时回滚
			if(!$result1 || !$result2){
				$db->query("ROLLBACK");
				$content = date("Y-m-d H:i:s")." errorCode：10113，修改信息失败。\r\n";
				$this->log($content);
				//修改失败
				echo "10113";
			}else{
				//修改成功
				echo "10112";
			}
			$db->query("COMMIT");//执行事务
			$db->close();
		}
		
		//删除缴费
		public function deleteFee($ID, $payyear){
			//连接数据库
			$this->open();
			$db=$this->link;
			$sql="DELETE FROM
						payment_info 
					WHERE 
						id = (SELECT id FROM Worker_information WHERE IDNumber = ?)
					AND
						payyear = ?";
			$stmt = $db->prepare($sql);
			$stmt->bind_param("ss",$ID, $payyear);
			$result = $stmt->execute();
			//判断当执行失败时回滚
			if(!$result){
				//修改失败
				echo "10025";
			}else{
				//修改成功
				echo "10112";
			}
			$stmt->close();
			$db->close();
		}
		
		//记录迁移
		public function updateInfoToNewUser($oldID, $newID = null){
			//连接数据库
			$this->open();
			$db=$this->link;
			//如果填了新旧身份证号则迁移缴费记录和补助记录，如果只填了旧身份证号则删除缴费记录和补助记录
			if($newID != null){
				//缴费部分
				$sqlInfo = "UPDATE 
							payment_info 
						SET 
							id = (SELECT id FROM worker_information WHERE IDNumber = ?)
						WHERE 
							id = (SELECT id FROM worker_information WHERE IDNumber = ?)";
				$stmtInfo = $db->prepare($sqlInfo);
				$stmtInfo->bind_param("ss",$newID,$oldID);
				//补助部分
				$sqlCompensation = 
						"UPDATE 
							compensation_info 
						SET 
							userId = (SELECT id FROM worker_information WHERE IDNumber = ?)
						WHERE 
							userId = (SELECT id FROM worker_information WHERE IDNumber = ?)";
				$stmtCompensation = $db->prepare($sqlCompensation);
				$stmtCompensation->bind_param("ss",$newID,$oldID);
			}
			else{
				//缴费部分
				$sqlInfo = 
						"DELETE FROM 
							payment_info
						WHERE 
							id = (SELECT id FROM worker_information WHERE IDNumber = ?)";
				$stmtInfo = $db->prepare($sqlInfo);
				$stmtInfo->bind_param("s",$oldID);	
				//补助部分
				$sqlCompensation = 
						"DELETE FROM 
							compensation_info 
						WHERE 
							userId = (SELECT id FROM worker_information WHERE IDNumber = ?)";
				$stmtCompensation = $db->prepare($sqlCompensation);
				$stmtCompensation->bind_param("s",$oldID);		
			}
			//用户部分
			$sqlUser = "DELETE FROM
							Worker_information
						WHERE 
							IDNumber = ?";
			$stmtUser = $db->prepare($sqlUser);
			$stmtUser->bind_param("s",$oldID);
			
			//开始事务定义
			$db->query("BEGIN");
			$resultInfo = $stmtInfo->execute();
			$resultCompensation = $stmtCompensation->execute();
			$resultUser = $stmtUser->execute();
			//执行失败
			if(!$resultInfo || !$resultUser || !$resultCompensation){
				$db->query("ROLLBACK");
				if(!$resultInfo){
					$content = date("Y-m-d H:i:s")." errorCode：10121，迁移或删除缴费信息失败，请根据数据库错误信息自行百度原因：“".$stmtInfo->error."”\r\n";
					$this->log($content);
				}
				else if(!$resultCompensation){
					$content = date("Y-m-d H:i:s")." errorCode：10122，迁移或删除补助信息失败，请根据数据库错误信息自行百度原因：“".$stmtCompensation->error."”\r\n";
					$this->log($content);
				}
				else if(!$resultUser){
					$content = date("Y-m-d H:i:s")." errorCode：10123，删除旧用户失败";
					$this->log($content);
				}
			}
			//执行成功
			else{
				$db->query("COMMIT");
				echo "10120";
			}
			$stmtInfo->close();
			$stmtCompensation->close();
			$stmtUser->close();
			$db->close();
		}
	}
?>