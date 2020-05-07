<?php
    session_start();
    if(!isset($_SESSION['username'])){
        echo 110;
        return;
    }
    $type = $_POST['type'];
    //1只删除历史记录，3删除全部使用记录
    if($type == 3){
        deldir("./picture/");
        deldir("./thumb/");
        deldir("./vtt/");
    }
    //设置需要删除的文件夹
    deldir("./video/");
    echo 1;
    //清空文件夹函数和清空文件夹后删除空文件夹函数的处理
    function deldir($path){
        //如果是目录则继续
        if(is_dir($path)){
            //扫描一个文件夹内的所有文件夹和文件并返回数组
            $p = scandir($path);
            foreach($p as $val){
                //排除目录中的.和..
                if($val !="." && $val !=".."){
                    //如果是目录则递归子目录，继续操作
                    if(is_dir($path.$val)){
                        //子目录中操作删除文件夹和文件
                        deldir($path.$val.'/');
                        //目录清空后删除空文件夹
                        @rmdir($path.$val.'/');
                    }else{
                    //如果是文件直接删除
                    unlink($path.$val);
                    }
                }
            }
        }
    }
?>