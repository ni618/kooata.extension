(function () {
var nick_name;
function modal(body, buttons) {
    var $div = $('<div class="modal fade" tabindex="-1" role="dialog">').appendTo('body');
    $div.html('<div class="modal-dialog" style="color: #000;"><div class="modal-content"><div class="modal-header"><button type="button" class="close differentFromBootstrap" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="h4 modal-title">kooata 提醒</h4></div><div class="modal-body"><p>'+body+'</p></div><div class="modal-footer">'+buttons+'</div></div></div>');
    $btn = $div.find('.modal-footer button');
    
    return { $: $div, btn: $btn };
}
function getUrlParameters (a) {
    if(!a || a == "") return {};
    a = a.split('&');
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p=a[i].split('=');
        if (p.length != 2) continue;
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
}
function alertError(msg) {
    var text = msg ? msg : 'Something error';
    var $dialog = new modal(text, '<button type="button" class="btn btn-default" data-dismiss="modal">好</button>');
    $dialog.$.modal('show');
    setTimeout(function () { $dialog.$.modal('hide'); }, 3000);
}

$(function () {
    nick_name = $('#login_link').text().match(/\[(\w*)\]/)[1];
    console.log('nick_name: ', nick_name );
    
    if( $('#kooata') ) {
        console.log('#kooata');
        $('#kooata').change(function (e) {
            //console.log(e, e.target.value, getUrlParameters(e.target.value));
            var p = getUrlParameters(e.target.value);
            console.log(p);
            if( p.limited_to ) {
                var $dialog = new modal('你正在發送的噗 ( <span class="text-primary">'+p.content+' </span>)，是否要同步到 <a href="http://kooata.com/plurkCollection/">kooata</a> 呢?', '<button type="button" class="btn btn-primary" data-dismiss="modal">好</button><button type="button" class="btn btn-default" data-dismiss="modal">不要</button>');
                    
                $dialog.btn.eq(0).click(function (e) {
                    console.log('YES');
                    var new_plurk = $('.plurk.cboxAnchor').filter(function(i) {
                        $self = $(this).find('.plurk_cnt');
                        return $self.hasClass('new1') || $self.hasClass('new2')
                            || $self.hasClass('new3') || $self.hasClass('new4')
                            || $self.hasClass('new5') || $self.hasClass('new6')
                            || $self.hasClass('new7') || $self.hasClass('new8')
                            || $self.hasClass('new9') || $self.hasClass('new10');
                    });
                    console.log(new_plurk.eq(0).attr('data-pid'));
                    
                    $.ajax({
                        type:   'GET',
                        url:    'http://kooata.com/plurkCollection/plurk/api.php',
                        data:   { method: 'post_plurk', content: p.content, posted: p.posted, qualifier: p.qualifier, plurk_uid: p.uid, plurk_pid: new_plurk.eq(0).attr('data-pid') }
                    }).done(function (msg) {
                        if(msg) {
                            
                        } else {
                            alertError();
                            console.log('response from api?post_plurk error');
                        }
                        console.log(msg);
                    });
                });
                $dialog.$.modal('show');
            }
            else {
                console.log('wtf');
            }
            $('#kooata').val('false');
        });
    }
});
$(function () {
    if( typeof(Storage)=='undefined' )
        // Sorry! No Web Storage support..
        return;
    
    if( !localStorage.kooata ) {
        $.ajax({
            type:   'GET',
            url:    'http://kooata.com/plurkCollection/plurk/api.php',
            data:   { method: 'get_kooata_id', nick_name: nick_name  }
        }).done(function (msg) {
            console.log(msg);
            if(msg != -1) {
                var ls = {id: msg, nick_name: nick_name};
                localStorage.kooata = JSON.stringify(ls);
            }
            else {
                var $dialog = new modal('您的帳號('+nick_name+') 尚未註冊於 <a href="http://kooata.com/plurkCollection/" target="_blank">kooata.com</a><br>請問您要 &hellip;', '<button type="button" class="btn btn-primary" data-dismiss="modal">現在註冊</button><button type="button" class="btn btn-warning" data-dismiss="modal">下次提醒</button><button type="button" class="btn btn-default" data-dismiss="modal">不要註冊</button>');
                
                $dialog.btn.eq(0).click(function (e) {
                    console.log(e);
                    window.open('http://kooata.com/plurkCollection/plurk/v/signin.php');
                });
                
                $dialog.$.modal('show');
                
                /*$(document).keydown(function (e) {
                    if( 'A' == String.fromCharCode(e.keyCode) )
                        $dialog.$.modal('show');
                });*/
            }
        });
    }
});
function main() {
    var is_addPlurk = false;
    function triggerChangeEvent(kooata) {
        if ('createEvent' in document) {
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent('change', false, true);
            kooata.dispatchEvent(evt);
        }
        else
            kooata.fireEvent('onchange');
    }
    function condition(args) {
        return args.length >= 2
                && (args[0].toLowerCase() == 'post')
                && typeof args[1] === 'string'
                && args[1].indexOf('TimeLine', 0) != -1
                && args[1].indexOf('addPlurk', 0) != -1;
    }
    function getUrlParameters (a) {
        if(!a || a == "") return {};
        a = a.split('&');
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p=a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    }
    window.XMLHttpRequest.prototype.trueOpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function() {
        try {
            is_addPlurk = condition(arguments);
        } catch (e) { console.error(e); }
        this.trueOpen.apply(this, arguments);
    };
    window.XMLHttpRequest.prototype.trueSend = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.send = function() {
        try {
            // console.log(arguments);
            // console.log('is_addPlurk', is_addPlurk);
            
            if(is_addPlurk) {
                var kooata = document.getElementById('kooata');
                if(!kooata) { console.error('cannot find input'); return; }
                kooata.value = arguments[0] ? arguments[0] : '';
                
                triggerChangeEvent(kooata);
            }
        } catch (e) { console.error(e); }
        this.trueSend.apply(this, arguments);
    };
}

var kooata = document.createElement('input');
kooata.type  = 'hidden';
kooata.id    = 'kooata';
kooata.value = 'false';
document.body.appendChild(kooata);
var script = document.createElement('script');
script.textContent = '(' + main.toString() + ')();';
document.body.appendChild(script);

})();