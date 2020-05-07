(function () {
    var $navs = $('#navs > li');
    // 菜单项的点击事件，切换面板
    $navs.on('click', function (e) {
        var $this = $(this);
        var sibs = $this.siblings();
        var spe = $this.data('panel');
        $this.addClass('active');
        sibs.removeClass('active');

        var $panel = $(spe);
        var $panelSibs = $panel.siblings('div');
        $panel.addClass('panel-action');
        $panelSibs.removeClass('panel-action');
    });

    // 获取数据库中所有的分工会，并渲染到所有的select中
    var getAllDepartments = function (url) {
        $.get(url, function (data) {
            data = JSON.parse(data);
            renderAllDepartments(data);
        });
    };

    // 渲染获取到的分工会数据到select中
    var renderAllDepartments = function (data) {
        var $depSelect = $('.real-institute');
        var html = '<option value="0">全部分工会</option>';
        data.forEach(function (dep) {
            html += '<option value="' + dep[0] + '">' + dep[1] + '</option>';
        })
        $depSelect.html(html);
    };

    // 提交查询的信息，将查询到的数据渲染到table中
    var postCheck = function (url, obj) {
        var $tbody = $('#search-pay-info tbody');
        $.post(url, obj, function (data) {
            if (data == '21000') {
                var M = sAlert({content: '查询失败', title: '错误', error: true});
                M.show();
                $tbody.html('');
                return;
            }
            data = JSON.parse(data);
            html = '';
            if (!data || data.length === 0) {
                html += '没有查找到符合的数据'
            } else {
                data.forEach(function (ele, index) {
                    var text = '<tr>'
                        + '<th>' + (index + 1) + '</th>'
                        + '<th>' + ele[0] + '</th>'
                        + '<th>' + ele[1] + '</th>'
                        + '<th>' + ele[2] + '</th>'
                        + '<th>' + ele[3] + '</th>'
                        + '<th>' + ele[4] + '</th>'
                        + '<th>' + ele[5] + '</th>'
                        + '<th>' + ele[6] + '</th>'
                        + '<th>' + ele[7] + '</th>'
                        + '</tr>';
                    html += text;
                });
            }
            $tbody.html(html);
        });
    };

    // 查询补助的信息，将数据渲染到table中
    var renderHelp = function (url, obj) {
        var $tbody = $('#search-help-info tbody');
        $.post(url, obj, function (data) {
            if (data == '10022') {
                var M = sAlert({content: '查询失败', title: '错误', error: true});
                M.show();
                $tbody.html('');
                return;
            }
            data = JSON.parse(data);
            html = '';
            if (!data || data.length === 0) {
                html += '没有查找到符合的数据'
            } else {
                data.forEach(function (ele, index) {
                    var text = '<tr>'
                        + '<th>' + (index + 1) + '</th>'
                        + '<th>' + ele[0] + '</th>'
                        + '<th>' + ele[1] + '</th>'
                        + '<th>' + ele[2] + '</th>'
                        + '<th>' + ele[3] + '</th>'
                        + '<th>' + ele[4] + '</th>'
                        + '<th>' + ele[5] + '</th>'
                        + '</tr>';
                    html += text;
                });
            }
            $tbody.html(html);
        });
    }
    // 未使用
    var renderTotal = function (index) {
        $.post('./query_total', {depid: index}, function (data) {
            var text = '<span id="total">' + index + '</span>';
            $display.append($(text));
        });
    };
    // 判断字符串是否为空
    var isEmptyStr = function (str) {
        return str.trim() === '';
    };
    // 查询按钮
    var $checkPay = $('#check-pay');
    // 查询按钮点击事件
    $checkPay.on('click', function () {
        var $institute = $('#search-pay-info #institute');
        var $name =      $('#search-pay-info #name');
        var $personid =  $('#search-pay-info #personid');
        var $year =      $('#search-pay-info #year');

        var situation = 0;
        var name =      $name.val().trim();
        var institute = $institute.val();
        var personid =  $personid.val().trim();
        var year =      $year.val().trim();

		var hasName  = !isEmptyStr(name);
        var hasIns   = (institute != 0);
        var hasYear  = !isEmptyStr(year);
        var hasPerId = !isEmptyStr(personid);

        if (hasPerId) {
            if (hasYear) situation = 2; // 身份证 + 年份 为1
            else situation = 1; // 单独身份证 为2
        } else if (hasIns && (hasName || hasYear)) {
			if (hasName && hasYear) {
				situation = 4;
			} else if (hasName) situation = 3; // 部门 + 姓名 为3
            else if (hasYear) situation = 6; // 部门 + 年份 为6
        } else if (!hasIns && hasName) {
            situation = 7; // 单独姓名为7
        } else {
            var M = sAlert({content: '格式不正确', title: '格式错误'});
            M.show();
            return;
        }

		$('input').val('');

        var obj = {
            num:     situation,
            name:    name,
            depid:   institute,
            ID:      personid,
            payYear: year,
        };
        postCheck('./query/query.php', obj);
    });
    // 查询补助信息按钮
    var $checkHelp = $('#check-help');
    // 点击事件
    $checkHelp.on('click', function () {
        var $institute = $('#search-help-info #institute');
        var $year =      $('#search-help-info #year');
        var $personid =  $('#search-help-info #personid');
        var $name =      $('#search-help-info #name');

        var situation = 0;
        var name =      $name.val().trim();
        var institute = $institute.val();
        var personid =  $personid.val().trim();
        var year =      $year.val().trim();

        var hasName =  !isEmptyStr(name);
        var hasIns =   (institute != 0);
        var hasYear =  !isEmptyStr(year);
        var hasPerId = !isEmptyStr(personid);

        if (hasPerId) {
            if (hasYear) situation = 2; // 身份证 + 年份 为1
            else situation = 1; // 单独身份证 为2
        } else if (hasIns && (hasName || hasYear)) {
			if (hasName && hasYear) {
				situation = 4;
			} else if (hasName) situation = 3; // 部门 + 姓名 为3
            else if (hasYear) situation = 6; // 部门 + 年份 为6
        } else if (hasYear) {
            situation = 8; // 单独年份
        } else if (!hasIns && hasName) {
            situation = 7; // 单独姓名为7
        } else {
            var M = sAlert({content: '格式不正确', title: '格式错误'});
            M.show();
            return;
        }

        var obj = {
            num: situation,
            name: name,
            depid: institute,
            ID: personid,
            payYear: year,
        };

        renderHelp('./query/query_compen.php', obj);
    });
    getAllDepartments('./query/query_department.php');
}());
