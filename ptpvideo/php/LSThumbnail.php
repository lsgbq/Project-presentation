<?php
/**
 * Created by PhpStorm.
 * User: 蓝 梦
 * Date: 2019/7/20
 * Time: 16:30
 */

ini_set('max_execution_time', '0');
class LSThumbnail
{
    //构造函数
    function __construct(){}
    public function main($nowDir, $type, $subPath, $quick, $mp4trans){
        $isCharMoreThan260 = "unknown";
        //依旧无法识别的超长路径，windows7x64路径长度限制260字符（中文占2字符）
        if(strlen($nowDir) > 260){
            $pos = strrpos($nowDir, ".");
            if((strlen($nowDir) - $pos) >= 6){
                //$isCharMoreThan260 = "dir";
                echo json_encode(260);
                return;
            }
            else
                $isCharMoreThan260 = "file";
        }
        //目录
        if(is_dir($nowDir)){
            $json =  json_encode(array_values($this->getDir($nowDir)));
            echo $json;
        }
        //文件
        else if(is_file($nowDir) || $isCharMoreThan260 == "file"){
            //获取文件后缀
            $fileType = substr($nowDir, strrpos($nowDir, '.') + 1);
            if($type == null){
                //视频
                if($this->typeOfViedo($fileType) != 0){
                    //获取视频名称
                    $start = strrpos($nowDir, '/') + 1;
                    $end = strrpos($nowDir, '.');
                    $fileOriginalName = substr($nowDir, $start, $end-$start);
                    //新生成的文件名
                    $fileName = "./video/".$fileOriginalName.".mp4";
                    //若文件不存在则复制
                    if(!file_exists($fileName)){
                        //复制文件，超长路径需要用Robocopy复制，超大文件也需要用Robocopy复制，所以全用Robocopy复制
                        //目标路径
                        $destination = dirname(__FILE__)."\\video";
                        //分离源路径的路径和文件名
                        $pathLength = strrpos($nowDir, '/');
                        $source = substr($nowDir, 0, $pathLength);
                        //要将/换成\才能让dos识别到路径
                        $source = str_replace("/", "\\", $source);
                        $file = substr($nowDir, $pathLength + 1);
                        //Robocopy 源路径 目标路径 文件
                        exec("Robocopy \"".$source."\" \"".$destination."\" \"".$file."\"");
                        //非mp4类型需要转码，或需要添加字幕的所有类型需要转码
                        if($fileType != "mp4" && $fileType != "MP4" || $subPath != null){
							$subtitle = null;
							//mkv类型自带字幕，进行提取第一个字幕轨
							if(($fileType == "mkv" || $fileType == "MKV") && $subPath == null && !$quick){
								//ffmpeg -i input.mkv  -map 0:s:0  output.ass
								exec("ffmpeg -i \"./video/".$fileOriginalName.".".$fileType."\" -map 0:s:0 -y \"./video/".$fileOriginalName.".ass\"");
								$subtitle = $fileOriginalName.".ass";
								$subPath = $subtitle;
							}
                            //带字幕转码
							if($subPath != null){
								//根据提供的字幕路径复制字幕
								if($subtitle == null){
									//获取字幕名称
									$startSub = strrpos($subPath, '.') + 1;
									$nameSub = substr($subPath, $startSub);
									//复制字幕
									copy($subPath,"./video/1.".$nameSub);
									$subtitle = "1.".$nameSub;
								}
								//ffmpeg -c:v h264_qsv -i "./video/1.mkv" -i ./video/2.ass -vcodec h264_qsv -vf ass=./video/2.ass -c:v h264_qsv -c:a copy -y ./video/3.mp4
								if($fileType == "mp4" || $fileType == "MP4")
                                    $fileName = "./video/".$fileOriginalName."2.mp4";
								//存在字幕文件则带字幕转码
								if(file_exists("./video/".$subtitle))
									$command = "ffmpeg.exe -c:v h264_qsv -i \"./video/".$fileOriginalName.".".$fileType."\" -vf ass=./video/".$subtitle." -c:v h264_qsv -c:a copy -strict -2 -y \"".$fileName."\"";
								else
									$command = "ffmpeg.exe -hwaccel qsv -c:v h264_qsv -i \"./video/".$fileOriginalName.".".$fileType."\" -c:v h264_qsv -c:a copy -strict -2 -y \"".$fileName."\"";
							}
							//不带字幕转码
							else
								$command = "ffmpeg.exe -hwaccel qsv -c:v h264_qsv -i \"./video/".$fileOriginalName.".".$fileType."\" -c:v h264_qsv -c:a copy -strict -2 -y \"".$fileName."\"";
							if($fileType == "rmvb" || $fileType == "RMVB"){
								exec("ffmpeg.exe -i \"./video/".$fileOriginalName.".".$fileType."\" -y \"".$fileName."\"");
							}
							//copy必须不带字幕，不支持rmvb
							//非mkv文件，$subtitle=null，但./video/会判定存在，所以要判断$subtitle为空
							//mkv文件会先提取字幕文件，即使不存在字幕文件，$subtitle也会变成.ass，此时./video/.ass判定为不存在
							else if($quick && (!file_exists("./video/".$subtitle) || $subtitle == null)){
								exec("ffmpeg.exe -i \"./video/".$fileOriginalName.".".$fileType."\" -c:v copy -c:a copy -strict -2 -y \"".$fileName."\"");
								if(filesize($fileName) <= 0){
									exec("ffmpeg.exe -i \"./video/".$fileOriginalName.".".$fileType."\" -c:v copy -y \"".$fileName."\"");
									clearstatcache();
								}
							}
							else
							{
								//写入txt文件
								$fp = fopen("transcodingStart.txt", "w");
								fwrite($fp, $command);
								fclose($fp);
								//等待转码完成，每隔一分钟查询一次
								do{
									//延迟5秒
									sleep(5);
									$filename = "transcodingEnd.ini";
									$file = fopen($filename, "r");
									$contents = fgets($file);
									fclose($file);
								}while($contents != "success" && $contents != "error");
								//清空标记
								$filename = "transcodingEnd.ini";
								$file = fopen($filename, "w");
								fwrite($file, "");
								fclose($file);
								//硬件加速不支持，进行软解
								if($contents == "error"){
									exec("ffmpeg.exe -i \"./video/".$fileOriginalName.".".$fileType."\" -c:v libx264 -vf format=yuv420p -c:a copy -strict -2 -y \"".$fileName."\"");
								}
							}
							//删除源文件
                            unlink("./video/".$fileOriginalName.".".$fileType);
                            if($fileType == "mp4" || $fileType == "MP4"){
                                $fileName = "./video/".$fileOriginalName.".mp4";
                                rename("./video/".$fileOriginalName."2.mp4", $fileName);
                            }
                        }
                        //原文件是mp4，且不存在于video目录下的mp4转码
                        else if($mp4trans){
							//libx264：x265(Hevc)->x264。-vf format=yuv420p：10bit->8bit
							$tempName = "./video/".$fileOriginalName."2.mp4";
                            exec("ffmpeg.exe -i \"".$fileName."\" -c:v libx264 -vf format=yuv420p -y \"".$tempName."\"");
							//删除源文件
                            unlink($fileName);
							rename("./video/".$fileOriginalName."2.mp4", $fileName);
                        }
                    }
                    //原文件可能是任何非mp4类型或存在于video目录下的mp4转码
                    else if($mp4trans){
                        //libx264：x265(Hevc)->x264。-vf format=yuv420p：10bit->8bit
                        $tempName = "./video/".$fileOriginalName."2.mp4";
                        exec("ffmpeg.exe -i \"".$fileName."\" -c:v libx264 -vf format=yuv420p -y \"".$tempName."\"");
                        //删除源文件
                        unlink($fileName);
                        rename("./video/".$fileOriginalName."2.mp4", $fileName);
                    }
					//若截图不存在则截图
					if(!file_exists("./video/".$fileOriginalName.".png")){
                        //获取视频分辨率
                        $arr = $this->get_video_info("./video/".$fileOriginalName.".mp4");
                        $resolution = "425x240";
                        if($arr){
                            //分辨率
                            $width = $arr[1]["width"];
                            $height = $arr[1]["height"];
                            while($width > 500){
                                $width = $width / 2;
                                $height = $height / 2;
                            }
                            $resolution = $width."x".$height;
                        }
                        exec("ffmpeg.exe -ss 0 -i \"".$fileName."\" -vframes 1 -s ".$resolution." \"./video/".$fileOriginalName.".png\"");
                    }
					$fileOriginalName = iconv("GBK","UTF-8", $fileOriginalName);
                    sleep(1);
                    echo json_encode(Array("video", $fileOriginalName));
                }
                //图片
                else if($this->typeOfPicture($fileType) != 0){
                    //获取图片名称（带后缀）
                    $start = strrpos($nowDir, '/') + 1;
                    $fileOriginalName = substr($nowDir, $start);
                    //若不存在则复制文件，超长路径需要用Robocopy复制
                    if($isCharMoreThan260 == "file"){
                        //目标路径
                        $destination = dirname(__FILE__)."\\picture";
                        //分离源路径的路径和文件名
                        $source = substr($nowDir, 0, $start - 1);
                        //要将/换成\才能让dos识别到路径
                        $source = str_replace("/", "\\", $source);
                        //Robocopy 源路径 目标路径 文件
                        exec("Robocopy \"".$source."\" \"".$destination."\" \"".$fileOriginalName."\"");
                    }
                    else{
                        if(!file_exists("./picture/".$fileOriginalName))
                            copy($nowDir,"./picture/".$fileOriginalName);
                    }
                    $fileOriginalName = iconv("GBK","UTF-8", $fileOriginalName);
                    echo json_encode(Array("picture", $fileOriginalName));
                }
                else
                    echo json_encode(0);
            }
            //下载
            else if($type == "download"){
                //视频或字幕
                if($this->typeOfViedo($fileType) != 0 || $this->typeOfSubtitle($fileType) != 0){
                    //获取视频名称
                    $start = strrpos($nowDir, '/') + 1;
                    $fileOriginalName = substr($nowDir, $start);
                    //新生成的文件名
                    $fileName = "./video/".$fileOriginalName;
                    //若文件不存在则复制
                    if(!file_exists($fileName)){
                        //若文件不存在则复制文件，超长路径需要用Robocopy复制，超大文件也需要用Robocopy复制，所以全用Robocopy复制
                        //目标路径
                        $destination = dirname(__FILE__)."\\video";
                        //分离源路径的路径和文件名
                        $pathLength = strrpos($nowDir, '/');
                        $source = substr($nowDir, 0, $pathLength);
                        //要将/换成\才能让dos识别到路径
                        $source = str_replace("/", "\\", $source);
                        $file = substr($nowDir, $pathLength + 1);
                        //Robocopy 源路径 目标路径 文件
                        exec("Robocopy \"".$source."\" \"".$destination."\" \"".$file."\"");
                    }
                    $fileOriginalName = iconv("GBK","UTF-8", $fileOriginalName);
                    echo json_encode(Array("download", $fileOriginalName));
                }
                else
                    echo json_encode(0);
            }
            //字幕文件
            else if($type == "subtitle"){
                //字幕
                if($this->typeOfSubtitle($fileType) != 0){
                    echo json_encode(3);
                }
                else
                    echo json_encode(0);
            }
        }
    }

    //获取文件目录列表,该方法返回数组
    public function getDir($dir) {
        $dirArray[]=NULL;
        $fileArray[] = NULL;
        if (false != ($handle = opendir ( $dir ))) {
            $i=0;
            $j=0;
            while ( false !== ($file = readdir ( $handle )) ) {
                //排除.和..及系统文件
                if($file != "." && $file != ".." && $file != "pagefile.sys" && $file != "\$RECYCLE.BIN" && $file != "System Volume Information"){
                    //无法识别的目录和文件・
                    if(!is_file($dir."/".$file) && !is_dir($dir."/".$file)){
                        $replace = iconv("UTF-8", "GBK", "·");
                        $replaceFile = str_replace("?", $replace, $file);
                        //要将/换成\才能让dos识别到路径
                        $oldName = str_replace("/", "\\", $dir."/".$file);
                        $newName = str_replace("/", "\\", $dir."/".$replaceFile);
                        //文件，用rename/ren重命名
                        exec("rename \"".$oldName."\" \"".$newName."\" 2>&1", $resArr, $status);
                        //0表示成功即文件重命名，非0（1）表示失败即文件夹，要用move
                        if($status != 0){
                            //文件夹，用move重命名
                            exec("move \"".$oldName."\" \"".$newName."\"");
                        }
                        $file = $replaceFile;
                    }
                    $isCharMoreThan260 = "unknown";
                    //依旧无法识别的超长路径，windows7x64路径长度限制260字符（中文占2字符）
                    if(strlen($dir."/".$file) > 260){
                        $pos = strrpos($file, ".");
                        if((strlen($file) - $pos) >= 6)
                            $isCharMoreThan260 = "dir";
                        else
                            $isCharMoreThan260 = "file";
                    }
                    //目录
                    if (is_dir($dir."/".$file) || $isCharMoreThan260 == "dir") {
                        $file = mb_convert_encoding($file,"UTF-8","GBK");
                        $dirArray[$i][0]=$file;
                        $dirArray[$i][1]="./picture/fold.png";
                        $i++;
                    }
                    //文件
                    else if (is_file($dir."/".$file) || $isCharMoreThan260 == "file") {
                        $pattern_video = "/(swf|flv|mp4|rmvb|avi|mov|wmv|mkv|SWF|FLV|MP4|RMVB|AVI|MOV|WMV|MKV)/";
                        $pattern_img = "/(jpg|gif|bmp|png|jpeg|JPG|GIF|BMP|PNG|JPEG)/";
                        //获取后缀
                        $fileType = substr($file, strrpos($file, '.') + 1);
                        //视频
                        if(preg_match($pattern_video, $fileType)){
                            //获取文件原始名字
                            $start = strrpos($file, '/');
                            $end = strrpos($file, '.');
                            $fileOriginalName = substr($file, $start, $end-$start);
                            //文件不存在
                            if(!file_exists("./thumb/".$fileOriginalName.".png")){
                                //获取视频时长和分辨率
                                $arr = $this->get_video_info($dir."/".$file);
                                $time = "500";
                                $resolution = "425x240";
                                if($arr){
                                    //时长
                                    $str0 = explode(":", $arr[0]);
                                    $temp0 = ($str0[0] * 60 + $str0[1]) * 60 + $str0[2];
                                    if($temp0 < 500)
                                        $time = "1";
                                    //分辨率
                                    $width = $arr[1]["width"];
                                    $height = $arr[1]["height"];
                                    while($width > 500){
                                        $width = $width / 2;
                                        $height = $height / 2;
                                    }
                                    $resolution = $width."x".$height;
                                }
                                //截图
                                exec("ffmpeg.exe -ss ".$time." -i \"".$dir."/".$file."\" -vframes 1 -s ".$resolution." \"./thumb/".$fileOriginalName.".png\"");
                                //如果截图失败则使用最简单的命令保证能截到图
                                if(!file_exists("./thumb/".$fileOriginalName.".png"))
                                    exec("ffmpeg.exe -ss 0 -i \"".$dir."/".$file."\" -vframes 1 \"./thumb/".$fileOriginalName.".png\"");
                            }
                            $file = mb_convert_encoding($file,"UTF-8","GBK");
                            $fileArray[$j][0]=$file;
                            $fileOriginalName = mb_convert_encoding($fileOriginalName,"UTF-8","GBK");
                            $fileArray[$j][1]="./php/thumb/".$fileOriginalName.".png";
                            $fileArray[$j][2] = "[".$fileType."]";
                        }
                        //图片
                        else if(preg_match($pattern_img, $fileType)){
                            //若文件不存在则复制
                            if(!file_exists("./thumb/".$file)){
                                //超长路径需要使用Robocopy
                                if($isCharMoreThan260 == "file"){
                                    //目标路径
                                    $destination = dirname(__FILE__)."\\thumb";
                                    //要将/换成\才能让dos识别到路径
                                    $source = str_replace("/", "\\", $dir);
                                    //Robocopy 源路径 目标路径 文件
                                    exec("Robocopy \"".$source."\" \"".$destination."\" \"".$file."\"");
                                }
                                else{
                                    //copy($dir."/".$file,"./thumb/".$file);
                                    $this->reSizeImg($dir."/".$file, 500, 300, "./thumb/".$file);
                                }
                            }
                            $file = mb_convert_encoding($file,"UTF-8","GBK");
                            $fileArray[$j][0]=$file;
                            $fileArray[$j][1]="./php/thumb/".$file;
                            $fileArray[$j][2] = "[".$fileType."]";

                        }
                        else{
                            $file = mb_convert_encoding($file,"UTF-8","GBK");
                            $fileArray[$j][0]=$file;
                            $fileArray[$j][1]="./picture/useless.png";
                            if($this->typeOfSubtitle($fileType) != 0){
                                $fileArray[$j][2] = "[".$fileType."]";
                            }
                        }
                        $j++;
                    }
                }
            }
            //没有目录只有文件
            if($dirArray[0] == NULL)
                $dirArray = $fileArray;
            //目录和文件都有
            else if($fileArray[0] != NULL)
                $dirArray = array_merge($dirArray, $fileArray);
            //关闭句柄
            closedir ( $handle );
        }
        //空文件夹
        if($dirArray[0] == NULL)
            $dirArray[0][0] = "empty";
        return $dirArray;
    }

    //判断是否是视频
    public function typeOfViedo($file){
        $files=array('mp4','MP4','rmvb','RMVB','avi','AVI','mkv','MKV', "flv", "FLV");
        for ($i=0;$i < count($files);$i++){
            if($file==$files[$i]){
                return 1; //有返回1
            }
        }
        return 0;
    }

    //判断是否是图片
    public function typeOfPicture($file){
        $files=array('jpg','JPG','png','PNG','gif','GIF','jpeg','JPEG');
        for ($i=0;$i < count($files);$i++){
            if($file==$files[$i]){
                return 1; //有返回1
            }
        }
        return 0;
    }

    //判断是否是字幕文件
    public function typeOfSubtitle($file){
        $files=array('ass','ASS','srt','SRT','vtt','VTT','ssa','SSA');
        for ($i=0;$i < count($files);$i++){
            if($file==$files[$i]){
                return 1; //有返回1
            }
        }
        return 0;
    }

    //获取视频时长和分辨率
    public function get_video_info($video_path){
        if (!file_exists($video_path))
            return false;
        $times = false;
        $resolution = false;
        $commond = "ffmpeg -i \"".$video_path."\" 2>&1";
        exec($commond, $str_res, $str_r);
        if (is_array($str_res)){
            foreach($str_res as $v){
                //时长
                if (strpos($v, 'Duration') !== false){
                    //'Duration: 00:24:28.14, start: 0.000000, bitrate: 486 kb/s'
                    $times = substr($v, stripos($v , '.') - 8, 8);
                }
                //分辨率
                else if (strpos($v, 'Stream #0:0') !== false){
                    //Stream #0:0(und): Video: h264 (High) (avc1 / 0x31637661), yuv420p, 386x480 [SAR 4095:4096 DAR 52689:65536],
                    // 182 kb/s, SAR 21943:21947 DAR 160:199, 25 fps, 25 tbr, 12501 tbn, 50 tbc (default)

                    //Stream #0:0(und): Video: h264 (High) (avc1 / 0x31637661), yuv420p, 404x720, 280 kb/s,
                    // 30 fps, 30 tbr, 15360 tbn, 60 tbc (default)

                    //Stream #0:0(und): Video: h264 (Main) (avc1 / 0x31637661), yuv420p(tv, bt709), 1280x720 [SAR 1:1 DAR 16:9],
                    // 1228 kb/s, 23.98 fps, 23.98 tbr, 90k tbn, 180k tbc (default)
					$arr = explode("x", $v);
					if(count($arr) >=2){
						$widthArr = explode(" ", $arr[count($arr) - 2]);
						$width = $widthArr[count($widthArr) - 1];
						$heightArr = explode(" ", $arr[count($arr) - 1]);
						$height = explode(",", $heightArr[0]);
						$resolution = Array(
							"width" => $width,
							"height" => $height[0]
						);
					}
					else
					{
						$resolution = Array(
							"width" => "425",
							"height" => "240"
						);
					}
                    break;
                }
            }
        }
        if($times && $resolution){
            return Array($times, $resolution);
        }
        else
            return false;
    }

    /**
    * 生成缩略图
    * $imgSrc           图片源路径
    * $resize_width     图片宽度
    * $resize_height    图片高度
    * $dstimg           缩略图路径
    * $isCut            是否剪切图片
    */
    function reSizeImg($imgSrc, $resize_width, $resize_height, $dstimg, $isCut = false) {
		$im = null;
        //图片的类型， strrchr查找字符在指定字符串中从右面开始的第一次出现的位置
        $type = substr(strrchr($imgSrc, "."), 1);
        //初始化图象，创建一个新图象（临时）
        if ($type == "jpg" || $type == "jpeg") {
            $im = imagecreatefromjpeg($imgSrc);
        }
        if ($type == "gif") {
            $im = imagecreatefromgif($imgSrc);
        }
        if ($type == "png") {
            $im = imagecreatefrompng($imgSrc);
        }
		if($im == null)
			return;
        //获取图像的宽高
        $width = imagesx($im);
        $height = imagesy($im);
  
        //生成图象
        //改变后的图象的比例
        $resize_ratio = ($resize_width) / ($resize_height);
        //实际图象的比例
        $ratio = ($width) / ($height);
        //剪切
        if (($isCut) == 1) {
            if ($ratio >= $resize_ratio) {
                //高度优先
                //imagecreatetruecolor(int x,int y)创建的是一幅大小为 x和 y的图像(默认为黑色)
                $newimg = imagecreatetruecolor($resize_width, $resize_height);
                /**
                 * bool imagecopyresampled(resource $dst_image, resource $src_image, int $dst_x, int $dst_y, int $src_x, int $src_y, int $dst_w, int $dst_h,int $src_w, int $src_h)
                 * $dst_image：新建的图片
                 * $src_image：需要载入的图片
                 * $dst_x：设定需要载入的图片在新图中的x坐标
                 * $dst_y：设定需要载入的图片在新图中的y坐标
                 * $src_x：设定载入图片要载入的区域x坐标
                 * $src_y：设定载入图片要载入的区域y坐标
                 * $dst_w：设定载入的原图的宽度（即生成的宽度，在此设置缩放）
                 * $dst_h：设定载入的原图的高度（即生成的高度，在此设置缩放）
                 * $src_w：原图要载入的宽度（原图被剪切的宽度）
                 * $src_h：原图要载入的高度（原图被剪切的高度）
                 */
                imagecopyresampled($newimg, $im, 0, 0, 0, 0, $resize_width, $resize_height, (($height) * $resize_ratio), $height);
                //输出图像，要输出的图像，指定输出图像的文件名(输出路径)
                ImageJpeg($newimg, $dstimg);
            }
            if ($ratio < $resize_ratio) {
                //宽度优先
                $newimg = imagecreatetruecolor($resize_width, $resize_height);
                imagecopyresampled($newimg, $im, 0, 0, 0, 0, $resize_width, $resize_height, $width, (($width) / $resize_ratio));
                ImageJpeg($newimg, $dstimg);
            }
        } 
        //不剪切
        else {
            if ($ratio >= $resize_ratio) {
                $newimg = imagecreatetruecolor($resize_width, ($resize_width) / $ratio);
                imagecopyresampled($newimg, $im, 0, 0, 0, 0, $resize_width, ($resize_width) / $ratio, $width, $height);
                ImageJpeg($newimg, $dstimg);
            }
            if ($ratio < $resize_ratio) {
                $newimg = imagecreatetruecolor(($resize_height) * $ratio, $resize_height);
                imagecopyresampled($newimg, $im, 0, 0, 0, 0, ($resize_height) * $ratio, $resize_height, $width, $height);
                ImageJpeg($newimg, $dstimg);
            }
        }
        //销毁文件（临时）
        ImageDestroy($im);
    }
}