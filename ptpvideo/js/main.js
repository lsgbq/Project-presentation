(function () {
    var util = {};
    //避免id冲突
    var idNum = 0;
    //2视频，1图片，0目录及不可打开文件
    var type = 0, videoBack = 2;
    //当前位置
    var nowPath = "";
    //当遇到“暂不支持打开此类文件”时的上一级位置
    var oldPath = "";
    //选择字幕时临时存储原路径
    var tempPath = "";
    //视频带字幕转码时存储视频路径
    var videoPath = null;
    var isTran = false;
    //当前播放的视频名称
    var videoName = null;
    //当前显示的图片ID/当前播放的视频ID
    var itemId = null;
    //记录滚动条位置
    var scroll = {data: 0, prior: null};
    //图片总数量，当前图片的位置（第nowImgNum张）
    var imgCount = 0, nowImgNum = 0;
    //强制后退，点击五次取消等待界面
    var forcedRetreat = 4;
    //字幕路径
    var subtitlePath = "";

    //重写浏览器返回方法
    jQuery(document).ready(function () {
        if (window.history && window.history.pushState) {
            $(window).on('popstate', function () {
                window.history.pushState('forward', null, '#');
                window.history.forward(1);
                switch(type){
                    //目录
                    case 0:
                        util.allHide();
                        var $fileDiv = $('#fileDiv');
                        $fileDiv.prop("class", "show");
                        //取/最后出现的位置
                        var lastIndex = nowPath.lastIndexOf("/");
                        if(lastIndex == -1){
                            nowPath = "";
                            util.lsThumb("./php/disk.php", -1);
                        }
                        else{
                            nowPath = nowPath.substring(0, lastIndex);
                            util.lsThumb("./php/ls.php", -1);
                        }
                        break;
                    //图片
                    case 1:
                        util.allHide();
                        var $fileDiv = $('#fileDiv');
                        $fileDiv.prop("class", "show");
                        type = 0;
                        itemId = null;
                        var $imageBox = $('#imageBox');
                        //清空子元素
                        $imageBox.empty();
                        //初始化
                        $imageBox.css("margin-left", "0");
                        $imageBox.css("width", "0");
                        imgCount = 0;
                        nowImgNum = 0;
                        break;
                    //视频返回有时候要按两下才能回到目录并退回到了上一层目录，所以用videoBack计数点两下再回到目录
                    case 2:
                        /*if(videoBack == 2){
                            $('video').trigger('pause');
                            videoBack--;
                        }
                        else{*/
                            videoBack = 2;
                            type = 0;
                            $('video').trigger('pause');
                            util.allHide();
                            var $fileDiv = $('#fileDiv');
                            $fileDiv.prop("class", "show");
                            var $title = $('#title');
                            $title.text("开启观看电脑视频之旅");
                            itemId = null;
                        //}
                        break;
                    //历史
                    case 3:
                        util.allHide();
                        var $fileDiv = $('#fileDiv');
                        $fileDiv.prop("class", "show");
                        type = 0;
                        break;
                    //下载目录
                    case 4:
                        util.allHide();
                        var $fileDiv = $('#fileDiv');
                        $fileDiv.prop("class", "show");
                        //取/最后出现的位置
                        var lastIndex = nowPath.lastIndexOf("/");
                        if(lastIndex == -1){
                            nowPath = "";
                            util.lsDownload("./php/disk.php", -1);
                        }
                        else{
                            nowPath = nowPath.substring(0, lastIndex);
                            util.lsDownload("./php/ls.php", -1);
                        }
                        break;
                    //全屏
                    case 5:
                        util.allHide();
                        var $videoDiv = $('#videoDiv');
                        $videoDiv.prop("class", "show");
                        $videoDiv.css("visibility", "visible");
                        var $botton = $('#botton');
                        $botton.prop("class", "botton");
                        var $fullTbody = $('#fullTbody');
                        $fullTbody.css("height", "80vh");
                        $flagFull = false;
                        type = 2;
                        var $video = $('#video');
                        if(!$video[0].paused){
                            var $pause = $('#pause');
                            $pause.prop("src", "./picture/pause.png");
                            //util.updateTime();
                        }
                        break;
					//字幕
					case 6:
						util.allHide();
                        var $subtitleDiv = $('#subtitleDiv');
                        $subtitleDiv.prop("class", "show");
                        //取/最后出现的位置
                        var lastIndex = nowPath.lastIndexOf("/");
                        if(lastIndex == -1){
                            nowPath = "";
                            util.lsSubt("./php/disk.php", -1);
                        }
                        else{
                            nowPath = nowPath.substring(0, lastIndex);
                            util.lsSubt("./php/ls.php", -1);
                        }
                        break;
                    //带字幕转码
                    case 7:
                        util.allHide();
                        var $fileDiv = $('#fileDiv');
                        $fileDiv.prop("class", "show");
                        //取/最后出现的位置
                        var lastIndex = nowPath.lastIndexOf("/");
                        if(lastIndex == -1){
                            nowPath = "";
                            util.lsTran("./php/disk.php", -1);
                        }
                        else{
                            nowPath = nowPath.substring(0, lastIndex);
                            util.lsTran("./php/ls.php", -1);
                        }
                        break;
                    //转码取消
                    case 8:
                        var $transCodingSel = $('#transCodingSel');
                        $transCodingSel.prop("class", "hide");
                        type = 0;
                        //取/最后出现的位置
                        var lastIndex = nowPath.lastIndexOf("/");
                        nowPath = nowPath.substring(0, lastIndex);
                        break;
                    //等待，禁止操作
                    case 9:
                        forcedRetreat--;
                        if(forcedRetreat == 0){
                            forcedRetreat = 4;
                            type = 0;
                        }
                        break;
                }
            });
        }
        window.history.pushState('forward', null, '#'); //在IE中必须得有这两行
        window.history.forward(1);
    });

    //后台播放回到页面事件
    document.addEventListener('webkitvisibilitychange',function(){
        if(isBackPlay){
            var $video = $('#video');
            var $audio = $('#audio');
            var $video2 = document.getElementById("video");
            var $audio2 = document.getElementById("audio");
            //回到页面
            if(document.webkitVisibilityState != 'hidden'){
                $video2.currentTime = $audio2.currentTime;
                //暂停状态切换出去再切换回来不自动播放
                if(!$audio[0].paused)
                    $video.trigger('play');
            }
        }
    });

    //后台播放回到页面事件
    document.addEventListener('visibilitychange',function(){
        if(isBackPlay){
            var $video = $('#video');
            var $audio = $('#audio');
            var $video2 = document.getElementById("video");
            var $audio2 = document.getElementById("audio");
            //回到页面
            if(document.visibilityState != 'hidden'){
                $video2.currentTime = $audio2.currentTime;
                //暂停状态切换出去再切换回来不自动播放
                if(!$audio[0].paused)
                    $video.trigger('play');
                //回到页面后video会卡顿，延迟一秒重新校准时间，重复五次后不再校准
                util.correctTime();
            }
        }
    });

    //启动定时器
    var correctId = -1;
    var correctCount = 5;
    util.correctTime = function(){
        correctId = setInterval(correctAudioTime, 1000);
    };

    //定时校准时间
    correctAudioTime = function(){
        var $video2 = document.getElementById("video");
        var $audio2 = document.getElementById("audio");
        $audio2.currentTime = $video2.currentTime;
        correctCount--;
        if(correctCount <= 0){
            clearInterval(correctId);
            correctId = -1;
            correctCount = 5;
        }
    };

    //重新校准时间
    var $againTime = $('#againTime');
    $againTime.on('click', function(){
        if(isBackPlay){
            util.correctTime();
        }
    });

    util.allHide=function(){
        var $startDiv = $('#startDiv');
        var $fileDiv = $('#fileDiv');
        var $videoDiv = $('#videoDiv');
        var $wait = $('#wait');
        var $history = $('#history');
        var $imgDiv = $('#imgDiv');
        var $subtitleDiv = $('#subtitleDiv');
        var $function = $('#function');
        var $login = $('#login');
        $startDiv.prop("class", "hide");
        $fileDiv.prop("class", "hide");
        $videoDiv.prop("class", "hide");
        $wait.prop("class", "hide");
        $history.prop("class", "hide");
        $imgDiv.prop("class", "hide");
        $subtitleDiv.prop("class", "hide");
        $function.prop("class", "hide");
        $login.prop("class", "hide");
        var $title = $('#title');
        $title.text("开启观看电脑视频之旅");
        clearInterval(intervalId);
        intervalId = -1;
        var $pause = $('#pause');
        $pause.prop("src", "./picture/start.png");
        type = 0;
    };

    //开始按钮
    var $startButton = $('#startButton');
    $startButton.on('click', function () {
        util.allHide();
        var $login = $('#login');
        $login.prop("class", "login");
    });

    //登录
    var $loginButton = $('#loginButton');
    $loginButton.on('click', function(){
        var $name = $username.val().trim();
        var $pass = $password.val().trim();
        //用户名不能为空
        if($name == ""){
            $username.prop("placeholder", "用户名不能为空");
        }
        //密码不能为空
        else if($pass == ""){
            $password.prop("placeholder", "密码不能为空");
        }
        else{
            var obj = {
                username: $name,
                password: $pass
            };
            $.post("./php/session.php", obj, function (data) {
                if(data == 110){
                    alert("用户名或密码错误");
                }
                else if(data == 3)
                    alert("账号使用中，禁止重复登录");
                else{       
                    util.allHide();
                    var $fileDiv = $('#fileDiv');
                    $fileDiv.prop("class", "show");
                    var $botton = $('#botton');
                    $botton.prop("class", "botton");
                    util.lsThumb("./php/disk.php", 0);
                    scroll = {data: 0, prior: null};
                    return false;
                }
            });
        }
    });

    //退出
    var $logout = $('#logout');
    $logout.on('click', function(){
        $.post('./php/sessionDestroy.php', {why: "why"}, function(){
            alert("退出成功");
            window.location.reload();;
        });
    });

    //用户名设置提示信息
    var $username = $('#username');
    $username.on('click', function(){
        $username.prop("placeholder", "用户名");
    });

    //密码设置提示信息
    var $password = $('#password');
    $password.on('click', function(){
        $password.prop("placeholder", "密码");
    });
	//密码框处按回车登录
	$password.on('keypress', function(event){
		if(event.keyCode == 13)
			$loginButton.trigger("click");
	});

    //显示主页
    var $mainPage = $('#mainPage');
    $mainPage.on('click', function(){
        util.allHide();
        var $fileDiv = $('#fileDiv');
        $fileDiv.prop("class", "show");
        oldPath = "";
        nowPath = "";
        util.lsThumb("./php/disk.php", 0);
        type = 0;
        $('video').trigger('pause');
        videoPath = null;
        isTran = false;
        itemId = null;
        scroll = {data: 0, prior: null};
    });

    //显示功能页
    var $functionPage = $('#functionPage');
    $functionPage.on('click', function(){
        util.allHide();
        $('video').trigger('pause');
        var $function = $('#function');
        $function.prop("class", "show");
        videoPath = null;
        isTran = false;
        itemId = null;
    });

    //关机
    var $closePC = $('#closePC');
    $closePC.on('click', function(){
        $.post("./php/close.php", {why: "why"}, function (data) {
            if(data == 1){
                alert("电脑将在一分钟内关机");
                window.location.href = "about:blank";
            }
            else if(data == 110){
                alert("请先登录");
                window.location.reload();
            }
            else if(data == 0)
                alert("当前用户没有权限");
            else
                alert("电脑关机失败");
        });
    });

    //带字幕转码
    var $transcoding = $('#transcoding');
    $transcoding.on('click', function(){
        util.allHide();
        var $fileDiv = $('#fileDiv');
        $fileDiv.prop("class", "show");
        oldPath = "";
        nowPath = "";
        scroll = {data: 0, prior: null};
        util.lsTran("./php/disk.php", 0);
        type = 7;
        $('video').trigger('pause');
        alert("1、选择视频；2、选择字幕");
    });

    //显示下载页
    var $download = $('#download');
    $download.on('click', function(){
        util.allHide();
        var $fileDiv = $('#fileDiv');
        $fileDiv.prop("class", "show");
        oldPath = "";
        nowPath = "";
        scroll = {data: 0, prior: null};
        util.lsDownload("./php/disk.php", 0);
        type = 4;
        $('video').trigger('pause');
    });

    //说明
    var $explain = $('#explain');
    $explain.on('click', function(){
        alert("注：电量、音量和后台播放功能，Safari不支持");
    });

    //清除历史记录
    var $clearHistory = $('#clearHistory');
    $clearHistory.on('click', function(){
        $.post("./php/deleteRecord.php", {type: 1}, function(data){
            if(data == 1)
                alert("清除成功");
            else if(data == 110){
                alert("请先登录");
                window.location.reload();
            }
            else{
                alert("清除失败");
                //console.log(data);
            }
        });
    });

    //删除使用记录
    var $deleteUseRecode = $('#deleteUseRecode');
    $deleteUseRecode.on('click', function(){
        $.post("./php/deleteRecord.php", {type: 3}, function(data){
            if(data == 1)
                alert("删除成功");
            else if(data == 110){
                alert("请先登录");
                window.location.reload();
            }
            else{
                alert("删除失败");
                //console.log(data);
            }
        });
    });

    //显示历史
    var $historyPage = $('#historyPage');
    $historyPage.on('click', function(){
        util.allHide();
        var $history = $('#history');
        $history.prop("class", "show");
        util.lsHistory("./php/history.php");
        type = 3;
        $('video').trigger('pause');
        videoPath = null;
        isTran = false;
        itemId = null;
    });

    //显示播放页
    var $playPage = $('#playPage');
    $playPage.on('click', function(){
        util.allHide();
        var $videoDiv = $('#videoDiv');
        $videoDiv.prop("class", "show");
        type = 2;
        var $hide = $('#hide');
        var $title = $('#title');
        $title.text($hide.text());
        timeoutId = setTimeout("hideBar()", 5000);
        videoPath = null;
        isTran = false;
        itemId = null;
        util.getSystemInfo();
        //createDiv("video", "./1.ass");
    });

    //选择字幕
    var $subtitle = $('#subtitle');
    $subtitle.on('click', function(){
        util.allHide();
        var $subtitleDiv = $('#subtitleDiv');
        $subtitleDiv.prop("class", "show");
        tempPath = nowPath;
        //oldPath = "";
        //nowPath = "";
		if(nowPath == ""){
			util.lsSubt("./php/disk.php", 0);
            scroll = {data: 0, prior: null};
        }
		else
			util.lsSubt("./php/ls.php");
        type = 6;
        $('video').trigger('pause');
    });

    //控制条切换
    var $isCustomCtrl = true;
    var $controlType = $('#controlType');
    $controlType.on('click', function(){
        var $video = $('#video');
        //当前是自定义控制条，切换到自带控制条
        if($isCustomCtrl){
            $myControls.prop("class", "hide");
            $video.attr("controls", "controls");
            $controlType.text("使用自定义控制条");
            $isCustomCtrl = false;
        }else{
            $myControls.prop("class", "myControls");
            $video.removeAttr("controls");
            $controlType.text("使用原生控制条");
            $isCustomCtrl = true;
        }
    });

    //10bitHevc转8bitx264
    var $10bithevcTo8bitx264 = $('#10bithevcTo8bitx264');
    $10bithevcTo8bitx264.on('click', function(){
        var $hide = $('#hide');
        //修改路径
        oldPath = nowPath;
        nowPath = "./video/" + $hide.text();
        //显示转码选项
        var $transCodingSel = $('#transCodingSel');
        $transCodingSel.prop("class", "show");
        //隐藏快速转码，mp4的快速转码不会改变文件编码方式，转了也白转
        var $fastCode = $('#fastCode');
        $fastCode.prop("class", "hide");
        type = 8;
    });

    //特殊字符转义'->&apos;
    util.escapeHtml = function(srcString) {
        srcString = srcString.replace(new RegExp("'","g"), "&apos;");
        return srcString;
    };

    //特殊字符反转义&apos;->'
    util.reescapeHtml = function(srcString) {
        srcString = srcString.replace(new RegExp("&apos;","g"), "'");
        return srcString;
    };

    /**
     * 显示缩略图
     * scrollBack：1不动，0回到顶端，-1后退
     * quick：true快速转码，false慢速转码
     * isPic：-1上一张图片，1下一张图片，0显示的文件
     * picId：上一张或下一张图片的itemId
     * mp4trans：truemp4转码，falsemp4不转码
     */
    util.lsThumb=function(url, scrollBack = 1, quick = "false", isPic = 0, picId = 0, mp4trans = "false"){
        var obj = {
            path: nowPath,
            quick: quick,
            mp4trans: mp4trans
        };
        //等待
        var $wait = $('#wait');
        if(isPic == 0){
            $wait.prop("class", "show");
            type = 9;
        }
        $.post(url, obj, function (data) {
			//console.log(data);
            if(data == null)
                return;
            data = JSON.parse(data);
            if(data == null)
                return;
            //无法打开
            if(data == 0){
                $wait.prop("class", "hide");
                type = 0;
                nowPath = oldPath;
                alert("暂不支持打开此类文件");
                return;
            }
            else if(data == 260){
                $wait.prop("class", "hide");
                type = 0;
                nowPath = oldPath;
                alert("路径过长无法打开此文件夹");
                return;
            }
            else if(data == 110){
                alert("请先登录");
                window.location.reload();
            }
            //空文件夹
            else if(data[0][0] == "empty"){
                $wait.prop("class", "hide");
                type = 0;
                oldPath = nowPath;
                //清空元素
                var $tbodyDom = $('#fileTbody');
                $tbodyDom.empty();
                //返回上一层后设置滚动条位置
                if(scrollBack == -1){
                    $('#fileTbody').scrollTop(scroll.data);
                    if(scroll.prior != null)
                        scroll = scroll.prior;
                }
            }
            //视频
            else if(data[0] == "video"){
                util.allHide();
                var $videoDiv = $('#videoDiv');
                $videoDiv.prop("class", "show");
                var $video = $('#video');
                $video.prop("src", "./php/video/" + data[1] + ".mp4");
                $video.prop("poster", "./php/video/" + data[1] + ".png");
                $video.prop("volume", "0.2");
                util.updateVolDotPos(0.2, false);
                nowPath = oldPath;
                type = 2;
                var $cnSubt = $('#cnSubt');
                $cnSubt.prop("src", "");
                var $title = $('#title');
                $title.text(data[1] + ".mp4");
                var $hide = $('#hide');
                $hide.text(data[1] + ".mp4");
                util.updateDotPos(0, 1);
                var $nowPro = $('#nowPro');
                $nowPro.text("00:00");
                videoName = data[1];
                if(isBackPlay){
                    isCanPlayAudio = false;
                    $.post("./php/videoToAudio.php", {fileName: data[1]}, function (data){
                        if(data == 1){
                            var $audio = $('#audio');
                            var $hide = $('#hide').text();
                            $hide = $hide.substring(0, $hide.length-1) + "3";
                            $audio.attr("src", "./php/video/" + $hide);
                        }
                    });
                }
                if(scroll.prior != null)
                    scroll = scroll.prior;
                util.getSystemInfo();
            }
            //图片
            else if(data[0] == "picture"){
                data[1] = util.escapeHtml(data[1]);
                nowPath = oldPath;
                type = 1;
                if(scrollBack == 0)
                    scroll = scroll.prior;
                var $imageBox = $('#imageBox');
                //上一张图片
                if(isPic == -1){
                    //动态添加
                    var html = "";
                    html += "<img src='./php/picture/" + data[1] + "' id='image" + picId + "' class='image'/>";
                    imgCount++;
                    $imageBox.css("width", "calc(" + imgCount + "* 100vw)");
                    $imageBox.css("margin-left", "calc(-" + nowImgNum + "* 100vw)");
                    var $image = $('#image' + itemId);
                    $image.before(html);
                }
                //下一张图片
                else if(isPic == 1){
                    //动态添加
                    var html = "";
                    html += "<img src='./php/picture/" + data[1] + "' id='image" + picId + "' class='image'/>";
                    imgCount++;
                    $imageBox.css("width", "calc(" + imgCount + "* 100vw)");
                    $imageBox.css("margin-left", "calc(-" + nowImgNum + "* 100vw)");
                    var $image = $('#image' + itemId);
                    $image.after(html);
                }
                //显示的图片
                else{
                    util.allHide();
                    var $imgDiv = $('#imgDiv');
                    $imgDiv.prop("class", "show");
                    //动态添加
                    var html = "";
                    html += "<img src='./php/picture/" + data[1] + "' id='image" + itemId + "' class='image'/>";
                    imgCount++;
                    $imageBox.css("width", "calc(" + imgCount + "* 100vw)");
                    $imageBox.html(html);
                    //获取前后两张图片
                    util.getPriorNext();
                }
            }
            else{
                $wait.prop("class", "hide");
                type = 0;
                oldPath = nowPath;
                //清空元素
                var $tbodyDom = $('#fileTbody');
                $tbodyDom.empty();
                var html = "";
                //循环添加元素
                idNum++;
                for(var i = 0; i < data.length; i++ ) {
                    if(data[i] == null)
                        continue;
                    data[i][1] = util.escapeHtml(data[i][1]);
                    html +=
                        "<div id='" + idNum + "-" + i + "' class='thumbDiv'>" +
                            "<img class='thumb' src='" + data[i][1] + "' />" +
                            "<div class='thumbText'>";
                    if(data[i].length > 2)
                        html += data[i][2];
                    html += data[i][0] + "</div>" +
                        "</div>";
                }
                $tbodyDom.html(html);
                //为动态添加的按钮绑定事件，绑定需要在元素添加上之后，否则会获取不到
                for(var i=0; i<data.length; i++){
                    if(data[i] == null)
                        continue;
                    if(data[i].length > 2)
                        util.thumbClicked(i, data[i][0], data[i][2]);
                    else
                        util.thumbClicked(i, data[i][0]);
                }
                //返回上一层后设置滚动条位置
                if(scrollBack == -1){
                    $('#fileTbody').scrollTop(scroll.data);
                    if(scroll.prior != null)
                        scroll = scroll.prior;
                }
                //进入下一层
                else if(scrollBack == 0)
                    $('#fileTbody').scrollTop(0);
            }
        });
    };

    //文件点击事件
    util.thumbClicked=function(index, fileName, fileType = null){
        var $detail = $("#" + idNum + "-" + index);
        //点击事件
        $detail.on('click', function(){
            //当前显示的图片或当前播放的视频id，点击的是图片或视频时才有用
            itemId = index;
            util.allHide();
            var $fileDiv = $('#fileDiv');
            $fileDiv.prop("class", "show");
            //修改路径为目录加文件名
            if(nowPath == "")
                nowPath = fileName.substring(0, 2);
            else
                nowPath = nowPath + "/" + fileName;
            //mp4无需转码，rmvb不支持快速转码
            if(fileType != null && (fileType == "[mkv]" || fileType == "[MKV]" || fileType == "[avi]" || fileType == "[AVI]" || fileType == "[flv]" || fileType == "[FLV]")){
                var $transCodingSel = $('#transCodingSel');
                $transCodingSel.prop("class", "show");
                var $fastCode = $('#fastCode');
                $fastCode.prop("class", "codeTransTop");
                type = 8;
                return;
            }
            var nowScroll = {data: $('#fileTbody').scrollTop(), prior: scroll};
            scroll = nowScroll;
            util.lsThumb("./php/ls.php", 0);
        });
        //长按事件
        var longPress ;
        $detail.mousedown(function() {
            longPress = setTimeout(function() {
                if(fileType != null && (fileType == "[mp4]" || fileType == "[MP4]")){
                    //当前显示的图片或当前播放的视频id，点击的是图片或视频时才有用
                    itemId = index;
                    //修改路径为目录加文件名
                    if(nowPath == "")
                        nowPath = fileName.substring(0, 2);
                    else
                        nowPath = nowPath + "/" + fileName;
                    //显示转码选项
                    var $transCodingSel = $('#transCodingSel');
                    $transCodingSel.prop("class", "show");
                    //隐藏快速转码，mp4的快速转码不会改变文件编码方式，转了也白转
                    var $fastCode = $('#fastCode');
                    $fastCode.prop("class", "hide");
                    type = 8;
                }
            }, 2000);
        });
        $detail.mouseup(function() {
            clearTimeout(longPress);
        });
        $detail.mouseout(function() {
            clearTimeout(longPress);
        });
    };

    //快速转码
    var $fastCode = $('#fastCode');
    $fastCode.on('click', function(){
        var $transCodingSel = $('#transCodingSel');
        $transCodingSel.prop("class", "hide");
        util.lsThumb("./php/ls.php", 1, "true");
    });

    //慢速转码
    var $slowCode = $('#slowCode');
    $slowCode.on('click', function(){
        var $transCodingSel = $('#transCodingSel');
        $transCodingSel.prop("class", "hide");
        util.lsThumb("./php/ls.php", 1, "false", 0, 0, "true");
    });

    //取消操作
    var $concel = $('#concel');
    $concel.on('click', function(){
        var $transCodingSel = $('#transCodingSel');
        $transCodingSel.prop("class", "hide");
        type = 0;
        //回退路径为目录
        //取/最后出现的位置
        var lastIndex = nowPath.lastIndexOf("/");
        if(lastIndex == -1){
            nowPath = "";
        }
        else{
            nowPath = nowPath.substring(0, lastIndex);
        }
    });

    //带字幕转码
    util.lsTran=function(url, scrollBack = 1){
        var obj;
        if(videoPath == null || !isTran){
            obj = {
                path: nowPath
            };
        }
        else{
            obj = {
                path: videoPath,
                subPath: nowPath
            };
        }
        //等待
        var $wait = $('#wait');
        $wait.prop("class", "show");
        type = 9;
        $.post(url, obj, function (data) {
            if(data == null)
                return;
            data = JSON.parse(data);
            if(data == null)
                return;
            //无法打开
            if(data == 0){
                $wait.prop("class", "hide");
                type = 0;
                nowPath = oldPath;
                alert("暂不支持打开此类文件");
                return;
            }
            else if(data == 260){
                $wait.prop("class", "hide");
                type = 0;
                nowPath = oldPath;
                alert("路径过长无法打开此文件夹");
                return;
            }
            else if(data == 110){
                alert("请先登录");
                window.location.reload();
            }
            //空文件夹
            else if(data[0][0] == "empty"){
                $wait.prop("class", "hide");
                type = 0;
                oldPath = nowPath;
                //清空元素
                var $tbodyDom = $('#fileTbody');
                $tbodyDom.empty();
                //返回上一层后设置滚动条位置
                if(scrollBack == -1){
                    $('#fileTbody').scrollTop(scroll.data);
                    if(scroll.prior != null)
                        scroll = scroll.prior;
                }
            }
            //视频
            else if(data[0] == "video"){
                util.allHide();
                var $videoDiv = $('#videoDiv');
                $videoDiv.prop("class", "show");
                var $video = $('#video');
                $video.prop("src", "./php/video/" + data[1] + ".mp4");
                $video.prop("poster", "./php/video/" + data[1] + ".png");
                $video.prop("volume", "0.2");
                util.updateVolDotPos(0.2, false);
                nowPath = oldPath;
                type = 2;
                var $cnSubt = $('#cnSubt');
                $cnSubt.prop("src", "");
                var $title = $('#title');
                $title.text(data[1] + ".mp4");
                var $hide = $('#hide');
                $hide.text(data[1] + ".mp4");
                util.updateDotPos(0, 1);
                var $nowPro = $('#nowPro');
                $nowPro.text("00:00");
                videoPath = null;
                isTran = false;
                if(isBackPlay){
                    isCanPlayAudio = false;
                    $.post("./php/videoToAudio.php", {fileName: data[1]}, function (data){
                        if(data == 1){
                            var $audio = $('#audio');
                            var $hide = $('#hide').text();
                            $hide = $hide.substring(0, $hide.length-1) + "3";
                            $audio.attr("src", "./php/video/" + $hide);
                        }
                    });
                }
                scroll = scroll.prior;
            }
            else{
                util.allHide();
                var $fileDiv = $('#fileDiv');
                $fileDiv.prop("class", "show");
                type = 7;
                oldPath = nowPath;
                //清空元素
                var $tbodyDom = $('#fileTbody');
                $tbodyDom.empty();
                var html = "";
                //循环添加元素
                idNum++;
                for(var i = 0; i < data.length; i++ ) {
                    if(data[i] == null)
                        continue;
                    data[i][1] = util.escapeHtml(data[i][1]);
                    html +=
                        "<div id='" + idNum + "-" + i + "' class='thumbDiv'>" +
                        "<img class='thumb' src='" + data[i][1] + "' />" +
                        "<div class='thumbText'>";
                    if(data[i].length > 2)
                        html += data[i][2];
                    html += data[i][0] + "</div>" +
                        "</div>";
                    data[i][1] = util.reescapeHtml(data[i][1]);
                }
                $tbodyDom.html(html);
                //为动态添加的按钮绑定事件，绑定需要在元素添加上之后，否则会获取不到
                for(var i=0; i<data.length; i++){
                    if(data[i] == null)
                        continue;
                    util.tranClicked(i, data[i][0], data[i][1]);
                }
                //返回上一层后设置滚动条位置
                if(scrollBack == -1){
                    $('#fileTbody').scrollTop(scroll.data);
                    if(scroll.prior != null)
                        scroll = scroll.prior;
                }
                //进入下一层
                else if(scrollBack == 0)
                    $('#fileTbody').scrollTop(0);
            }
        });
    };

    //文件点击事件
    util.tranClicked=function(index, fileName, imgType){
        var $detail = $("#" + idNum + "-" + index);
        $detail.on('click', function(){
            if(nowPath == "")
                nowPath = fileName.substring(0, 2);
            else{
                if(videoPath == null){
                    if( fileName.lastIndexOf("mp4") >=0 || fileName.lastIndexOf("MP4") >=0 ||
                        fileName.lastIndexOf("mkv") >=0 || fileName.lastIndexOf("MKV") >=0 ||
                        fileName.lastIndexOf("avi") >=0 || fileName.lastIndexOf("AVI") >=0 ||
                        fileName.lastIndexOf("flv") >=0 || fileName.lastIndexOf("FLV") >=0 ||
                        fileName.lastIndexOf("rmvb") >=0 || fileName.lastIndexOf("RMVB") >=0
                    ){
                        videoPath = nowPath + "/" + fileName;
                        alert("2、选择字幕");
                        return;
                    }
                    nowPath = nowPath + "/" + fileName;
                }
                else if(fileName.lastIndexOf("ass") >=0 || fileName.lastIndexOf("ASS") >=0 ||
                        fileName.lastIndexOf("srt") >=0 || fileName.lastIndexOf("SRT") >=0 ||
                        fileName.lastIndexOf("vtt") >=0 || fileName.lastIndexOf("VTT") >=0 ||
                        fileName.lastIndexOf("ssa") >=0 || fileName.lastIndexOf("SSA") >=0
                ){
                    nowPath = nowPath + "/" + fileName;
                    isTran = true;
                }
                else{
                    if(imgType != "./picture/fold.png"){
                        alert("请选择字幕文件");
                        return;
                    }
                    nowPath = nowPath + "/" + fileName;
                }
            }
            var nowScroll = {data: $('#fileTbody').scrollTop(), prior: scroll};
            scroll = nowScroll;
            util.lsTran("./php/ls.php", 0);
        });
    };

    //显示下载
    util.lsDownload=function(url, scrollBack = 1){
        var obj = {
            path: nowPath,
            type: "download"
        };
        //等待
        var $wait = $('#wait');
        $wait.prop("class", "show");
        type = 9;
        $.post(url, obj, function (data) {
            if(data == null)
                return;
            data = JSON.parse(data);
            if(data == null)
                return;
            //无法打开
            if(data == 0){
                $wait.prop("class", "hide");
                type = 0;
                nowPath = oldPath;
                alert("暂不支持打开此类文件");
                return;
            }
            else if(data == 260){
                $wait.prop("class", "hide");
                type = 0;
                nowPath = oldPath;
                alert("路径过长无法打开此文件夹");
                return;
            }
            else if(data == 110){
                alert("请先登录");
                window.location.reload();
            }
            //空文件夹
            else if(data[0][0] == "empty"){
                $wait.prop("class", "hide");
                type = 0;
                oldPath = nowPath;
                //清空元素
                var $tbodyDom = $('#fileTbody');
                $tbodyDom.empty();
                //返回上一层后设置滚动条位置
                if(scrollBack == -1){
                    $('#fileTbody').scrollTop(scroll.data);
                    if(scroll.prior != null)
                        scroll = scroll.prior;
                }
            }
            //视频
            else if(data[0] == "download"){
                util.allHide();
                var $fileDiv = $('#fileDiv');
                $fileDiv.prop("class", "show");
                nowPath = oldPath;
                var $title = $('#title');
                $title.text(data[1]);
                //window.location.href = "./php/download.php?path=./video/" + data[1];
                var url = "./php/download.php";
                var params = {
                    path: "./video/" + data[1]
                };
                var form = $('<form method="POST" action="' + url + '">');
                $.each(params, function (k, v) {
                    form.append($('<input type="hidden" name="' + k +
                        '" value="' + v + '">'));
                });
                $('body').append(form);
                form.submit();
                scroll = scroll.prior;
                /*$.ajax({
                    type:'POST',
                    url: url,
                    data: params,
                    success: function(response, status, request) {
                        var disp = request.getResponseHeader('Content-Disposition');
                        if (disp && disp.search('attachment') != -1) {
                            var form = $('<form method="POST" action="' + url + '">');
                            $.each(params, function (k, v) {
                                form.append($('<input type="hidden" name="' + k +
                                    '" value="' + v + '">'));
                            });
                            $('body').append(form);
                            form.submit();
                        }
                    }
                });*/
            }
            else{
                $wait.prop("class", "hide");
                type = 4;
                oldPath = nowPath;
                //清空元素
                var $tbodyDom = $('#fileTbody');
                $tbodyDom.empty();
                var html = "";
                //循环添加元素
                idNum++;
                for(var i = 0; i < data.length; i++ ) {
                    if(data[i] == null)
                        continue;
                    data[i][1] = util.escapeHtml(data[i][1]);
                    html +=
                        "<div id='" + idNum + "-" + i + "' class='thumbDiv'>" +
                            "<img class='thumb' src='" + data[i][1] + "' />" +
                            "<div class='thumbText'>";
                    if(data[i].length > 2)
                        html += data[i][2];
                    html += data[i][0] + "</div>" +
                        "</div>";
                }
                $tbodyDom.html(html);
                //为动态添加的按钮绑定事件，绑定需要在元素添加上之后，否则会获取不到
                for(var i=0; i<data.length; i++){
                    if(data[i] == null)
                        continue;
                    util.downloadClicked(i, data[i][0]);
                }
                //返回上一层后设置滚动条位置
                if(scrollBack == -1){
                    $('#fileTbody').scrollTop(scroll.data);
                    if(scroll.prior != null)
                        scroll = scroll.prior;
                }
                //进入下一层
                else if(scrollBack == 0)
                    $('#fileTbody').scrollTop(0);
            }
        });
    };

    //文件点击事件
    util.downloadClicked=function(index, fileName){
        var $detail = $("#" + idNum + "-" + index);
        $detail.on('click', function(){
            util.allHide();
            var $fileDiv = $('#fileDiv');
            $fileDiv.prop("class", "show");
            if(nowPath == "")
                nowPath = fileName.substring(0, 2);
            else
                nowPath = nowPath + "/" + fileName;
            var nowScroll = {data: $('#fileTbody').scrollTop(), prior: scroll};
            scroll = nowScroll;
            util.lsDownload("./php/ls.php", 0);
        });
    };

    //显示历史
    util.lsHistory=function(url){
        var $wait = $('#wait');
        $wait.prop("class", "show");
        type = 9;
        var obj = {
            path: "./video"
        };
        $.post(url, obj, function (data) {
            if(data == null)
                return;
            data = JSON.parse(data);
            if(data == null)
                return;
            $wait.prop("class", "hide");
            if(data == 110){
                alert("请先登录");
                window.location.reload();
            }
            //清空元素
            var $tbodyDom = $('#historyTbody');
            $tbodyDom.empty();
            var html = "";
            //循环添加元素
            idNum++;
            for( var i = 0; i < data.length; i++ ) {
                if(data[i] == null)
                    continue;
                data[i][0] = util.escapeHtml(data[i][0]);
                html +=
                    "<div id='" + idNum + "-" + i + "' class='thumbDiv'>" +
                        "<img class='thumb' src='./php/thumb/" + data[i][0] + ".png' />" +
                        "<div class='thumbText'>";
                if(data[i].length > 2)
                    html += data[i][2];
                html += data[i][0] + "</div>" +
                    "</div>";
                data[i][0] = util.reescapeHtml(data[i][0]);
            }
            $tbodyDom.html(html);
            //为动态添加的按钮绑定事件，绑定需要在元素添加上之后，否则会获取不到
            for(var i=0; i<data.length; i++){
                if(data[i] == null)
                    continue;
                util.historyClicked(i, data[i][0], data[i][1]);
            }
        });
    };

    //文件点击事件
    util.historyClicked=function(index, filename, subtitle){
        var $detail = $("#" + idNum + "-" + index);
        $detail.on('click', function(){
            util.allHide();
            var $videoDiv = $('#videoDiv');
            $videoDiv.prop("class", "show");
            var $video = $('#video');
            $video.prop("src", "./php/video/" + filename + ".mp4");
            $video.prop("poster", "./php/video/" + filename + ".png");
            $video.prop("volume", "0.2");
            util.updateVolDotPos(0.2, false);
            //用true和false无法判断，可能与类型有关，但使用数字就不会受影响
            if(subtitle == 1){
                var $cnSubt = $('#cnSubt');
                $cnSubt.prop("src", "./php/vtt/" + filename + ".vtt");
                subtitlePath = "./php/vtt/" + filename + ".vtt";
            }
            var $title = $('#title');
            $title.text(filename + ".mp4");
            var $hide = $('#hide');
            $hide.text(filename + ".mp4");
            util.updateDotPos(0, 1);
            timeoutId = setTimeout("hideBar()", 5000);
            var $nowPro = $('#nowPro');
            $nowPro.text("00:00");
			type = 2;
			videoName = filename;
            if(isBackPlay){
                isCanPlayAudio = false;
                $.post("./php/videoToAudio.php", {fileName: filename}, function (data){
                    if(data == 1){
                        var $audio = $('#audio');
                        var $hide = $('#hide').text();
                        $hide = $hide.substring(0, $hide.length-1) + "3";
                        $audio.attr("src", "./php/video/" + $hide);
                    }
                });
            }
            util.getSystemInfo();
        });
    };

    //显示字幕
    util.lsSubt=function(url, scrollBack = 1){
        var obj = {
            path: nowPath,
            type : "subtitle"
        };
        //等待
        var $wait = $('#wait');
        $wait.prop("class", "show");
        type = 9;
        $.post(url, obj, function (data) {
            if(data == null)
                return;
            data = JSON.parse(data);
            if(data == null)
                return;
            if(data == 110){
                alert("请先登录");
                window.location.reload();
            }
            //字幕
            if(data == 3){
                util.allHide();
                var $videoDiv = $('#videoDiv');
                $videoDiv.prop("class", "show");
                var $hide = $('#hide');
                var $title = $('#title');
                $title.text($hide.text());
                type = 2;
                var obj = {
                    source: nowPath,
                    videoName: videoName
                };
                $.post("./php/subtitle.php", obj, function(d){
                    var $cnSubt = $('#cnSubt');
                    $cnSubt.prop("src", "./php/vtt/" + d + ".vtt");
                    subtitlePath = "./php/vtt/" + d + ".vtt";
                });
                nowPath = tempPath;
                oldPath = tempPath;
                videoName = null;
                scroll = scroll.prior;
            }
            else if(data == 0){
                $wait.prop("class", "hide");
                type = 0;
                nowPath = oldPath;
                alert("请选择字幕文件");
                scroll = scroll.prior;
                return;
            }
            else if(data == 260){
                $wait.prop("class", "hide");
                type = 0;
                nowPath = oldPath;
                alert("路径过长无法打开此文件夹");
                return;
            }
            //空文件夹
            else if(data[0][0] == "empty"){
                $wait.prop("class", "hide");
                type = 0;
                oldPath = nowPath;
                //清空元素
                var $tbodyDom = $('#fileTbody');
                $tbodyDom.empty();
                //返回上一层后设置滚动条位置
                if(scrollBack == -1){
                    $('#fileTbody').scrollTop(scroll.data);
                    if(scroll.prior != null)
                        scroll = scroll.prior;
                }
            }
            else{
                $wait.prop("class", "hide");
                type = 6;
                oldPath = nowPath;
                //清空元素
                var $tbodyDom = $('#subtitleTbody');
                $tbodyDom.empty();
                var html = "";
                //循环添加元素
                idNum++;
                for(var i = 0; i < data.length; i++ ) {
                    if(data[i] == null)
                        continue;
                    data[i][1] = util.escapeHtml(data[i][1]);
                    html +=
                        "<div id='" + idNum + "-" + i + "' class='thumbDiv'>" +
                            "<img class='thumb' src='" + data[i][1] + "' />" +
                            "<div class='thumbText'>";
                    if(data[i].length > 2)
                        html += data[i][2];
                    html += data[i][0] + "</div>" +
                        "</div>";
                }
                $tbodyDom.html(html);
                //为动态添加的按钮绑定事件，绑定需要在元素添加上之后，否则会获取不到
                for(var i=0; i<data.length; i++){
                    if(data[i] == null)
                        continue;
                    util.subtClicked(i, data[i][0]);
                }
                //返回上一层后设置滚动条位置
                if(scrollBack == -1){
                    $('#fileTbody').scrollTop(scroll.data);
                    if(scroll.prior != null)
                        scroll = scroll.prior;
                }
                //进入下一层
                else if(scrollBack == 0)
                    $('#fileTbody').scrollTop(0);
            }
        });
    };

    //文件点击事件
    util.subtClicked=function(index, fileName){
        var $detail = $("#" + idNum + "-" + index);
        $detail.on('click', function(){
            util.allHide();
            var $subtitleDiv = $('#subtitleDiv');
            $subtitleDiv.prop("class", "show");
            if(nowPath == "")
                nowPath = fileName.substring(0, 2);
            else
                nowPath = nowPath + "/" + fileName;
            var nowScroll = {data: $('#fileTbody').scrollTop(), prior: scroll};
            scroll = nowScroll;
            util.lsSubt("./php/ls.php");
        });
    };

    window.onload = function() {
        //隐藏滚动条
        document.body.parentNode.style.overflowY = "hidden";
        $("body").parent().css("overflow-y","hidden");
        //根据宽高选择背景图片
        $width = $(window).width();
        $height = $(window).height();
        var $loginBg = $('#loginBg');
        if($width > $height){
            $loginBg.prop("src", "./picture/bg3.jpg");
        }
        else{
            $loginBg.prop("src", "./picture/bg.jpg");
        }
        //判断是否已经登录
        $.post('./php/session.php', {why: "why"}, function(data){
            if(data == 1){
                util.allHide();
                var $fileDiv = $('#fileDiv');
                $fileDiv.prop("class", "show");
                var $botton = $('#botton');
                $botton.prop("class", "botton");
                util.lsThumb("./php/disk.php", 0);
                scroll = {data: 0, prior: null};
            }
        });
        // 阻止双击放大
        var lastTouchEnd = 0;
        document.addEventListener('touchstart', function(event) {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        });
        document.addEventListener('touchend', function(event) {
            var now = (new Date()).getTime();
            if (now - lastTouchEnd <= 500) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // 阻止双指放大
        document.addEventListener('gesturestart', function(event) {
            event.preventDefault();
        });
    };

    //ios双击暂停或播放
    var lastTouchEnd = 0;
    var startPosX = 0;
    var startPosY = 0;
    var $myControl = document.getElementById("myControls");
    $myControl.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
        startPosX = event.targetTouches[0].pageX;
        startPosY = event.targetTouches[0].pageY;
        touchFlag = false;
    });
    //var touchendCount = 0;
    $myControl.addEventListener('touchend', function(event) {
        /*touchendCount++;
        //防止三连击导致播放状态变回原本的状态
        if(touchendCount > 2){
            touchendCount = 0;
            return;
        }*/
		// 取消上次延时未执行的方法
		clearTimeout(TimeFn);
        var now = (new Date()).getTime();
        if (now - lastTouchEnd <= 500) {
            if(isTouchMove)
                return;
            event.preventDefault();
            var $video = $('#video');
            if($video[0].paused){
                $video.trigger('play');
                var $pause = $('#pause');
                $pause.prop("src", "./picture/pause.png");
                util.updateTime();
                if(isBackPlay){
                    var $audio = $("#audio");
                    $audio.trigger('play');
                }
            }
            else{
                $video.trigger('pause');
                var $pause = $('#pause');
                $pause.prop("src", "./picture/start.png");
                clearInterval(intervalId);
                intervalId = -1;
                if(isBackPlay){
                    var $audio = $("#audio");
                    $audio.trigger('pause');
                }
            }
        }
        lastTouchEnd = now;
    }, false);

    //滑动屏幕调整时间条，亮度和音量
    var touchFlag = false;
    var isTouchMove = false;
    $myControl.addEventListener('touchmove',function(event){
		event.stopPropagation();
        event.preventDefault();
        //touchmove会连续触发，若已经触发调整时间条则不再重复触发，调整亮度和音量无此限制
        if(!touchFlag){
            var endPosX = event.targetTouches[0].pageX;
            var endPosY = event.targetTouches[0].pageY;
            //X轴变量长度大于Y轴变量长度，调整时间轴
            if(Math.abs(endPosX - startPosX) > Math.abs(endPosY - startPosY)){
                var myControlsWidth = $myControls.width() / 2;
                var myControlsHeight = $myControls.height() / 2;
                //初始化调整时间为0秒
                var changeTime = 0;
                //右(1/2)下(1/2)连续调整时间条，根据开始坐标判断
                if(startPosX > myControlsWidth && startPosY > myControlsHeight){
                    //设置调整时间为5秒
                    var changeTime = 5;
                    touchFlag = false;
                }
                //固定前进或后退
                else{
                    //设置调整时间为5秒
                    var changeTime = 5;
                    touchFlag = true;
                }
                var width = 0;
                //时间条前进5秒
                if((endPosX - startPosX) > width){
                    var $video = document.getElementById("video");
                    var $nowTime = $video.currentTime + changeTime;
                    var $totalTime = $video.duration;
                    if($nowTime > $totalTime)
                        $nowTime = $totalTime;
                    $video.currentTime = $nowTime;
                    var $text = util.showTime($nowTime);
                    var $nowPro = $('#nowPro');
                    $nowPro.text($text);
                }
                //时间条后退5秒
                else if((endPosX - startPosX) < -width){
                    var $video = document.getElementById("video");
                    var $nowTime = $video.currentTime - changeTime;
                    if($nowTime < 0)
                        $nowTime = 0;
                    var $totalTime = $video.duration;
                    $video.currentTime = $nowTime;
                    var $text = util.showTime($nowTime);
                    var $nowPro = $('#nowPro');
                    $nowPro.text($text);
                }
                //修改圆点位置
                util.updateDotPos($nowTime, $totalTime);
                util.setTimeout();
            }
            //X轴变量长度小于Y轴变量长度，调整音量
            else{
                isTouchMove = true;
                //隐藏控制条
                $controlsBar.prop("class", "hide");
                clearInterval(intervalId);
                intervalId = -1;
                $fullScreenBar.prop("class", "hide");
                $volBar.prop("class", "hide");
                var $systemTip = $('#systemTip');
                $systemTip.prop("class", "hide");
                $flagBar = false;
                $speedSelect.prop("class", "hide");
                isShowSpeed = false;
                $customSpeed.prop("class", "hide");
                isShowCustomSpeed = false;
                clearTimeout(timeoutId);
                timeoutId = -1;
                //左调亮度（暂未实现），右调音量
                var $width = $(window).width() / 2;
                var $percent = 1;
                if(endPosY - startPosY > 0)
                    $percent = -1;
                if(startPosX < $width){
                    ;
                    /*var $video = $('#video');
                    var $filter = $video.css("filter");
                    var $oldBright = parseFloatFloat($filter.substring(11, $filter.indexOf(")"))) * 100;
                    var $newBright = Math.round($oldBright + $percent);
                    if($newBright <= 0)
                        $newBright = 0;
                    $video.css("filter", "brightness(" + $newBright + "%) contrast(" + $newBright + "%) saturate(" + $newBright + "%)");
                    $video.css("-webkit-filter", "brightness(" + $newBright + "%) contrast(" + $newBright + "%) saturate(" + $newBright + "%)");
                    var $brightDiv = $('#brightDiv');
                    $brightDiv.prop("class", "brightDiv");
                    var $bright = $('#bright');
                    $bright.prop("src", "./picture/bright.png");
                    var $brightPercent = $('#brightPercent');
                    $brightPercent.text($newBright);*/
                }
                else{
                    //设置调整前的音量
                    var $oldVol = 0;
                    //后台播放获取音频音量（后台播放时视频静音）
                    if(isBackPlay){
                        var $audio = document.getElementById("audio");
                        $oldVol = $audio.volume;
                    }
                    //否则获取视频音量
                    else{
                        var $video = document.getElementById("video");
                        $oldVol = $video.volume;
                    }
                    var $newVol = Math.round($oldVol*100 + $percent);
                    //最小值0
                    if($newVol <= 0)
                        $newVol = 0;
                    //最大值100
                    else if($newVol >= 100)
                        $newVol = 100;
                    //后台播放设置音频音量（后台播放时视频静音）
                    if(isBackPlay){
                        $audio.volume = $newVol/100;
                    }
                    //否则设置视频音量
                    else{
                        $video.volume = $newVol/100;
                    }
                    //修改音量圆点位置
                    util.updateVolDotPos($newVol/100, true, false);
                }
                util.setTimeoutBriVol();
            }
            startPosX = endPosX;
            startPosY = endPosY;
        }
    });

    //设置一次性定时器
    var timeoutBriVolId = -1;
    util.setTimeoutBriVol = function(){
        if(timeoutBriVolId != -1){
            clearTimeout(timeoutBriVolId);
            timeoutBriVolId = -1;
        }
        timeoutBriVolId = setTimeout("hideBriVol()", 1000);
    };
    //定时隐藏亮度/音量图标
    hideBriVol = function(){
        isTouchMove = false;
        var $brightDiv = $('#brightDiv');
        $brightDiv.prop("class", "hide");
        clearTimeout(timeoutBriVolId);
        timeoutBriVolId = -1;
    };

    //ios控制条不执行父div双击事件
    var lastTouchEnd2 = 0;
    document.getElementById("controlsBar").addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
            event.stopPropagation();
        }
    });
    document.getElementById("controlsBar").addEventListener('touchend', function(event) {
        var now = (new Date()).getTime();
        if (now - lastTouchEnd2 <= 500) {
            event.preventDefault();
            event.stopPropagation();
        }
        lastTouchEnd2 = now;
    }, false);
	//ios控制条不执行父div滑动事件
    document.getElementById("controlsBar").addEventListener('touchmove', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
            event.stopPropagation();
        }
		return false;
    });

    //ios全屏按钮不执行父div双击事件
    var lastTouchEnd3 = 0;
    document.getElementById("fullScreenBar").addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
            event.stopPropagation();
        }
    });
    document.getElementById("fullScreenBar").addEventListener('touchend', function(event) {
        var now = (new Date()).getTime();
        if (now - lastTouchEnd3 <= 500) {
            event.preventDefault();
            event.stopPropagation();
        }
        lastTouchEnd3 = now;
    }, false);
	//ios全屏按钮不执行父div滑动事件
    document.getElementById("fullScreenBar").addEventListener('touchmove', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
            event.stopPropagation();
        }
		return false;
    });

    //ios音量条不执行父div双击事件
    var lastTouchEnd4 = 0;
    document.getElementById("volBar").addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
            event.stopPropagation();
        }
    });
    document.getElementById("volBar").addEventListener('touchend', function(event) {
        var now = (new Date()).getTime();
        if (now - lastTouchEnd4 <= 500) {
            event.preventDefault();
            event.stopPropagation();
        }
        lastTouchEnd4 = now;
    }, false);
	//ios音量条不执行父div滑动事件
    document.getElementById("volBar").addEventListener('touchmove', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
            event.stopPropagation();
        }
		return false;
    });

    //控制条不执行父div单击事件
    var $controlsBar = $('#controlsBar');
    $controlsBar.on('click', function(event){
        event.stopPropagation();
    });
    //控制条不执行父div双击事件
    $controlsBar.on('dblclick', function(event){
        event.stopPropagation();
    });

    //全屏不执行父div双击事件
    var $fullScreenBar = $('#fullScreenBar');
    $fullScreenBar.on('dblclick', function(event){
        event.stopPropagation();
    });

    //音量条不执行父div单击事件
    var $volBar = $('#volBar');
    $volBar.on('click', function(event){
        event.stopPropagation();
    });
    //音量条不执行父div双击事件
    $volBar.on('dblclick', function(event){
        event.stopPropagation();
    });

    //双击暂停或播放
    /*
    $myControls.on('dblclick', function(){
        if(isTouchMove)
            return;
        var $video = $('#video');
        if($video[0].paused){
            $video.trigger('play');
            var $pause = $('#pause');
            $pause.prop("src", "./picture/pause.png");
            util.updateTime();
            if(isBackPlay){
                var $audio = $("#audio");
                $audio.trigger('play');
            }
        }
        else{
            $video.trigger('pause');
            var $pause = $('#pause');
            $pause.prop("src", "./picture/start.png");
            clearInterval(intervalId);
            intervalId = -1;
            if(isBackPlay){
                var $audio = $("#audio");
                $audio.trigger('pause');
            }
        }
    });*/

	var TimeFn = null;
    //显示或隐藏自定义控制条
    var $flagBar = true;
    var $myControls = $('#myControls');
    $myControls.on('click', function(){
		// 取消上次延时未执行的方法
		clearTimeout(TimeFn);
		//执行延时
		TimeFn = setTimeout(function(){
			//do function在此处写单击事件要执行的代码
			if($flagBar){
				util.hideControls();
				$flagBar = false;
			}
			else{
				util.showControls();
				$flagBar = true;
			}
		},300);
    });
	
	util.hideControls = function(){
		var $controlsBar = $('#controlsBar');
        var $fullScreenBar = $('#fullScreenBar');
        var $volBar = $('#volBar');
		$controlsBar.prop("class", "hide");
		clearInterval(intervalId);
		intervalId = -1;
		$fullScreenBar.prop("class", "hide");
		$volBar.prop("class", "hide");
		var $systemTip = $('#systemTip');
		$systemTip.prop("class", "hide");
		$speedSelect.prop("class", "hide");
		$customSpeed.prop("class", "hide");
		$backPlayList.prop("class", "hide");
		$functionList.prop("class", "hide");
		var $brightDiv = $('#brightDiv');
		$brightDiv.prop("class", "hide");
		isTouchMove = false;
		isShowFun = false;
		isShowCustomSpeed = false;
		isShowSpeed = false;
		isShowBack = false;
	};
	
	util.showControls = function(){
		var $controlsBar = $('#controlsBar');
        var $fullScreenBar = $('#fullScreenBar');
        var $volBar = $('#volBar');
		var $video = $('#video');
		if(!$video[0].paused){
			util.updateTime();
		}
		$controlsBar.prop("class", "controlsBar");
		$fullScreenBar.prop("class", "controlsFullBar");
		$volBar.prop("class", "volBar");
		var $systemTip = $('#systemTip');
		$systemTip.prop("class", "systemTip");
		var $brightDiv = $('#brightDiv');
		$brightDiv.prop("class", "hide");
		util.setTimeout();
		util.getSystemInfo();
		getNowTime();
	}

    //设置一次性定时器
    var timeoutId = -1;
    util.setTimeout = function(){
        if(timeoutId != -1){
            clearTimeout(timeoutId);
            timeoutId = -1;
        }
        timeoutId = setTimeout("hideBar()", 5000);
    };
    //定时隐藏控制条
    hideBar = function(){
        $controlsBar.prop("class", "hide");
        clearInterval(intervalId);
        intervalId = -1;
        $fullScreenBar.prop("class", "hide");
        $volBar.prop("class", "hide");
        var $systemTip = $('#systemTip');
        $systemTip.prop("class", "hide");
        $flagBar = false;
        $speedSelect.prop("class", "hide");
        isShowSpeed = false;
        $customSpeed.prop("class", "hide");
        var $brightDiv = $('#brightDiv');
        $brightDiv.prop("class", "hide");
        isShowCustomSpeed = false;
        clearTimeout(timeoutId);
        timeoutId = -1;
        $functionList.prop("class", "hide");
        isShowFun = false;
    };

    //控制条暂停键
    var $pause = $('#pause');
    $pause.on('click', function(){
        var $video = $('#video');
        //暂停->播放
        if($video[0].paused){
            $video.trigger('play');
            var $pause = $('#pause');
            $pause.prop("src", "./picture/pause.png");
            util.updateTime();
            if(isBackPlay){
                var $audio = $("#audio");
                $audio.trigger('play');
            }
        }
        //播放->暂停
        else{
            $video.trigger('pause');
            var $pause = $('#pause');
            $pause.prop("src", "./picture/start.png");
            clearInterval(intervalId);
            intervalId = -1;
            if(isBackPlay){
                var $audio = $("#audio");
                $audio.trigger('pause');
            }
        }
        util.setTimeout();
    });

    //显示视频总时长
    showAllTime = function(){
        var $video = document.getElementById("video");
        var $totalTime = $video.duration;
        var $morePro = $('#morePro');
        isOneH = false;
        var $text = util.showTime($totalTime);
        $morePro.text($text);
    };

    var isOneH = false;
    //显示进度条时间
    util.showTime = function($time){
        var m = Math.floor($time / 60);
        var s = Math.floor($time % 60);
        var h = Math.floor(m / 60);
        m = Math.floor(m % 60);
        //按照指定长度为数字前面补零
        //(Array(length).join('0') + $num).slice(-length)
        m = (Array(2).join('0') + m).slice(-2);
        s = (Array(2).join('0') + s).slice(-2);
        if(h > 0 || isOneH){
            isOneH = true;
            h = (Array(2).join('0') + h).slice(-2);
            return h + ":" + m + ":" + s;
        }
        else{
            return m + ":" + s;
        }
    };

    //启动重复定时器
    var intervalId = -1;
    util.updateTime = function(){
        if(intervalId != -1){
            clearInterval(intervalId);
            intervalId = -1;
        }
        intervalId = setInterval(getNowTime, 1000);
    };

    //定时修改时间条
    getNowTime = function(){
        var $video = document.getElementById("video");
        var $nowTime = $video.currentTime;
        var $totalTime = $video.duration;
        var $text = util.showTime($nowTime);
        var $nowPro = $('#nowPro');
        $nowPro.text($text);
        //修改圆点位置
        util.updateDotPos($nowTime, $totalTime, false);
    };

    //后退15秒
    var $progressBack = $('#progressBack');
    $progressBack.on('click', function(){
        var $video = document.getElementById("video");
        var $nowTime = $video.currentTime - 15;
        if($nowTime < 0)
            $nowTime = 0;
        var $totalTime = $video.duration;
        $video.currentTime = $nowTime;
        var $text = util.showTime($nowTime);
        var $nowPro = $('#nowPro');
        $nowPro.text($text);
        //修改圆点位置
        util.updateDotPos($nowTime, $totalTime);
        util.setTimeout();
    });

    //前进15秒
    var $progressPre = $('#progressPre');
    $progressPre.on('click', function(){
        var $video = document.getElementById("video");
        var $nowTime = $video.currentTime + 15;
        var $totalTime = $video.duration;
        if($nowTime > $totalTime)
            $nowTime = $totalTime;
        $video.currentTime = $nowTime;
        var $text = util.showTime($nowTime);
        var $nowPro = $('#nowPro');
        $nowPro.text($text);
        //修改圆点位置
        util.updateDotPos($nowTime, $totalTime);
        util.setTimeout();
    });

    //点击进度条修改时间
    var $progress = $('#progress');
    $progress.on('click', function(e){
        var x = $progress.offset().left;
        var pointX = e.pageX - x;
        var width = $progress.width();
        var percent = pointX / width;
        var $video = document.getElementById("video");
        var $totalTime = $video.duration;
        var $nowTime = $totalTime * percent;
        $video.currentTime = $nowTime;
        var $text = util.showTime($nowTime);
        var $nowPro = $('#nowPro');
        $nowPro.text($text);
        util.updateDotPos($nowTime, $totalTime);
        util.setTimeout();
    });

    //点击进度条修改时间
    var $oldProgress = $('#oldProgress');
    $oldProgress.on('click', function(e){
        var x = $progress.offset().left;
        var pointX = e.pageX - x;
        var width = $progress.width();
        var percent = pointX / width;
        var $video = document.getElementById("video");
        var $totalTime = $video.duration;
        var $nowTime = $totalTime * percent;
        $video.currentTime = $nowTime;
        var $text = util.showTime($nowTime);
        var $nowPro = $('#nowPro');
        $nowPro.text($text);
        util.updateDotPos($nowTime, $totalTime);
        util.setTimeout();
    });

    //进度条拖动
    var $dot = document.getElementById("dot");
    $dot.addEventListener('touchmove',function(e){
        e.preventDefault();
        var x = $progress.offset().left;
        var pointX = e.targetTouches[0].pageX - x;
        var width = $progress.width();
        var percent = pointX / width;
        if(percent < 0)
            percent = 0;
        else if(percent > 1)
            percent = 1;
        var $video = document.getElementById("video");
        var $totalTime = $video.duration;
        var $nowTime = $totalTime * percent;
        $video.currentTime = $nowTime;
        var $text = util.showTime($nowTime);
        var $nowPro = $('#nowPro');
        $nowPro.text($text);
        util.updateDotPos($nowTime, $totalTime);
        util.setTimeout();
    });
    
    //修改圆点位置
    util.updateDotPos = function($nowTime, $totalTime, isChange = true){
        if(isBackPlay && isChange){
            var $video = document.getElementById("video");
            var $audio = document.getElementById("audio");
            $audio.currentTime = $video.currentTime;
            //延迟一秒重新校准时间，重复五次后不再校准
            util.correctTime();
        }
        var $progress = $('#progress');
        var $width = parseFloat($progress.css("width"));
        $width = $width / $(window).width();
        var percent = $nowTime / $totalTime;
        if(percent == 1)
            $pause.prop("src", "./picture/start.png");
        var $dot = $('#dot');
        $dot.css("margin-left", "calc(" + percent + " * " + $width + "* 100vw)");
        var $oldProgress = $('#oldProgress');
        $oldProgress.css("width", "calc(" + percent + " * " + $width + "* 100vw)");
    };

    //显示隐藏功能列表
    var isShowFun = false;
    var $funcDiv = $('#funcDiv');
    var $functionList = $('#functionList');
    $funcDiv.on('click', function(){
        var $listHead = $('#listHead');
        if(isShowFun){
            $functionList.prop("class", "hide");
            $backPlayList.prop("class", "hide");
            isShowFun = false;
            isShowSpeed = false;
            isShowBack = false;
        }
        else{
            $speedSelect.prop("class", "hide");
            $functionList.prop("class", "functionList");
            $listHead.prop("class", "listHead");
            isShowFun = true;
        }
        clearTimeout(timeoutId);
        timeoutId = -1;
    });

    //阻止事件冒泡
    var $listHead = $('#listHead');
    $listHead.on('click', function(event){
        event.stopPropagation();
    });

    //显示隐藏后台播放列表
    var isShowBack = false;
    var $backstage = $('#backstage');
    $backstage.on('click', function(){
        if(isShowBack){
            $backPlayList.prop("class", "hide");
            isShowBack = false;
        }
        else{
            var $listHead = $('#listHead');
            $listHead.prop("class", "hide");
            $backPlayList.prop("class", "backPlay");
            isShowBack = true;
        }
    });

    //阻止事件冒泡
    var $backPlayList = $('#backPlayList');
    $backPlayList.on('click', function(event){
        event.stopPropagation();
    });

    //后台播放
    var isBackPlay = false;
    var $backPlay = $('#backPlay');
    $backPlay.on('click', function(){
        if(isBackPlay){
            $backPlay.text("□后台播放");
            var $video = document.getElementById("video");
            var $audio = document.getElementById("audio");
            $video.volume = $audio.volume;
            $audio.volume = 0;
            $('#audio').trigger('pause');
            isBackPlay = false;
        }
        else{
            $backPlay.text("☑后台播放");
            var $hide = $('#hide').text();
            $hide = $hide.substring(0, $hide.length-4);
            if(!isCanPlayAudio){
                $.post("./php/videoToAudio.php", {fileName: $hide}, function (data){
                    if(data == 1){
                        var $audio = $('#audio');
                        var $hide = $('#hide').text();
                        $hide = $hide.substring(0, $hide.length-1) + "3";
                        $audio.attr("src", "./php/video/" + $hide);
                    }
                });
            }
            else{
                var $video = $('#video');
                var $audio = $('#audio');
                var $video2 = document.getElementById("video");
                var $audio2 = document.getElementById("audio");
                $audio2.volume = $video2.volume;
                $video2.volume = 0;
                $audio2.currentTime = $video2.currentTime;
                if(!$video[0].paused)
                    $audio.trigger('play');
            }
            isBackPlay = true;
        };
    });

    //显示或隐藏字幕
    var isShowSubtitle = true;
    var $subtitleShow = $('#subtitleShow');
    $subtitleShow.on('click', function(){
        //显示字幕->隐藏字幕
        if(isShowSubtitle){
            $video.textTracks[0].mode = 'hidden';
            $subtitleShow.text("□字　　幕");
            isShowSubtitle = false;
        }
        //隐藏字幕->显示字幕
        else{
            video.textTracks[0].mode = 'showing';
            $subtitleShow.text("☑字　　幕");
            isShowSubtitle = true;
        }
    });

    //显示隐藏速度列表
    var isShowSpeed = false;
    var $speed = $('#speed');
    $speed.on('click', function(){
        if(isShowSpeed){
            $speedSelect.prop("class", "hide");
            isShowSpeed = false;
        }
        else{
            var $listHead = $('#listHead');
            $listHead.prop("class", "hide");
            $speedSelect.prop("class", "speed");
            isShowSpeed = true;
        }
    });

    //阻止事件冒泡
    var $speedSelect = $('#speedSelect');
    $speedSelect.on('click', function(event){
        event.stopPropagation();
    });

    //显示隐藏自定义速度div
    var isShowCustomSpeed = false;
    var $speedX = $('#speedX');
    $speedX.on('click', function(){
        if(isShowCustomSpeed){
            $customSpeed.prop("class", "hide");
            isShowCustomSpeed = false;
        }
        else{
            $customSpeed.prop("class", "speedX");
            isShowCustomSpeed = true;
        }

    });
    
    //阻止事件冒泡
    var $customSpeed = $('#customSpeed');
    $customSpeed.on('click', function(event){
        event.stopPropagation();
    });

    var $speedXText = $('#speedXText');
    $speedXText.on('click', function(){
        $speedXText.removeAttr("placeholder");
    });

    //设置播放速度为自定义倍
    var $speedSubmit = $('#speedSubmit');
    $speedSubmit.on('click', function(){
        var $spd = $speedXText.val();
        $video.playbackRate = $spd;
        if(isBackPlay){
            $audio = document.getElementById("audio");
            $audio.playbackRate = $spd;
        }
        $speedXText.attr("placeholder", $spd);
        $globalSpeedX = $spd;
        $speedXText.val("");
        util.setTimeout();
        util.setColor();
        $speedX.css("color", "red");
    });

    //设置播放速度为0.5倍
    var $speed05 = $('#speed05');
    $speed05.on('click', function(){
        $video.playbackRate = 0.5;
        if(isBackPlay){
            $audio = document.getElementById("audio");
            $audio.playbackRate = 0.5;
        }
        $speedXText.attr("placeholder", "0.5");
        $globalSpeedX = 0.5;
        util.setTimeout();
        util.setColor();
        $speed05.css("color", "red");
    });
    
    //设置播放速度为0.7倍
    var $speed07 = $('#speed07');
    $speed07.on('click', function(){
        $video.playbackRate = 0.7;
        if(isBackPlay){
            $audio = document.getElementById("audio");
            $audio.playbackRate = 0.7;
        }
        $speedXText.attr("placeholder", "0.7");
        $globalSpeedX = 0.7;
        util.setTimeout();
        util.setColor();
        $speed07.css("color", "red");
    });
    
    //设置播放速度为1.0倍
    var $speed10 = $('#speed10');
    $speed10.css("color", "red");
    $speed10.on('click', function(){
        $video.playbackRate = 1.0;
        if(isBackPlay){
            $audio = document.getElementById("audio");
            $audio.playbackRate = 1.0;
        }
        $speedXText.attr("placeholder", "1.0");
        $globalSpeedX = 1.0;
        util.setTimeout();
        util.setColor();
        $speed10.css("color", "red");
    });
    
    //设置播放速度为1.2倍
    var $speed12 = $('#speed12');
    $speed12.on('click', function(){
        $video.playbackRate = 1.2;
        if(isBackPlay){
            $audio = document.getElementById("audio");
            $audio.playbackRate = 1.2;
        }
        $speedXText.attr("placeholder", "1.2");
        $globalSpeedX = 1.2;
        util.setTimeout();
        util.setColor();
        $speed12.css("color", "red");
    });
    
    //设置播放速度为1.5倍
    var $speed15 = $('#speed15');
    $speed15.on('click', function(){
        $video.playbackRate = 1.5;
        if(isBackPlay){
            $audio = document.getElementById("audio");
            $audio.playbackRate = 1.5;
        }
        $speedXText.attr("placeholder", "1.5");
        $globalSpeedX = 1.5;
        util.setTimeout();
        util.setColor();
        $speed15.css("color", "red");
    });
    
    //设置播放速度为1.7倍
    var $speed17 = $('#speed17');
    $speed17.on('click', function(){
        $video.playbackRate = 1.7;
        if(isBackPlay){
            $audio = document.getElementById("audio");
            $audio.playbackRate = 1.7;
        }
        $speedXText.attr("placeholder", "1.7");
        $globalSpeedX = 1.7;
        util.setTimeout();
        util.setColor();
        $speed17.css("color", "red");
    });
    
    //设置播放速度为2.0倍
    var $speed20 = $('#speed20');
    $speed20.on('click', function(){
        $video.playbackRate = 2.0;
        if(isBackPlay){
            $audio = document.getElementById("audio");
            $audio.playbackRate = 2.0;
        }
        $speedXText.attr("placeholder", "2.0");
        $globalSpeedX = 2.0;
        util.setTimeout();
        util.setColor();
        $speed20.css("color", "red");
    });

    //设置速度div颜色
    util.setColor = function(){
        $speedSelect.children("div").css("color", "white");
    };

    //播放速度设置始终生效
    var $globalSpeedX = 1.0;
    var isGlobal = false;
    var $globalSpeed = $('#globalSpeed');
    $globalSpeed.on('click', function(){
        if(isGlobal){
            $globalSpeed.text("□全局");
            isGlobal = false;
        }
        else{
            $globalSpeed.text("☑全局");
            isGlobal = true;
        }
    });

    //视频加载完成事件
    var $videoCanPlay = document.getElementById("video");
    $videoCanPlay.addEventListener('canplaythrough', function() {
        //显示视频总时长
        showAllTime();
        //播放速度设置始终生效
        if(isGlobal){
            $videoCanPlay.playbackRate = $globalSpeedX;
        }
        //恢复到1.0倍速
        else{
            util.setColor();
            $speed10.css("color", "red");
        }
        //默认将mp4转成mp3
        var $hide = $('#hide').text();
        $hide = $hide.substring(0, $hide.length-4);
        $.post("./php/videoToAudio.php", {fileName: $hide}, function (){});
    });

    //音频加载完成事件
    var isCanPlayAudio = false;
    var $audioCanPlay = document.getElementById("audio");
    $audioCanPlay.addEventListener('canplaythrough', function() {
        if(isCanPlayAudio)
            return;
        var $video = $('#video');
        //var $audio = $('#audio');
        var $video2 = document.getElementById("video");
        var $audio2 = document.getElementById("audio");
        $audio2.volume = $video2.volume;
        $video2.volume = 0;
        $audio2.currentTime = $video2.currentTime;
        if(!$video[0].paused){
            //暂停视频
            $video.trigger('pause');
            var $pause = $('#pause');
            $pause.prop("src", "./picture/start.png");
            clearInterval(intervalId);
            intervalId = -1;
            //显示控制条
            $controlsBar.prop("class", "controlsBar");
            $fullScreenBar.prop("class", "controlsFullBar");
            $volBar.prop("class", "volBar");
            var $systemTip = $('#systemTip');
            $systemTip.prop("class", "systemTip");
            var $brightDiv = $('#brightDiv');
            $brightDiv.prop("class", "hide");
            $flagBar = true;
            util.setTimeout();
            util.getSystemInfo();
            //$audio.trigger('play');
            //getNowTime();
            //util.updateTime();
        }
        isCanPlayAudio = true;
    });

    //音量图标
    var $volImg = $('#volImg');
    var $volume = 0;
    $volImg.on('click', function(){
        var $video = document.getElementById("video");
        //回复原来的音量
        if($video.volume == 0){
            util.updateVolDotPos($volume);
            $video.volume = $volume;
            if(isBackPlay){
                $video.volume = 0; 
                var $audio = document.getElementById("audio");
                $audio.volume = $volume;
            }
        }
        //静音
        else{
            $volume = $video.volume;
            $video.volume = 0;
            util.updateVolDotPos(0);
            if(isBackPlay){
                var $audio = document.getElementById("audio");
                $audio.volume = 0;
            }
        }
        util.setTimeout();
    });

    //点击音量条修改音量
    var $volAllProgress = $('#volAllProgress');
    $volAllProgress.on('click', function(e){
        var x = $volAllProgress.offset().left;
        var pointX = e.pageX - x;
        var width = $volAllProgress.width();
        var percent = pointX / width;
        var $video = document.getElementById("video");
        $video.volume = percent;
        util.updateVolDotPos(percent);
        util.setTimeout();
    });

    //点击音量条修改音量
    var $volNowProgress = $('#volNowProgress');
    $volNowProgress.on('click', function(e){
        var x = $volAllProgress.offset().left;
        var pointX = e.pageX - x;
        var width = $volAllProgress.width();
        var percent = pointX / width;
        var $video = document.getElementById("video");
        $video.volume = percent;
        util.updateVolDotPos(percent);
        util.setTimeout();
    });

    //音量条拖动
    var $volDot = document.getElementById("volDot");
    $volDot.addEventListener('touchmove',function(e){
        e.preventDefault();
        e.stopPropagation();
        var x = $volAllProgress.offset().left;
        var pointX = e.targetTouches[0].pageX - x;
        var width = $volAllProgress.width();
        var percent = pointX / width;
        if(percent < 0)
            percent = 0;
        else if(percent > 1)
            percent = 1;
        var $video = document.getElementById("video");
        $video.volume = percent;
        util.updateVolDotPos(percent);
        util.setTimeout();
    });

    //修改音量圆点位置
    util.updateVolDotPos = function($volume, isShowIcon = true, isHaveBar = true){
        if(isBackPlay){
            var $video = document.getElementById("video");
            $video.volume = 0; 
            var $audio = document.getElementById("audio");
            $audio.volume = $volume;
        }
        var $volAllProgress = $('#volAllProgress');
        var $width = parseFloat($volAllProgress.css("width")) / $(window).width();
        var $volDot = $('#volDot');
        $volDot.css("margin-left", "calc(25/260 * 28vw - 1vw + " + $volume + " * " + $width + "* 100vw)");
        var $volNowProgress = $('#volNowProgress');
        $volNowProgress.css("width", "calc(" + $volume + " * " + $width + "* 100vw)");
        //修改音量图标
        var $bright = $('#bright');
        if($volume > 0.75){
            $bright.prop("src", "./picture/maxVolume.png");
            $volImg.prop("src", "./picture/maxVolume.png");
        }
        else if($volume > 0.5){
            $bright.prop("src", "./picture/modVolume.png");
            $volImg.prop("src", "./picture/modVolume.png");
        }
        else if($volume > 0.25){
            $bright.prop("src", "./picture/lowVolume.png");
            $volImg.prop("src", "./picture/lowVolume.png");
        }
        else if($volume > 0){
            $bright.prop("src", "./picture/minVolume.png");
            $volImg.prop("src", "./picture/minVolume.png");
        }
        else{
            $bright.prop("src", "./picture/mute.png");
            $volImg.prop("src", "./picture/mute.png");
        }
        //显示屏幕中间音量图标
        if(isShowIcon){
            var $brightDiv = $('#brightDiv');
            $brightDiv.prop("class", "brightDiv");
            var $brightPercent = $('#brightPercent');
            $brightPercent.text(parseInt($volume*100));
            //存在控制条
            if(isHaveBar){
                $brightDiv.css("margin", "calc(-1080/1920 * 47vw - 10vw) 0 0 40vw");
            }
            //不存在控制条
            else{
                $brightDiv.css("margin", "calc(1080/1920 * 50vw - 10vw) 0 0 40vw");
            }
        }
    };

    //列表播放
    isListPlay = false;
    var $listPlay = $('#listPlay');
    $listPlay.on('click', function(){
        if(isListPlay){
            $listPlay.text("□列表播放");
            isListPlay = false;
        }
        else{
            $listPlay.text("☑列表播放");
            isListPlay = true;
        }
        util.setTimeout();
    });

    //视频播放完成事件，自动播放下一视频，返回后取消自动播放
    var $video = document.getElementById("video");
    $video.onended = function(){
        if(itemId == null || !isListPlay)
            return;
        //当前视频ID
        itemId = parseInt(itemId);
        itemId = itemId + 1;
        var $last = $("#" + idNum + "-" + itemId);
        while($last.length > 0){
            var $fileName = $last.children("div").text();
            //文件名[xxx]xxxx，要去除[xxx]
            var firstIndex = $fileName.indexOf("]");
            $fileName = $fileName.substring(firstIndex + 1);
            if ($fileName.lastIndexOf("mp4") >= 0 || $fileName.lastIndexOf("MP4") >= 0) {
                nowPath = nowPath + "/" + $fileName;
                var obj = {
                    path: nowPath
                };
                $.post("./php/ls.php", obj, function (data) {
                    if (data == null)
                        return;
                    data = JSON.parse(data);
                    if (data == null)
                        return;
                    if (data[0] == "video") {
                        var $video = $('#video');
                        $video.prop("src", "./php/video/" + data[1] + ".mp4");
                        nowPath = oldPath;
                        type = 2;
                        var $cnSubt = $('#cnSubt');
                        $cnSubt.prop("src", "");
                        var $title = $('#title');
                        $title.text(data[1] + ".mp4");
                        var $hide = $('#hide');
                        $hide.text(data[1] + ".mp4");
                        util.updateDotPos(0, 1);
                        var $nowPro = $('#nowPro');
                        $nowPro.text("00:00");
                        videoName = data[1];
                        $video.trigger('play');
                        var $pause = $('#pause');
                        $pause.prop("src", "./picture/pause.png");
                        if(isBackPlay){
                            isCanPlayAudio = false;
                            $.post("./php/videoToAudio.php", {fileName: data[1]}, function (data){
                                if(data == 1){
                                    var $audio = $('#audio');
                                    var $hide = $('#hide').text();
                                    $hide = $hide.substring(0, $hide.length-1) + "3";
                                    $audio.attr("src", "./php/video/" + $hide);
                                }
                            });
                        }
                    }
                });
                break;
            }
            itemId = itemId + 1;
            $last = $("#" + idNum + "-" + itemId);
        }
    };

    //全屏
    var $flagFull = false;
    $fullScreenBar.on('click', function(event){
        event.stopPropagation();
        var u = navigator.userAgent;
        //苹果手机，伪全屏
        if(u.indexOf('iPhone') > -1){
            //退出全屏
            if($flagFull){
                util.allHide();
                var $videoDiv = $('#videoDiv');
                $videoDiv.prop("class", "show");
                $videoDiv.css("visibility", "visible");
                var $botton = $('#botton');
                $botton.prop("class", "botton");
                var $fullTbody = $('#fullTbody');
                $fullTbody.css("height", "80vh");
                $flagFull = false;
                type = 2;
                var $video = $('#video');
                if(!$video[0].paused){
                    var $pause = $('#pause');
                    $pause.prop("src", "./picture/pause.png");
                    //util.updateTime();
                }
            }
            //全屏
            else{
                util.allHide();
                var $botton = $('#botton');
                $botton.prop("class", "hide");
                var $videoDiv = $('#videoDiv');
                $videoDiv.prop("class", "show");
                $videoDiv.css("visibility", "hidden");
                var $videoAndControls = $('#videoAndControls');
                $videoAndControls.css("visibility", "visible");
                var $fullTbody = $('#fullTbody');
                $fullTbody.css("height", "100vh");
                $flagFull = true;
                type = 5;
                var $video = $('#video');
                if(!$video[0].paused){
                    var $pause = $('#pause');
                    $pause.prop("src", "./picture/pause.png");
                    //util.updateTime();
                }
            }
            util.setTimeout();
        }
        //其他，div全屏
        else{
            var isFull=!!(document.webkitIsFullScreen || document.mozFullScreen ||
                document.msFullscreenElement || document.fullscreenElement
            );
            //进入全屏
            if (isFull==false) {
                var element = document.getElementById('videoAndControls');
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                }
                type = 5;
                var $video = $('#video');
                if(!$video[0].paused){
                    var $pause = $('#pause');
                    $pause.prop("src", "./picture/pause.png");
                    //util.updateTime();
                }
            }
            //退出全屏
            else{
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
                type = 2;
                var $video = $('#video');
                if(!$video[0].paused){
                    var $pause = $('#pause');
                    $pause.prop("src", "./picture/pause.png");
                    //util.updateTime();
                }
            }
            util.setTimeout();
        }
    });

    //滑动切换图片
    var startPos = 0;
    var picTouchFlag = false;
    var $imageDiv = document.getElementById("imgDiv");
    $imageDiv.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
        startPos = event.targetTouches[0].pageX;
        picTouchFlag = false;
    });
    //小幅度修改图片显示位置
    $imageDiv.addEventListener('touchmove', function(event) {
        event.preventDefault();
        if(itemId == null)
            return;
        //当前图片ID
        itemId = parseInt(itemId);
        var tempId = itemId;
        var endPos = event.targetTouches[0].pageX;
        //向右滑，同时显示当前图片和上一张图片
        if((endPos - startPos) > 0){
            //大于0则有上一张
            if(nowImgNum > 0){
                //显示上一张
                var $imageBox = $('#imageBox');
                var $imageWidth = $('#image' + itemId).width();
                $imageBox.css('margin-left', -nowImgNum * $imageWidth + (endPos - startPos));
            }
        }
        //向左滑，同时显示当前图片和下一张图片
        else if((endPos - startPos) < 0){
            tempId = itemId + 1;
            var $last = $("#" + idNum + "-" + tempId);
            if(imgCount > (nowImgNum + 1)){
                //显示下一张
                var $imageBox = $('#imageBox');
                var $imageWidth = $('#image' + itemId).width();
                $imageBox.css('margin-left', -nowImgNum * $imageWidth + (endPos - startPos));
            }
        }
    }, false);
    //切换图片
    $imageDiv.addEventListener('touchend', function(event) {
        if(itemId == null)
            return;
        if(!picTouchFlag){
            //当前图片ID
            itemId = parseInt(itemId);
            var tempId = itemId;
            var endPos = event.changedTouches[0].pageX;
            var width = $(window).width() / 2;
            //向右滑，上一张图片
            if((endPos - startPos) > width){
                var $priorNode = $("#" + idNum + "-" + tempId).prev();
                //已经存在上一元素
                if($priorNode.length > 0){
                    //获取上一元素的id
                    tempId = parseInt($priorNode.attr("id").match(/\d+/g)[1]);
                    //将当前id设为上一元素id
                    itemId = tempId;
                    //以上一元素为起点寻找上上一元素
                    while((tempId = tempId - 1) > 0){
                        var $last = $("#" + idNum + "-" + tempId);
                        var $fileName = $last.children("div").text();
                        //文件名[xxx]xxxx，要去除[xxx]
                        var firstIndex = $fileName.indexOf("]");
                        $fileName = $fileName.substring(firstIndex + 1);
                        if($fileName.lastIndexOf("jpg") >=0 || $fileName.lastIndexOf("JPG") >=0 ||
                            $fileName.lastIndexOf("png") >=0 || $fileName.lastIndexOf("PNG") >=0 ||
                            $fileName.lastIndexOf("gif") >=0 || $fileName.lastIndexOf("GIF") >=0 ||
                            $fileName.lastIndexOf("jpeg") >=0 || $fileName.lastIndexOf("JPEG") >=0
                        ){
                            var $priorImg = $("#image" + tempId);
                            if($priorImg.length <= 0){
                                nowImgNum++;
                                nowPath = nowPath + "/" + $fileName;
                                util.lsThumb("./php/ls.php", 1, "false", -1, tempId);
                            }
                            break;
                        }
                    }
                    //显示上一张
                    nowImgNum--;
                    var $imageBox = $('#imageBox');
                    var $imageWidth = $('#image' + itemId).width();
                    $imageBox.animate({'margin-left':-nowImgNum * $imageWidth});
                }
                startPos = 0;
                picTouchFlag = true;
            }
            //向左滑，下一张图片
            else if((endPos - startPos) < -width){
                var $nextNode = $("#" + idNum + "-" + tempId).next();
                //已经存在下一元素
                if($nextNode.length > 0){
                    //获取下一元素的id
                    tempId = parseInt($nextNode.attr("id").match(/\d+/g)[1]);
                    //将当前id设为下一元素id
                    itemId = tempId;
                    tempId = tempId + 1;
                    var $last = $("#" + idNum + "-" + tempId);
                    while($last.length > 0){
                        var $fileName = $last.children("div").text();
                        //文件名[xxx]xxxx，要去除[xxx]
                        var firstIndex = $fileName.indexOf("]");
                        $fileName = $fileName.substring(firstIndex + 1);
                        if($fileName.lastIndexOf("jpg") >=0 || $fileName.lastIndexOf("JPG") >=0 ||
                            $fileName.lastIndexOf("png") >=0 || $fileName.lastIndexOf("PNG") >=0 ||
                            $fileName.lastIndexOf("gif") >=0 || $fileName.lastIndexOf("GIF") >=0 ||
                            $fileName.lastIndexOf("jpeg") >=0 || $fileName.lastIndexOf("JPEG") >=0
                        ){
                            var $nextImg = $("#image" + tempId);
                            if($nextImg.length <= 0){
                                nowPath = nowPath + "/" + $fileName;
                                util.lsThumb("./php/ls.php", 1, "false", 1, tempId);
                            }
                            break;
                        }
                        tempId = tempId + 1;
                        $last = $("#" + idNum + "-" + tempId);
                    }
                    nowImgNum++;
                    //显示下一张
                    var $imageBox = $('#imageBox');
                    var $imageWidth = $('#image' + itemId).width();
                    $imageBox.animate({'margin-left':-nowImgNum * $imageWidth});
                }
                startPos = 0;
                picTouchFlag = true;
            }
            //依然显示当前图片并恢复默认位置
            else{
                var $imageBox = $('#imageBox');
                var $imageWidth = $('#image' + itemId).width();
                $imageBox.animate({'margin-left':-nowImgNum * $imageWidth});
            }
        }
    }, false);

    /*var $prior = $('#prior');
    $prior.on('click', function(){
        if(itemId == null)
            return;
        //当前图片ID
        itemId = parseInt(itemId);
        var tempId = itemId;
        //向右滑，上一张图片
        var $priorNode = $("#" + idNum + "-" + tempId).prev();
        //已经存在上一元素
        if($priorNode.length > 0){
            //获取上一元素的id
            tempId = parseInt($priorNode.attr("id").match(/\d+/g)[1]);
            //将当前id设为上一元素id
            itemId = tempId;
            //以上一元素为起点寻找上上一元素
            while((tempId = tempId - 1) > 0){
                var $last = $("#" + idNum + "-" + tempId);
                var $fileName = $last.children("div").text();
                //文件名[xxx]xxxx，要去除[xxx]
                var firstIndex = $fileName.indexOf("]");
                $fileName = $fileName.substring(firstIndex + 1);
                if($fileName.lastIndexOf("jpg") >=0 || $fileName.lastIndexOf("JPG") >=0 ||
                    $fileName.lastIndexOf("png") >=0 || $fileName.lastIndexOf("PNG") >=0 ||
                    $fileName.lastIndexOf("gif") >=0 || $fileName.lastIndexOf("GIF") >=0 ||
                    $fileName.lastIndexOf("jpeg") >=0 || $fileName.lastIndexOf("JPEG") >=0
                ){
                    var $priorImg = $("#image" + tempId);
                    if($priorImg.length <= 0){
                        nowImgNum++;
                        nowPath = nowPath + "/" + $fileName;
                        util.lsThumb("./php/ls.php", 1, "false", -1, tempId);
                    }
                    break;
                }
            }
            //显示上一张
            nowImgNum--;
            var $imageBox = $('#imageBox');
            var $imageWidth = $('#image' + itemId).width();
            $imageBox.animate({'margin-left':-nowImgNum * $imageWidth});
        }
    });
    var $next = $('#next');
    $next.on('click', function(){
        if(itemId == null)
            return;
        //当前图片ID
        itemId = parseInt(itemId);
        var tempId = itemId;
        var $nextNode = $("#" + idNum + "-" + tempId).next();
        //已经存在下一元素
        if($nextNode.length > 0){
            //获取下一元素的id
            tempId = parseInt($nextNode.attr("id").match(/\d+/g)[1]);
            //将当前id设为下一元素id
            itemId = tempId;
            tempId = tempId + 1;
            var $last = $("#" + idNum + "-" + tempId);
            while($last.length > 0){
                var $fileName = $last.children("div").text();
                //文件名[xxx]xxxx，要去除[xxx]
                var firstIndex = $fileName.indexOf("]");
                $fileName = $fileName.substring(firstIndex + 1);
                if($fileName.lastIndexOf("jpg") >=0 || $fileName.lastIndexOf("JPG") >=0 ||
                    $fileName.lastIndexOf("png") >=0 || $fileName.lastIndexOf("PNG") >=0 ||
                    $fileName.lastIndexOf("gif") >=0 || $fileName.lastIndexOf("GIF") >=0 ||
                    $fileName.lastIndexOf("jpeg") >=0 || $fileName.lastIndexOf("JPEG") >=0
                ){
                    var $nextImg = $("#image" + tempId);
                    if($nextImg.length <= 0){
                        nowPath = nowPath + "/" + $fileName;
                        util.lsThumb("./php/ls.php", 1, "false", 1, tempId);
                    }
                    break;
                }
                tempId = tempId + 1;
                $last = $("#" + idNum + "-" + tempId);
            }
            nowImgNum++;
            //显示下一张
            var $imageBox = $('#imageBox');
            var $imageWidth = $('#image' + itemId).width();
            $imageBox.animate({'margin-left':-nowImgNum * $imageWidth});
        }
    });*/

    //获取当前图片的上下两张图片
    util.getPriorNext = function(){
        if(itemId == null)
            return;
        var tempPath = nowPath;
        //当前图片ID
        itemId = parseInt(itemId);
        var tempId = itemId;
        //上一张图片
        while((tempId = tempId - 1) > 0){
            var $last = $("#" + idNum + "-" + tempId);
            var $fileName = $last.children("div").text();
            //文件名[xxx]xxxx，要去除[xxx]
            var firstIndex = $fileName.indexOf("]");
            $fileName = $fileName.substring(firstIndex + 1);
            if($fileName.lastIndexOf("jpg") >=0 || $fileName.lastIndexOf("JPG") >=0 ||
                $fileName.lastIndexOf("png") >=0 || $fileName.lastIndexOf("PNG") >=0 ||
                $fileName.lastIndexOf("gif") >=0 || $fileName.lastIndexOf("GIF") >=0 ||
                $fileName.lastIndexOf("jpeg") >=0 || $fileName.lastIndexOf("JPEG") >=0
            ){
                nowImgNum++;
                nowPath = nowPath + "/" + $fileName;
                util.lsThumb("./php/ls.php", 1, "false", -1, tempId);
                break;
            }
        }
        nowPath = tempPath;
        //下一张图片
        tempId = itemId + 1;
        var $last = $("#" + idNum + "-" + tempId);
        while($last.length > 0){
            var $fileName = $last.children("div").text();
            //文件名[xxx]xxxx，要去除[xxx]
            var firstIndex = $fileName.indexOf("]");
            $fileName = $fileName.substring(firstIndex + 1);
            if($fileName.lastIndexOf("jpg") >=0 || $fileName.lastIndexOf("JPG") >=0 ||
                $fileName.lastIndexOf("png") >=0 || $fileName.lastIndexOf("PNG") >=0 ||
                $fileName.lastIndexOf("gif") >=0 || $fileName.lastIndexOf("GIF") >=0 ||
                $fileName.lastIndexOf("jpeg") >=0 || $fileName.lastIndexOf("JPEG") >=0
            ){
                nowPath = nowPath + "/" + $fileName;
                util.lsThumb("./php/ls.php", 1, "false", 1, tempId);
                break;
            }
            tempId = tempId + 1;
            $last = $("#" + idNum + "-" + tempId);
        }
    }

    //获取系统信息
    util.getSystemInfo = function(){
        //获取时间
        var date = new Date();
        var h = date.getHours();
        var m = date.getMinutes();
        h = (Array(2).join('0') + h).slice(-2);
        m = (Array(2).join('0') + m).slice(-2);
        var $tipTime = $('#tipTime');
        $tipTime.text(h + ":" + m);
        //获取浏览器类型
        var $chromeType = Object.keys(browser())[0];
        //获取电量，IE和Safari无效
        if($chromeType != "safari" && $chromeType != "ie"){
            navigator.getBattery().then(function(battery) {
                var $power = $('#power');
                //获取电量，最大值1
                var $powerLevel = parseInt(battery.level*100);
                $power.text($powerLevel + "%");
                var $powerImg = $('#powerImg');
                var $powerBg = $('#powerBg');
                $power.css("color", "white");
                //充电
                if(battery.charging){
                    $powerImg.prop("src", "./picture/charge.png");
                    $powerBg.prop("src", "./picture/chargeBg.png");
                    if($powerLevel >= 90)
                        $power.css("color", "#34c759");
                }
                //没充电
                else{
                    $powerImg.prop("src", "./picture/power.png");
                    $powerBg.prop("src", "./picture/powerBg.png");
                }
                //修改电量百分比的颜色
                if($powerLevel < 20){
                    $power.css("color", "red");
                    $powerBg.prop("src", "./picture/lowPowerBg.png");
                }  
                //设置电量背景长度
                $powerBg.css("width", "calc(" + battery.level + " * 0.82 * 6vw)");
            });
        }
    };

    //浏览器类型判断
    const browser = function() {
        var Sys = {};
        var ua = navigator.userAgent.toLowerCase();
        var s;
        (s = ua.indexOf('edge') !== - 1 ? Sys.edge = 'edge' : ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1]:
            (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
            (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
            (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
            (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
            (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
        return Sys;
    }
}());