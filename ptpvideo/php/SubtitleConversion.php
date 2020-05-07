<?php
/**
 * Created by PhpStorm.
 * User: 蓝 梦
 * Date: 2019/7/18
 * Time: 19:57
 */

class SubtitleConversion
{
	public function toVtt($source, $videoName){
        //获取源文件名
        $start = strrpos($source, '.') + 1;
        $fileType = substr($source, $start);
		if($fileType == "ass" || $fileType == "ASS" || $fileType == "ssa" || $fileType == "SSA")
			return $this->assToVtt($source, $videoName);
		else if($fileType == "srt" || $fileType == "SRT"){
			$srt = fopen($source, "r");
            $temp = fgets($srt);
			fclose($srt);
			if(substr($temp, 0, strlen("<SAMI>")) === "<SAMI>")
				return $this->srtToVtt2($source, $videoName);
			else
				return $this->srtToVtt($source, $videoName);
		}
	}
	
    private function assToVtt($source, $videoName){
        //打开新文件
        $vtt = fopen("./vtt/".$videoName.".vtt", "w");
        //写入新文件第一行（格式要求必须写）
        fwrite($vtt, "WEBVTT\n\n");
        //打开源文件
        $ass = fopen($source, "r");
        //逐行读取
        while(!feof($ass))
        {
            //fgets() Read row by row
            $temp = fgets($ass);
            //Dialogue开头为字幕内容
            if(substr($temp, 0, strlen("Dialogue")) === "Dialogue"){
                $arr = explode(',',$temp);
				//开始时间
                fwrite($vtt, $arr[1]."0");
                fwrite($vtt, " --> ");
				//结束时间
                fwrite($vtt, $arr[2]."0\n");
				$string = "";
				//内容合并
                for($i=9; $i<count($arr); $i++){
					$string = $string.$arr[$i];
				}
				//去除ass中特效代码，vtt无法识别
				while(strlen($start = strpos($string, '{')) > 0){
					$end = strpos($string, '}');
					$str = Array();
					$str[0] = substr($string, 0, $start);
					$str[1] = substr($string, $end + 1);
					$string = $str[0].$str[1];
				}
				fwrite($vtt, $string);
                fwrite($vtt, "\n");
            }
        }
        fclose($ass);
        fclose($vtt);
		$fileOriginalName = iconv("GBK","UTF-8", $videoName);
        return $fileOriginalName;
    }
	
	private function srtToVtt($source, $videoName){
        //打开新文件
        $vtt = fopen("./vtt/".$videoName.".vtt", "w");
        //写入新文件第一行（格式要求必须写）
        fwrite($vtt, "WEBVTT\n\n");
        //打开源文件
        $srt = fopen($source, "r");
		$count = 1;
		$num = 2;
        //逐行读取
        while(!feof($srt))
        {
			//fgets() Read row by row
			$temp = fgets($srt);
			if($temp == $count){
				$num = $count + 1;
				$count++;
				continue;
			}
			//时间
			if($num == ($count + 1)){
				fwrite($vtt, $temp."\n");
				$num++;
			}
			//内容
			else{
				fwrite($vtt, $temp."\n");
			}
        }
        fclose($srt);
        fclose($vtt);
		$fileOriginalName = iconv("GBK","UTF-8", $videoName);
        return $fileOriginalName;
	}
	
	private function srtToVtt2($source, $videoName){
        //打开新文件
        $vtt = fopen("./vtt/".$videoName.".vtt", "w");
        //写入新文件第一行（格式要求必须写）
        fwrite($vtt, "WEBVTT\n\n");
        //打开源文件
        $srt = fopen($source, "r");
		$bool = false;
        //逐行读取
        while(!feof($srt))
        {
            //fgets() Read row by row
            $temp = fgets($srt);
			if(!$bool){
				//<SYNC开头为字幕内容
				if(substr($temp, 0, strlen("<SYNC")) === "<SYNC"){
					$arr = explode(' ',$temp);
					$start = 0;
					$end = 0;
					//<SYNC Start=1009439><P Class=ZHCC>&nbsp;
					//<SYNC Start=1013800 End=1019929><P Class=ZHCC>
					if(substr($arr[1], 0, 5) === "Start"){
						$stop = strpos($arr[1], '>');
						if($stop != 0)
							continue;
						else
							$start = substr($arr[1], 6);
					}
					if(substr($arr[2], 0, 3) === "End"){
						$stop = strpos($arr[2], '>') - 4;
						$end = substr($arr[2], 4, $stop);
					}
					if($end != 0){
						$second = floor($start / 1000);
						$ms = $start % 1000;
						$array = Array();
						//秒
						$array[0] = $second % 60;
						//分
						$array[1] = floor($second / 60);
						$array[1] = $array[1] % 60;
						//时
						$array[2] = floor($array[1] / 60);
						//补全零
						for($i=0; $i<3; $i++){
							while(strlen($array[$i]) < 2)
								$array[$i] = "0".$array[$i];
						}
						while(strlen($ms) < 3)
								$ms = "0".$ms;
						$startString = $array[2].":".$array[1].":".$array[0].".".$ms;
						fwrite($vtt, $startString);
						fwrite($vtt, " --> ");
						
						$second = floor($end / 1000);
						$ms = $end % 1000;
						$array = Array();
						//秒
						$array[0] = $second % 60;
						//分
						$array[1] = floor($second / 60);
						$array[1] = $array[1] % 60;
						//时
						$array[2] = floor($array[1] / 60);
						//补全零
						for($i=0; $i<3; $i++){
							while(strlen($array[$i]) < 2)
								$array[$i] = "0".$array[$i];
						}
						while(strlen($ms) < 3)
								$ms = "0".$ms;
						$endString = $array[2].":".$array[1].":".$array[0].".".$ms;
						fwrite($vtt, $endString."\n");
						$bool = true;
					}
				}
			}
			else{
				fwrite($vtt, $temp."\n");
				$bool = false;
			}
        }
        fclose($srt);
        fclose($vtt);
		$fileOriginalName = iconv("GBK","UTF-8", $videoName);
        return $fileOriginalName;
    }
}