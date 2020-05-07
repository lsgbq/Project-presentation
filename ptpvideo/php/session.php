<?php
/**
 * Created by PhpStorm.
 * User: 蓝 梦
 * Date: 2019/7/25
 * Time: 15:01
 */
    include_once("DB.php");
    session_start();
    //已经登录
    if(isset($_SESSION['username'])){
        echo 1;
        return;
    }
    //获取前端传来的用户名和密码
    $name = $_POST['username'];
    $pass = $_POST['password'];
    //读取数据库中的信息
	$db = new DB();
    $array = $db->queryInfo($name);
    //用户名错误
    if($array == 110 || $array == null){
        echo 110;
        return;
    }
    //设置密码，用户类型和登录数
    $password = $array[0][0];
    $userType = $array[0][1];
    $count = $array[0][2];
    //超过最高同时登录数禁止登录
    if($count == 3){
        echo 3;
        return;
    }
    //验证密码
    $isPass = password_verify($pass, $password);
    //密码正确，设置session，修改数据库登录人数
    if($isPass){
        $_SESSION['username'] = $name;
        $_SESSION['usertype'] = $userType;
        $db->updateCount($name, 1, "+");
        echo 1;
    }
    //密码错误
    else
        echo 110;
?>