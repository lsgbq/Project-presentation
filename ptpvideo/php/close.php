<?php
/**
 * Created by PhpStorm.
 * User: 蓝 梦
 * Date: 2019/7/31
 * Time: 21:25
 */
    session_start();
    if(!isset($_SESSION['username'])){
        echo 110;
        return;
    }
    if($_SESSION['usertype'] == "user"){
        echo 0;
        return;
    }
    include_once("DB.php");
    $db = new DB();
    //登录数置0
    $db->updateCount("", "", "", true);
    exec("shutdown -s -t 60  2>&1");
    echo 1;
?>