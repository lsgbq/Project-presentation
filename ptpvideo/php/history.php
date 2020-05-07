<?php
/**
 * Created by PhpStorm.
 * User: 蓝 梦
 * Date: 2019/7/25
 * Time: 15:01
 */
    session_start();
    if(!isset($_SESSION['username'])){
        echo 110;
        return;
    }
    $path = $_POST['path'];
    $fileArray[]=NULL;
    $pattern_video = "/(swf|flv|mp4|rmvb|avi|mpeg|ra|ram|mov|wmv)/";
    if (false != ($handle = opendir ( $path ))) {
        $i=0;
        while ( false !== ($file = readdir ( $handle )) ) {
            //中文转码
            $file = mb_convert_encoding($file,"UTF-8","GBK");
            //获取后缀
            $fileType = substr($file, strrpos($file, '.') + 1);
            //去掉"“.”、“..”以及带“.xxx”后缀的文件
            if ($file != "." && $file != ".." && strpos($file,".")) {
                if(preg_match($pattern_video, $fileType)){
                    $file = iconv("UTF-8","GBK", $file);
                    //获取文件原始名字
                    $start = strrpos($file, '/');
                    $end = strrpos($file, '.');
                    $fileOriginalName = substr($file, $start, $end-$start);
                    if(file_exists("./vtt/".$fileOriginalName.".vtt"))
                        $fileArray[$i][1]= 1;
                    else
                        $fileArray[$i][1]= 0;
                    $fileOriginalName = iconv("GBK","UTF-8", $fileOriginalName);
                    $fileArray[$i][0]= $fileOriginalName;
                    $fileArray[$i][2] = "[".$fileType."]";
                    $i++;
                }
                if($i==100){
                    break;
                }
            }
        }
        //关闭句柄
        closedir ( $handle );
    }
    echo json_encode($fileArray);