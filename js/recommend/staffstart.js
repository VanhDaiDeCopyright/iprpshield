window.addEventListener("DOMContentLoaded", function() {

    // pc/sp判別
    const userAgent = navigator.userAgent
    let DEVICE_PC;
    if (/iPhone|iPod|Android/i.test(userAgent)) {
        DEVICE_PC = false;
    } else {
        DEVICE_PC = true;
    }

    //--- 非ajaxのスライダー
    const slides = document.querySelectorAll('.js_coordinate_slide');

    slides.forEach((slide, i) => {
        const slides = slide.querySelectorAll('.coordinate_slide');
        const slidesId = 'coordinate_slide_static_0' + i;
        slide.setAttribute('id', slidesId);

        const elmContainer = document.createElement('div');
        const elmWrapper = document.createElement('div');

        elmContainer.className = 'coordination_slider_container swiper-container';
        elmWrapper.className = 'coordination_slider_wrapper swiper-wrapper';

        slide.appendChild(elmContainer);
        elmContainer.appendChild(elmWrapper);

        slides.forEach(coord => {
            coord.classList.add('swiper-slide');
            elmWrapper.appendChild(coord);
        });

        if (DEVICE_PC) {
            const elmNext = document.createElement('div');
            const elmPrev = document.createElement('div');

            elmNext.className = 'coordinate_slides_next swiper-button-next';
            elmPrev.className = 'coordinate_slides_prev swiper-button-prev';

            slide.appendChild(elmNext);
            slide.appendChild(elmPrev);
        }
    });

    if (slides.length > 0) {
        const spv = DEVICE_PC ? 4 : 2.63325;

        slides.forEach((slide, i) => {
            const trgId = `#coordinate_slide_static_0${i}`;
            const slidesItem = document.querySelectorAll(trgId + ' .coordinate_slide_img');
            const slidable = slidesItem.length > spv
            new Swiper(`${trgId} .coordination_slider_container.swiper-container`, {
                init: true,
                roundLengths: true,
                spaceBetween: 20,
                slidesPerView: spv,
                loop: slidable,
                freeMode: true,
                freeModeSticky: true,
                observer: true,
                observeParents: true,
                watchOverflow: true,
                navigation: {
                    nextEl: `${trgId} .swiper-button-next`,
                    prevEl: `${trgId} .swiper-button-prev`
                }
            }).init();
        });
    }
    // 非ajaxのスライダー----------------------------end
});

console.log('staffstart.js end')