<?php
    $fileName = $_POST["fileName"];
    $fileName = iconv("UTF-8","GBK", $fileName);
    if(!file_exists("./video/".$fileName.".mp3")){
        exec("ffmpeg -i \"./video/".$fileName.".mp4\" -vn  -acodec libmp3lame -ac 2 -qscale:a 4 -ar 48000  \"./video/".$fileName.".mp3\"");
    }
    echo 1;
?>