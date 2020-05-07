<?php
/**
 * Created by PhpStorm.
 * User: 蓝 梦
 * Date: 2019/7/20
 * Time: 17:44
 */
    ini_set('max_execution_time','0');
    include_once("LSThumbnail.php");
    session_start();
    if(!isset($_SESSION['username'])){
        echo 110;
        return;
    }
    $subtitle = null;
    $nowDir = $_POST["path"];
    if(isset($_POST["type"]))
        $type = $_POST["type"];
    else
        $type = null;
    if(isset($_POST["subPath"])){
        $subPath = $_POST["subPath"];
        $subPath = iconv("UTF-8","GBK", $subPath);
    }
    else
        $subPath = null;
    //快速转码判断标志
    if(isset($_POST["quick"])){
        if($_POST["quick"] == "true")
            $quick = true;
        else
            $quick = false;
    }
    else
        $quick = false;
    //mp4转码判断标志
    if(isset($_POST["mp4trans"])){
        if($_POST["mp4trans"] == "true")
            $mp4trans = true;
        else
            $mp4trans = false;
    }
    else
        $mp4trans = false;
    //中文转码
    $nowDir = iconv("UTF-8","GBK", $nowDir);
    $ls = new LSThumbnail();
    $ls->main($nowDir, $type, $subPath, $quick, $mp4trans);
?>