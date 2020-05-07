<?php 
	error_reporting(E_ALL^E_NOTICE);//屏蔽NOTICE提示，此提示并非错误
	include_once("PHPExcel.php"); 
	/*$filePath = "./test/学院.xls";
	$test = new ExcelToMysql();
	$arr = $test->read($filePath);
	for($i = 0; $i < 70; $i++){
		for($j = 0; $j < 9; $j++){
			echo $arr[$i][$j]."\t";
		}
		echo "</br>";
	}*/
	class ExcelToMysql{
		//对excel里的日期进行格式转化
		public function GetData($val, $str){
			//转换成1970年以来的秒数
			$second = intval(($val - 25569) * 3600 * 24);
			//格式化时间
			return gmdate($str, $second);
		} 

		//读取Excel文件内容并存放到一个二维数组中
		public function read($filePath){
			$filePath = iconv('UTF-8','GB2312',$filePath);

			$PHPExcel = new PHPExcel(); 
	
			//默认用excel2007读取excel，若格式不对，则用之前的版本进行读取
			$PHPReader = new PHPExcel_Reader_Excel2007(); 
			if(!$PHPReader->canRead($filePath)){ 
				$PHPReader = new PHPExcel_Reader_Excel5(); 
				if(!$PHPReader->canRead($filePath)){ 
					echo 'no Excel'; 
					return ; 
				} 
			} 

			$PHPExcel = $PHPReader->load($filePath); 
			//读取excel文件中的第一个工作表*
			$currentSheet = $PHPExcel->getSheet(0); 
			//取得最大的列号
			$allColumn = $currentSheet->getHighestColumn(); 
			//取得一共有多少行
			$allRow = $currentSheet->getHighestRow();
			//从第0行开始输入，excel表中第一行为标题，第二行为时间，第三行为列名
			for($currentRow = 0, $i = 0;$currentRow <= $allRow;$currentRow++, $i++){
				//从第A列开始输出
				for($currentColumn= 'A', $j = 0;$currentColumn<= $allColumn; $currentColumn++, $j++){
					//ord()将字符转为十进制数
					$val = $currentSheet->getCellByColumnAndRow(ord($currentColumn) - 65,$currentRow)->getValue();
					//去除空格
					$val = trim($val);
					$val = str_replace(' ', '', $val);
					//如果输出汉字有乱码，则需将输出内容用iconv函数进行编码转换，如下将gb2312编码转为utf-8编码输出
					//$arr[$i][$j] = iconv('utf-8','gb2312', $val); 
					$arr[$i][$j] = $val; 
				}
			}
			return $arr;
		}
	}
?> 
