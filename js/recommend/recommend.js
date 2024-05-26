jQuery(function($) {

    /*--- 変数設定 ---*/

    // 接続ドメイン
    var domain = 'https://yohjiycom.silveregg.net'
    // var domain = 'https://yohjiycom-test.silveregg.net'

    // pc/sp判別
    var col;
    if ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {
        col = 4;
    } else {
        col = 8;
    }

    // en/fr判別
    var fr;
    if (document.URL.match(/fr/)) {
        fr = true
    } else {
        fr = false
    }

    // リクエスト送信クエリ設定
    var requestId = jQuery('[id^="recommend_"]')
    if (requestId.length) {

        var requestData
        var REQUESTDATA;
        var requestParam;
        var requestData_callback;

        requestId.each(function() {

            // specIDを取り出し
            var specId = jQuery(this).attr('id').split('_')[1]

            // 変数名を生成
            specIdUpperCase = specId.toUpperCase()
            REQUESTDATA = "REQUEST_DATA_" + specIdUpperCase
            var REQUEST_DATA = eval(REQUESTDATA)

            if (typeof REQUEST_DATA !== 'undefined') {
                requestData = REQUEST_DATA;
                requestData_callback = requestData.callback
                requestParam = jQuery.param(requestData, true)
                // console.log("requestParam0;",requestParam);

                /*--- 呼び出し ---*/
                silvereggReqest(requestParam, specId)
            }

        })
    }

    // クリック通知クエリ設定
    var clickParam;

    // コンバージョン通知クエリ設定
    if (typeof CONVERSION_DATA !== 'undefined') {
        var conversionObj = CONVERSION_DATA;

        // CONVERSION_DATAから必要な配列を取り出し
        jQuery.each(conversionObj, function(index, conversionData) {
            // console.log('conversionObj;',conversionObj)
            /*--- 呼び出し ---*/
            silvereggConversion(index, conversionData)
        })

    }

    // callback(callSetEvents)される関数をまとめる
    var setEvents = function(specId) {
        setSlider(specId)
        setSelectEvent()
        recoLoad()
    }

    /*--- 関数定義 ---*/

    // リクエスト送信ajax
    function silvereggReqest(requestParam, specId) {
        // console.log('silvereggReqest!')
        // ドメイン設定
        var sendRequestDomain = domain
        sendRequestDomain += '/pycre5/jsonp/recommend?'
        var sendRequest = sendRequestDomain + requestParam
        var sendRequestUrl = sendRequest.replace(/&callback=.+/gi, '')
        sendRequestUrl += '&xcat=coordination';
        var defer = jQuery.Deferred();

        // console.log('requestData_callback;',requestData_callback)

        jQuery.ajax({
                type: 'GET',
                url: sendRequestUrl,
                dataType: 'jsonp',
                jsonpCallback: requestData_callback
            })
            .then(
                function(data) {
                    // htmlの生成開始
                    // console.log('ajaxのthen')
                    // リクエスト送信デバッグ用
                    // console.log('sendRequestUrl;',sendRequestUrl)
                    createHtml(data, setEvents, specId)
                    return defer.resolve(data);
                },
                function() {
                    console.log('リクエスト受信失敗')
                    return defer.reject([]);
                }
            );
        return defer.promise();
    }

    // クリック通知送信ajax
    function sendClick(clickParam, count, targetHref) {
        // console.log('sendClick!')
        // console.log('clickParam-sendClick;', clickParam)

        // ユニークのcallback名を作る
        var clickData_callback = 'clickItem0' + count
        // ドメイン設定
        var sendClickDomain = domain
        sendClickDomain += '/pycre5/jsonp/click?'
        var sendClick = sendClickDomain + clickParam
        var sendClickUrl = sendClick.replace(/&callback=.+/gi, '')
        // console.log('sendClickUrl-var;',sendClickUrl)
        var defer = jQuery.Deferred();

        jQuery.ajax({
                type: 'GET',
                url: sendClickUrl,
                dataType: 'jsonp',
                async: true,
                jsonpCallback: clickData_callback
            })
            .then(
                function(data) {
                    // クリック通知送信デバッグ用
                    // console.log('sendClickUrl-then;',sendClickUrl)
                    // return defer.resolve(data);
                    // ページを遷移させる
                    // console.log('targetHref;',targetHref)
                    location.href = targetHref;
                },
                function() {
                    // console.log('クリック通知送信失敗')
                    return defer.reject([]);
                }
            );
        return defer.promise();
    }

    // コンバージョン送信ajax
    function silvereggConversion(index, conversionData) {
        // console.log('silvereggConversion!')

        // ユニークのcallback名を作る
        index = index + 1
        var conversionData_callback = 'conversionItem0' + index

        // console.log('conversionData_callback;', conversionData_callback)
        // 配列をパラメータに変換
        var conversionParam = jQuery.param(conversionData, true)
        // console.log('conversionParam;',conversionParam)
        // conversionParam.delete('callback')
        // ドメイン設定
        var sendConversionDomain = domain
        sendConversionDomain += '/pycre5/jsonp/purchase?'
        var silvereggConversion = sendConversionDomain + conversionParam
        var silvereggConversionUrl = silvereggConversion.replace(/&callback=.+/gi, '')
        var defer = jQuery.Deferred();


        jQuery.ajax({
            type: 'GET',
            // url: url,
            url: silvereggConversionUrl,
            dataType: 'jsonp',
            async: true,
            jsonpCallback: conversionData_callback
        })
        // .then(
        //   function(data) {
        //     //コンバージョン送信デバッグ用
        //     console.log('silvereggConversionUrl;', silvereggConversionUrl)
        //     return defer.resolve(data);
        //   },
        //   function() {
        //     // console.log('コンバージョン送信失敗')
        //     return defer.reject([]);
        //   }
        // );
        return defer.promise();
    }

    // html生成
    function createHtml(data, callSetEvents, specId) {
        // console.log('createHtml!')
        // console.log('data',data)
        // console.log("requestParam2;",requestParam);
        // console.log('specId(createHtml);',specId)

        // crefに設定するrqidを取り出し
        var cref = data.rqid

        var itemList = '';

        if (data == '') {
            itemList += '<div class="silverEgg-emptyData-messege"><p>データがありません</p></div>'
        } else {
            if (specId == 'sp311' || specId == 'sp312') {
                itemList += '<div class="reco_load">'
                itemList += '<div class="reco_load_row">'
                jQuery.each(data.items, function(index, items) {
                    clickParam = 'prod=' + items[0]._id + '&'
                    clickParam += 'merch=' + requestData.merch + '&'
                    clickParam += 'spec=' + specId + '&'
                    clickParam += 'cookie=' + requestData.cookie + '&'
                    clickParam += 'cref=' + cref + '&'
                    clickParam += 'callback=' + 'clickItem' + index
                    var item = items[0];
                    var itemImgUrlArray = [item.img_url, item.img_url_2, item.img_url_3, item.img_url_4, item.img_url_5, item.img_url_6]
                    var ct_url = item_title = item_price_string = null
                    if (fr) {
                        ct_url = item.ct_url_france
                    } else {
                        ct_url = item.ct_url
                    }
                    if (fr) {
                        item_title = item.title_france
                        item_price_string = items[0].price_string_france
                    } else {
                        item_title = item.title
                        item_price_string = items[0].price_string
                    }
                    itemList += '<div class="item_">'
                    itemList += '<div class="item_photo_">'
                    jQuery.each(itemImgUrlArray, function(index, imgUrl) {
                        index = index + 1
                        if (index == 1) {
                            itemImgStyle = 'block'
                        } else {
                            itemImgStyle = 'none'
                        }
                        if (index == 1) {
                            if (fr) {
                                ct_url = item.ct_url_france
                            } else {
                                ct_url = item.ct_url
                            }
                            img_url_colorchip = item.img_url_colorchip
                        } else if (index == 2) {
                            if (fr) {
                                ct_url = item.ct_url_colorchip2_france
                            } else {
                                ct_url = item.ct_url_colorchip2
                            }
                            img_url_colorchip = item.img_url_colorchip2
                        } else if (index == 3) {
                            if (fr) {
                                ct_url = item.ct_url_colorchip3_france
                            } else {
                                ct_url = item.ct_url_colorchip3
                            }
                            img_url_colorchip = item.img_url_colorchip3
                        } else if (index == 4) {
                            if (fr) {
                                ct_url = item.ct_url_colorchip4_france
                            } else {
                                ct_url = item.ct_url_colorchip4
                            }
                            img_url_colorchip = item.img_url_colorchip4
                        } else if (index == 5) {
                            if (fr) {
                                ct_url = item.ct_url_colorchip5_france
                            } else {
                                ct_url = item.ct_url_colorchip5
                            }
                            img_url_colorchip = item.img_url_colorchip5
                        } else if (index == 6) {
                            if (fr) {
                                ct_url = item.ct_url_colorchip6_france
                            } else {
                                ct_url = item.ct_url_colorchip6
                            }
                            img_url_colorchip = item.img_url_colorchip6
                        }
                        if (imgUrl) {
                            itemList += '<a class="item_photo_img" href="' + ct_url + '"data-item-image-color="' + ct_url + '"data-item-click="' + clickParam + '"style="display:' + itemImgStyle + ';">'
                            itemList += '<img class="swiper-lazy" src="' + imgUrl + '"data-srcset="' + imgUrl + '" alt="' + item_title + '">'
                            itemList += '</a>'
                        }
                    });
                    itemList += '<div class="item_color_">'
                    itemList += '<div class="item_color_inner">'
                    jQuery.each(itemImgUrlArray, function(index, imgUrl) {
                        index = index + 1
                        if (index == 1) {
                            if (fr) {
                                ct_url = item.ct_url_france
                            } else {
                                ct_url = item.ct_url
                            }
                            img_url_colorchip = item.img_url_colorchip
                        } else if (index == 2) {
                            if (fr) {
                                ct_url = item.ct_url_colorchip2_france
                            } else {
                                ct_url = item.ct_url_colorchip2
                            }
                            img_url_colorchip = item.img_url_colorchip2
                        } else if (index == 3) {
                            if (fr) {
                                ct_url = item.ct_url_colorchip3_france
                            } else {
                                ct_url = item.ct_url_colorchip3
                            }
                            img_url_colorchip = item.img_url_colorchip3
                        } else if (index == 4) {
                            if (fr) {
                                ct_url = item.ct_url_colorchip4_france
                            } else {
                                ct_url = item.ct_url_colorchip4
                            }
                            img_url_colorchip = item.img_url_colorchip4
                        } else if (index == 5) {
                            if (fr) {
                                ct_url = item.ct_url_colorchip5_france
                            } else {
                                ct_url = item.ct_url_colorchip5
                            }
                            img_url_colorchip = item.img_url_colorchip5
                        } else if (index == 6) {
                            if (fr) {
                                ct_url = item.ct_url_colorchip6_france
                            } else {
                                ct_url = item.ct_url_colorchip6
                            }
                            img_url_colorchip = item.img_url_colorchip6
                        }
                        if (imgUrl) {
                            itemList += '<div class="item_color_set" data-item-color="' + ct_url + '">'
                            itemList += '<div class="color_ color_EnableStock_" style="background-image:url(&quot;' + img_url_colorchip + '&quot;);"></div>'
                            itemList += '</div>'
                        }
                    })
                    itemList += '</div>'
                    itemList += '</div>'
                    itemList += '</div>'
                    itemList += '<div class="item_detail_">'
                    itemList += '<div class="item_name_">' + item_title + '</div>'
                    itemList += item_price_string
                    itemList += '<a href="' + ct_url + '" data-item-link="' + ct_url + '"data-item-click="' + clickParam + '" style="display: none;"></a>'
                    itemList += '</div>'
                    itemList += '</div>'

                })
                itemList += '</div>'
                itemList += '<div class="reco_btn_wrap"><button class="reco_load_btn">View more</button></div>'
                itemList += '</div>'

            } else {
                itemList += '<div class="reco_slider_container">'
                itemList += '<div class="reco_slider_wrapper">'
                itemList += '<div class="reco_slider_panel">'
                jQuery.each(data.items, function(index, items) {
                    // reco_slider_panelをループ処理で制限する用
                    var itemLength = data.items.length

                    // クリック通知パラメータ生成
                    clickParam = 'prod=' + items[0]._id + '&'
                    clickParam += 'merch=' + requestData.merch + '&'
                    clickParam += 'spec=' + specId + '&'
                    clickParam += 'cookie=' + requestData.cookie + '&'
                    clickParam += 'cref=' + cref + '&'
                    clickParam += 'callback=' + 'clickItem' + index
                    // console.log('clickParam;',clickParam)
                    // console.log('items[0];',items[0])
                    // console.log('items[0]._id;',items[0]._id)

                    index = index + 1

                    itemList += '<div class="item_">'

                    itemList += '<div class="item_photo_">'
                    if (fr) {
                        itemList += '<a class="item_photo_img" href="' + items[0].ct_url_france + '"data-item-image-color="' + items[0].ct_url_france + '"data-item-click="' + clickParam + '"style="display: block;">'
                        itemList += '<img class="swiper-lazy" data-src="' + items[0].img_url + '"data-srcset="' + items[0].img_url + '" alt="' + items[0].title_france + '">'
                    } else {
                        itemList += '<a class="item_photo_img" href="' + items[0].ct_url + '"data-item-image-color="' + items[0].ct_url + '"data-item-click="' + clickParam + '"style="display: block;">'
                        itemList += '<img class="swiper-lazy" data-src="' + items[0].img_url + '"data-srcset="' + items[0].img_url + '" alt="' + items[0].title + '">'
                    }
                    itemList += '</a>'
                    if (items[0].img_url_2) {
                        if (fr) {
                            itemList += '<a class="item_photo_img" href="' + items[0].ct_url_colorchip2_france + '"data-item-image-color="' + items[0].ct_url_colorchip2_france + '"data-item-click="' + clickParam + '"style="display: none;">'
                            itemList += '<img class="swiper-lazy" data-src="' + items[0].img_url_2 + '"data-srcset="' + items[0].img_url_2 + '" alt="' + items[0].title_france + '">'
                        } else {
                            itemList += '<a class="item_photo_img" href="' + items[0].ct_url_colorchip2 + '"data-item-image-color="' + items[0].ct_url_colorchip2 + '"data-item-click="' + clickParam + '"style="display: none;">'
                            itemList += '<img class="swiper-lazy" data-src="' + items[0].img_url_2 + '"data-srcset="' + items[0].img_url_2 + '" alt="' + items[0].title + '">'
                        }
                        itemList += '</a>'
                    }
                    if (items[0].img_url_3) {
                        if (fr) {
                            itemList += '<a class="item_photo_img" href="' + items[0].ct_url_colorchip3_france + '"data-item-image-color="' + items[0].ct_url_colorchip3_france + '"data-item-click="' + clickParam + '"style="display: none;">'
                            itemList += '<img class="swiper-lazy" data-src="' + items[0].img_url_3 + '"data-srcset="' + items[0].img_url_3 + '" alt="' + items[0].title_france + '">'
                        } else {
                            itemList += '<a class="item_photo_img" href="' + items[0].ct_url_colorchip3 + '"data-item-image-color="' + items[0].ct_url_colorchip3 + '"data-item-click="' + clickParam + '"style="display: none;">'
                            itemList += '<img class="swiper-lazy" data-src="' + items[0].img_url_3 + '"data-srcset="' + items[0].img_url_3 + '" alt="' + items[0].title + '">'
                        }
                        itemList += '</a>'
                    }
                    if (items[0].img_url_4) {
                        if (fr) {
                            itemList += '<a class="item_photo_img" href="' + items[0].ct_url_colorchip4_france + '"data-item-image-color="' + items[0].ct_url_colorchip4_france + '"data-item-click="' + clickParam + '"style="display: none;">'
                            itemList += '<img class="swiper-lazy" data-src="' + items[0].img_url_4 + '"data-srcset="' + items[0].img_url_4 + '" alt="' + items[0].title_france + '">'
                        } else {
                            itemList += '<a class="item_photo_img" href="' + items[0].ct_url_colorchip4 + '"data-item-image-color="' + items[0].ct_url_colorchip4 + '"data-item-click="' + clickParam + '"style="display: none;">'
                            itemList += '<img class="swiper-lazy" data-src="' + items[0].img_url_4 + '"data-srcset="' + items[0].img_url_4 + '" alt="' + items[0].title + '">'
                        }
                        itemList += '</a>'
                    }
                    if (items[0].img_url_5) {
                        if (fr) {
                            itemList += '<a class="item_photo_img" href="' + items[0].ct_url_colorchip5_france + '"data-item-image-color="' + items[0].ct_url_colorchip5_france + '"data-item-click="' + clickParam + '"style="display: none;">'
                            itemList += '<img class="swiper-lazy" data-src="' + items[0].img_url_5 + '"data-srcset="' + items[0].img_url_5 + '" alt="' + items[0].title_france + '">'
                        } else {
                            itemList += '<a class="item_photo_img" href="' + items[0].ct_url_colorchip5 + '"data-item-image-color="' + items[0].ct_url_colorchip5 + '"data-item-click="' + clickParam + '"style="display: none;">'
                            itemList += '<img class="swiper-lazy" data-src="' + items[0].img_url_5 + '"data-srcset="' + items[0].img_url_5 + '" alt="' + items[0].title + '">'
                        }
                        itemList += '</a>'
                    }
                    if (items[0].img_url_6) {
                        if (fr) {
                            itemList += '<a class="item_photo_img" href="' + items[0].ct_url_colorchip6_france + '"data-item-image-color="' + items[0].ct_url_colorchip6_france + '"data-item-click="' + clickParam + '"style="display: none;">'
                            itemList += '<img class="swiper-lazy" data-src="' + items[0].img_url_6 + '"data-srcset="' + items[0].img_url_6 + '" alt="' + items[0].title_france + '">'
                        } else {
                            itemList += '<a class="item_photo_img" href="' + items[0].ct_url_colorchip6 + '"data-item-image-color="' + items[0].ct_url_colorchip6 + '"data-item-click="' + clickParam + '"style="display: none;">'
                            itemList += '<img class="swiper-lazy" data-src="' + items[0].img_url_6 + '"data-srcset="' + items[0].img_url_6 + '" alt="' + items[0].title + '">'
                        }
                        itemList += '</a>'
                    }
                    itemList += '<div class="item_color_">'
                    itemList += '<div class="item_color_inner">'
                    if (fr) {
                        itemList += '<div class="item_color_set" data-item-color="' + items[0].ct_url_france + '">'
                    } else {
                        itemList += '<div class="item_color_set" data-item-color="' + items[0].ct_url + '">'
                    }
                    itemList += '<div class="color_ color_EnableStock_" style="background-image:url(&quot;' + items[0].img_url_colorchip + '&quot;);"></div>'
                    itemList += '</div>'

                    if (items[0].img_url_2) {
                        if (fr) {
                            itemList += '<div class="item_color_set" data-item-color="' + items[0].ct_url_colorchip2_france + '">'
                        } else {
                            itemList += '<div class="item_color_set" data-item-color="' + items[0].ct_url_colorchip2 + '">'
                        }
                        itemList += '<div class="color_ color_EnableStock_" style="background-image:url(&quot;' + items[0].img_url_colorchip2 + '&quot;);"></div>'
                        itemList += '</div>'
                    }
                    if (items[0].img_url_3) {
                        if (fr) {
                            itemList += '<div class="item_color_set" data-item-color="' + items[0].ct_url_colorchip3_france + '">'
                        } else {
                            itemList += '<div class="item_color_set" data-item-color="' + items[0].ct_url_colorchip3 + '">'
                        }
                        itemList += '<div class="color_ color_EnableStock_" style="background-image:url(&quot;' + items[0].img_url_colorchip3 + '&quot;);"></div>'
                        itemList += '</div>'
                    }
                    if (items[0].img_url_4) {
                        if (fr) {
                            itemList += '<div class="item_color_set" data-item-color="' + items[0].ct_url_colorchip4_france + '">'
                        } else {
                            itemList += '<div class="item_color_set" data-item-color="' + items[0].ct_url_colorchip4 + '">'
                        }
                        itemList += '<div class="color_ color_EnableStock_" style="background-image:url(&quot;' + items[0].img_url_colorchip4 + '&quot;);"></div>'
                        itemList += '</div>'
                    }
                    if (items[0].img_url_5) {
                        if (fr) {
                            itemList += '<div class="item_color_set" data-item-color="' + items[0].ct_url_colorchip5_france + '">'
                        } else {
                            itemList += '<div class="item_color_set" data-item-color="' + items[0].ct_url_colorchip5 + '">'
                        }
                        itemList += '<div class="color_ color_EnableStock_" style="background-image:url(&quot;' + items[0].img_url_colorchip5 + '&quot;);"></div>'
                        itemList += '</div>'
                    }
                    if (items[0].img_url_6) {
                        if (fr) {
                            itemList += '<div class="item_color_set" data-item-color="' + items[0].ct_url_colorchip6_france + '">'
                        } else {
                            itemList += '<div class="item_color_set" data-item-color="' + items[0].ct_url_colorchip6 + '">'
                        }
                        itemList += '<div class="color_ color_EnableStock_" style="background-image:url(&quot;' + items[0].img_url_colorchip6 + '&quot;);"></div>'
                        itemList += '</div>'
                    }

                    //item_color_inner
                    itemList += '</div>'
                    // item_color_
                    itemList += '</div>'
                    // item_photo_
                    itemList += '</div>'

                    itemList += '<div class="item_detail_">'
                    if (fr) {
                        itemList += '<div class="item_name_">' + items[0].title_france + '</div>'
                        itemList += items[0].price_string_france
                    } else {
                        itemList += '<div class="item_name_">' + items[0].title + '</div>'
                        itemList += items[0].price_string
                    }
                    if (fr) {
                        itemList += '<a href="' + items[0].ct_url_france + '" data-item-link="' + items[0].ct_url_france + '"data-item-click="' + clickParam + '" style="display: block;"></a>'
                    } else {
                        itemList += '<a href="' + items[0].ct_url + '" data-item-link="' + items[0].ct_url + '"data-item-click="' + clickParam + '" style="display: block;"></a>'
                    }
                    if (items[0].img_url_2) {
                        if (fr) {
                            itemList += '<a href="' + items[0].ct_url_colorchip2_france + '" data-item-link="' + items[0].ct_url_colorchip2_france + '"data-item-click="' + clickParam + '" style="display: none;"></a>'
                        } else {
                            itemList += '<a href="' + items[0].ct_url_colorchip2 + '" data-item-link="' + items[0].ct_url_colorchip2 + '"data-item-click="' + clickParam + '" style="display: none;"></a>'
                        }
                    }
                    if (items[0].img_url_3) {
                        if (fr) {
                            itemList += '<a href="' + items[0].ct_url_colorchip3_france + '" data-item-link="' + items[0].ct_url_colorchip3_france + '"data-item-click="' + clickParam + '" style="display: none;"></a>'
                        } else {
                            itemList += '<a href="' + items[0].ct_url_colorchip3 + '" data-item-link="' + items[0].ct_url_colorchip3 + '"data-item-click="' + clickParam + '" style="display: none;"></a>'
                        }
                    }
                    if (items[0].img_url_4) {
                        if (fr) {
                            itemList += '<a href="' + items[0].ct_url_colorchip4_france + '" data-item-link="' + items[0].ct_url_colorchip4_france + '"data-item-click="' + clickParam + '" style="display: none;"></a>'
                        } else {
                            itemList += '<a href="' + items[0].ct_url_colorchip4 + '" data-item-link="' + items[0].ct_url_colorchip4 + '"data-item-click="' + clickParam + '" style="display: none;"></a>'
                        }
                    }
                    if (items[0].img_url_5) {
                        if (fr) {
                            itemList += '<a href="' + items[0].ct_url_colorchip5_france + '" data-item-link="' + items[0].ct_url_colorchip5_france + '"data-item-click="' + clickParam + '" style="display: none;"></a>'
                        } else {
                            itemList += '<a href="' + items[0].ct_url_colorchip5 + '" data-item-link="' + items[0].ct_url_colorchip5 + '"data-item-click="' + clickParam + '" style="display: none;"></a>'
                        }
                    }
                    if (items[0].img_url_6) {
                        if (fr) {
                            itemList += '<a href="' + items[0].ct_url_colorchip6_france + '" data-item-link="' + items[0].ct_url_colorchip6_france + '"data-item-click="' + clickParam + '" style="display: none;"></a>'
                        } else {
                            itemList += '<a href="' + items[0].ct_url_colorchip6 + '" data-item-link="' + items[0].ct_url_colorchip6 + '"data-item-click="' + clickParam + '" style="display: none;"></a>'
                        }
                    }
                    if (col == 8) {

                        itemList += '<div class="item_logo_"><img class="swiper-lazy" data-src="' + encodeURI(items[0].desc) + '"data-srcset="' + encodeURI(items[0].desc) + '"></div>'
                        // item_logo_
                    }
                    // item_detail_
                    itemList += '</div>'

                    // item_
                    itemList += '</div>'
                    // spは4 pcは8
                    if (index % col == 0 && index < itemLength) {
                        // reco_slider_panel
                        itemList += '</div><div class="reco_slider_panel">'
                    }

                })
                // reco_slider_panel
                itemList += '</div>'
                // reco_slider_wrapper
                itemList += '</div>'
                // reco_slider_container
                itemList += '</div>'
            }
            // --------------
        }
        var targetDom = jQuery('#recommend_' + specId)
        // console.log('targetDom;',targetDom)
        targetDom.html(itemList)
        callSetEvents(specId);
    }

    // スライダー設定
    function setSlider(specId) {
        // console.log('setSlider!')
        // console.log('specId(specId);',specId)
        var targetSlide = "#recommend_" + specId;

        if (jQuery(targetSlide + " .reco_slider_container").length > 0) {

            jQuery(targetSlide + " .reco_slider_container").addClass("swiper-container");
            jQuery(targetSlide + " .reco_slider_wrapper").addClass("swiper-wrapper");
            jQuery(targetSlide + " .reco_slider_panel").addClass("swiper-slide");
            // // アイテム数が足りているときのフラグ
            var slidable = jQuery(targetSlide + " .reco_slider_container .item_").length > col
            // // スライドがアクティブな場合は、コンテナー要素にクラス名「is-active」を設定
            // var containerModifierClass =  slidable ? 'is-active swiper-container-' : 'swiper-container-';
            jQuery(targetSlide + " .reco_slider_container").after('<div class="swiper-button-next"></div><div class="swiper-button-prev"></div>');
            jQuery(targetSlide + " .reco_slider_container").after('<div class="swiper-pagination"></div>');
            var reco_slider = "reco_slider" + specId;
            var reco_slider = new Swiper(targetSlide + " .reco_slider_container.swiper-container", {
                // containerModifierClass: containerModifierClass,
                init: true,
                observer: true,
                observeParents: true,
                watchOverflow: true,
                roundLengths: true,
                pagination: {
                    el: targetSlide + " .swiper-pagination",
                    type: 'bullets',
                    clickable: true
                },
                navigation: {
                    nextEl: targetSlide + " .swiper-button-next",
                    prevEl: targetSlide + " .swiper-button-prev"
                },
                loop: false,
                preloadImages: true,
                lazy: {
                    loadPrevNext: true
                },
                on: {
                    slideChange: function() {
                        if (this.realIndex === 0) {
                            this.lazy.loadInSlide(this.activeIndex - 1);
                        }
                    }
                }
                // ------------
            }); ///
            // if (slidable) {
            // }

        }
    }

    // カラーチップクリックでサムネイルとリンク先を変更
    function setSelectEvent() {
        // console.log('setSelectEvent!')
        if (jQuery('[data-item-color]').length > 0) {
            jQuery('[data-item-color]:first-child').find('.color_').addClass(' color_Selected_')

            jQuery('[data-item-color]').on('click', function(e) {
                // スライダーまで動かさないおまじない
                e.stopPropagation()

                var selectedColor = jQuery(this).data('item-color');
                var selectedItem = jQuery(this).closest('.item_');
                var selectedPhotoColor = jQuery(selectedItem).find("[data-item-image-color='" + selectedColor + "']");
                var selectedImageSource = jQuery(selectedPhotoColor).find('img').data('item-src');
                var selectedLink = jQuery(selectedItem).find("[data-item-link='" + selectedColor + "']");

                // カラーチップ選択クラス付与
                jQuery(this).parents('.item_color_').find('.color_').removeClass('color_Selected_');
                jQuery(this).find('.color_').addClass('color_Selected_');

                // Hide all images in 0 seconds
                jQuery(selectedItem).find('[data-item-image-color]').fadeOut(0, function() {
                    // Change image source and show image
                    jQuery(selectedPhotoColor).find('img').attr('src', selectedImageSource).parent().css({
                        display: 'block'
                    }).animate({
                        opacity: 1
                    }, 0);
                });

                // Hide all and show correct link
                jQuery(selectedItem).find('[data-item-link]').css('display', 'none');
                jQuery(selectedLink).css('display', 'block');
            });
        }
    }

    // クリック通知イベント
    var count = 0;
    jQuery('[id^="recommend_"]').on('click', '.item_ a', function(e) {
        count = count + 1
        // クリックを奪う
        e.preventDefault();
        var targetHref = jQuery(this).attr('href');
        // パラメータ格納
        clickParam = jQuery(this).data('item-click');
        // console.log('clickParam-click;',clickParam);
        sendClick(clickParam, count, targetHref);
        // -----------------
    })

    function recoLoad() {
        var moreSlice = 4;
        btnWrap = jQuery('.reco_btn_wrap')
        jQuery('.reco_load_row').each(function() {
            var recoLoadAllCol = jQuery(this).children('.item_')
            if (recoLoadAllCol.length < 1) {
                jQuery(this).parents('.reco_slider').prev('.reco_ttl').hide()
            }
            jQuery(this).next(btnWrap).hide()
            recoLoadAllCol.hide()
            recoLoadAllCol.slice(0, moreSlice).show()
            if (jQuery(this).children('.item_:hidden').length != 0) {
                jQuery(this).next(btnWrap).show();
            }

        })
        jQuery('.reco_load_btn').unbind('click')
        jQuery('.reco_load_btn').on('click', function(e) {
            e.preventDefault();
            jQuery(this).parents('.reco_load').find('.item_:hidden').slice(0, moreSlice).fadeIn();
            if (jQuery(this).parents('.reco_load').find('.item_:hidden').length == 0) {
                jQuery(this).parent(btnWrap).fadeOut('slow');
            }
        })
    }
    console.log('recommend.js_end')
})