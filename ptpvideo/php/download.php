<?php
/**
 * Created by PhpStorm.
 * User: 蓝 梦
 * Date: 2019/7/19
 * Time: 8:19
 */
    ini_set("memory_limit",-1);
    error_reporting(E_ALL^E_NOTICE);
    set_time_limit(0);
    $file_dir = $_POST["path"];
    $name = substr($file_dir, strrpos($file_dir, '/') + 1);
    $file_dir = iconv("UTF-8","gbK", $file_dir);
    $f = fopen($file_dir,"rb+");
    $str = fread($f, filesize($file_dir));  // 读取输入流中的数据
    fclose($f);   // 关闭文件
    Header("X-Content-Type-Options: nosniff");
    Header("Content-type: application/octet-stream");
    Header("Accept-Ranges: bytes");
    Header("Content-Length: ".filesize($file_dir));
    Header("Content-Disposition: attachment; filename=".$name);
    ob_clean();
    flush();
    echo $str;
?>