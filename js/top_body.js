// top coordinate swiper
jQuery(function($) {
    jQuery(window).on('load', function() {
        var cd_swiper = new Swiper('.coordinate__slider__slider.swiper-container', {
            slidesPerView: 4.5,
            spaceBetween: 20,
            loop: true,
            observer: true,
            on: {
                slideChange: function() {
                    if (this.realIndex === 0) {
                        this.lazy.loadInSlide(this.activeIndex - 1);
                    }
                },
                init: function() {
                    jQuery('[data-original]').each(function() {
                        jQuery(this).attr('src', $(this).data('original'));
                        jQuery(this).css({
                            opacity: 1
                        });
                    })
                }
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
        });
    });
});