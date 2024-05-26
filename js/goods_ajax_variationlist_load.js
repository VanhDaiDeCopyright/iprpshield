'use strict';
var ecblib = ecblib || {};
ecblib.goods_ajax_variationlist_load = ecblib.goods_ajax_variationlist_load || {};
if (document.addEventListener) {
    window.addEventListener('pageshow', function(event) {
            if (event.persisted || performance.getEntriesByType("navigation")[0].type === 'back_forward') {
                location.reload();
            }
        },
        false);
}
jQuery(window).load(function() {

    var goodsKind = "";
    var loadStart = function(elem) {
        jQuery(elem).attr("data-bookmark-click", "true");
        goodsKind = jQuery(elem).attr("class").indexOf("variation") != -1 ? "variation" : "goods";
        return elem;
    };
    var loadEnd = function(elem, iserror, msg, goodsCode) {
        if (!iserror) {
            if (msg == '1') {
                if (!jQuery(elem).hasClass('is_active')) {
                    jQuery(elem).addClass("is_active");
                    jQuery(elem).attr("data-goods", goodsCode);
                }
            } else {
                if (jQuery(elem).hasClass('is_active')) {
                    jQuery(elem).removeClass("is_active");
                    jQuery(elem).removeAttr("data-goods");
                }
            }
        } else {
            console.log(msg);
        }
        jQuery(elem).removeAttr("data-bookmark-click");
    };

    var CheckBookmark = function(b, g) {
        if (jQuery(b).attr("data-bookmark-click") == "true") {
            return false;
        }
        var o = loadStart(b);
        jQuery.ajax({
            async: true,
            type: "GET",
            url: ecblib.sys.wwwroot + "/shop/customer/bookmarkgoodsajax.aspx",
            data: {
                "goods": g,
                "crsirefo_hidden": jQuery("[name='crsirefo_hidden']").val()
            },
            cache: false,
            ifModified: false,
            dataType: "json",
            success: function(contents) {
                setTimeout(function() {
                    loadEnd(b, false, contents.msg, g);
                }, 0);
            },
            error: function(xhr, status, thrown) {
                loadEnd(o, true);
                console.log('お気に入りボタンのAjax処理を確認してください');
                return false;
            }
        });
        return true;
    };

    var SetChangeEvent = function(parent_goods) {
        if (jQuery('#chip_' + parent_goods + ' [data-item-color]').length > 0) {
            jQuery('#chip_' + parent_goods + ' [data-item-color]').on('click', function() {
                var selectedColor = jQuery(this).data('item-color');
                var selectedItem = jQuery(this).closest('.item_');
                var selectedPhoto = jQuery(selectedItem).find('.item_photo_');
                var selectedPhotoColor = jQuery(selectedItem).find("[data-item-image-color='" + selectedColor + "']");
                var selectedImageSource = jQuery(selectedPhotoColor).find('img').data('item-src');
                var selectedLink = jQuery(selectedItem).find("[data-item-link='" + selectedColor + "']");
                var isNew = selectedPhoto.find('.item_new_').length;
                var bookmarkLink = "";
                var goodsCode = jQuery(selectedPhotoColor).attr('href').split('/')

                if (isNew > 0) {
                    selectedPhoto.find('a:not(.item_new_, .item_addwish_btn)').addClass('item_new_');
                }

                jQuery(this).parents('.item_color_').find('.color_').removeClass("color_Selected_");
                jQuery(this).find('.color_').addClass('color_Selected_');


                jQuery(selectedItem).find('[data-item-image-color]').fadeOut(0, function() {
                    jQuery(selectedPhotoColor).find('img').attr('src', selectedImageSource).parent().css({
                        display: 'block'
                    }).animate({
                        opacity: 1
                    }, 0);
                });

                jQuery('[data-item-link]').css('display', 'none');
                jQuery(selectedLink).css('display', 'block');

                bookmarkLink = ecblib.sys.wwwroot + "/shop/customer/bookmark.aspx?goods=" + goodsCode[goodsCode.length - 2].slice(1) + "&crsirefo_hidden=";
                jQuery(selectedItem).find('.item_addwish_btn').attr('href', bookmarkLink);
                CheckBookmark(jQuery(selectedItem).find('.item_addwish_btn'), goodsCode[goodsCode.length - 2].slice(1))

            });
        }
    }

    var AjaxVariationGoodsList = function(data) {
        var parent_goods = data.for_goods;
        jQuery.ajax({
            async: true,
            url: ecblib.sys.wwwroot + "/shop/goods/variationlistloadapi.aspx",
            data: data,
            dataType: "json",
            type: "post",
            cache: false,
            success: function(data, status) {
                jQuery("#StyleT_Item_" + data[0]["variation_group"]).attr('class', 'StyleT_Item_ js-thumbSwitch');
                jQuery('#image_area_' + data[0]["variation_group"]).html(jQuery('<a href="">' + '<div class="img_ js-thumbSwitchImg"></div>' + '</a>' + '<div class="add_like_ js-likeTrigger"></div>'));
                renderVariationGoodsAnchorList(data, parent_goods);
                renderVariationGoodsChipList(data, parent_goods);
                renderVariationGoodsLinkList(data, parent_goods);
                CheckBookmark(jQuery('#chip_' + parent_goods).find('.item_addwish_btn'), parent_goods)
                SetChangeEvent(parent_goods);
            }
        });
    }

    jQuery('[name="for_variation_group"]').each(function(i) {
        if ((!jQuery('#for_goods' + i).val() == "") && (!jQuery('#for_variation_group' + i).val() == "")) {
            var data = {
                "for_goods": jQuery('#for_goods' + i).val(),
                "for_variation_group": jQuery('#for_variation_group' + i).val(),
            }
            AjaxVariationGoodsList(data)
        } else {
            return true;
        }
    });

});

function renderVariationGoodsAnchorList(data, parent_goods) {
    if (data.length != 0) {
        jQuery.each(data, function(key, item) {
            if (item.goods != parent_goods) {
                var AnchorArea = jQuery('#chip_' + parent_goods + ' > .item_photo_ > a:last');
                var chip = jQuery('<a href="' + item.link + '" data-item-image-color="' + item.variation_name2 + '"><img src="/img/usr/spacer.gif" alt="" data-item-src="' + item.src_s + '" wovn-ignore></a>');

                AnchorArea.after(chip);
            }
        });
    }
}

function renderVariationGoodsChipList(data, parent_goods) {
    if (data.length != 0) {
        jQuery.each(data, function(key, item) {

            var ChipListArea = jQuery('#chip_' + parent_goods + ' > .item_photo_ > .item_color_ > .item_color_inner');
            var chip = jQuery('<div data-item-color="' + item.variation_name2 + '" class="item_color_set"><div title="' + item.variation_name2 + '" class="color_ color_gray_ color_EnableStock_ color_Thumbnail_ " style="background-image: url(&quot;' + item.src_9 + '&quot;); "></div><span class="color_alt_">' + item.variation_name2 + '</span></div>');

            ChipListArea.append(chip);
        });
        jQuery('[data-item-color]:first-child').find('.color_').addClass(' color_Selected_');
    }
}

function renderVariationGoodsLinkList(data, parent_goods) {
    if (data.length != 0) {
        jQuery.each(data, function(key, item) {
            if (item.goods != parent_goods) {
                var ChipLinkArea = jQuery('#chip_' + parent_goods + ' > .item_detail_ > a:last');
                var chip = jQuery('<a href="' + item.link + '" data-item-link="' + item.variation_name2 + '">link</a>');

                ChipLinkArea.after(chip);
            }
        });
    }
}