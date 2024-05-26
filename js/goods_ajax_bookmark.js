var ecblib = ecblib || {};
ecblib.goods_ajax_bookmark = ecblib.goods_ajax_bookmark || {};

jQuery(document).ready(function() {
    jQuery(function() {
        var _goods_ajax_bookmark = ecblib.goods_ajax_bookmark;
    });

    var $btn_bookmark = jQuery(".item_addwish_btn");
    $btn_bookmark.off("click");
    jQuery(document).on("click", ".item_addwish_btn", function(e) {
        var isRegisted = jQuery(this).attr("class").indexOf("is_active") != -1 ? true : false;
        var goodsKind = "";
        var goodsCode = "";
        var removeFlg = false;
        var attachUrl = "javascript:void(0)";
        var loadStart = function(elem) {
            goodsCode = jQuery(elem).attr("href").substring(jQuery(elem).attr("href").indexOf("goods="), jQuery(elem).attr("href").indexOf("&crsirefo")).replace("goods=", "");
            goodsKind = jQuery(elem).attr("class").indexOf("variation") != -1 ? "variation" : "goods";
            if (isRegisted) {
                if (goodsKind != "variation") {
                    elem = jQuery(jQuery(elem).attr("data-area")).find('[class*="registed"]');
                } else {
                    elem = jQuery("[data-goods=" + goodsCode + "]");
                }
                removeFlg = true;
            }
            attachUrl = ecblib.sys.wwwroot + "/shop/customer/bookmark.aspx?goods=" + goodsCode + "&crsirefo_hidden=";
            jQuery(elem).attr("data-bookmark-click", "true");
            return elem;
        };
        var loadEnd = function(elem, iserror, msg, valResult) {
            if (!iserror) {
                if (!valResult) {
                    if (!jQuery(elem).hasClass("invalid-guest-bookmark")) {
                        jQuery(elem).attr("href", attachUrl);
                        if (!removeFlg) {
                            jQuery(elem).addClass("is_active");
                            jQuery(elem).attr("data-goods", goodsCode);
                        } else {
                            jQuery(elem).removeClass("is_active");
                            jQuery(elem).removeAttr("data-goods");
                        }
                    } else {
                        console.log("ゲストブックマーク機能が許可されていません");
                    }
                } else {
                    console.log(msg)
                }
            } else {
                console.log(msg);
            }
            jQuery(elem).removeAttr("data-bookmark-click");
        };
        var addBookmark = function(b, g, f) {

            setElement_bookmark_addwish(g);

            if (jQuery(b).attr("data-bookmark-click") == "true") {
                return false;
            }

            var o = loadStart(b);
            jQuery.ajax({
                async: true,
                type: "POST",
                url: ecblib.sys.wwwroot + "/shop/customer/bookmarkajax.aspx",
                data: {
                    "goods": g,
                    "list_trans_fg": f,
                    "crsirefo_hidden": jQuery("[name='crsirefo_hidden']").val()
                },
                cache: false,
                ifModified: false,
                dataType: "json",
                success: function(contents) {
                    setTimeout(function() {
                        loadEnd(b, false, contents.msg, contents.valResult);
                    }, 0);
                },
                error: function(xhr, status, thrown) {
                    loadEnd(o, true);
                    console.log("お気に入り登録に失敗しました。");
                    return false;
                }
            });
            return true;
        };
        var removeBookmark = function(b, g) {
            if (jQuery(b).attr("data-bookmark-click") == "true") {
                return false;
            }

            var o = loadStart(b);
            jQuery.ajax({
                async: true,
                type: "POST",
                url: ecblib.sys.wwwroot + "/shop/customer/bookmarkajax.aspx",
                data: {
                    "goods": g,
                    "list_trans_fg": "0",
                    "crsirefo_hidden": jQuery("[name='crsirefo_hidden']").val(),
                    "remove_flg": "True"
                },
                cache: false,
                ifModified: false,
                dataType: "json",
                success: function(contents) {
                    setTimeout(function() {
                        loadEnd(b, false, contents.msg, contents.valResult);
                    }, 0);
                },
                error: function(xhr, status, thrown) {
                    loadEnd(o, true);
                    console.log("お気に入り登録解除に失敗しました。");
                    return false;
                }
            });
            return true;
        };
        if (!jQuery(this).length) {
            return false;
        }
        var href = jQuery(this).attr("href");
        var re = new RegExp("goods=([0-9A-Za-z_\-]+)");
        var matches = href.match(re);
        var goods = "";
        var list_fg = jQuery(this).data("list-flg");
        if (matches && matches.length == 2) {
            goods = matches[1];
        } else {
            return true;
        }
        if (!isRegisted) {
            addBookmark(this, goods, list_fg);
        } else {
            removeBookmark(this, goods);
        }
        return false;
    });
});