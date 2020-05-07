<?php
/**
 * Created by PhpStorm.
 * User: 蓝 梦
 * Date: 2019/7/17
 * Time: 11:56
 */
    session_start();
    if(!isset($_SESSION['username'])){
        echo 110;
        return;
    }
    exec("wmic LOGICALDISK get name,volumeName",$dir);
    //普通用户隐藏某些盘
    if($_SESSION['usertype'] == "user"){
        $array = Array("J:    !表番", "L:    封印", "M:    Audio and Video");
        for($i=0; $i<count($array); $i++){
            $array[$i] = iconv("UTF-8","GBK", $array[$i]);
        }
        $dir = array_values(array_diff($dir,$array));
    }
    //$i与$j的差别：$i包含命令行给出的所有磁盘，$j去除所有磁盘中的CD驱动器
    for($i=1, $j=0; $i<count($dir)-1; $i++){
        //跳过CD驱动器
        if(strlen($dir[$i]) < 3)
            continue;
		$disk[$j][0] = mb_convert_encoding($dir[$i],"UTF-8","GBK");
		$disk[$j++][1] = "./picture/disk.png";
    }
    echo json_encode($disk);
?>