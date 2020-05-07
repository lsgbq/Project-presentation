<?php
/**
 * Created by PhpStorm.
 * User: 蓝 梦
 * Date: 2019/7/18
 * Time: 20:25
 */
    error_reporting(E_ALL^E_NOTICE);
    include_once("SubtitleConversion.php");
    $source = $_POST['source'];
    $videoName = $_POST['videoName'];
    $source = iconv("UTF-8","GBK", $source);
    $videoName = iconv("UTF-8","GBK", $videoName);
    
    //超长路径需要用Robocopy复制
    if(strlen($source) > 260){
        //目标路径
        $destination = dirname(__FILE__)."\\vtt";
        //分离源路径的路径和文件名
        $pathLength = strrpos($source, '/');
        $dir = substr($source, 0, $pathLength);
        //要将/换成\才能让dos识别到路径
        $dir = str_replace("/", "\\", $dir);
        $file = substr($source, $pathLength + 1);
        //Robocopy 源路径 目标路径 文件
        exec("Robocopy \"".$dir."\" \"".$destination."\" \"".$file."\"");
        $source = "./vtt/".$file;
    }

    $tran = new SubtitleConversion();
    $fileOriginalName = $tran->toVtt($source, $videoName);
    echo $fileOriginalName;
?>