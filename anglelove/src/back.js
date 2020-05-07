/*global $ sAlert*/
(function () {
    var isEmpty = function (str) {
        return str == '';
    };

    var util = {};

    util.reRerenderObj = null;

    /**
     * 获取数据库中所有的分工会，并渲染到所有的select中
     */
    util.getAllDepartments = function (url) {
        $.get(url, function (data) {
            data = JSON.parse(data);
            util.renderAllDepartments(data);
        });
    };

    /**
     * 渲染获取到的分工会数据到select中
     */
    util.renderAllDepartments = function (data) {
        var $depSelect = $('.real-institute');
        var html = '<option value="0">全部分工会</option>';
        data.forEach(function (dep) {
            html += '<option value="' + dep[0] + '">' + dep[1] + '</option>';
        })
        $depSelect.html(html);
    };

    /**
     * 添加新会员，调用post方法传递obj到后台
     */
    util.insertWorker = function (url, obj) {
        $.post(url, obj, function (data) {
            var M;
            if (data == '20006') {
                M = sAlert({content: '身份证号已存在', title: '错误', error: true});
                M.show();
            } else if (data == '2000020010' || data == '2000120010') {
                M = sAlert({content: '操作成功', title: '成功'});
                M.show();
            } else {
                M = sAlert({content: '服务器出错', title: '错误', error: true});
                M.show();
            }
        });
    };

    /**
     * 添加补助信息，obj为传递的对象，url为请求的后台接口
     */
    util.addHelpPay = function (url, obj) {
        $.post(url, obj, function (data) {
            if (data == '10020') {
                 M = sAlert({content: '操作成功', title: '成功'});
                 M.show();
            } else if (data == '10021') {
                M = sAlert({content: '服务器错误', title: '错误', error: true});
                M.show();
            }
        });
    };

    /**
     * 修改会员信息 获取并渲染数据
     * 获取后端传来的信息，并渲染到table中
     */
    util.updateMember = function (url, obj) {

        $.post(url, obj, function (data) {
             if (data == '21000') {
                 M = sAlert({content: '服务器错误', title: '错误', error: true});
                 M.show();
             }
             data = JSON.parse(data);
        
             if (!data || data.length == 0) {
                 M = sAlert({content: '没有查询到相关数据', title: '错误'});
                 M.show();
                 return;
             }
             // 将数据保存
             util.cacheData = data;
             util.updateMemberRender(data);
         });
    };

    /**
    * 修改会员补助信息，获取并渲染数据
    * 获取后端传来的信息，并渲染到table中
    */
    util.updateMemberHelp = function (url, obj) {

        // $.get('../data/help.json', function (data) {
        //     if (data == '') {
        //         M = sAlert({content: '服务器错误', title: '错误'});
        //         M.show();
        //     }
        //
        //     // data = JSON.parse(data);
        //
        //     if (!data || data.length == 0) {
        //         M = sAlert({content: '没有查询到相关数据', title: '错误'});
        //         M.show();
        //         return;
        //     }
        //     util.cacheData = data;
        //     console.log(data);
        //     util.updateMemberRenderHelp(data);
        // });


        $.post(url, obj, function (data) {
            if (data == '10023') {
                M = sAlert({content: '服务器错误', title: '错误'});
                M.show();
            }
            data = JSON.parse(data);

            if (!data || data.length == 0) {
                M = sAlert({content: '没有查询到相关数据', title: '错误'});
                M.show();
                return;
            }
            util.cacheData = data;
            util.updateMemberRenderHelp(data);
        });
    };

    /**
     * 添加所有checkbox的点击事件，点击后如果checked的数量大于1,显现分工会转移的按钮，不然隐藏
     */
    util.addCheckBoxEvent = function () {
        var $checkBoxes = $('.mock-checkbox');
        $checkBoxes.on('click', function (event) {
            var $this = $(this);
            $this.toggleClass('checked');
            var size = $('.checked').length;
            if (size > 0) {
                $('#update-member .change-some-department').css('display', 'block');
            } else {
                $('#update-member .change-some-department').hide();
            }
        });
    };

    /**
     * 添加修改会员缴费信息中每一列的修改按钮的事件，显现modal框，将列中的数据填充到框中的表单中
     */
    util.addUpdateMemberEvent = function () {
        var $btns = $('#update-member tbody .table-update');
        $btns.on('click', function (event) {
            var $this = $(this);
            var $row = $this.parents('tr');
            // 将要修改的列添加到变量 util.reRenderObj中
            util.reRerenderObj = $row;

            var ths = $row.children('th');
            var $modal = $('.update-modal');

            $modal.toggleClass('hide');

            // 获取当前行在缓存数组中的位置
            var rowNum = $row.data('rows');
            // 保存当前操作的列在数组中的位置
            util.rowNum = rowNum;
            var data = util.cacheData;

            var personId = data[rowNum][3];
            var department = data[rowNum][0];
            var name = data[rowNum][1];
            var payNum = data[rowNum][4];
            var payDate = data[rowNum][6];
            var sex = data[rowNum][2];
            var payCom = data[rowNum][5];
            var payNote = data[rowNum][7];

            var confirmId = data[rowNum][8];

            $('.update-modal #personid').val(personId);
            $('.update-modal #department').val(department);
            $('.update-modal #name').val(name);
            $('.update-modal #pay-num').val(payNum);
            $('.update-modal #pay-date').val(payDate);
            $('.update-modal #sex').val(sex);
            $('.update-modal #pay-com').val(payCom);
            $('.update-modal #pay-note').val(payNote);
            $('.update-modal #confirm-id').val(confirmId);
        });
    };

    /**
     * 添加修改会员补助信息中每一列的修改按钮的事件，显现modal框，将列中的数据填充到框中的表单中
     */
    util.addUpdateMemberHelpEvent = function () {
        var $modal = $('.update-help-modal');

        var $btns = $('#update-member tbody .table-update');
        $btns.on('click', function (event) {
            var $this = $(this);
            var $row = $this.parents('tr');

            // 将要修改的列添加到变量 util.reRenderObj中
            util.reRerenderObj = $row;

            var ths = $row.children('th');

            $modal.toggleClass('hide');

            // 获取当前行在缓存数组中的位置
            var rowNum = $row.data('rows');
            // 保存当前操作的列在数组中的位置
            util.rowNum = rowNum;
            var data = util.cacheData;

            var helpDate = data[rowNum][4];
            var helpNote = data[rowNum][5];
            var confirmId = data[rowNum][6];

            $('.update-help-modal #help-date').val(helpDate);
            $('.update-help-modal #help-note').val(helpNote);
            $('.update-help-modal #confirm-id').val(confirmId);
        });
    };

    util.addMemberDelEvent = function () {
        var $deleteBtns = $('#update-member tbody .table-delete');
        $deleteBtns.on('click', function (e) {
            var $this = $(this);
            var $row = $this.parents('tr');
            var ths = $row.children('th');

            // 获取当前行在缓存数组中的位置
            var rowNum = $row.data('rows');
            // 保存当前操作的列在数组中的位置
            util.rowNum = rowNum;

            var confirmId = null;
            var url = '';
			var obj = {};

            if (util.checkHelp) {
                obj.id = util.cacheData[rowNum][6];
                url = './delete/delete_info.php';
            } else {
                obj.ID = util.cacheData[rowNum][3];
				obj.payyear = util.cacheData[rowNum][6];
                url = './delete/delete_fee.php';
            }
				
            var M = sAlert({content: '确定删除该信息？', title: '删除', confirm: true}, function (res) {
				
                if (res == 1) {
                    $.post(url, obj, function (data) {
                        
                        if (data == '10025') {
                            M = sAlert({content: '服务器错误', title: '错误', error: true});
                            M.show();
                        } else {
                            M = sAlert({content: '成功', title: '成功'});
                            M.show();
                            delete util.cacheData[util.rowNum];
                            if (util.checkHelp) {
                                util.updateMemberRenderHelp(util.cacheData);
                            } else {
                                util.updateMemberRender(util.cacheData);
                            }
                        }
                    });
                }

                // if (res == 1) {
                //     M = sAlert({content: '成功', title: '成功'});
                //     M.show();
                //     delete util.cacheData[util.rowNum];
                //     util.updateMemberRenderHelp(util.cacheData);
                //     console.log(util.cacheData);
                // }
            });

            M.show();
        });
    };

	// 批量转移分工会
	util.changeSomeDepartment = function (url, obj, boxes) {
		$.post(url, obj, function (data) {
			if (data == '20007') {
				M = sAlert({content: '修改失败', title: '错误', error: true});
                M.show();
			} else {
				M = sAlert({content: '修改成功', title: '成功'});
                M.show();
				// 将转移工会的列去除
				boxes.parents('tr').remove();
			}
		});
	};

    /**
     * 初始化modal框中的几个按钮的事件，在init方法中调用，初始化一次
     */
    util.addUpdateBtnEvent = function () {
        var $confirmBtn = $('.update-modal .update-confirm');
        var $helpConfirmBtn = $('.update-help-modal .update-confirm');
        var $quitBtn = $('#update-text .update-quit');
        var $departmentBtn = $('#update-text .update-department-btn');
        // 修改单个信息框中修改按钮的点击事件
        $confirmBtn.on('click', function () {
            var personId = $('.update-modal #personid').val().trim();
            var name = $('.update-modal #name').val().trim();
            var payNum = $('.update-modal #pay-num').val().trim();
            var payDate = $('.update-modal #pay-date').val().trim();
            var sex = $('.update-modal #sex').val().trim();
            var payCom = $('.update-modal #pay-com').val().trim();
            var payNote = $('.update-modal #pay-note').val().trim();

            var confirmId = $('.update-modal #confirm-id').val().trim();

            var obj = {
                IDNumber: personId,
                name: name,
                sex: sex,
                fee: payNum,
                year: payDate,
                afterPay: payCom,
                note: payNote,
                id: confirmId,
            }

            $(this).parents('.update-modal').toggleClass('hide');
            // ./update/update_info.php
            util.postUpdateInfo('./update/update_info.php', obj);
        });

        $helpConfirmBtn.on('click', function () {
            var helpDate = $('.update-help-modal #help-date').val().trim();
            var helpNote = $('.update-help-modal #help-note').val().trim();
            var confirmId = $('.update-help-modal #confirm-id').val().trim();

            var obj = {
                year: helpDate,
                compensationInfo: helpNote,
                id: confirmId,
            }

            $(this).parents('.update-help-modal').toggleClass('hide');
			
            util.postUpdateInfo('./update/update_compensation_info.php', obj);
        });

        // 转移分工会框中的修改按钮的点击事件
        $departmentBtn.on('click', function () {
            var $this = $(this);
            var $checkBoxes = $('.checked');
            var toDep = $('.update-modal-department select').val();
            var $person = $checkBoxes.parent().siblings('.person-id');
			var $years = $checkBoxes.parent().siblings('.person-year');
            var personIds = [];
			var personYears = [];
            $person.each(function (index) {
                personIds.push($(this).html());
            });
			$years.each(function (index) {
				personYears.push($(this).html());
			});

            var size = $('.checked').length;
            if (size == 0) {
                $('#update-member .change-some-department').hide();
            }
            $this.parents('.update-modal-department').toggleClass('hide');
			var obj = {
				dep_id: toDep,
				id: JSON.stringify(personIds),
				year: JSON.stringify(personYears)
            };
			util.changeSomeDepartment('./update/update_dep.php', obj, $checkBoxes);

        });
        // 框中取消按钮的点击事件
        $quitBtn.on('click', function () {
            $(this).parents('#update-text').parent().toggleClass('hide');
        });
    };

    // 单选框的组建字符串，可惜。。
    var checkBoxStr = '<span class="mock-checkbox">'
                    + '<span>✓</span>'
                    + '</span>';
    /**
     * 修改会员信息 渲染查询到的数据到table中
     */
    util.updateMemberRender = function (data) {
        var $thead = $('#update-member thead');
        var $tbody = $('#update-member tbody');

        var headStr = '<tr>'
            + '<th>选择</th>'
            + '<th>#</th>'
            + '<th>分工会</th>'
            + '<th>姓名</th>'
            + '<th>性别</th>'
            + '<th>身份证号</th>'
            + '<th>缴费金额</th>'
            + '<th>是否补缴</th>'
            + '<th>年份</th>'
            + '<th>备注</th>'
            + '</tr>';
        $thead.html(headStr);

        var html = '';
        data.forEach(function (ele, index) {
            var text = '<tr data-rows="' + index + '">'
                + '<th>' + checkBoxStr + '</th>'
                + '<th>' + (index + 1) + '</th>'
                + '<th>' + ele[0] + '</th>'
                + '<th>' + ele[1] + '</th>'
                + '<th>' + ele[2] + '</th>'
                + '<th>' + ele[3] + '</th>'
                + '<th>' + ele[4] + '</th>'
                + '<th>' + ele[5] + '</th>'
                + '<th class="person-year">' + ele[6] + '</th>'
                + '<th>' + ele[7] + '</th>'
                + '<th class="person-id" style="display: none;">' + ele[8] + '</th>'
                + '<th><button class="btn btn-primary af-btn table-update">修改</button></th>'
                + '<th><button class="btn btn-primary af-btn table-delete">删除</button></th>'
                + '</tr>';
            html += text;
        });
        $tbody.html(html);
        util.addCheckBoxEvent();
        util.addUpdateMemberEvent();
        util.addMemberDelEvent();
    }

    /**
     * 修改会员补助信息 渲染查询到的数据到table中
     */
    util.updateMemberRenderHelp = function (data) {
        var $thead = $('#update-member thead');
        var $tbody = $('#update-member tbody');

        var headStr = '<tr>'
            + '<th>选择</th>'
            + '<th>#</th>'
            + '<th>分工会</th>'
            + '<th>姓名</th>'
            + '<th>性别</th>'
            + '<th>身份证号</th>'
            + '<th>补助年份</th>'
            + '<th>补助信息</th>'
            + '</tr>';
        $thead.html(headStr);

        var html = '';
        data.forEach(function (ele, index) {
            var text = '<tr data-rows="' + index + '">'
                + '<th>' + checkBoxStr + '</th>'
                + '<th>' + (index + 1) + '</th>'
                + '<th>' + ele[0] + '</th>'
                + '<th>' + ele[1] + '</th>'
                + '<th>' + ele[2] + '</th>'
                + '<th>' + ele[3] + '</th>'
                + '<th class="person-year">' + ele[4] + '</th>'
                + '<th>' + ele[5] + '</th>'
                + '<th class="person-id" style="display: none;">' + ele[6] + '</th>'
                + '<th><button class="btn btn-primary af-btn table-update">修改</button></th>'
                + '<th><button class="btn btn-primary af-btn table-delete">删除</button></th>'
                + '</tr>';
            html += text;
        });
        $tbody.html(html);
        util.addUpdateMemberHelpEvent();
        util.addMemberDelEvent();
    };

    // 修改会员信息后重新渲染被修改列的信息
    util.rerenderWorkerInfo = function (nInfo) {
        var $row = util.reRerenderObj;

        // var obj = {
        //     IDNumber: personId,
        //     name: name,
        //     sex: sex,
        //     fee: payNum,
        //     year: payDate,
        //     afterPay: payCom,
        //     note: payNote,
        //     id: confirmId,
        // }

        var data = util.cacheData;
        var rowNum = util.rowNum;
        if (util.checkHelp) {
            data[rowNum][4] = nInfo['year'];
            data[rowNum][5] = nInfo['compensationInfo'];

            // 重新渲染改动后的数组
            util.updateMemberRenderHelp(data);
        } else {
            data[rowNum][1] = nInfo['name'];
            data[rowNum][2] = nInfo['sex'];
            data[rowNum][3] = nInfo['IDNumber'];
            data[rowNum][4] = nInfo['fee'];
            data[rowNum][5] = nInfo['afterPay'];
            data[rowNum][6] = nInfo['year'];
            data[rowNum][7] = nInfo['note'];
            data[rowNum][8] = nInfo['id'];

            // 重新渲染改动后的数组
            util.updateMemberRender(data);
        }

        // 将改动保存到缓存中
        util.cacheData = data;
    };

    /**
     * 失败返回 10113
     * 成功返回 10112
     * 修改会员信息 向后台传递修改的信息
     */
    util.postUpdateInfo = function (url, obj) {
		
        $.post(url, obj, function (res) {
			
            if (res == '10112') {
				util.rerenderWorkerInfo(obj);
                M = sAlert({content: '修改成功', title: '成功'});
                M.show();
            } else {
                M = sAlert({content: '修改失败', title: '错误', error: true});
                M.show();
            }
        });
    }

    /**
     * 删除分工会 向后台发出请求
     */
    util.delDepartment = function (url, depId) {
        $.post(url, { depId: depId }, function (data) {
            var M;
            if (data == '10034') {
                M = sAlert({content: '删除成功', title: '成功'});
                M.show();
            } else {
                M = sAlert({content: '删除失败', title: '错误', error: true});
                M.show();
            }
        });
    };

    /**
     * 添加分工会
     */
    util.addDepartment = function (url, depName) {
        $.post(url, { depName: depName }, function (data) {
            var M;
            if (data == '10030') {
                M = sAlert({content: '添加成功', title: '成功'});
                M.show();
            } else {
                M = sAlert({content: '添加失败', title: '错误', error: true});
                M.show();
            }
        });
    };

	// 修改分工会名称
	util.updateDepartmentName = function (url, obj) {
		$.post(url, obj, function (data) {
			var M;
            if (data == '20036') {
                M = sAlert({content: '修改成功', title: '成功'});
                M.show();
            } else {
                M = sAlert({content: '修改失败', title: '错误', error: true});
                M.show();
            }
		});
	};

    // 获取一些dom元素
    var $uploadFile = $('#upload-excel button');
    var $insertWorker = $('#add-new-member button');
    var $addHelpPay = $('#insert-help button');
    var $updateMember = $('#update-member .update-member-btn');
    var $delDepartment = $('#delete-department button');
    var $addDepartment = $('#add-department button');
	var $updateDepartmentName = $('#update-department button');
    var $convertPersonData = $('#update-person-id button');

    // 上传文件按钮的点击事件
    $uploadFile.on('click', function () {
        var fileData = $('#upload-excel #upload-file')[0].files[0];
        var formData = new FormData();
        var M = null;
        formData.append('file', fileData);
        M = sAlert({content: '插入中...', title: '等待', wait: true});
        M.show();
        $.ajax({
    		url: './add/add_work_bat.php',
    		type: 'POST',
    		cache: false,
    		data: formData,
    		processData: false,
    		contentType: false
		}).done(function(res) {
            M.close();
            if (res.trim() == '2000020010' || res.trim() == '2000120010') {
                M = sAlert({content: '插入成功', title: '成功'});
                M.show();
            } else {
                M = sAlert({content: '插入失败', title: '错误', error: true});
                M.show();
            }
		}).fail(function(res) {
			M.close();
            M = sAlert({content: '插入失败', title: '错误', error: true});
            M.show();
        });
    });

    // 添加新会员中确定按钮的点击事件
    $insertWorker.on('click', function () {
        var institute = $('#add-new-member #institute').val();
        var personId = $('#add-new-member #personid').val().trim();
        var name = $('#add-new-member #name').val();
        var sex = $('#add-new-member #sex').val();
        var payNum = $('#add-new-member #pay-num').val().trim();

        if (isEmpty(name) || institute == '00' || isEmpty(personId) || isEmpty(payNum)) {
            var M;
            M = sAlert({content: '请正确填写', title: '错误'});
            M.show();
            return ;
        }

        if (sex === '1') {
            sex = '男';
        } else {
            sex = '女';
        }
		
        var year = $('#add-new-member #year').val().trim();
		var payNote = $('#add-new-member #pay-note').val().trim();
		var afterPayment = $('#add-new-member #afterpayment').val().trim();
		
		if (isEmpty(year)) {
			year = new Date().getFullYear();
		}
		
		if (afterPayment == '1') {
			afterPayment = '否';
		} else if (afterPayment == '2') {
			afterPayment = '是';
		}
		
        var obj = {
            name: name,
            sex: sex,
            depa: institute,
            year: year,
            ID: personId,
            fee: payNum,
            afterPayment: afterPayment,
            note: payNote,
        };

        util.insertWorker('./add/add_work.php', obj);
    });

    // 添加补助信息中确定按钮的点击事件
    // 2018.5.11 年份可以输入，不再是默认今年
    $addHelpPay.on('click', function () {
        var personId = $('#insert-help #personid').val().trim();
        var info =     $('#insert-help #help-info').val().trim();
        var year =     $('#insert-help #year').val().trim();

        if (isEmpty(personId) || isEmpty(info)) {
            M = sAlert({content: '填写信息不完整', title: '错误'});
            M.show();
            return;
        }

        if (isEmpty(year)) {
            year = new Date().getFullYear();
        }

        var obj = {
            ID: personId,
            info: info,
            year: year
        };

        util.addHelpPay('./add/add_info.php', obj);
    });
    // 判断字符串是否为空字符串
    var isEmptyStr = function (str) {
        return str.trim() === '';
    };

    /**
     * 修改会员信息中查找按钮的点击事件
     */
    $updateMember.on('click', function () {
        var $institute = $('#update-member #institute');
        var $name =      $('#update-member #name');
        var $personid =  $('#update-member #personid');
        var $year =      $('#update-member #year');

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

        util.personId = personid;

        // 判断查看补缴信息还是缴费信息
        var checkComp = $('#update-member #check-help').val();

        if (checkComp == '0') {
            util.checkHelp = false; // 设置标志位
            util.updateMember('./query/query.php', obj);
        } else if (checkComp == '1') {
            util.checkHelp = true;
            util.updateMemberHelp('./query/query_compen.php', obj);
        }
    });

    // 删除部门按钮的点击事件
    $delDepartment.on('click', function () {

        var depId = $('#delete-department #institute').val();
        if (depId == '00') {
            var M = sAlert({content: '请选择分工会', title: '错误'});
            M.show();
            return;
        }

        util.delDepartment('./delete/delete_dep.php', depId);
    });
    // 添加部门按钮的点击事件
    $addDepartment.on('click', function () {
        var depName = $('#add-department #depname').val().trim();
        if (depName == '') {
            M = sAlert({content: '请输入分工会名称', title: '错误'});
            M.show();
            return;
        }

        util.addDepartment('./add/add_dep.php', depName);
    });

	$updateDepartmentName.on('click', function () {
		var oldDepId =   $('#update-department #institute').val().trim();
		var newDepName = $('#update-department #dep-new-name').val().trim();
		var obj = {
			oldDepId: oldDepId,
			newDepName: newDepName
		};
		util.updateDepartmentName('./update/update_dep_name.php', obj);

	});

    // 转移会员数据
    $convertPersonData.on('click', function () {
        var oldPersonId = $('#update-person-id #old-person-id').val().trim();
        var newPersonId = $('#update-person-id #new-person-id').val().trim();

        if (isEmpty(oldPersonId)) {
            M = sAlert({content: '格式不正确', title: '错误'});
            M.show();
            return;
        }

        var obj = {
            oldID: oldPersonId,
            newID: newPersonId || ''
        };
		
		
		var M = sAlert({content: '确定转移该信息？', title: '删除', confirm: true}, function (res) {
			if (res == 1) {
				
				$.post('./update/update_ID.php', obj, function (res) {
					if (res == '10120') {
						M = sAlert({content: '转移成功', title: '成功'});
						M.show();
					} else {
						M = sAlert({content: '转移失败', title: '错误', error: true});
						M.show();
					}
				});
			}
		});
		M.show();
    });

    // 初始化函数
    var init = function () {
        var $navs = $('#navs > li');
        // 菜单项的点击事件，控制不同面板的切换
        $navs.on('click', function (e) {
            var $this = $(this);
            var sibs =  $this.siblings();
            var spe =   $this.data('panel');
            $this.addClass('active');
            sibs.removeClass('active');

            var $panel =     $(spe);
            var $panelSibs = $panel.siblings('div');
            $panel.addClass('panel-action');
            $panelSibs.removeClass('panel-action');
        });
        // 修改会员信息中转移分工会按钮的事件
        var $changeSomeDepartmentBtn = $('#update-member .change-some-department');

        $changeSomeDepartmentBtn.on('click', function () {
            var $modal = $('.update-modal-department');
            var size = $('.checked').length;
            $('.update-modal-department #person-num').html(size + '人');
            $modal.toggleClass('hide');
        });

        $('.nav-panel button').click(function () {
            $('input').val('');
        });

        util.addUpdateBtnEvent();
        util.getAllDepartments('./query/query_department.php');
    };
    // 调用初始化函数绑定一些事件
    init();
}());
