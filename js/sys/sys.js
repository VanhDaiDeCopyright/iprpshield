// 名前空間を定義
var ecblib = ecblib || {};
ecblib.sys = ecblib.sys || {};

(function() {
    // ローカル用の名前空間
    var _sys = ecblib.sys;

    /*!
     * JavaScriptが有効である場合、要素を非表示状態から表示状態（block）に変更します。
     */
    jQuery(document).ready(function() {
        jQuery(".js-creditcard-js-available").each(function() {
            jQuery(this).show();
        });
    });

    /*!
     * 現在のブラウザ判定による画面モードをHTMLタグのカスタムデータ属性 data-browse-mode から取得します。なお、値が S である場合のみスマートフォンと判定されます。
     */
    _sys.isModeSmartPhone = function() {
        return jQuery("html").data("browse-mode") == "S";
    };

    /*!
     * アプリケーションルートをmetaタグから読み取ります。
     */
    _sys.wwwroot = jQuery("meta[name='wwwroot']").attr('content');

    _sys.escapeHtml = function escapeHtml(value) {
        if (typeof value !== 'string') {
            return value;
        }
        return value.replace(/[&'`"<>]/g, function(match) {
            return {
                '&': '&amp;',
                "'": '&#x27;',
                '`': '&#x60;',
                '"': '&quot;',
                '<': '&lt;',
                '>': '&gt;',
            }[match];
        });
    };

    _sys.render = function render(template, keyValues) {
        if (typeof keyValues !== 'object' || keyValues === null) {
            return template;
        }
        return template.replace(/\$\{(.*?)\}|\#\{(.*?)\}/g, function(match, capt1, capt2) {
            var key = capt1 ? capt1 : capt2;
            if (Object.prototype.hasOwnProperty.call(keyValues, key)) {
                var value = keyValues[key];
                if (typeof value !== 'string') return '';
                return match[0] === '$' ? _sys.escapeHtml(value) : value;
            } else {
                return match;
            }
        });
    };
})();