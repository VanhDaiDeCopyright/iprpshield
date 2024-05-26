/*  System.CookiePath::Shopの値と合わせる */
var cookie_path = '/';
var redirect_path = '';
/*  cookie情報取得 */
var cookies = document.cookie;
var cookiesArray = cookies.split(';');
/*  ブラウザの最優先言語情報取得 */
var b_lang = window.navigator.language
var ans = ''
var load_cookie_lang = '';

window.onload = function() {
    var lang = get_lang(b_lang);
    if (load_cookie_lang != '') {
        if ((location.pathname.indexOf('/fr/') != -1) && (load_cookie_lang != 'fr')) {
            load_cookie_lang = ''
            add_cookie('fr', 2);
            location.href = location.href;
        } else if ((location.pathname.lastIndexOf('/fr') != -1) && (load_cookie_lang != 'fr')) {
            load_cookie_lang = ''
            add_cookie('fr', 2);
            location.href = (location.href.replace('/fr', '/fr/'));
        } else if ((location.pathname.indexOf('/fr/') == -1) && (load_cookie_lang != 'en')) {
            load_cookie_lang = ''
            add_cookie('en', 1);
            location.href = location.href;
        } else if ((location.pathname.lastIndexOf('/fr') == -1) && (load_cookie_lang != 'en')) {
            load_cookie_lang = ''
            add_cookie('en', 1);
            location.href = location.href;
        }
    }
}


jQuery(document).ready(function() {
    var lang = get_lang(b_lang);

    if (lang == 'fr') {
        add_cookie(lang, 2);
        change_button(lang);
    } else {
        add_cookie(lang, 1);
        change_button(lang);
    }


    /*  言語切替で英語が選択された場合 */
    jQuery("#lang_en").on('click', function() {

        if (lang != 'en') {
            add_cookie('en', 1);
            redirect_url('en');
            change_button('en');
        }
    });

    /*  言語切替でフランス語が選択された場合 */
    jQuery("#lang_fr").on('click', function() {
        if (lang != 'fr') {
            add_cookie('fr', 2);
            redirect_url('fr');
            change_button('fr');
        }
    });
});


/*  選択した言語ページへのリダイレクト */
function redirect_url(select_lang) {
    /*  URLの全体を取得 */
    var href = location.href
    /*  末尾の「:」を含む、URLのプロトコル部分取得 */
    var protocol = location.protocol
    /*  URLのドメイン部分取得 */
    var host = location.host
    var path = ''
    var param = ''

    if (location.pathname != '') {
        /*  URLのパス部分取得 */
        path = location.pathname
    }
    if (location.search != '') {
        /*  URLのパラメータ部分取得 */
        param = location.search
    }

    /*  現在表示しているページが英語で、それ以外の言語ページにリダイレクトする場合 */
    if (select_lang == 'en') {
        /*  現在のURL内の「/[言語情報]/」を削除してリダイレクト */
        if ((href.indexOf('/fr/') == -1) && (href.lastIndexOf('/fr') != -1)) {
            location.href = (href.replace('/fr', '/'));
        } else {
            location.href = (href.replace('/fr/', '/'));
        }
    } else {
        /*  URLに「/fr/」が入っていた場合削除する */
        if ((path.indexOf('/fr/') == -1) && (path.lastIndexOf('/fr') != -1)) {
            path = path.replace('/fr', '/');
        } else {
            path = path.replace('/fr/', '/');
        }
        /*  URLに「/[言語情報]/」を挿入してリダイレクト */
        location.href = (protocol + '//' + host + '/' + redirect_path + 'fr' + path.replace(redirect_path, '') + param);
    }
}

function get_lang(b_lang) {
    /*  cookieあり */
    if (cookies != '') {
        for (var c of cookiesArray) {
            var cArray = c.split('=');
            if (cArray[0].trim() == 'lang') {
                if (cArray[1] == 'en') {
                    ans = 'en';
                    load_cookie_lang = 'en'
                } else if (cArray[1] == 'fr') {
                    ans = 'fr';
                    load_cookie_lang = 'fr'
                } else {
                    ans = init_lang(b_lang);
                }
            }
        }
        if (ans == '') {
            ans = init_lang(b_lang);
        }
        /*  cookieなし */
    } else {
        ans = init_lang(b_lang);
    }
    return ans;
}

/* langがない */
function init_lang(b_lang) {
    var lang = '';
    if (b_lang == 'fr' && location.href.match('/fr/')) {
        lang = 'fr';
    } else if (b_lang == 'fr' && (location.href.lastIndexOf('/fr') != -1)) {
        lang = 'fr';
    } else if (b_lang != 'fr' && location.href.match('/fr/')) {
        lang = 'fr'
    } else if (b_lang != 'fr' && (location.href.lastIndexOf('/fr') != -1)) {
        lang = 'fr'
    } else {
        if (b_lang == 'fr') {
            lang = 'fr'
        } else {
            lang = 'en'
        }
    }
    return lang;
}

/*  cookieに言語情報、通貨情報書き込み */
function add_cookie(lang, currency) {
    var cookie_lang_string = ''
    var cookie_currency_string = ''

    /*  cookie言語情報に言語切替ボタン情報を設定 */
    cookie_lang_string += "lang=" + lang + ";"
    /*  cookie言語情報にパスを設定 */
    cookie_lang_string += "path=" + cookie_path + ";"
    /*  cookie言語情報書き込み */
    document.cookie = cookie_lang_string

    /*  cookie通貨情報に言語切替ボタン情報を設定 */
    cookie_currency_string += "currency=" + currency + ";"
    /*  cookie通貨情報にパスを設定 */
    cookie_currency_string += "path=" + cookie_path + ";"
    /*  cookie通貨情報書き込み */
    document.cookie = cookie_currency_string
}

function change_button(lang) {
    if (lang == 'en') {
        /*  英語 */
        /*  英語ボタンをアクティブ状態にする */
        jQuery('#lang_en').addClass("is-active");
        jQuery('#lang_fr').removeClass("is-active");
    } else if (lang == 'fr') {
        /*  フランス語 */
        /*  フランス語ボタンをアクティブ状態にする */
        jQuery('#lang_en').removeClass("is-active");
        jQuery('#lang_fr').addClass("is-active");
    } else {
        /*  その他 */
        /*  英語ボタンをアクティブ状態にする */
        jQuery('#lang_en').addClass("is-active");
        jQuery('#lang_fr').removeClass("is-active");
    }
}