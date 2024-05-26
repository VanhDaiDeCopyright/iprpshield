/** eコマース用共通関数 */
var currencytype = '';
if (document.URL.match("/fr/")) {
    currencytype = 'EUR';
} else {
    currencytype = 'USD';
};
const GA4Currency = currencytype;
const trackingcode = 'G-VHXPX6X9ZG';
const title_anchor_class = '.item_photo_ a, .StyleH_Item_ .img_ a,  a:has(figure.img_)';
const price_class = '.price_';
const variant_class = '.name2_';
const parent_search_count = 4;
const image_link = '.item_photo_ a';
const del_cart_img = 'div.delete_ img';
const method_name_class = 'th.estimate_method_';
const goods_list_wrapper_class = '.goods_list_wrapper_';
const goods_list_cart_btn = '.cart_ a img.btn_cart_';
const goods_detail_cart_btn = '.btn_cart_l_, #cart_in';

var ecommerceExtCommon_GA4 = {
    /* 決済フロー送信タグ用 */
    checkoutTags: [],

    /* 金額の整形 */
    formatPrice: function(price) {
        var result = price.replace(/,/g, '');
        /* 税込価格(￥,) 抜き部分のみを抜出す */
        result = jQuery.trim(result).split(/\r?\n/g).shift();
        if (result.indexOf('￥') != -1) {
            result = result.substr(1, result.length - 1);
        } else {
            /* 販売準備中は空 */
            result = '';
        }

        return result;
    },

    /* 商品名、バリエーションの特殊文字をエスケープ */
    escapeJavaScriptValue: function(value) {
        if (value != null && value != undefined && value != '') {
            return value.replace(/['\"]/g, function(match) {
                return {
                    "'": "\\'",
                    '"': '\\"',
                }[match]
            });
        }
    },

    /* バリエーションの整形 */
    formatVariant: function(variant1, variant2) {
        var result = '';
        if (variant1 !== '' && variant2 !== '') {
            result = '（' + variant1 + '　' + variant2 + '）';
        } else if (variant1 !== '' || variant2 !== '') {
            result = '（' + variant1 + variant2 + '）';
        }

        return result;
    },

    /* 商品リンククリックを送信 */
    sendClickConversion: function(event) {
        gtag('event', 'select_item', {
            item_list_id: location.pathname,
            items: [{
                'currency': GA4Currency,
                'item_id': event.data.itemData['id'],
                'item_name': event.data.itemData['title'],
                'item_brand': event.data.itemData['brand'],
                'item_category': event.data.itemData['category'],
                'item_variant': event.data.itemData['variant'],
                'price': event.data.itemData['price'],
                'index': event.data.itemData['position']
            }],
            'send_to': trackingcode
        });
    },

    /* 購入ボタン押下 */
    addCartConversion: function(event) {
        var me = ecommerceExt_GA4;
        me.sendAddCartConversion(event.data.itemData);
    },

    /* 商品のカート追加を送信 */
    sendAddCartConversion: function(itemData) {
        gtag('event', 'add_to_cart', {
            items: [{
                'currency': GA4Currency,
                'item_id': itemData['id'],
                'item_name': itemData['title'],
                'item_brand': itemData['brand'],
                'item_category': itemData['category'],
                'item_variant': itemData['variant'],
                'price': itemData['price'],
                'index': itemData['position'],
                'quantity': itemData['qty'],
                'location_id': location.pathname
            }],
            'send_to': trackingcode
        });
    },

    /* 商品のカート削除を送信 */
    sendDelCartConversion: function(itemData) {
        gtag('event', 'remove_from_cart', {
            items: [{
                'currency': GA4Currency,
                'item_id': itemData['id'],
                'item_name': itemData['title'],
                'item_brand': itemData['brand'],
                'item_category': itemData['category'],
                'item_variant': itemData['variant'],
                'price': itemData['price']
            }],
            'send_to': trackingcode
        });
    },

    /* カテゴリ、ブランドの整形 */
    formatCodeWithName: function(code, name) {
        var result = '';
        if (code !== '' && name !== '') {
            result = name + '(' + code + ')';
        }
        return result;
    },

    /* 決済フロー集計用のタグを出力 */
    checkoutConversion: function() {
        var me = ecommerceExt_GA4;
        var url_filename = window.location.href.match('.+/(.+?)([\?#;].*)?$')[1];
        var order_step = 0;
        /* ページによってstepを変更する */
        if (url_filename === 'cart.aspx') {
            /* カートの場合 */
            order_step = 1;
        } else if (url_filename === 'method.aspx' || url_filename === 'select.aspx') {
            /* 通常購入またはギフト購入の場合 */
            order_step = 2;
        } else if (url_filename === 'estimate.aspx') {
            /* 注文確認の場合 */
            order_step = 3;
        } else {
            return;
        }

        var carts
        if ((document.querySelector('meta[property="etm:cart_item"]') != null) || (document.querySelector('meta[property="etm:cart_item"]') != undefined)) {
            carts = JSON.parse(document.querySelector('meta[property="etm:cart_item"]').content);
        }

        if (carts.length === 0) {
            /* カートに商品がなければ処理終了 */
            return;
        }

        var variant = '';
        var checkoutItems = '';
        var itemobj = {};
        var categoryVal = '';
        var brandVal = '';

        /* metaタグから取得したデータ分、タグを生成 */
        for (var key in carts) {
            itemobj = {};
            /* バリエーション取得 */
            variant = me.formatVariant(carts[key]['variation_name1'], carts[key]['variation_name2']);
            categoryVal = carts[key]['category'];
            brandVal = carts[key]['goods'].substr(0, 1);

            /* 決済フロー用商品情報タグ作成 */
            itemobj.item_id = carts[key]['goods'];
            itemobj.item_name = me.escapeJavaScriptValue(carts[key]['name']);
            itemobj.item_brand = brandVal;
            itemobj.item_category = categoryVal;
            itemobj.item_variant = me.escapeJavaScriptValue(variant);
            itemobj.price = carts[key]['price'];
            itemobj.quantity = carts[key]['qty'];
            itemobj.currency = GA4Currency;

            me.checkoutTags.push(itemobj);
        }

        if (me.checkoutTags.length > 0) {
            /* step3の場合は支払い方法を設定 */
            var method_name = '';
            if (order_step === 3) {
                method_name = (jQuery(method_name_class).siblings("td").text() == undefined) ? "" : jQuery(method_name_class).siblings("td").text();
                gtag('event', 'add_payment_info', {
                    payment_type: method_name,
                    items: me.checkoutTags,
                    'send_to': trackingcode
                });
            }

            gtag('event', 'begin_checkout', {
                items: me.checkoutTags,
                'send_to': trackingcode
            });

        }
    }
};

ecommerceExtCommon_GA4.mixin_obj = function(srcObj, dstObj) {
    for (var property in srcObj) {
        dstObj[property] = srcObj[property];
    }
};

ecommerceExtCommon_GA4.LoadJquery = {
    load: function(callback) {
        if (typeof jQuery != 'undefined') {
            callback();
            return;
        }
        var script = document.createElement('script');
        script.setAttribute('src', 'https://code.jquery.com/jquery-3.0.0.min.js');
        script.setAttribute('type', 'text/javascript');
        document.getElementsByTagName('head')[0].appendChild(script);
        script.onload = function() {
            callback();
        };
    }
};

/** eコマース用インプレッション */
var ecommerceExt_GA4 = Object.create(ecommerceExtCommon_GA4);
var ecommerceList_GA4 = {
    /* 商品表示回数送信タグ用 */
    impressionTags: [],
    /* 表示商品データ */
    impressionDatas: [],
    impressionDatasItems: [],

    /* 商品の表示回数集計用のタグを出力 */
    createImpression: function() {
        var me = this,
            count = 1,
            list = location.pathname,
            id = '',
            title = '',
            category = '',
            brand = '',
            price = '',
            variant = '',
            price_text = '',
            img_anchor = '',
            cart_btn = '',
            goods_link;

        var data = {};

        jQuery(title_anchor_class).each(function() {

            goods_link = jQuery(this);

            id = '',
                title = '',
                category = '',
                brand = '',
                price = '',
                variant = '',
                price_text = '',
                img_anchor = '',
                cart_btn = '';

            /* href属性のURLに、「/g/」がない場合、以降の処理をスキップ */
            if (!goods_link.attr('href').match(/\/g\//)) {
                return true;
            }

            /* href属性から商品コードを抜出す */
            id = goods_link.attr('href').substr(0, goods_link.attr('href').length - 1).split('/').pop();
            id = id.substr(1, id.length - 1);

            /* title属性から商品名を取得 */
            title = goods_link.attr('title');

            /* 商品コード、商品名いずれかでも取得出来ない場合、以降の処理をスキップ */
            if (id == '' || title == '') {
                return true;
            }

            /* category、brandを取得 */
            category = (goods_link.attr('category') == undefined) ? '' : goods_link.attr('category');
            brand = id.substr(0, 1);

            dom = this;
            for (var i = 0; i < parent_search_count; i++) {
                dom = jQuery(dom).parent();
                /* 「税込価格(￥、, 抜き)」部分のみを抜出す */
                price_text = jQuery(dom).find(price_class).text();
                if (price_text !== '') {
                    price = ecommerceExtCommon_GA4.formatPrice(price_text);
                }

                /* サイズ・カラーを取得 */
                variant_text = jQuery(dom).find(variant_class).text();
                if (i < parent_search_count - 1 && variant == "" && variant_text != "") {
                    /* 取得したバリエーションの先頭が「・」でなければ、「（xxx）」部分を取得 */
                    if (variant_text.trim().lastIndexOf("・", 0) !== 0) {
                        variant = variant_text.match(/()（.*）/)[0];
                    }
                }

                /* 画像に設定された詳細リンク要素を取得する */
                if (jQuery(dom).find(image_link).attr('href') != undefined) {
                    img_anchor = jQuery(dom).find(image_link);
                }

                /* 購入ボタン要素を取得 */
                if (jQuery(dom).find(goods_list_cart_btn).attr('class') != undefined) {
                    cart_btn = jQuery(dom).find(goods_list_cart_btn);
                }
            }

            /* 送信用タグを作成 */
            var impressionData = {};
            impressionData.item_id = id;
            impressionData.item_name = ecommerceExtCommon_GA4.escapeJavaScriptValue(title);
            impressionData.item_brand = brand;
            impressionData.item_category = category;
            impressionData.item_variant = ecommerceExtCommon_GA4.escapeJavaScriptValue(variant);
            impressionData.price = price;
            impressionData.index = count;

            me.impressionDatasItems.push(impressionData);

            /* 表示商品データに取得した情報を保持 */
            if (!(id in me.impressionDatas)) {
                me.impressionDatas[id] = {
                    'category': category,
                    'brand': brand,
                    'price': price,
                    'variant': variant,
                    'position': count
                };
            }

            data = {
                'id': id,
                'title': title,
                'category': category,
                'brand': brand,
                'price': price,
                'variant': variant,
                'position': count,
                'qty': 1
            };

            /* 商品リンククリックイベント設定 */
            jQuery(goods_link).on('click', {
                itemData: data
            }, ecommerceExtCommon_GA4.sendClickConversion);

            /* 自身と画像リンクが同一要素ではない場合、画像リンクに商品リンククリックイベント設定 */
            if (jQuery(goods_link).is(img_anchor) == false) {
                jQuery(img_anchor).on('click', {
                    itemData: data
                }, ecommerceExtCommon_GA4.sendClickConversion);
            }

            /* 商品のカート追加クリックイベント設定 */
            jQuery(cart_btn).on('click', {
                itemData: data
            }, ecommerceExtCommon_GA4.addCartConversion);

            /* キーボード操作イベントの設定 */
            jQuery(cart_btn).on('keydown', function(event) {
                if (event.keyCode === 13) {
                    jQuery(this).unbind('keydown');
                    /* ボタンクリックイベントの実行を設定 */
                    jQuery(this).find(cart_btn).trigger('click');
                }
            });

            count += 1;
        });

        /* 商品の表示回数集計用タグ出力 */
        if (me.impressionDatasItems.length > 0) {
            gtag('event', 'view_item_list', {
                item_list_id: list,
                items: me.impressionDatasItems,
                'send_to': trackingcode
            });
        }
    },

    /* 商品のカート削除を送信 */
    delCartConversion: function() {
        jQuery(document).on('click', del_cart_img, function(event) {
            var id = '',
                title = '',
                category = '',
                brand = '',
                price = '',
                variant = '',
                id_text = '',
                variant_text = '',
                price_text = '';

            var dom = this;

            /* 自身の親要素を辿り必要な情報を取得 */
            for (var i = 0; i < parent_search_count; i++) {
                dom = jQuery(dom).parent();

                id_text = jQuery(dom).find(title_anchor_class).attr('href');
                if (id == '' && id_text != undefined) {
                    /* href属性から商品コードを抜出す */
                    id = id_text.substr(0, id_text.length - 1).split("/").pop();
                    id = id.substr(1, id.length - 1);

                    /* title属性から商品名を取得 */
                    title = jQuery(dom).find(title_anchor_class).text();

                    /* category、brandを取得 */
                    category = (jQuery(dom).attr("category") == undefined) ? "" : jQuery(dom).attr("category"),
                        brand = (jQuery(dom).attr("brand") == undefined) ? "" : jQuery(dom).attr("brand");
                }

                /* 「税込価格(￥、, 抜き)」部分のみを抜出す */
                price_text = jQuery(dom).find(price_class).text();
                if (price_text !== '') {
                    price = ecommerceExtCommon_GA4.formatPrice(price_text);
                }

                /* サイズ・カラーを取得 */
                variant_text = jQuery(dom).find(variant_class).text();
                if (i < parent_search_count - 1 && variant == "" && variant_text != "") {
                    variant = variant_text;
                }
            }

            /* 商品コード、商品名いずれかでも取得出来ない場合、以降の処理をスキップ */
            if (id == "" || title == "") {
                return true;
            }

            /* 送信用データ配列作成 */
            var itemData = {
                'id': id,
                'title': title,
                'category': category,
                'brand': brand,
                'price': price,
                'variant': variant
            };

            /* 送信処理 */
            ecommerceExtCommon_GA4.sendDelCartConversion(itemData);

        });
    }
};

ecommerceExt_GA4.mixin_obj(ecommerceList_GA4, ecommerceExt_GA4)
ecommerceExt_GA4.conversionInit = function() {
    ecommerceExt_GA4.createImpression();
    ecommerceExt_GA4.delCartConversion();
};
ecommerceExt_GA4.LoadJquery.load(ecommerceExt_GA4.conversionInit);


/** eコマース用チェックアウト初期化 */
ecommerceExt_GA4.checkoutConversionInit = function() {
    ecommerceExt_GA4.checkoutConversion();
};
ecommerceExt_GA4.LoadJquery.load(ecommerceExt_GA4.checkoutConversionInit);

/** eコマース用カート内操作 */
/* 再計算、各決済フローボタン押下処理 */
jQuery("input[name^='update'], input[name='submit'], input[name='gift'], #AmazonPayButton").on('click', function(event) {
    var tags_key = 0;
    var carts
    if ((document.querySelector('meta[property="etm:cart_item"]') != null) || (document.querySelector('meta[property="etm:cart_item"]') != undefined)) {
        carts = JSON.parse(document.querySelector('meta[property="etm:cart_item"]').content);
    }
    /* 取得したカート情報分ループし、カート削除＞カート追加を行って総洗替えする */
    jQuery("input[name^=qty]").each(function() {

        var id = carts[tags_key]['goods'],
            variant = ecommerceExt_GA4.impressionDatas[id]['variant'],
            qty = jQuery(this).val();

        var categoryVal = ecommerceExt_GA4.impressionDatas[id]['category'];
        var brandVal = id.substr(0, 1);

        /* 送信用データ配列作成 */
        var itemData = {
            'id': id,
            'title': carts[tags_key]['name'],
            'category': categoryVal,
            'brand': brandVal,
            'price': carts[tags_key]['price'],
            'variant': variant,
            'qty': qty,
            'position': ''
        };

        /* カートの削除送信 */
        ecommerceExt_GA4.sendDelCartConversion(itemData);

        /* フォームの個数が0または空の場合は以降の処理をスキップ */
        if (qty == 0 || qty == '') {
            tags_key++;
            return true;
        }

        /* カートの追加送信 */
        ecommerceExt_GA4.sendAddCartConversion(itemData);

        tags_key++;
    });
});

/* 削除ボタン押下処理 */
jQuery("input[name^=del]").on('click', function(event) {
    var id = '',
        title = '';

    var base_dom = this;
    /* 自身の親要素を辿り必要な情報を取得 */
    for (var i = 0; i < parent_search_count; i++) {
        base_dom = jQuery(base_dom).parent();
        id_text = jQuery(base_dom).find(title_anchor_class).attr("href");
        if (id == "" && id_text != undefined) {
            id = id_text.substr(0, id_text.length - 1).split("/").pop();
            id = id.substr(1, id.length - 1);
            title = jQuery(base_dom).find(title_anchor_class).text();
        }

        /* 商品コードが取得できた時点でループ終了 */
        if (id !== "") {
            break;
        }
    }

    /* 商品コード、商品名いずれかでも取得出来ない場合、以降の処理をスキップ */
    if (id === '' || title === '') {
        return true;
    }

    /* 商品表示回数集計タグ生成時に保持した情報から、価格、カテゴリ、ブランド、バリエーションを取得 */
    var price = ecommerceExt_GA4.impressionDatas[id]['price'],
        category = ecommerceExt_GA4.impressionDatas[id]['category'],
        brand = ecommerceExt_GA4.impressionDatas[id]['brand'],
        variant = ecommerceExt_GA4.impressionDatas[id]['variant'];

    /* 送信処理 */
    var itemData = {
        'id': id,
        'title': title,
        'category': category,
        'brand': brand,
        'price': price,
        'variant': variant
    };

    ecommerceExt_GA4.sendDelCartConversion(itemData);

});

/* eコマース商品詳細表示 */
(function() {
    /* 商品情報を取得 */
    if ((document.querySelector('meta[property="etm:goods_detail"]') != null) || (document.querySelector('meta[property="etm:goods_detail"]') != undefined)) {
        var itemDetail = JSON.parse(document.querySelector('meta[property="etm:goods_detail"]').content);

        /* バリエーション取得 */
        var variant = ecommerceExt_GA4.formatVariant(itemDetail['variation_name1'], itemDetail['variation_name2']);
        var categoryVal = itemDetail['category'];
        var brandVal = itemDetail['goods'].substr(0, 1);

        /* 商品閲覧集計の送信 */
        gtag('event', 'view_item', {
            'items': [{
                'currency': GA4Currency,
                'item_id': itemDetail['goods'],
                'item_name': itemDetail['name'],
                'item_brand': brandVal,
                'item_category': categoryVal,
                'item_variant': variant,
                'price': itemDetail['price'],
                'location_id': 'detail'
            }],
            'send_to': trackingcode
        });

        /* 買い物かごに入れるボタン押下処理 */
        jQuery(goods_detail_cart_btn).on('click', function(event) {

            var id = itemDetail['goods'],
                title = itemDetail['name'],
                variantArray = new Array();

            /* 通常表示時のバリエーションセレクトボックス */
            var domSelectbox = jQuery(this).parents('form').find('select[name=goods]:not(#variation_arrival_notice_select)');

            /* セレクトボックスのvalueが取得できなければ元の値を送信 */
            if (domSelectbox.val() !== undefined && domSelectbox.val() !== '') {
                /* 選択されたvalue値とテキスト配列を取得 */
                id = domSelectbox.val();
                variantArray = domSelectbox.children('option:selected').text().split('/');
                /* 取得したテキスト配列から末尾の在庫部分を削除 */
                variantArray.pop();

                /* 配列を逆順でループしてバリエーション整形 */
                variant = '（';
                for (var i = variantArray.length - 1; i > -1; i--) {
                    if (i !== variantArray.length - 1) {
                        variant = variant + '　';
                    }

                    variant = variant + variantArray[i];
                }
                variant = variant + '）';

                /* 商品名に全角スペースを/に置換したバリエーションを連結 */
                title = title + variant.replace('　', '/');
            }
            /* 送信用データ配列作成 */
            var itemData = {
                'id': id,
                'title': title,
                'category': categoryVal,
                'brand': brandVal,
                'price': itemDetail['price'],
                'variant': variant,
                'qty': 1,
                'position': ''
            };

            /* カートの追加送信 */
            ecommerceExt_GA4.sendAddCartConversion(itemData);

        });
    }
})();