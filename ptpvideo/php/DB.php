<?php
	error_reporting(E_ALL^E_NOTICE);
	set_time_limit(0);//0表示不限时
	class DB{
		//构造函数
		function __construct(){}
		public $link;
		
		//连接数据库
		public function open(){
			$this->link = new mysqli("localhost","root","admin","ptpvideo");
			if($this->link->connect_errno){
				exit();
            }
            //打印字符编码
			$this->link->query("set names utf8");
        }

        //查询密码，用户类型和登录数
		public function queryInfo($username){
			$sql="  SELECT password, user_type, login_count
				    FROM usertable
				    WHERE 
						user_name = '$username'";
			$result = $this->query($sql);
			return $result;
        }

        //修改同时登录数
        public function updateCount($username, $count, $sign, $close = false){
            //连接数据库
			$this->open();
            $db=$this->link;
            if(!$close){
                //查询当前登录数
                $sql="  SELECT login_count
                        FROM usertable
                        WHERE 
                            user_name = '$username'";
                $result = $this->query($sql);
                $loginCount = $result[0][0];
                //当前登录数增加
                if($sign == "+")
                    $loginCount = $loginCount + $count;
                //减少
                else if($sign == "-")
                    $loginCount = $loginCount - $count;
                //最小值为零
                if($loginCount < 0)
                    $loginCount = 0;
                //修改单个用户
                $sql="  UPDATE 
                            usertable 
                        SET 
                            login_count = '$loginCount'
                        WHERE 
                            user_name = '$username'";
            }
            //关机修改全部用户
            else
                $sql="  UPDATE 
                            usertable 
                        SET 
                            login_count = 0";
            $result=$db->query($sql);
            $db->close();
        }
        
        //查询
		public function query($sqlstr){
			$this->open();
			$db=$this->link;
			//执行sql语句
			$result=$db->query($sqlstr);
			if(!$result){
				return 110;
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
    }
        
?>