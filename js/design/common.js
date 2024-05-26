document.addEventListener('DOMContentLoaded', function() {

    // サイドメニュー
    var header = jQuery('#header');
    var wrap = jQuery('.wrapper_');
    var scroll_top = 0;
    var overlay = jQuery('#sidemenu_overlay');
    var sidemenu = jQuery('#sidemenu');

    jQuery('#header_menu_btn').on('click', function() {
        if (!wrap.hasClass('opened')) {
            scroll_top = jQuery(window).scrollTop();
            wrap.css('top', -scroll_top + 'px');
            wrap.addClass('opened');
            header.addClass('opened');
            overlay.show();
            sidemenu.addClass('opened');
        } else {
            wrap.removeClass('opened');
            header.removeClass('opened');
            overlay.hide();
            sidemenu.removeClass('opened');
        }
    });

    jQuery('#sidemenu #sidemenu_mainmenu>li .acco_').on('click', function() {
        var this_ = jQuery(this);
        if (!this_.hasClass('opened')) {
            this_.addClass('opened');
            this_.next().stop().slideDown('fast');
        } else {
            this_.removeClass('opened');
            this_.next().stop().slideUp('fast');
        }
    });
    jQuery('#sidemenu_overlay').on('click', function() {
        wrap.removeClass('opened');
        header.removeClass('opened');
        overlay.hide();
        sidemenu.removeClass('opened');
        wrap.css('top', 0);
        jQuery(window).scrollTop(scroll_top);
    });

    // タブ切り替え
    function tabFunc(btn, target) {
        if (jQuery(btn).length < 1) return
        jQuery(btn).on('click', function() {
            jQuery(btn).removeClass('is_active');
            jQuery(this).addClass('is_active');
            var i = jQuery(btn).index(this);
            jQuery(target).removeClass('is_active');
            jQuery(target).eq(i).addClass('is_active');
        })
    }
    tabFunc('.js_sidemenu_tabmenu_btn', '.js_sidemenu_tabmenu_item')

    // アコーディオン(click)
    function accoFunk(btn, target) {
        if (jQuery(btn).length < 1) return
        jQuery(btn).on('click', function() {
            jQuery(this).toggleClass("is_open");
            var i = jQuery(btn).index(this);
            jQuery(target).eq(i).slideToggle("fast", "swing");
        })
    }
    accoFunk('.js_sidemenu_acco_btn', '.js_sidemenu_acco_body');

    console.log('design/common.js end')
})