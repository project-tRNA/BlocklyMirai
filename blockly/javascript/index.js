'use strict';

var Messages = {};
/**
 * 显示消息提示
 * @param {any} msg
 */
Messages.Show = function (msg, hasOkBtn) {

    var msgbg = $('#message');
    var content = msgbg.children('div.panel-content');
    content.css('height', 'auto');
    msgbg.css('opacity', '0');
    content.html('');
    content.append('<div style="padding: 20px;">' + msg + '</div>');
    content.focus();
    if (typeof (hasOkBtn) == "undefined" || hasOkBtn) {
        var btn = $('<button class="btn-ok">确定</button>')
        btn.on('click', Messages.Hide);
        content.append(btn);
        btn.focus();
    }
    var h = content[0].offsetHeight + 20;
    content.css('height', '0px');
    msgbg.css('visibility', 'visible');
    msgbg.animate({ opacity: '1' }, 50, function () { 
        content.animate({ height: h + 'px', marginTop: (-h / 2) + 'px' }, 150);
    });
};
/**
 * 隐藏消息提示
 * */
Messages.Hide = function () {
    var msgbg = $('#message');
    var content = msgbg.children('div.panel-content');
    content.animate({ height: '0px', marginTop: '0px' }, 100, function () {
        content.html('');
        msgbg.animate({ opacity: '0' }, 50, function () {
            msgbg.css('visibility', 'hidden');
        });
    });
};
window.addEventListener('load', function(){
    // 加载项目按钮
    $('button.btn-load-project').on('click', function(){
        Code.loadProjectPanel();
    });
    // 保存项目按钮
    $('button.btn-save-project').on('click', function () {
        $(this).blur();
        if($('div#xml-operation>input.project-name').val().length > 0){
            if (Code.saveProject()) {
                Messages.Show('<p style="color:#666">保存项目</p><p>项目保存成功!</p>');
            }
        } else {
            Messages.Show('<p style="color:#666">【错误】保存项目</p><p>项目名不能为空</p>');
        }
    });
    // 导出 Gradle 项目按钮
    $('button.btn-export-project-gradle').on('click', function(){
        Code.genGradleProject();
    });
    // 加载项目界面 取消按钮
    $('div#projects-panel').children('div.panel-content').children('button.btn-cancel').on('click', function(){
        $('div#projects-panel').css('visibility', 'hidden');
    });
    // 友情链接
    $('a.friend-links').on('click', function () {
        $(this).blur();
        Messages.Show('<p style="color:#666">友情链接</p><p>MiraiForum <a class="light-link" href="https://mirai.mamoe.net/" target="_blank">https://mirai.mamoe.net/</a></p>');
    });
    // 链接-打开文件夹
    $('a.folder-link').on('click', function(){
        Code.openFolder($(this).attr('data-folder'));
    });
    
    $('.loading').fadeOut(500);
});
/**
 * 时间格式化
 * 代码来源: https://my.oschina.net/u/3568600/blog/1799039
 * @param {String} fmt 时间格式
 */
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "H+": this.getHours(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};