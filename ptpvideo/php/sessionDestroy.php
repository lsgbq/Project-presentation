<?php
    include_once("DB.php");
    //开启 Session
    session_start();
    $name = $_SESSION['username'];
    $db = new DB();
    //登录数减一
    $db->updateCount($name, 1, "-");
    // 删除所有 Session 变量
    $_SESSION = array();
    //判断 cookie 中是否保存 Session ID
    if(isset($_COOKIE[session_name()])){
        setcookie(session_name(),'',time()-3600, '/');
    }
    //彻底销毁 Session
    session_destroy();
?>