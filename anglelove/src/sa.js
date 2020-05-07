var sAlert = function (options, callback) {
    var opt = {
        content: '',
        title: '',
        wait: false,
        confirm: false,
        error: false,
    };

    opt = $.extend({}, opt, options);

    var $modal = $('<div class="sa-modal"><div>');
    var $container = $('<div class="sa-container"></div>');
    var $title = $('<div class="sa-title"></div>');
    var $content = $('<div class="sa-content"></div>');
    var $deleteBtn = $('<button class="sa-delete-btn">确定</button>');

    var $confirmBtn = $('<button class="sa-confirm-btn">确定</button>');
    var $quitBtn = $('<button class="sa-quit-btn">取消</button>');

    var $checkLogBtn = $('<button class="sa-quit-btn"><a style="color:white;text-decoration: none;" target="_blank" href="./error.log">查看日志</a></button>');

    $deleteBtn.on('click', function () {
        api.close();
    });

    $confirmBtn.on('click', function () {
        api.close();
        callback(1);
    });

    $quitBtn.on('click', function () {
        api.close();
        callback(0);
    });

    $container.append($title)
            .append($content);

    if (!opt.wait) {
        if (opt.error) {
            $container.append($confirmBtn);
            $container.append($checkLogBtn);
        } else if (!opt.confirm) {
            $container.append($deleteBtn);
        } else {
            $container.append($confirmBtn);
            $container.append($quitBtn);
        }
    }

    var api = {};

    api.setHtml = function () {
        $title.text(opt.title);
        $content.text(opt.content);
        $('body').append($modal)
            .append($container);
        $modal.fadeIn(200);
        $container.fadeIn(200);
    };

    api.show = function () {
        api.setHtml();
    };

    api.close = function () {
        $('.sa-modal').fadeOut(200);
        $('.sa-container').fadeOut(200);
        // 防止remove方法破坏渐出动画
        var timeout = setTimeout(function () {
            $modal.remove();
            $container.remove();
            clearTimeout(timeout);
        }, 200);
    };

    return api;
};
