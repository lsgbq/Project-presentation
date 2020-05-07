(function () {
    var util = {};
    //字幕脚本信息
    var scriptInfo = new Array();
    //字幕样式
    var style = new Array();
    //开始时间 + 内容，结束时间，索引
    var contentStart = new Array();
    var contentEnd = new Array();
    var contentIndex = 0;
	//小于当前播放时间的Start
	var $subscriptStart = new Array();
	//大于当前播放时间的End
	var $subscriptEnd = new Array();
	//当前字幕数组下标数组，可能有多条字幕同时出现
	var subIndex = new Array();
	subIndex[0] = {id: -1};
    //video播放器元素
    var $video = null;
    //字幕DIV元素
    var $mySubtitleDiv = null;
    createDiv = function($videoId, $url){
        //获取video宽高和位置
        $video = $('#' + $videoId);
        var $width = $video.width();
        var $height = $video.height();
        var $top = $video.offset().top;
        var $left = $video.offset().left;
        //创建div
        $video.after("<div id='mySubtitleDiv'></div>");
        $mySubtitleDiv = $('#mySubtitleDiv');
        //设置css样式
        var css = {
            "height": $height,
            "width": $width,
            "position": "absolute",
			"z-index": "5555",
			"overflow":"hidden"
        };
        $mySubtitleDiv.css(css);
        $mySubtitleDiv.offset({ top: $top, left: $left });
        //读取字幕文件内容
        $.ajax({
            url:$url,
            success :function(data) {
                //按行分割
                var $contentRow = data.split(/[\n]/);
                $.each($contentRow, function(index, row){
                    //字幕内容
                    if(row.indexOf("Dialogue:") > -1){
                        var $time = row.split(",");
                        var $temp1 = $time[1].split(":");
                        //时间字符串转浮点型数字
                        $time[1] = (parseFloat($temp1[0]) * 60 + parseFloat($temp1[1])) * 60 + parseFloat($temp1[2]);
                        var $temp2 = $time[2].split(":");
                        $time[2] = (parseFloat($temp2[0]) * 60 + parseFloat($temp2[1])) * 60 + parseFloat($temp2[2]);
                        //初始化为空字符串
                        var temp = "";
                        //拼接被逗号分割的字幕内容
                        for(var $i=9; $i<$time.length; $i++)
                            temp = temp + "," + $time[$i];
                        //去除句首逗号
                        temp = temp.substring(1);
						var indexStar = $time[3].indexOf("*");
						if(indexStar >= 0)
							$time[3] = $time[3].substring(0, indexStar) + $time[3].substring(indexStar + 1);
						var objStart = {
							id: contentIndex,
							Start: $time[1],
							End: $time[2],
							Style: $time[3],
							content: temp
						};
						var objEnd = {
							id: contentIndex,
							End: $time[2]
						};
						contentStart[contentIndex] = objStart;
						contentEnd[contentIndex] = objEnd;
                        contentIndex++;
                    }
                    //字幕样式
                    else if(row.indexOf("Style:") > -1){
						var $Style = row.split(",");
						var indexStar = $Style[1].indexOf("*");
						if(indexStar >= 0)
							$Style[1] = $Style[1].substring(0, indexStar) + $Style[1].substring(indexStar + 1);
						var obj = {
							Fontname: $Style[1],//字体名称（区分大小写）
							Fontsize: parseFloat($Style[2].trim()),//字体大小（字号）
							PrimaryColour: (Array(8).join('0') + $Style[3].substring(2)).slice(-8),//主体颜色（一般情况下文字的颜色）。下同，前2位(alpha)为透明度，00=不透明，FF=DEC255=全透明；后6是BGR蓝绿红颜色。 排在最前的00可以忽略不写
							SecondaryColour: (Array(8).join('0') + $Style[4].substring(2)).slice(-8),//次要颜色（在卡拉OK效果中字幕由次要颜色变为主体颜色。 ）
							OutlineColour: (Array(8).join('0') + $Style[5].substring(2)).slice(-8),//边框颜色
							BackColour: (Array(8).join('0') + $Style[6].substring(2)).slice(-8),//阴影颜色
							Bold: parseInt($Style[7].trim()),//粗体（ -1=开启，0=关闭）
							Italic: parseInt($Style[8].trim()),//斜体（ -1=开启，0=关闭）
							Underline: parseInt($Style[9].trim()),//下划线（-1=开启，0=关闭）
							StrikeOut: parseInt($Style[10].trim()),//删除线（-1=开启，0=关闭）
							ScaleX: parseFloat($Style[11].trim()),//横向缩放（单位 [%]，100即正常宽度）
							ScaleY: parseFloat($Style[12].trim()),//纵向缩放（单位 [%]，100即正常高度）
							Spacing: parseFloat($Style[13].trim()),//字间距（单位 [像素]，可用小数）
							Angle: parseFloat($Style[14].trim()),//旋转角度（绕z轴逆时针旋转\frz，负数=顺时针旋转。单位 [度]，可用小数）
							BorderStyle: parseInt($Style[15].trim()),//边框样式（1=边框+阴影，3=不透明底框）
							Outline: parseFloat($Style[16].trim()),//边框宽度（单位 [像素]，可用小数）
							Shadow: parseFloat($Style[17].trim()),//阴影深度（单位 [像素]，可用小数，右下偏移）
							Alignment: parseInt($Style[18].trim()),//对齐方式（同小键盘布局，决定了旋转/定位/缩放的参考点）
							MarginL: parseFloat($Style[19].trim()),//左边距（字幕距左边缘的距离，单位 [像素]，右对齐和中对齐时无效）
							MarginR: parseFloat($Style[20].trim()),//右边距（字幕距右边缘的距离，单位 [像素]，左对齐和中对齐时无效）
							MarginV: parseFloat($Style[21].trim()),//垂直边距（字幕距垂直边缘的距离，单位 [像素]，下对齐时表示到底部的距离、上对齐时表示到顶部的距离、中对齐时无效， 文本位于垂直中心）
							Encoding: parseInt($Style[22].trim()),//编码（0=ANSI,1=默认,128=日文,134=简中,136=繁中，一般用默认1即可）
							css: {}
						};
						//样式名称做索引（用于[Events]部分引用，区分大小写，不能包含逗号）
						style[$Style[0].substring(7)] = obj;
						style[$Style[0].substring(7)].css = util.styleToCss(style[$Style[0].substring(7)]);
					}
                    //字幕信息
					else if(row.indexOf("Synch Point:") > -1){
						//描述脚本在视频的何处开始播放，通常使用0。
						scriptInfo["SynchPoint"] = parseFloat(row.substring(12).trim());
					}
					else if(row.indexOf("Collisions:") > -1){
						//若为"Normal" ，则后一条字幕将出现在前一条字幕的上方；若为"Reverse"，则前一条字幕将向上移动给后一条字幕让位。
						scriptInfo["Collisions"] = row.substring(11).trim();
					}
					else if(row.indexOf("PlayResX:") > -1){
						//屏幕的左上角坐标为(0,0),右下角坐标为(PlayResX数值,PlayResY数值)，所有给出的坐标(三个边距, \pos, \move, 矢量绘图等)都以此数值作为参照；
						//所有的文字字号均按照此分辨率等比例放大缩小；
						//这个分辨率不影响最终显示文字的宽高比, 但影响矢量绘画图形的宽高比。
						//播放脚本时屏幕的宽度，建议与视频分辨率一致。
						scriptInfo["PlayResX"] = parseFloat(row.substring(9).trim());
					}
					else if(row.indexOf("PlayResY:") > -1){
						//播放脚本时屏幕的高度，建议与视频分辨率一致
						scriptInfo["PlayResY"] = parseFloat(row.substring(9).trim());
					}
					else if(row.indexOf("PlayDepth:") > -1){
						//播放脚本时颜色的深度
						scriptInfo["PlayDepth"] = parseFloat(row.substring(10).trim());
					}
					else if(row.indexOf("Timer:") > -1){
						//播放速度，是百分数，100.0000%即精确的100%，小数点后有四位。
						//默认100%。当超过100%时，将会减少字幕的整体持续时间，即意味着字幕将会越来越快地出现；低于100%时，将越来越慢。这种拉伸和压缩只在脚本播放期间起效，不会更改脚本中项目的实际时间值
						scriptInfo["Timer"] = parseFloat(row.substring(6).trim()).toFixed(4);
					}
					else if(row.indexOf("WrapStyle:") > -1){
						//当一个Dialogue行中存在用空格分开的多句话时，此项定义了默认换行方式：
						//0（默认）：智能换行，尽量平均，若无法平均，上方字幕会更长；
						//1：行尾换行，一行的最后一个空格才换行，只有\N可以强制换行；
						//2：不换行，\n和\N都可以强制换行；
						//3：同0，智能换行，尽量平均，若无法平均，下方的字幕会更长。
						scriptInfo["WrapStyle"] = parseInt(row.substring(10).trim());
					}
					else if(row.indexOf("ScaledBorderAndShadow:") > -1){
						//边框宽度与阴影深度是否随着视频分辨率同等比例缩放。
						//no： 边框宽度与阴影深度完全按照指定的像素数显示；
						//Yes： 边框宽度与阴影深度随着实际视频的分辨率同等比例缩放
						scriptInfo["ScaledBorderAndShadow"] = row.substring(22).trim();
					}
                });
				//归并排序
				util.MergeSortStart(contentStart);
				util.MergeSortEnd(contentEnd);
				/*for(var $i=0; $i<contentStart.length; $i++){
					console.log(contentStart[$i].Start);
					console.log(contentStart[$i].content);
					console.log(contentEnd[$i].End);
				}*/
            }
        });

		//上一次的当前时间
		var lastCurrentTime = 0;
		//大于当前播放时间的下一条字幕的开始时间数组下标
		var nextSubIndex = 0;
        var $myVideo = document.getElementById($videoId);
        //视频播放位置发生变化事件
        $myVideo.addEventListener("timeupdate", function() {
            //字幕内容不为空才执行
            if(contentStart != null){
                var $nowTime = $myVideo.currentTime;
                var $totalTime = $myVideo.duration;
				//时间差
				var $difference = $nowTime - lastCurrentTime;
				//当前播放时间与上次播放时间差30秒以上，即改变进度条触发，用非线性跳转寻找
				if(Math.abs($difference) > 30){
					//播放百分比
					var percent = $nowTime * 1.0 / $totalTime;
					//数组长度
					var $length = contentStart.length;
					//字幕与视频的百分比
					var subPerVideo = (contentEnd[$length - 1].End - contentStart[0].Start) * 1.0 / $totalTime;
					//预估数组下标，向下取整。假设视频长度100，字幕长度80开始于10结束于90,；((11%-(10/100))/(80/100))*80
					var pos = Math.floor(((percent - contentStart[0].Start * 1.0 / $totalTime) * 1.0 / subPerVideo) * $length);
					if(pos < 0)
						pos = 0;
					//跳跃百分比，用于前后搜索减小与当前播放时间的差距
					var ratio = Math.abs($difference) / $totalTime;
					//向前一次加一，若加两次则保持ratio不变，否则缩小ratio
					var forward = 0;
					//向后一次加一，若加两次则保持ratio不变，否则缩小ratio
					var backward = 0;
					//寻找小于当前播放时间且离当前播放时间最近的开始时间
					while(true){
						//防止下标越界
						if(pos >= contentStart.length - 1 || pos < 0)
							break;
						//寻找到小于当前播放时间且离当前播放时间最近的开始时间，或当前时间小于第一条字幕的开始时间，或当前时间大于最后一条字幕的结束时间
						if((contentStart[pos].Start <= $nowTime && contentStart[pos+1].Start > $nowTime) || contentStart[0].Start > $nowTime || contentEnd[$length-1].End < $nowTime)
							break;
						if(contentStart[pos].Start > $nowTime){
							//上一次是向后，而这一次是向前，缩小ratio
							if(backward > 0){
								backward = 0;
								ratio = ratio / 2;
							}
							//假设字幕接近均匀分布的，向前ratio%
							percent = percent - ratio;
							pos = Math.floor(((percent - contentStart[0].Start * 1.0 / $totalTime) * 1.0 / subPerVideo) * $length);
							if(pos < 0)
								pos = 0;
							forward++;
						}
						else if(contentStart[pos+1].Start < $nowTime){
							//上一次是向前，而这一次是向后，缩小ratio
							if(forward > 0){
								forward = 0;
								ratio = ratio / 2;
							}
							//假设字幕接近均匀分布的，向后ratio%
							percent = percent + ratio;
							pos = Math.floor(((percent - contentStart[0].Start * 1.0 / $totalTime) * 1.0 / subPerVideo) * $length);
							backward++;
						}
					}
					nextSubIndex = pos + 1;
					//将小于当前播放时间的Start的id保存到数组$subscriptStart，此时id可能乱序
					$subscriptStart = new Array();
					for(var $i=0; $i<=pos; $i++){
						if(pos > contentStart.length - 1)
							break;
						$subscriptStart[$i] = contentStart[$i];
					}
					//跳跃百分比，用于前后搜索减小与当前播放时间的差距
					ratio = Math.abs($difference) / $totalTime;
					//向前一次加一，若加两次则保持ratio不变，否则缩小ratio
					forward = 0;
					//向后一次加一，若加两次则保持ratio不变，否则缩小ratio
					backward = 0;
					//寻找大于当前播放时间且离当前播放时间最近的结束时间
					while(true){
						//防止下标越界
						if(pos > contentStart.length - 1 || pos <= 0)
							break;
						//寻找到大于当前播放时间且离当前播放时间最近的结束时间，或当前时间小于第一条字幕的开始时间，或当前时间大于最后一条字幕的结束时间
						if((contentEnd[pos-1].End <= $nowTime && contentEnd[pos].End > $nowTime) || contentEnd[0].Start > $nowTime || contentEnd[$length-1].End < $nowTime)
							break;
						if(contentEnd[pos-1].End > $nowTime){
							//上一次是向后，而这一次是向前，缩小ratio
							if(backward > 0){
								backward = 0;
								ratio = ratio / 2;
							}
							//假设字幕接近均匀分布的，向前ratio%
							percent = percent - ratio;
							pos = Math.floor(((percent - contentEnd[0].End * 1.0 / $totalTime) * 1.0 / subPerVideo) * $length);
							if(pos < 0)
								pos = 0;
							forward++;
						}
						else if(contentEnd[pos].End < $nowTime){
							//上一次是向前，而这一次是向后，缩小ratio
							if(forward > 0){
								forward = 0;
								ratio = ratio / 2;
							}
							//假设字幕接近均匀分布的，向后ratio%
							percent = percent + ratio;
							pos = Math.floor(((percent - contentEnd[0].End * 1.0 / $totalTime) * 1.0 / subPerVideo) * $length);
							backward++;
						}
					}
					//将大于当前播放时间的End的id保存到数组$subscriptEnd，此时id可能乱序
					$subscriptEnd = new Array();
					for(var $i=pos, $j=0; $i<contentEnd.length; $i++, $j++)
						$subscriptEnd[$j] = contentEnd[$i];
					//将得到的Start和End按id顺序排序
					util.MergeSortID($subscriptStart);
					util.MergeSortID($subscriptEnd);
					//通过对比找出两者共有的id，即是当前应该显示的字幕
					var $i = 0;
					var $j = 0;
					var $k = 0;
					for(var $i=0;$i<subIndex.length;){
						//取消显示
						var $delete = $('#subtitle' + subIndex[$i].id);
						$delete.remove();
						//从数组中删除
						subIndex.splice($i, 1);
						$('head').children("style").remove();
						$alignmentPos = new Array(0, 0, 0, 0, 0, 0, 0);
					}
					subIndex = new Array();
					subIndex[0] = {id: -1};
					while($i < $subscriptStart.length && $j < $subscriptEnd.length){
						if($subscriptStart[$i].id < $subscriptEnd[$j].id){
							$i++;
						}
						else if($subscriptStart[$i].id > $subscriptEnd[$j].id){
							$j++;
						}
						else if($subscriptStart[$i].id == $subscriptEnd[$j].id){
							subIndex[$k++] = $subscriptStart[$i];
							$i++;
							$j++;
						}
					}
					//记录时间
					lastCurrentTime = $nowTime;
					//显示字幕
					if(subIndex[0].id != -1){
						util.showSubtitle();
					}
				}
				//跳转线性寻找。
                else if(Math.abs($difference) >= 5){
					var $num = Math.ceil(Math.abs($difference) / 4) * 2;
					//向前
					if($difference <= 0){
						//当前字幕数组下标
						pos = nextSubIndex + $num;
						if(pos < 0)
							pos = 0;
						//寻找大于当前播放时间且离当前播放时间最近的结束时间
						while(true){
							//防止下标越界
							if(pos > contentStart.length - 1 || pos <= 0)
								break;
							//寻找到大于当前播放时间且离当前播放时间最近的结束时间，或当前时间小于第一条字幕的开始时间，或当前时间大于最后一条字幕的结束时间
							if((contentEnd[pos-1].End <= $nowTime && contentEnd[pos].End > $nowTime) || contentStart[0].Start > $nowTime || contentEnd[contentEnd.length-1].End < $nowTime)
								break;
							pos--;
						}
						//将大于当前播放时间的End的id保存到数组$subscriptEnd，此时id可能乱序
						$subscriptEnd = new Array();
						for(var $i=pos, $j=0; $i<contentEnd.length; $i++, $j++)
							$subscriptEnd[$j] = contentEnd[$i];
						//避免pos改变导致，id全部重合显示整个字幕文件
						pos = nextSubIndex + $num;
						//寻找小于当前播放时间且离当前播放时间最近的开始时间
						while(true){
							//防止下标越界
							if(pos >= contentStart.length - 1 || pos <= 0)
								break;
							//寻找到小于当前播放时间且离当前播放时间最近的开始时间，或当前时间小于第一条字幕的开始时间，或当前时间大于最后一条字幕的结束时间
							if((contentStart[pos].Start <= $nowTime && contentStart[pos+1].Start > $nowTime) || contentStart[0].Start > $nowTime || contentEnd[contentEnd.length-1].End < $nowTime)
								break;
							pos--;
						}
						nextSubIndex = pos + 1;
						//将小于当前播放时间的Start的id保存到数组$subscriptStart，此时id可能乱序
						$subscriptStart = new Array();
						for(var $i=0; $i<=pos; $i++){
							if(pos > contentStart.length - 1)
								break;
							$subscriptStart[$i] = contentStart[$i];
						}
						//将得到的Start和End按id顺序排序
						util.MergeSortID($subscriptStart);
						util.MergeSortID($subscriptEnd);
						if(contentStart[0].Start > $nowTime){
							for(var $i=0;$i<subIndex.length;){
								//取消显示
								var $delete = $('#subtitle' + subIndex[$i].id);
								$delete.remove();
								//从数组中删除
								subIndex.splice($i, 1);
								$('head').children("style").remove();
								$alignmentPos = new Array(0, 0, 0, 0, 0, 0, 0);
							}
							subIndex = new Array();
							subIndex[0] = {id: -1};
							nextSubIndex = 0;
						}
						else{
							//通过对比找出两者共有的id，即是当前应该显示的字幕
							var $i = 0;
							var $j = 0;
							var $k = 0;
							for(var $i=0;$i<subIndex.length;){
								//取消显示
								var $delete = $('#subtitle' + subIndex[$i].id);
								$delete.remove();
								//从数组中删除
								subIndex.splice($i, 1);
								$('head').children("style").remove();
								$alignmentPos = new Array(0, 0, 0, 0, 0, 0, 0);
							}
							subIndex = new Array();
							subIndex[0] = {id: -1};
							while($i < $subscriptStart.length && $j < $subscriptEnd.length){
								if($subscriptStart[$i].id < $subscriptEnd[$j].id){
									$i++;
								}
								else if($subscriptStart[$i].id > $subscriptEnd[$j].id){
									$j++;
								}
								else if($subscriptStart[$i].id == $subscriptEnd[$j].id){
									subIndex[$k++] = $subscriptStart[$i];
									$i++;
									$j++;
								}
							}
						}
					}
					//向后
					else{
						//当前字幕数组下标
						pos = nextSubIndex - $num;
						if(pos < 0)
							pos = 0;
						//寻找大于当前播放时间且离当前播放时间最近的结束时间
						while(true){
							//防止下标越界
							if(pos <= 0 || pos > contentStart.length - 1)
								break;
							//寻找到大于当前播放时间且离当前播放时间最近的结束时间，或当前时间小于第一条字幕的开始时间，或当前时间大于最后一条字幕的结束时间
							if((contentEnd[pos-1].End <= $nowTime && contentEnd[pos].End > $nowTime) || contentStart[0].Start > $nowTime || contentEnd[contentEnd.length-1].End < $nowTime)
								break;
							pos++;
						}
						//将大于当前播放时间的End的id保存到数组$subscriptEnd，此时id可能乱序
						$subscriptEnd = new Array();
						for(var $i=pos, $j=0; $i<contentEnd.length; $i++, $j++)
							$subscriptEnd[$j] = contentEnd[$i];
						pos = nextSubIndex - $num;
						if(pos < 0)
							pos = 0;
						//寻找小于当前播放时间且离当前播放时间最近的开始时间
						while(true){
							//防止下标越界
							if(pos <0 || pos >= contentStart.length - 1)
								break;
							//寻找到小于当前播放时间且离当前播放时间最近的开始时间，或当前时间小于第一条字幕的开始时间，或当前时间大于最后一条字幕的结束时间
							if((contentStart[pos].Start <= $nowTime && contentStart[pos+1].Start > $nowTime) || contentStart[0].Start > $nowTime || contentEnd[contentEnd.length-1].End < $nowTime)
								break;
							pos++;
						}
						nextSubIndex = pos + 1;
						//将小于当前播放时间的Start的id保存到数组$subscriptStart，此时id可能乱序
						$subscriptStart = new Array();
						for(var $i=0; $i<=pos; $i++){
							if(pos > contentStart.length - 1)
								break;
							$subscriptStart[$i] = contentStart[$i];
						}
						//将得到的Start和End按id顺序排序
						util.MergeSortID($subscriptStart);
						util.MergeSortID($subscriptEnd);
						if(contentStart[0].Start > $nowTime){
							for(var $i=0;$i<subIndex.length;){
								//取消显示
								var $delete = $('#subtitle' + subIndex[$i].id);
								$delete.remove();
								//从数组中删除
								subIndex.splice($i, 1);
								$('head').children("style").remove();
								$alignmentPos = new Array(0, 0, 0, 0, 0, 0, 0);
							}
							subIndex = new Array();
							subIndex[0] = {id: -1};
							nextSubIndex = 0;
						}
						else{
							//通过对比找出两者共有的id，即是当前应该显示的字幕
							var $i = 0;
							var $j = 0;
							var $k = 0;
							for(var $i=0;$i<subIndex.length;){
								//取消显示
								var $delete = $('#subtitle' + subIndex[$i].id);
								$delete.remove();
								//从数组中删除
								subIndex.splice($i, 1);
								$('head').children("style").remove();
								$alignmentPos = new Array(0, 0, 0, 0, 0, 0, 0);
							}
							subIndex = new Array();
							subIndex[0] = {id: -1};
							while($i < $subscriptStart.length && $j < $subscriptEnd.length){
								if($subscriptStart[$i].id < $subscriptEnd[$j].id){
									$i++;
								}
								else if($subscriptStart[$i].id > $subscriptEnd[$j].id){
									$j++;
								}
								else if($subscriptStart[$i].id == $subscriptEnd[$j].id){
									subIndex[$k++] = $subscriptStart[$i];
									$i++;
									$j++;
								}
							}
						}
					}
					//记录时间
					lastCurrentTime = $nowTime;
					//显示字幕
					if(subIndex[0].id != -1){
						util.showSubtitle();
					}
				}
				//正常播放，不寻找，仅判断当前字幕有无达到结束时间的和接下来几条有无要显示的。
				//过于精确会导致异常输出，因此时间精确到0.01秒，即ass文件时间精确度。
				else if(Math.abs($difference) >= 0.01){
					//原本就有显示的
					if(subIndex[0].id != -1){
						var $i=0;
						for(;$i<subIndex.length;){
							//达到结束时间取消显示
							if(subIndex[$i].End <= $nowTime){
								//取消显示
								var $delete = $('#subtitle' + subIndex[$i].id);
								$delete.remove();
								//从数组中删除
								subIndex.splice($i, 1);
								$('head').children("style").remove();
								if(typeof(subIndex.an) != "undefined")
									$alignmentPos[subIndex.an - 1]--;
							}
							else
								$i++;
							
						}
						//有新的要显示
						while(contentStart[nextSubIndex].Start <= $nowTime){
							subIndex[$i++] = contentStart[nextSubIndex];
							nextSubIndex++;
						}
						//原本显示的全部删除了
						if($i == 0){
							for(var $i=0;$i<subIndex.length;){
								//取消显示
								var $delete = $('#subtitle' + subIndex[$i].id);
								$delete.remove();
								//从数组中删除
								subIndex.splice($i, 1);
								$('head').children("style").remove();
								$alignmentPos = new Array(0, 0, 0, 0, 0, 0, 0);
							}
							subIndex = new Array();
							subIndex[0] = {id: -1};
						}
					}
					//原本没有要显示的
					else{
						var $i = 0;
						//有要显示的了
						while(contentStart[nextSubIndex].Start <= $nowTime){
							subIndex[$i++] = contentStart[nextSubIndex];
							nextSubIndex++;
						}
					}
					//记录时间
					lastCurrentTime = $nowTime;
					//显示字幕
					if(subIndex[0].id != -1){
						util.showSubtitle();
					}
				}
            }
        });
    };

	//显示字幕
    util.showSubtitle = function(){
		//将要显示的字幕按开始时间排序
		util.MergeSortStart(subIndex);
		var $pos = 0;
		//若为"Normal" ，则后一条字幕将出现在前一条字幕的上方；
        //若为"Reverse"，则前一条字幕将向上移动给后一条字幕让位。
        if(scriptInfo["Collisions"] == "Reverse" || scriptInfo["Collisions"] == "reverse" || scriptInfo["Collisions"] == "REVERSE"){
            //根据subIndex数组显示对应字幕
            for(var $i=subIndex.length-1; $i>=0; $i--){
                var $newNode = $('#subtitle' + subIndex[$i].id);
				//已经存在的字幕，可能需要调整位置，比如pos=0的字幕消失了，则pos=1的字幕要顶替pos=0字幕的位置
				//TODO是否要调整位置，爱奇艺播放器是不调整位置
                if($newNode.length > 0){
                    //跳过pos=-1的字幕
                    if(subIndex[$i].pos != -1){
                        subIndex[$i].pos = $pos;
                        $pos = subIndex[$i].pos + subIndex[$i].plies + 1;
					}
					else
						continue;
                }
                //不存在才创建，避免重复创建
                else{
                    //正常字幕位置
                    subIndex[$i].pos = $pos;
                    //正常字幕层数，一层记为0，两层记为1，以此类推
                    subIndex[$i].plies = 0;
                    $mySubtitleDiv = $('#mySubtitleDiv');
                    $mySubtitleDiv.append("<div id='subtitle" + subIndex[$i].id + "'></div>");
                    $newNode = $('#subtitle' + subIndex[$i].id);
                    $newNode.css(style[subIndex[$i].Style].css);
                    //分析内容
                    subIndex[$i] = util.analysis(subIndex[$i]);
                    //自定义位置的内容跳过后面的位置设置
                    if(subIndex[$i].pos == -1)
                        continue;
                    //宽度是随内容变化的，所以先把内容显示好再修改位置，否则在加载css之前计算会得到父元素宽度（100vw）
                    $newNode.text(subIndex[$i].content);
                    $pos = subIndex[$i].pos + subIndex[$i].plies + 1;
                }
                //对齐方式同小键盘
                switch(style[subIndex[$i].Style].Alignment){
                    //左下
                    case 1:
                        $newNode.css("padding", $mySubtitleDiv.height() * (1-style[subIndex[$i].Style].MarginV/scriptInfo["PlayResY"]) - $newNode.height() * (1 + subIndex[$i].pos) + "px 0 0 " + $mySubtitleDiv.width() * style[subIndex[$i].Style].MarginL/scriptInfo["PlayResX"] + "px");
                        break;
                    //中下
                    case 2:
                        $newNode.css("padding", $mySubtitleDiv.height() * (1-style[subIndex[$i].Style].MarginV/scriptInfo["PlayResY"]) - $newNode.height() * (1 + subIndex[$i].pos) + "px 0 0 " + ($mySubtitleDiv.width() - $newNode.width()) / 2 + "px");
                        break;
                    //右下
                    case 3:
                        $newNode.css("padding", $mySubtitleDiv.height() * (1-style[subIndex[$i].Style].MarginV/scriptInfo["PlayResY"]) - $newNode.height() * (1 + subIndex[$i].pos) + "px 0 0 " + $mySubtitleDiv.width() * (1-style[subIndex[$i].Style].MarginR/scriptInfo["PlayResX"]) - $newNode.width() + "px");
                        break;
                    //左中
                    case 4:
                        $newNode.css("padding", ($mySubtitleDiv.height() - $newNode.height()) / 2 - $newNode.height() * subIndex[$i].pos + "px 0 0 " + $mySubtitleDiv.width() * style[subIndex[$i].Style].MarginL/scriptInfo["PlayResX"] + "px");
                        break;
                    //中中
                    case 5:
                        $newNode.css("padding", ($mySubtitleDiv.height() - $newNode.height()) / 2 - $newNode.height() * subIndex[$i].pos + "px 0 0 " + ($mySubtitleDiv.width() - $newNode.width()) / 2 + "px");
                        break;
                    //右中
                    case 6:
                        $newNode.css("padding", ($mySubtitleDiv.height() - $newNode.height()) / 2 - $newNode.height() * subIndex[$i].pos + "px 0 0 " + $mySubtitleDiv.width() * (1-style[subIndex[$i].Style].MarginR/scriptInfo["PlayResX"]) - $newNode.width() + "px");
                        break;
                    //左上
                    case 7:
                        $newNode.css("padding", $mySubtitleDiv.height() * style[subIndex[$i].Style].MarginV/scriptInfo["PlayResY"] + $newNode.height() * subIndex[$i].pos + "px 0 0 " + $mySubtitleDiv.width() * style[subIndex[$i].Style].MarginL/scriptInfo["PlayResX"] + "px");
                        break;
                    //中上
                    case 8:
                        $newNode.css("padding", $mySubtitleDiv.height() * style[subIndex[$i].Style].MarginV/scriptInfo["PlayResY"] + $newNode.height() * subIndex[$i].pos + "px 0 0 " + ($mySubtitleDiv.width() - $newNode.width()) / 2 + "px");
                        break;
                    //右上
                    case 9:
                        $newNode.css("padding", $mySubtitleDiv.height() * style[subIndex[$i].Style].MarginV/scriptInfo["PlayResY"] + $newNode.height() * subIndex[$i].pos + "px 0 0 " + $mySubtitleDiv.width() * (1-style[subIndex[$i].Style].MarginR/scriptInfo["PlayResX"]) - $newNode.width() + "px");
                        break;
                }
            }
        }
        else{
            //根据subIndex数组显示对应字幕
            for(var $i=0; $i<subIndex.length; $i++){
                var $newNode = $('#subtitle' + subIndex[$i].id);
                //已经存在的字幕，可能需要调整位置，比如pos=0的字幕消失了，则pos=1的字幕要顶替pos=0字幕的位置
				//TODO是否要调整位置，爱奇艺播放器是不调整位置
                if($newNode.length > 0){
                    //跳过pos=-1的字幕
                    if(subIndex[$i].pos != -1){
                        subIndex[$i].pos = $pos;
                        $pos = subIndex[$i].pos + subIndex[$i].plies + 1;
					}
					else
						continue;
                }
                //不存在才创建，避免重复创建
                else{
                    //正常字幕位置
                    subIndex[$i].pos = 0;
                    //正常字幕层数，一层记为0，两层记为1，以此类推
                    subIndex[$i].plies = 0;
                    $mySubtitleDiv = $('#mySubtitleDiv');
                    $mySubtitleDiv.append("<div id='subtitle" + subIndex[$i].id + "'></div>");
                    $newNode = $('#subtitle' + subIndex[$i].id);
                    $newNode.css(style[subIndex[$i].Style].css);
                    //分析内容
					subIndex[$i] = util.analysis($newNode, subIndex[$i]);
                    //自定义位置的内容跳过后面的位置设置
                    if(subIndex[$i].pos == -1)
                        continue;
                    //宽度是随内容变化的，所以先把内容显示好再修改位置，否则在加载css之前计算会得到父元素宽度（100vw）
                    $newNode.text(subIndex[$i].content);
                    var lastMaxPos = -1;
                    for(var $j=0;$j<$i;$j++){
                        if(subIndex[$j].pos > lastMaxPos)
                            lastMaxPos = subIndex[$j].pos + subIndex[$j].plies;
                    }
                    subIndex[$i].pos = lastMaxPos + 1;
				}
                //对齐方式同小键盘
                switch(style[subIndex[$i].Style].Alignment){
                    //左下
                    case 1:
                        $newNode.css("padding", $mySubtitleDiv.height() * (1-style[subIndex[$i].Style].MarginV/scriptInfo["PlayResY"]) - $newNode.height() * (1 + subIndex[$i].pos) + "px 0 0 " + $mySubtitleDiv.width() * style[subIndex[$i].Style].MarginL/scriptInfo["PlayResX"] + "px");
                        break;
                    //中下
                    case 2:
                        $newNode.css("padding", $mySubtitleDiv.height() * (1-style[subIndex[$i].Style].MarginV/scriptInfo["PlayResY"]) - $newNode.height() * (1 + subIndex[$i].pos) + "px 0 0 " + ($mySubtitleDiv.width() - $newNode.width()) / 2 + "px");
                        break;
                    //右下
                    case 3:
                        $newNode.css("padding", $mySubtitleDiv.height() * (1-style[subIndex[$i].Style].MarginV/scriptInfo["PlayResY"]) - $newNode.height() * (1 + subIndex[$i].pos) + "px 0 0 " + $mySubtitleDiv.width() * (1-style[subIndex[$i].Style].MarginR/scriptInfo["PlayResX"]) - $newNode.width() + "px");
                        break;
                    //左中
                    case 4:
                        $newNode.css("padding", ($mySubtitleDiv.height() - $newNode.height()) / 2 - $newNode.height() * subIndex[$i].pos + "px 0 0 " + $mySubtitleDiv.width() * style[subIndex[$i].Style].MarginL/scriptInfo["PlayResX"] + "px");
                        break;
                    //中中
                    case 5:
                        $newNode.css("padding", ($mySubtitleDiv.height() - $newNode.height()) / 2 - $newNode.height() * subIndex[$i].pos + "px 0 0 " + ($mySubtitleDiv.width() - $newNode.width()) / 2 + "px");
                        break;
                    //右中
                    case 6:
                        $newNode.css("padding", ($mySubtitleDiv.height() - $newNode.height()) / 2 - $newNode.height() * subIndex[$i].pos + "px 0 0 " + $mySubtitleDiv.width() * (1-style[subIndex[$i].Style].MarginR/scriptInfo["PlayResX"]) - $newNode.width() + "px");
                        break;
                    //左上
                    case 7:
                        $newNode.css("padding", $mySubtitleDiv.height() * style[subIndex[$i].Style].MarginV/scriptInfo["PlayResY"] + $newNode.height() * subIndex[$i].pos + "px 0 0 " + $mySubtitleDiv.width() * style[subIndex[$i].Style].MarginL/scriptInfo["PlayResX"] + "px");
                        break;
                    //中上
                    case 8:
                        $newNode.css("padding", $mySubtitleDiv.height() * style[subIndex[$i].Style].MarginV/scriptInfo["PlayResY"] + $newNode.height() * subIndex[$i].pos + "px 0 0 " + ($mySubtitleDiv.width() - $newNode.width()) / 2 + "px");
                        break;
                    //右上
                    case 9:
                        $newNode.css("padding", $mySubtitleDiv.height() * style[subIndex[$i].Style].MarginV/scriptInfo["PlayResY"] + $newNode.height() * subIndex[$i].pos + "px 0 0 " + $mySubtitleDiv.width() * (1-style[subIndex[$i].Style].MarginR/scriptInfo["PlayResX"]) - $newNode.width() + "px");
                        break;
                }
            }
        }
	};

	var $alignmentPos = new Array(0, 0, 0, 0, 0, 0, 0);
	//分析内容
    util.analysis = function($newNode, $subtitleContent){
        var $content = $subtitleContent.content;
        //存放分割后的内容
        var $contentArray = new Array();
        //临时存在第一次分割后的内容
        var $arr = new Array();
        $arr = $content.split("}");
        for(var $i=0; $i<$arr.length;$i++){;
            //临时存在第二次分割后的内容
            var $temp = new Array();
            $temp = $arr[$i].split("{");
            $contentArray = $contentArray.concat($temp);
        }
        //concat拼接会在数组首生成一个空字符串，要将空字符串删除
        $contentArray.splice(0, 1);
        var $index = 0;
        var $grouping = new Array();
        for(var $i=0;$i<$contentArray.length;$i++){
            //记录内容的下标
            if($contentArray[$i].indexOf("\\") < 0 || $contentArray[$i].indexOf("\\n") > -1 || $contentArray[$i].indexOf("\\N") >-1 || $contentArray[$i].indexOf("\h") > -1){
                $grouping[$index] = $i;
                $index++;
            }
		}
		var $alignment = style[$subtitleContent.Style].Alignment;
		var $useMargin = "0";
		var $posX = 0, $posY = 0, $toX = 0, $toY = 0, $moveStartTime = $subtitleContent.Start * 1000, $moveEndTime = $subtitleContent.End * 1000;
		var $useMoveTime = false;
		//处理代码
		for(var $i=0, $k=0; $i<$contentArray.length; $i++){
			//代码
			if($i != $grouping[$k]){
				//代码中可能存在多条语句只能以\分割再逐个判断
				var $temp = $contentArray[$i].split("\\");
				//$temp[0] = "";
				for(var $j=1; $j<$temp.length; $j++){
					var $letter = $temp[$j].substring(0, 1);
					switch($letter){
						case "a":
							switch($temp[$j].substring(1, 2)){
								//\an
								case "n":
									var $num = parseInt($temp[$j].substring(2, 3))
									$alignment = $num;
									$subtitleContent.pos = -1;
									break;
								//\alpha
								case "l":
									break;
							}
							break;
						case "b":
							switch($temp[$j].substring(1, 2)){
								//\be
								case "e":
									break;
								//\blur
								case "l":
									break;
								//\bord
								case "o":
									break;
								//\b
								default:
									break;
							}
							break;
						case "c":
							switch($temp[$j].substring(1, 2)){
								//\clip
								case "l":
									break;
								//\c
								default:
									break;
							}
							break;
						case "f":
							switch($temp[$j].substring(1, 2)){
								case "a":
									switch($temp[$j].substring(2, 3)){
										case "d":
											var $fadeIn = "", $fadeOut = "", $fadeEnd = "";
											//淡入和淡出的延迟（开始）时间
											var $delayIn = 0, $delayOut = 0, $delayEnd = 0;
											//淡入和淡出的持续时间，animation结束后不会改变原本的透明度就会导致淡出了的字幕淡出结束后再次显示，再加上一个用来淡出结束后一直保持淡出结束透明度
											var $timeIn = 0, $timeOut = 0, $timeEnd = 0;
											switch($temp[$j].substring(3, 4)){
												//\fade
												case "e":
													//a1是淡入开始时的透明度，t1,t2表示淡入的开始时间和结束时间
													//a2是淡入结束到淡出开始时的透明度
													//a3是淡出结束时的透明度，t3,t4表示淡出的开始时间和结束时间
													//此处透明度必须使用十进制来表示，范围0-255
													var $t1 = 0, $t2 = 0, $t3 = 0, $t4, $a1 = 0, $a2 = 0, $a3 = 0;
													var $attribute = $temp[$j].substring(5, $temp[$j].length - 1).split(",");
													$a1 = $attribute[0].trim();
													$a2 = $attribute[1].trim();
													$a3 = $attribute[2].trim();
													$t1 = $attribute[3].trim();
													$t2 = $attribute[4].trim();
													$t3 = $attribute[5].trim();
													$t4 = $attribute[6].trim();
													//ass和css透明度相反；ass：0不透明，255透明；css：0透明，1不透明
													$a1 = Math.abs($a1 / 255 - 1);
													$a2 = Math.abs($a2 / 255 - 1);
													$a3 = Math.abs($a3 / 255 - 1);
													//淡入持续时间
													$timeIn = $t2 - $t1;
													//淡出持续时间
													$timeOut = $t4 - $t3;
													$timeEnd = ($subtitleContent.End - $subtitleContent.Start) * 1000 - $t4 + 1000;
													//淡入开始时间
													$delayIn = $t1;
													$delayEnd = $t4;
													//淡出开始时间
													$delayOut = $t3;
													$fadeIn = "fadIn" + $subtitleContent.id + "{0% {opacity: " + $a1 + ";}100% {opacity: " + $a2 + ";}}";
													$fadeOut = "fadOut" + $subtitleContent.id + "{0% {opacity: " + $a2 + ";}100% {opacity: " + $a3 + ";}}";
													$fadeEnd = "fadEnd" + $subtitleContent.id + "{0% {opacity: " + $a3 + ";}100% {opacity: " + $a3 + ";}}";
													break;
												//\fad
												default:
													var $attribute = $temp[$j].substring(4, $temp[$j].length - 1).split(",");
													//淡入使用时间
													$timeIn = $attribute[0].trim();
													//淡出使用时间
													$timeOut = $attribute[1].trim();
													$timeEnd = 1000;
													$delayOut = ($subtitleContent.End - $subtitleContent.Start) * 1000 - $timeOut;
													$delayEnd = ($subtitleContent.End - $subtitleContent.Start) * 1000; 
													//不会影响原本的透明度
													$fadeIn = "fadIn" + $subtitleContent.id + "{0% {opacity: 0;}100% {opacity: 1;}}";
													$fadeOut = "fadOut" + $subtitleContent.id + "{0% {opacity: 1;}100% {opacity: 0;}}";
													$fadeEnd = "fadEnd" + $subtitleContent.id + "{0% {opacity: 0;}100% {opacity: 0;}}";
													break;
											}
											var $head = 
											"@keyframes " + $fadeIn + 
											"@-ms-keyframes " + $fadeIn + 
											"@-moz-keyframes " + $fadeIn + 
											"@-webkit-keyframes " + $fadeIn + 
											"@-o-keyframes " + $fadeIn + 
											"@keyframes " + $fadeOut + 
											"@-ms-keyframes " + $fadeOut + 
											"@-moz-keyframes " + $fadeOut + 
											"@-webkit-keyframes " + $fadeOut + 
											"@-o-keyframes " + $fadeOut + 
											"@keyframes " + $fadeEnd + 
											"@-ms-keyframes " + $fadeEnd + 
											"@-moz-keyframes " + $fadeEnd + 
											"@-webkit-keyframes " + $fadeEnd + 
											"@-o-keyframes " + $fadeEnd;
											$('head').append($("<style>" + $head + "</style>"));
											var $animation = $newNode.css["animation"];
											if(typeof($animation) != "undefined" && $animation.length > 0)
												$animation = $animation + 
												",fadIn" + $subtitleContent.id + " " + $timeIn + "ms " + $delayIn + "ms" + 
												",fadOut" + $subtitleContent.id + " " + $timeOut + "ms " + $delayOut + "ms" + 
												",fadEnd" + $subtitleContent.id + " " + $timeEnd + "ms " + $delayEnd + "ms";
											else
												$animation = "fadIn" + $subtitleContent.id + " " + $timeIn + "ms " + $delayIn + "ms" + 
												",fadOut" + $subtitleContent.id + " " + $timeOut + "ms " + $delayOut + "ms" + 
												",fadEnd" + $subtitleContent.id + " " + $timeEnd + "ms " + $delayEnd + "ms";
											$newNode.css("animation", $animation);
											break;
										//\fa
										default:
											break;
									}
									break;
								//\fe
								case "e":
									break;
								//\fn字体类型
								case "n":
									$fontType = $temp[$j].substring(2);
									$newNode.css("font-family", $fontType);
									break;
								case "s":
									switch($temp[$j].substring(2, 3)){
										//\fsc
										case "c":
											break;
										//fsp
										case "p":
											break;
										//fs
										default:
											$fontSize = $temp[$j].substring(2);
											$newNode.css("font-size", $fontSize / 8.5 + "vw");
											break;
									}
									break;
								case "r":
									switch($temp[$j].substring(2, 3)){
										//\frz
										case "z":
											break;
										//fr
										default:
											break;
									}
									break;
							}
							break;
						case "i":
							switch($temp[$j].substring(1, 2)){
								//\iclip
								case "c":
									break;
								//\i
								default:
									break;
							}
							break;
						case "k":
							switch($temp[$j].substring(1, 2)){
								//\kf
								case "f":
									break;
								//\ko
								case "o":
									break;
								//\kt
								case "t":
									break;
								//\k
								default:
									break;
							}
							break;
						case "K":
							break;	
						case "m":
							//move(50, 50, 100, 100, 1000, 3000)
							//$positions[0]="xxx", $positions[$positions.length]=" xxx)""
							var $positions = $temp[$j].substring(5).split(",");
							$posX = $positions[0].trim();
							$posY = $positions[1].trim();
							$toX = $positions[2].trim();
							if($positions.length < 5)
								$toY = $positions[3].substring(0, $positions[3].length-1).trim();
							else{
								$toY = $positions[3].trim();
								$moveStartTime = $positions[4].trim();
								$moveEndTime = $positions[5].substring(0, $positions[5].length-1).trim();
								$useMoveTime = true;
							}
							$useMargin = "m";
							$subtitleContent.pos = -1;
							break;
						case "o":
							break;
						case "p":
							switch($temp[$j].substring(1, 2)){
								//\pbo
								case "b":
									break;
								//\pos
								case "o":
									//pos(50,50)
									//$positions[0]="xxx", $positions[1]=" xxx)""
									var $positions = $temp[$j].substring(4).split(",");
									$posX = $positions[0].trim();
									$posY = $positions[1].substring(0, $positions[1].length-1).trim();
									$useMargin = "p";
									$subtitleContent.pos = -1;
									break;
								//\p
								default:
									break;
							}
							break;
						case "q":
							break;
						case "r":
							break;
						case "s":
							switch($temp[$j].substring(1, 2)){
								//\shad
								case "h":
									break;
								//\s
								default:
									break;
							}
							break;
						case "t":
							break;
						case "u":
							break;
						case "1":
							switch($temp[$j].substring(1, 2)){
								//\1a
								case "a":
									break;
								//\1c
								case "c":
									break;
							}
							break;
						case "2":
							switch($temp[$j].substring(1, 2)){
								//\2a
								case "a":
									break;
								//\2c
								case "c":
									break;
							}
							break;
						case "3":
							switch($temp[$j].substring(1, 2)){
								//\3a
								case "a":
									break;
								//\3c
								case "c":
									break;
							}
							break;
						case "4":
							switch($temp[$j].substring(1, 2)){
								//\4a
								case "a":
									break;
								//\4c
								case "c":
									break;
							}
							break;
					}
				}
			}
			//内容
			else{
				//TODO
				$k++;
			}
		}
		if($subtitleContent.pos == -1){
			$mySubtitleDiv = $('#mySubtitleDiv');
			$newNode.text($contentArray[$grouping[0]]);
			if($useMargin == "0"){
				$subtitleContent.an = $alignment;
				$subtitleContent.alignmentPos = $alignmentPos[0];
				//对齐方式同小键盘
				switch($alignment){
					//左下
					case 1:
						$newNode.css("padding", $mySubtitleDiv.height() * (1-style[$subtitleContent.Style].MarginV/scriptInfo["PlayResY"]) - $newNode.height() * (1 + $alignmentPos[0]) + "px 0 0 " + $mySubtitleDiv.width() * style[$subtitleContent.Style].MarginL/scriptInfo["PlayResX"] + "px");
						$subtitleContent.alignmentPos = $alignmentPos[0];
						$alignmentPos[0]++;
						break;
					//中下
					case 2:
						$newNode.css("padding", $mySubtitleDiv.height() * (1-style[$subtitleContent.Style].MarginV/scriptInfo["PlayResY"]) - $newNode.height() * (1 + $alignmentPos[1]) + "px 0 0 " + ($mySubtitleDiv.width() - $newNode.width()) / 2 + "px");
						$subtitleContent.alignmentPos = $alignmentPos[1];
						$alignmentPos[1]++;
						break;
					//右下
					case 3:
						$newNode.css("padding", $mySubtitleDiv.height() * (1-style[$subtitleContent.Style].MarginV/scriptInfo["PlayResY"]) - $newNode.height() * (1 + $alignmentPos[2]) + "px 0 0 " + $mySubtitleDiv.width() * (1-style[$subtitleContent.Style].MarginR/scriptInfo["PlayResX"]) - $newNode.width() + "px");
						$subtitleContent.alignmentPos = $alignmentPos[2];
						$alignmentPos[2]++;
						break;
					//左中
					case 4:
						$newNode.css("padding", ($mySubtitleDiv.height() - $newNode.height()) / 2 - $newNode.height() * $alignmentPos[3] + "px 0 0 " + $mySubtitleDiv.width() * style[$subtitleContent.Style].MarginL/scriptInfo["PlayResX"] + "px");
						$subtitleContent.alignmentPos = $alignmentPos[3];
						$alignmentPos[3]++;
						break;
					//中中
					case 5:
						$newNode.css("padding", ($mySubtitleDiv.height() - $newNode.height()) / 2 - $newNode.height() * $alignmentPos[4] + "px 0 0 " + ($mySubtitleDiv.width() - $newNode.width()) / 2 + "px");
						$subtitleContent.alignmentPos = $alignmentPos[4];
						$alignmentPos[4]++;
						break;
					//右中
					case 6:
						$newNode.css("padding", ($mySubtitleDiv.height() - $newNode.height()) / 2 - $newNode.height() * $alignmentPos[5] + "px 0 0 " + $mySubtitleDiv.width() * (1-style[$subtitleContent.Style].MarginR/scriptInfo["PlayResX"]) - $newNode.width() + "px");
						$subtitleContent.alignmentPos = $alignmentPos[5];
						$alignmentPos[5]++;
						break;
					//左上
					case 7:
						$newNode.css("padding", $mySubtitleDiv.height() * style[$subtitleContent.Style].MarginV/scriptInfo["PlayResY"] + $newNode.height() * $alignmentPos[6] + "px 0 0 " + $mySubtitleDiv.width() * style[$subtitleContent.Style].MarginL/scriptInfo["PlayResX"] + "px");
						$subtitleContent.alignmentPos = $alignmentPos[6];
						$alignmentPos[6]++;
						break;
					//中上
					case 8:
						$newNode.css("padding", $mySubtitleDiv.height() * style[$subtitleContent.Style].MarginV/scriptInfo["PlayResY"] + $newNode.height() * $alignmentPos[7] + "px 0 0 " + ($mySubtitleDiv.width() - $newNode.width()) / 2 + "px");
						$subtitleContent.alignmentPos = $alignmentPos[7];
						$alignmentPos[7]++;
						break;
					//右上
					case 9:
						$newNode.css("padding", $mySubtitleDiv.height() * style[$subtitleContent.Style].MarginV/scriptInfo["PlayResY"] + $newNode.height() * $alignmentPos[8] + "px 0 0 " + $mySubtitleDiv.width() * (1-style[$subtitleContent.Style].MarginR/scriptInfo["PlayResX"]) - $newNode.width() + "px");
						$subtitleContent.alignmentPos = $alignmentPos[8];
						$alignmentPos[8]++;
						break;
				}
			}
			else{
				$posX = $mySubtitleDiv.width() * $posX / scriptInfo["PlayResX"];
				$posY = $mySubtitleDiv.height() * $posY / scriptInfo["PlayResY"];
				$toX = $mySubtitleDiv.width() * $toX / scriptInfo["PlayResX"];
				$toY = $mySubtitleDiv.height() * $toY / scriptInfo["PlayResY"];
				//对齐方式同小键盘
				switch($alignment){
					//左下
					case 1:
						$posY = $posY - $newNode.height();
						$toY = $toY - $newNode.height();
						if($posX < 0 && $posY < 0){
							$newNode.css("margin", $posY + "px 0 0 " + $posX + "px");
						}
						else if($posX < 0){
							$newNode.css("margin-left", $posX + "px");
							$newNode.css("padding-top", $posY + "px");
						}
						else if($posY < 0){
							$newNode.css("padding-left", $posX + "px");
							$newNode.css("margin-top", $posY + "px");
						}
						else
							$newNode.css("padding", $posY + "px 0 0 " + $posX + "px");
						break;
					//中下
					case 2:
						$posX = $posX - $newNode.width() / 2;
						$posY = $posY - $newNode.height();
						$toX = $toX - $newNode.width() / 2;
						$toY = $toY - $newNode.height();
						if($posX < 0 && $posY < 0){
							$newNode.css("margin", $posY + "px 0 0 " + $posX + "px");
						}
						else if($posX < 0){
							$newNode.css("margin-left", $posX + "px");
							$newNode.css("padding-top", $posY + "px");
						}
						else if($posY < 0){
							$newNode.css("padding-left", $posX + "px");
							$newNode.css("margin-top", $posY + "px");
						}
						else
							$newNode.css("padding", $posY + "px 0 0 " + $posX + "px");
						break;
					//右下
					case 3:
						$posX = $posX - $newNode.width();
						$posY = $posY - $newNode.height();
						$toX = $toX - $newNode.width();
						$toY = $toY - $newNode.height();
						if($posX < 0 && $posY < 0){
							$newNode.css("margin", $posY + "px 0 0 " + $posX + "px");
						}
						else if($posX < 0){
							$newNode.css("margin-left", $posX + "px");
							$newNode.css("padding-top", $posY + "px");
						}
						else if($posY < 0){
							$newNode.css("padding-left", $posX + "px");
							$newNode.css("margin-top", $posY + "px");
						}
						else
							$newNode.css("padding", $posY + "px 0 0 " + $posX + "px");
						break;
					//左中
					case 4:
						$posY = $posY - $newNode.height() / 2;
						$toY = $toY - $newNode.height() / 2;
						if($posX < 0 && $posY < 0){
							$newNode.css("margin", $posY + "px 0 0 " + $posX + "px");
						}
						else if($posX < 0){
							$newNode.css("margin-left", $posX + "px");
							$newNode.css("padding-top", $posY + "px");
						}
						else if($posY < 0){
							$newNode.css("padding-left", $posX + "px");
							$newNode.css("margin-top", $posY + "px");
						}
						else
							$newNode.css("padding", $posY + "px 0 0 " + $posX + "px");
						break;
					//中中
					case 5:
						$posX = $posX - $newNode.width() / 2;
						$posY = $posY - $newNode.height() / 2;
						$toX = $toX - $newNode.width() / 2;
						$toY = $toY - $newNode.height() / 2;
						if($posX < 0 && $posY < 0){
							$newNode.css("margin", $posY + "px 0 0 " + $posX + "px");
						}
						else if($posX < 0){
							$newNode.css("margin-left", $posX + "px");
							$newNode.css("padding-top", $posY + "px");
						}
						else if($posY < 0){
							$newNode.css("padding-left", $posX + "px");
							$newNode.css("margin-top", $posY + "px");
						}
						else
							$newNode.css("padding", $posY + "px 0 0 " + $posX + "px");
						break;
					//右中
					case 6:
						$posX = $posX - $newNode.width();
						$posY = $posY - $newNode.height() / 2;
						$toX = $toX - $newNode.width();
						$toY = $toY - $newNode.height() / 2;
						if($posX < 0 && $posY < 0){
							$newNode.css("margin", $posY + "px 0 0 " + $posX + "px");
						}
						else if($posX < 0){
							$newNode.css("margin-left", $posX + "px");
							$newNode.css("padding-top", $posY + "px");
						}
						else if($posY < 0){
							$newNode.css("padding-left", $posX + "px");
							$newNode.css("margin-top", $posY + "px");
						}
						else
							$newNode.css("padding", $posY + "px 0 0 " + $posX + "px");
						break;
					//左上
					case 7:
						if($posX < 0 && $posY < 0){
							$newNode.css("margin", $posY + "px 0 0 " + $posX + "px");
						}
						else if($posX < 0){
							$newNode.css("margin-left", $posX + "px");
							$newNode.css("padding-top", $posY + "px");
						}
						else if($posY < 0){
							$newNode.css("padding-left", $posX + "px");
							$newNode.css("margin-top", $posY + "px");
						}
						else
							$newNode.css("padding", $posY + "px 0 0 " + $posX + "px");
						break;
					//中上
					case 8:
						$posX = $posX - $newNode.width() / 2;
						$toX = $toX - $newNode.width() / 2;
						if($posX < 0 && $posY < 0){
							$newNode.css("margin", $posY + "px 0 0 " + $posX + "px");
						}
						else if($posX < 0){
							$newNode.css("margin-left", $posX + "px");
							$newNode.css("padding-top", $posY + "px");
						}
						else if($posY < 0){
							$newNode.css("padding-left", $posX + "px");
							$newNode.css("margin-top", $posY + "px");
						}
						else
							$newNode.css("padding", $posY + "px 0 0 " + $posX + "px");
						break;
					//右上
					case 9:
						$posX = $posX - $newNode.width();
						$toX = $toX - $newNode.width();
						if($posX < 0 && $posY < 0){
							$newNode.css("margin", $posY + "px 0 0 " + $posX + "px");
						}
						else if($posX < 0){
							$newNode.css("margin-left", $posX + "px");
							$newNode.css("padding-top", $posY + "px");
						}
						else if($posY < 0){
							$newNode.css("padding-left", $posX + "px");
							$newNode.css("margin-top", $posY + "px");
						}
						else
							$newNode.css("padding", $posY + "px 0 0 " + $posX + "px");
						break;
				}
			}
			if($useMargin == "m"){
				$toX = $toX - $posX;
				$toY = $toY - $posY;
				var $time = 0;
				if($useMoveTime)
					$time = $moveEndTime - $moveStartTime;
				else
					//秒转毫秒
					$time = ($subtitleContent.End - $subtitleContent.Start) * 1000;
				//延迟
				var $delay = $moveStartTime - $subtitleContent.Start * 1000;
				var $toPosition = "mymove" + $subtitleContent.id + "{from {left:0px;top:0px;}to {left:" + $toX + "px;top:" + $toY + "px;}}";
				var $head = 
				"@keyframes " + $toPosition + 
				"@-ms-keyframes " + $toPosition + 
				"@-moz-keyframes " + $toPosition + 
				"@-webkit-keyframes " + $toPosition + 
				"@-o-keyframes " + $toPosition;
				$('head').append($("<style>" + $head + "</style>"));
				var $animation = $newNode.css["animation"];
				if(typeof($animation) != "undefined" && $animation.length > 0)
					$animation = $animation + "," + "mymove" + $subtitleContent.id + " " + $time + "ms " + $delay + "ms";
				else
					$animation = "mymove" + $subtitleContent.id + " " + $time + "ms " + $delay + "ms";
				$newNode.css("animation", $animation);
				/*
				var obj = {
					"transform": "translate(" + $toX + "px," + $toY +"px)",
					"-ms-transform": "translate(" + $toX + "px," + $toY +"px)", 	
					"-moz-transform": "translate(" + $toX + "px," + $toY +"px)", 	
					"-webkit-transform": "translate(" + $toX + "px," + $toY +"px)", 
					"-o-transform": "translate(" + $toX + "px," + $toY +"px)", 	
					"transition": "transform " + $time + "ms " + $delay + "ms",
					"-ms-transition": "-ms-transform " + $time + "ms " + $delay + "ms",
					"-moz-transition": "-moz-transform " + $time + "ms " + $delay + "ms",
					"-webkit-transition": "-webkit-transform " + $time + "ms " + $delay + "ms",
					"-o-transition": "-o-transform " + $time + "ms " + $delay + "ms"
				}
				*/
			}
		}
    	return $subtitleContent;
	};

    util.styleToCss = function($style){
		//字体颜色“BGR”蓝绿红颜色
		var fontRgb = new Array();
		fontRgb["b"] = $style.PrimaryColour.substring(2, 4);
		fontRgb["g"] = $style.PrimaryColour.substring(4, 6);
		fontRgb["r"] = $style.PrimaryColour.substring(6, 8);
		fontRgb["r"] = util.hexadecimalToDecimal(fontRgb["r"]);
		fontRgb["g"] = util.hexadecimalToDecimal(fontRgb["g"]);
		fontRgb["b"] = util.hexadecimalToDecimal(fontRgb["b"]);
		//字体透明度，ass一十六进制计0为不透明255为透明，而css以0为透明1为不透明
		var $fontPpacity = $style.PrimaryColour.substring(0, 2);
		$fontPpacity = util.hexadecimalToDecimal($fontPpacity);
		$fontPpacity = Math.abs($fontPpacity / 255 - 1);

		//字体边框颜色
		var borderRgb = new Array();
		borderRgb["b"] = $style.OutlineColour.substring(2, 4);
		borderRgb["g"] = $style.OutlineColour.substring(4, 6);
		borderRgb["r"] = $style.OutlineColour.substring(6, 8);
		borderRgb["r"] = util.hexadecimalToDecimal(borderRgb["r"]);
		borderRgb["g"] = util.hexadecimalToDecimal(borderRgb["g"]);
		borderRgb["b"] = util.hexadecimalToDecimal(borderRgb["b"]);
		//字体边框透明度，ass一十六进制计0为不透明255为透明，而css以0为透明1为不透明
		var $borderPpacity = $style.OutlineColour.substring(0, 2);
		$borderPpacity = util.hexadecimalToDecimal($borderPpacity);
		$borderPpacity = Math.abs($borderPpacity / 255 - 1);

		//阴影颜色
		var backRgb = new Array();
		backRgb["b"] = $style.BackColour.substring(2, 4);
		backRgb["g"] = $style.BackColour.substring(4, 6);
		backRgb["r"] = $style.BackColour.substring(6, 8);
		backRgb["r"] = util.hexadecimalToDecimal(backRgb["r"]);
		backRgb["g"] = util.hexadecimalToDecimal(backRgb["g"]);
		backRgb["b"] = util.hexadecimalToDecimal(backRgb["b"]);
		//阴影透明度，ass一十六进制计0为不透明255为透明，而css以0为透明1为不透明
		var $backPpacity = $style.BackColour.substring(0, 2);
		$backPpacity = util.hexadecimalToDecimal($backPpacity);
		$backPpacity = Math.abs($backPpacity / 255 - 1);

		//粗体
		var $bold = "normal";
		if($style.Bold == -1 || $style.Bold == 1)
			$bold = "bold";

		//斜体
		var $italic = "normal";
		if($style.Italic == -1 || $style.Italic == 1)
			$italic = "italic";

		//下划线
		var $line = "none";
		if($style.Underline == -1 || $style.Underline == 1)
			$italic = "underline";
		//删除线
		if($style.StrikeOut == -1 || $style.StrikeOut == 1)
			$italic = "line-through";

		var css = {
		    "position": "absolute",//绝对定位
			"display": "inline-block",//宽度自适应内容
			"line-height": "1em",//行高
			"font-family": $style.Fontname,//字体类型
			"font-size": $style.Fontsize / 8.5 + "vw",//字体大小，字号转vw除以10
			"color": "rgba(" + fontRgb["r"] + "," + fontRgb["g"] + "," + fontRgb["b"] + "," + $fontPpacity + ")",//字体颜色及透明度
			"font-weight": $bold,//粗体
			"font-style": $italic,//斜体
			"text-decoration": $line,//下划线或删除线
            "letter-spacing": $style.Spacing / 10 + "vw"//行间距
		};
		
		//边框样式，1=边框+阴影，3=不透明底框
		if($style.BorderStyle == 1){
			var $scaledBorderAndShadow = "px";
			if(scriptInfo["ScaledBorderAndShadow"] == "yes" || scriptInfo["ScaledBorderAndShadow"] == "Yes" || scriptInfo["ScaledBorderAndShadow"] == "YES"){
				$scaledBorderAndShadow = "vw";
				css["-webkit-text-stroke"] = $style.Outline / 15.0 + $scaledBorderAndShadow + " rgba(" + borderRgb["r"] + "," + borderRgb["g"] + "," + borderRgb["b"] + "," + $borderPpacity + ")";//边框宽度 边框颜色及透明度
				//$style.Shadow / 7 + $scaledBorderAndShadow + " " + $style.Shadow / 7 + $scaledBorderAndShadow + " 0 rgba(" + backRgb["r"] + "," + backRgb["g"] + "," + backRgb["b"] + "," + $backPpacity + ")"
				css["text-shadow"] = "0 0 0 rgba(" + backRgb["r"] + "," + backRgb["g"] + "," + backRgb["b"] + "," + $backPpacity + ")," + $style.Shadow / 10 + $scaledBorderAndShadow + " " + $style.Shadow / 10 + $scaledBorderAndShadow + " 0 rgba(" + backRgb["r"] + "," + backRgb["g"] + "," + backRgb["b"] + "," + $backPpacity + ")," + $style.Shadow / 9 + $scaledBorderAndShadow + " " + $style.Shadow / 9 + $scaledBorderAndShadow + " 0 rgba(" + backRgb["r"] + "," + backRgb["g"] + "," + backRgb["b"] + "," + $backPpacity + ")," + $style.Shadow / 8 + $scaledBorderAndShadow + " " + $style.Shadow / 8 + $scaledBorderAndShadow + " 0 rgba(" + backRgb["r"] + "," + backRgb["g"] + "," + backRgb["b"] + "," + $backPpacity + ")," + $style.Shadow / 7 + $scaledBorderAndShadow + " " + $style.Shadow / 7 + $scaledBorderAndShadow + " 0 rgba(" + backRgb["r"] + "," + backRgb["g"] + "," + backRgb["b"] + "," + $backPpacity + ")";//阴影
			}
			else{
				css["-webkit-text-stroke"] = $style.Outline + $scaledBorderAndShadow + " rgba(" + borderRgb["r"] + "," + borderRgb["g"] + "," + borderRgb["b"] + "," + $borderPpacity + ")";//边框宽度 边框颜色及透明度
				//$style.Shadow / 7 + $scaledBorderAndShadow + " " + $style.Shadow / 7 + $scaledBorderAndShadow + " 0 rgba(" + backRgb["r"] + "," + backRgb["g"] + "," + backRgb["b"] + "," + $backPpacity + ")"
				css["text-shadow"] = "0 0 0 rgba(" + backRgb["r"] + "," + backRgb["g"] + "," + backRgb["b"] + "," + $backPpacity + ")," + $style.Shadow + $scaledBorderAndShadow + " " + $style.Shadow + $scaledBorderAndShadow + " 0 rgba(" + backRgb["r"] + "," + backRgb["g"] + "," + backRgb["b"] + "," + $backPpacity + ")," + $style.Shadow * 0.5 + $scaledBorderAndShadow + " " + $style.Shadow * 0.5 + $scaledBorderAndShadow + " 0 rgba(" + backRgb["r"] + "," + backRgb["g"] + "," + backRgb["b"] + "," + $backPpacity + ")," + $style.Shadow * 1.5 + $scaledBorderAndShadow + " " + $style.Shadow * 1.5 + $scaledBorderAndShadow + " 0 rgba(" + backRgb["r"] + "," + backRgb["g"] + "," + backRgb["b"] + "," + $backPpacity + ")," + $style.Shadow * 2 + $scaledBorderAndShadow + " " + $style.Shadow * 2 + $scaledBorderAndShadow + " 0 rgba(" + backRgb["r"] + "," + backRgb["g"] + "," + backRgb["b"] + "," + $backPpacity + ")";//阴影
			}
		}
		else if($style.BorderStyle == 3){
			css["background-color"] = "rgba(" + borderRgb["r"] + "," + borderRgb["g"] + "," + borderRgb["b"] + "," + $borderPpacity + ")";
			css["box-shadow"] = $style.Shadow / 4 + "vw " + $style.Shadow / 4 + "vw 0vw rgba(" + backRgb["r"] + "," + backRgb["g"] + "," + backRgb["b"] + "," + $backPpacity + ")";
		}

		//旋转角度，ass和css差个负号
		var $angle = $style.Angle;
		$angle = -$angle;
		if($style.Angle != 0){
		    css["transform"] = "rotate(" + $angle + "deg)";
		    css["-ms-transform"] = "rotate(" + $angle + "deg)";/* Internet Explorer */
		    css["-moz-transform"] = "rotate(" + $angle + "deg)";/* Firefox */
		    css["-webkit-transform"] = "rotate(" + $angle + "deg)";/* Safari 和 Chrome */
		    css["-o-transform"] = "rotate(" + $angle + "deg)";/* Opera */
        }
		return css;
	};

    //十六进制转十进制
	util.hexadecimalToDecimal = function($hex){
		var $temp1 = $hex.substring(0, 1);
		var $temp2 = $hex.substring(1, 2);
		switch($temp1){
			case "A":
				$temp1 = 10;
				break;
			case "B":
				$temp1 = 11;
				break;
			case "C":
				$temp1 = 12;
				break;
			case "D":
				$temp1 = 13;
				break;
			case "E":
				$temp1 = 14;
				break;
			case "F":
				$temp1 = 15;
				break;
		}
		switch($temp2){
			case "A":
				$temp2 = 10;
				break;
			case "B":
				$temp2 = 11;
				break;
			case "C":
				$temp2 = 12;
				break;
			case "D":
				$temp2 = 13;
				break;
			case "E":
				$temp2 = 14;
				break;
			case "F":
				$temp2 = 15;
				break;
		}
		$hex = parseInt($temp1 * 16) + parseInt($temp2);
		return $hex;
	};

    //窗口大小改变时自适应
    $(window).resize(function(){
        if($video != null){
            var $width = $video.width();
            var $height = $video.height();
            $mySubtitleDiv.css("width", $width);
            $mySubtitleDiv.css("height", $height);
        }
    });
	
	//归并排序，开始时间
	util.MergeSortStart = function($array){
		$tempArray = new Array();
		util.sortStart($array, 0, $array.length-1, $tempArray);
	};
	
	//分组
	util.sortStart = function($array, $left, $right, $tempArray){
		if($left < $right){
			//取中值，向下取整
			var $mid = Math.floor(($left + $right) / 2);
			util.sortStart($array, $left, $mid, $tempArray);
			util.sortStart($array, $mid + 1, $right, $tempArray);
			util.mergeStart($array, $left, $mid, $right, $tempArray);
		}
	};
	
	//合并
	util.mergeStart = function($array, $left, $mid, $right, $tempArray){
		//左指针，右指针。临时指针
		var $i = $left;
		var $j = $mid + 1;
		var $k = 0;
		//左右对比小的加入临时数组
		while($i <= $mid && $j <= $right){
			if($array[$i].Start <= $array[$j].Start){
				$tempArray[$k++] = $array[$i++];
			}
			else{
				$tempArray[$k++] = $array[$j++];
			}
		}
		//将左边剩余加入临时数组，左边和右边只有有一边剩余
		while($i <= $mid){
			$tempArray[$k++] = $array[$i++];
		}
		//将右边剩余加入临时数组
		while($j <= $right){
			$tempArray[$k++] = $array[$j++];
		}
		//将临时数组中的数据放回原来数组
		$k = 0;
		while($left <= $right){
			$array[$left++] = $tempArray[$k++];
		}
	};
	
	//归并排序，结束时间
	util.MergeSortEnd = function($array){
		$tempArray = new Array();
		util.sortEnd($array, 0, $array.length-1, $tempArray);
	};
	
	//分组
	util.sortEnd = function($array, $left, $right, $tempArray){
		if($left < $right){
			//取中值，向下取整
			var $mid = Math.floor(($left + $right) / 2);
			util.sortEnd($array, $left, $mid, $tempArray);
			util.sortEnd($array, $mid + 1, $right, $tempArray);
			util.mergeEnd($array, $left, $mid, $right, $tempArray);
		}
	};
	
	//合并
	util.mergeEnd = function($array, $left, $mid, $right, $tempArray){
		//左指针，右指针。临时指针
		var $i = $left;
		var $j = $mid + 1;
		var $k = 0;
		//左右对比小的加入临时数组
		while($i <= $mid && $j <= $right){
			if($array[$i].End <= $array[$j].End){
				$tempArray[$k++] = $array[$i++];
			}
			else{
				$tempArray[$k++] = $array[$j++];
			}
		}
		//将左边剩余加入临时数组，左边和右边只有有一边剩余
		while($i <= $mid){
			$tempArray[$k++] = $array[$i++];
		}
		//将右边剩余加入临时数组
		while($j <= $right){
			$tempArray[$k++] = $array[$j++];
		}
		//将临时数组中的数据放回原来数组
		$k = 0;
		while($left <= $right){
			$array[$left++] = $tempArray[$k++];
		}
	};
	
	//归并排序，id
	util.MergeSortID = function($array){
		$tempArray = new Array();
		util.sortID($array, 0, $array.length-1, $tempArray);
	};
	
	//分组
	util.sortID = function($array, $left, $right, $tempArray){
		if($left < $right){
			//取中值，向下取整
			var $mid = Math.floor(($left + $right) / 2);
			util.sortID($array, $left, $mid, $tempArray);
			util.sortID($array, $mid + 1, $right, $tempArray);
			util.mergeID($array, $left, $mid, $right, $tempArray);
		}
	};
	
	//合并
	util.mergeID = function($array, $left, $mid, $right, $tempArray){
		//左指针，右指针。临时指针
		var $i = $left;
		var $j = $mid + 1;
		var $k = 0;
		//左右对比小的加入临时数组
		while($i <= $mid && $j <= $right){
			if($array[$i].id <= $array[$j].id){
				$tempArray[$k++] = $array[$i++];
			}
			else{
				$tempArray[$k++] = $array[$j++];
			}
		}
		//将左边剩余加入临时数组，左边和右边只有有一边剩余
		while($i <= $mid){
			$tempArray[$k++] = $array[$i++];
		}
		//将右边剩余加入临时数组
		while($j <= $right){
			$tempArray[$k++] = $array[$j++];
		}
		//将临时数组中的数据放回原来数组
		$k = 0;
		while($left <= $right){
			$array[$left++] = $tempArray[$k++];
		}
	};
}());