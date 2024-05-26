window.addEventListener("DOMContentLoaded", function() {
    // Recently Viewed Products（最近ご覧になったアイテム）

    const targetDom = document.querySelector("#recently");
    if (targetDom) {

        // 接続先
        const url = jQuery("meta[name='wwwroot']").attr('content') + "/shop/goods/goods_history_api.aspx";
        // 変数設定 ----------
        let itemLength;
        let col;

        let DEVICE_PC
        if ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {
            DEVICE_PC = false;
        } else {
            DEVICE_PC = true;
        }

        if (!DEVICE_PC) {
            col = 4; // SPスライダーの表示コマ数
        } else if (DEVICE_PC) {
            col = 4; // PCスライダーの表示コマ数
        } else {
            col = 4;
        }
        // ------------------

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                console.log(response);
                return response.json();
            })
            .then((data) => {
                // console.log(data);
                crateRecentlyHtml(data, setEvents)
            })
            .catch((error) => {
                console.error("There was a problem with the fetch operation:", error);
            });

        function crateRecentlyHtml(data, callSetEvents) {
            let itemHtml = '';
            if (!data.items) {
                itemHtml += '<div class="silverEgg-emptyData-messege"><p>データがありません</p></div>'
            } else {
                itemHtml += '<h2 class="reco_ttl">最近ご覧になったアイテム</h2>'
                itemHtml += '<div class="reco_slider">'
                itemHtml += '<div class="reco_slider_container swiper-container">'
                itemHtml += '<div class="reco_slider_wrapper swiper-wrapper">'
                itemHtml += '<div class="reco_slider_panel swiper-slide">'

                data.items.forEach(function(items, index) {
                    index = index + 1
                    itemLength = data.items.length // reco_slider_panelをループ処理で制限する用
                    itemHtml += '<div class="item_">'
                    itemHtml += '<div class="item_photo_">'
                    itemHtml += '<a class="item_photo_img" href="' + items['ct_url'] + '"data-item-image-color="' + items['ct_url'] + '"style="display: flex;">'
                    itemHtml += '<img loading="lazy" src="' + items.img_url + '" alt="' + items.title + '">'
                    itemHtml += '</a>'
                    for (let i = 2; i <= 6; i++) {
                        if (items['img_url_' + i]) {
                            itemHtml += '<a class="item_photo_img" href="' + items['ct_url_colorchip' + i] + '"data-item-image-color="' + items['ct_url_colorchip' + i] + '"style="display: none;">'
                            itemHtml += '<img loading="lazy" src="' + items['img_url_' + i] + '" alt="' + items['title'] + '">'
                            itemHtml += '</a>'
                        }
                    }
                    itemHtml += '<div class="item_color_">'
                    itemHtml += '<div class="item_color_inner">'
                    itemHtml += '<div class="item_color_set" data-item-color="' + items['ct_url'] + '">'
                    itemHtml += '<div class="color_ color_EnableStock_" style="background-image:url(&quot;' + items.img_url_colorchip + '&quot;);"></div>'
                    itemHtml += '</div>'
                    for (let j = 2; j <= 6; j++) {
                        if (items['img_url_' + j]) {
                            itemHtml += '<div class="item_color_set" data-item-color="' + items['ct_url_colorchip' + j] + '">'
                            itemHtml += '<div class="color_ color_EnableStock_" style="background-image:url(&quot;' + items['img_url_colorchip' + j] + '&quot;);"></div>'
                            itemHtml += '</div>'
                        }
                    }
                    itemHtml += '</div>' //item_color_inner
                    itemHtml += '</div>' // item_color_
                    itemHtml += '</div>' // item_photo_

                    itemHtml += '<div class="item_detail_">'
                    itemHtml += '<div class="item_name_">' + items['title'] + '</div>'
                    itemHtml += '<div class="item_price_" wovn-ignore="true">'
                    itemHtml += items['price_string']
                    itemHtml += '</div>'
                    itemHtml += '<a href="' + items['ct_url'] + '" data-item-link="' + items['ct_url'] + '" style="display: block;"></a>'
                    for (let k = 2; k <= 6; k++) {
                        if (items['img_url_' + k]) {
                            itemHtml += '<a href="' + items['ct_url_colorchip' + k] + '" data-item-link="' + items['ct_url_colorchip' + k] + '" style="display: none;"></a>'
                        }
                    }
                    itemHtml += '<div class="item_logo_"><img loading="lazy" src="' + encodeURI(items.desc) + '"></div>' // item_logo_
                    itemHtml += '</div>' // item_detail_
                    itemHtml += '</div>' // item_
                    if (index % col == 0 && index < itemLength) { // spは4 pcは4
                        itemHtml += '</div><div class="reco_slider_panel swiper-slide">' // reco_slider_panel
                    }
                })
                itemHtml += '</div>'
                itemHtml += '</div>'
                itemHtml += '</div>'
                itemHtml += '</div>'
            }
            targetDom.innerHTML = itemHtml;
            callSetEvents();
        }

        const setEvents = function() {
            setSlider();
            setSelectEvent()
        }

        // swiperのnext.beforeボタンを追加する関数
        function addNextPrevButtons() {
            const recently = document.querySelector("#recently .reco_slider_container");
            const nextButton = document.createElement("div");
            nextButton.className = "swiper-button-next";
            const prevButton = document.createElement("div");
            prevButton.className = "swiper-button-prev";
            recently.parentNode.insertBefore(nextButton, recently.nextSibling);
            recently.parentNode.insertBefore(prevButton, recently.nextSibling);
        }

        // swiperのpagenationを追加する関数
        function addpagination() {
            const recently = document.querySelector("#recently .reco_slider_container");
            const pagination = document.createElement("div");
            pagination.className = "swiper-pagination";
            recently.parentNode.insertBefore(pagination, recently.nextSibling);
        }

        // スライダー化
        function setSlider() {
            if (DEVICE_PC) {
                addNextPrevButtons();
            }
            addpagination();
            const recentlylider = new Swiper("#recently .reco_slider_container.swiper-container", {
                init: true,
                observer: true,
                observeParents: true,
                watchOverflow: true,
                roundLengths: true,
                pagination: {
                    el: "#recently .swiper-pagination",
                    type: 'bullets',
                    clickable: true
                },
                navigation: {
                    nextEl: "#recently .swiper-button-next",
                    prevEl: "#recently .swiper-button-prev"
                },
                loop: true,
                // ------------
            });
        };

        // カラーチップクリックでサムネイルとリンク先を変更
        function setSelectEvent() {
            // console.log('setSelectEvent!')
            if (jQuery('[data-item-color]').length > 0) {
                jQuery('[data-item-color]:first-child .color_').addClass('color_Selected_')

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

    } // endif

});
console.log("rvp.js end");