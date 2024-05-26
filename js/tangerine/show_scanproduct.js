//------------------ 基本接続
const API_URL = "https://api-stg2.tangerine.io/TangerineCloud/1/RA/" //環境用
var STATUS_SUCCESS = 200;
var TIMEOUT = 10000;
/**
 * request related methods
 */
/**
 * helper function to handle timeout
 * @param  {ms} timeout in milisecond
 * @param  {promise}
 * @return {promise}
 */
function timeoutPromise(ms, promise) {
    return new Promise(function(resolve, reject) {
        var timeoutId = setTimeout(function() {
            reject(new Error("timeout"))
        }, ms);
        promise.then(
            function(res) {
                clearTimeout(timeoutId);
                resolve(res);
            },
            function(err) {
                clearTimeout(timeoutId);
                reject(err);
            }
        );
    });
}
/**
 * make a get request
 * @param  {token} access token from SDK
 * @param  {url}
 * @return {promise}
 */
function getRequest(token, url) {
    var h;
    if (token) {
        h = {
            'Content-Type': 'application/json',
            'accessToken': token
        };
    } else {
        h = {
            'Content-Type': 'application/json',
        };
    }
    var requestOptions = {
        method: 'GET',
        headers: h
    };
    return timeoutPromise(TIMEOUT, fetch(url, requestOptions)
        .then(handleResponse)
        .catch(function(error) {
            // statusCode(error);
            // stopLoad();
        })
    ).catch(function(error) {
        // timeout();
    });
}
/**
 * make a post request
 * @param  {token} access token from SDK
 * @param  {url}
 * @param  {body} body in json format
 * @return {promise}
 */
function postRequest(token, url, body) {
    return timeoutPromise(TIMEOUT, fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                accessToken: token
            },
            body: JSON.stringify(body)
        })
        .then(handleResponse)
        .catch(function(error) {
            // statusCode(error);
            // stopLoad();
        })
    ).catch(function(error) {
        // timeout();
    });
}
// helper functions
function handleResponse(response) {
    return response.text().then(function(text) {
        var data = text && JSON.parse(text);
        if (!response.ok) {
            return Promise.reject(response);
        }
        return data;
    });
}
//------------------ /基本接続ここまで
function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}
//------------------ 接続後のデータ取得

// デバイス設定
var col;
var devicePc;
// pc/sp判別
if ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {
    // SPスライダーの表示コマ数
    col = 4;
    devicePc = false;
} else {
    // PCスライダーの表示コマ数
    col = 4;
    devicePc = true;
}

// APIリクエストとhtml展開
function showScanProduct(data) {

    var element = data.position;
    var apiKey = data.apiKey;
    var appUserId = data.appUserID;

    getRequest('', API_URL + 'Authenticate?apiKey=' + apiKey)
        .then(function(data) {
            if (data.status = STATUS_SUCCESS && data.token != '') {
                getRequest('', API_URL + 'GetPickerLinkInfo?accessToken=' + data.accessToken + '&appUserId=' + appUserId)
                    .then(function(data) {
                        if (data.status = STATUS_SUCCESS) {

                            var itemList = '';
                            itemList += '<h2 class="reco_ttl">店舗でチェックしたアイテム</h2>';
                            itemList += '<div class="reco_slider">';
                            itemList += '<div class="reco_slider_container">';
                            itemList += '<div class="reco_slider_wrapper">';
                            itemList += '<div class="reco_slider_panel">';

                            for (var i = 0; i < data.items.length; i++) {
                                var itemLength = data.items.length;
                                var itemIndex = i + 1;
                                if (data.items[i].image != null) {
                                    document.getElementById(element).classList.add("is_Show");

                                    itemList += '<div class="item_">';
                                    itemList += '<div class="item_photo_">';
                                    itemList += '<a class="item_photo_img lazyload" href="' + data.items[i].url + '"style="display: flex;">';
                                    itemList += '<img class="lazyload" data-src="' + data.items[i].image + '" alt="' + data.items[i].itemName + '">';
                                    itemList += '</a>'; // item_photo_
                                    itemList += '</div>'; // item_photo_
                                    itemList += '<div class="item_detail_">';
                                    itemList += '<div class="item_name_">' + data.items[i].itemName + '</div>';
                                    itemList += '<div class="item_logo_"><img class="lazyload" data-src="' + data.items[i].brandImageUrl + '"></div>'; // item_logo_
                                    itemList += '</div>'; // item_detail_
                                    itemList += '<div class="scanproduct_item_shopname">' + data.items[i].siteName + '</div>';
                                    itemList += '</div>'; // item_
                                    // spは4 pcは4
                                    if (itemIndex % col == 0 && itemIndex < itemLength) {
                                        // reco_slider_panel
                                        itemList += '</div><div class="reco_slider_panel">';
                                    }
                                } else {
                                    document.getElementById(element).classList.add("noData");
                                }
                            }

                            itemList += '</div>'; // reco_slider_panel
                            itemList += '</div>'; // reco_slider_wrapper
                            itemList += '</div>'; // reco_slider_container
                            itemList += '</div>'; // reco_slider

                            // htmlをセット
                            document.getElementById(element).insertAdjacentHTML('afterbegin', itemList);
                            // スライダーをセット
                            setSlider(element);

                        } else {
                            // failed
                            document.getElementById(element).classList.add("failed");
                        }
                    })
                // /getRequest
            }
        })
    // ------------
}
// /APIリクエストとhtml展開

// スライダー設定
function setSlider(element) {
    // 出力要素設定
    var targetSlide = element;
    var loopFlag;

    if (jQuery("#" + targetSlide + " .reco_slider_container").length > 0) {
        jQuery("#" + targetSlide + " .reco_slider_container").addClass("swiper-container");
        jQuery("#" + targetSlide + " .reco_slider_wrapper").addClass("swiper-wrapper");
        jQuery("#" + targetSlide + " .reco_slider_panel").addClass("swiper-slide");
        if (devicePc) {
            jQuery("#" + targetSlide + " .reco_slider_container").after('<div class="swiper-button-next"></div><div class="swiper-button-prev"></div>');
        }
        var slideLength = jQuery("#" + targetSlide + " .reco_slider_container .swiper-slide").length;
        if (slideLength > 1) {
            jQuery("#" + targetSlide + " .reco_slider_container").after('<div class="swiper-pagination"></div>');
            loopFlag = true;
        } else {
            loopFlag = false;
        }
        var reco_slider = new Swiper("#" + targetSlide + " .reco_slider_container.swiper-container", {
            init: true,
            observer: true,
            observeParents: true,
            watchOverflow: true,
            roundLengths: true,
            pagination: {
                el: "#" + targetSlide + " .swiper-pagination",
                type: 'bullets',
                clickable: true
            },
            navigation: {
                nextEl: "#" + targetSlide + " .swiper-button-next",
                prevEl: "#" + targetSlide + " .swiper-button-prev"
            },
            loop: loopFlag,
        });
    }
}
// /スライダー設定

function showScanProductMyPage(data) {

    /*  cookie情報から言語情報取得 */
    var lang = '';
    for (var c of cookiesArray) {
        var cArray = c.split('=');
        if (cArray[0] == ' lang') {
            lang = cArray[1];
        }
    }

    var element = data.position;
    var apiKey = data.apiKey;
    var appUserId = data.appUserID;

    var price_string = '';
    var isFr = false;
    if (lang == 'fr') {
        isFr = true;
    }

    getRequest('', API_URL + 'Authenticate?apiKey=' + apiKey)
        .then(function(data) {
            if (data.status = STATUS_SUCCESS && data.token != '') {
                getRequest('', API_URL + 'GetPickerLinkInfo?accessToken=' + data.accessToken + '&appUserId=' + appUserId)
                    .then(function(data) {
                        if (data.status = STATUS_SUCCESS) {

                            var itemList = '';

                            var faildMessage = '';
                            faildMessage += '<p class="scanproducts_items_caution">Product cannot be found.</p>';
                            faildMessage += '<p class="scanproducts_items_caution">Produit introuvable.</p>';

                            for (var i = 0; i < data.items.length; i++) {
                                var itemLength = data.items.length;
                                var itemIndex = i + 1;
                                if (data.items[i].image != null) {
                                    document.getElementById(element).classList.add("is_Show");

                                    /*  言語情報ごとに金額生成 */
                                    if (isFr) {
                                        price_string = 'EU €' + data.items[i].priceEuro.toLocaleString(); /*  フランス語 */
                                    } else {
                                        price_string = 'US＄' + data.items[i].priceDollar.toLocaleString(); /*  英語 */
                                    }

                                    itemList += '<a class="item_" href="' + data.items[i].url + '">';
                                    itemList += '  <div class="item_photo_img"><img src="' + data.items[i].image + '" alt="' + data.items[i].itemName + '" loading="lazy" ></div>';
                                    itemList += '  <div class="item_detail_">';
                                    itemList += '    <div class="item_name_">' + data.items[i].itemName + '</div>';
                                    itemList += '    <div class="item_price_"><span wovn-ignore>' + price_string + '</span></div>';
                                    itemList += '    <div class="item_logo_"><img src="' + data.items[i].brandImageUrl + '" loading="lazy"></div>';
                                    itemList += '  </div>'; // item_detail_
                                    itemList += '  <div class="scanproduct_item_shopname">' + data.items[i].siteName + '</div>';
                                    itemList += '</a>'; // item_

                                } else {
                                    itemList += faildMessage;
                                }
                            }

                            if (data.items.length == 0) {
                                document.getElementById(element).style.display = "none";
                                itemList += faildMessage;
                                document.getElementById(element).insertAdjacentHTML('beforebegin', itemList);
                            } else {
                                document.getElementById(element).insertAdjacentHTML('afterbegin', itemList);
                            }

                        } else {
                            // failed
                            itemList += faildMessage;
                            document.getElementById(element).insertAdjacentHTML('beforebegin', itemList);
                        }
                    })
                // /getRequest
            }
        })
    // ------------
}
console.log('show_scanproduct.js end');