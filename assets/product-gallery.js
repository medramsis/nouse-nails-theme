document.addEventListener('DOMContentLoaded', function () {
  const mainGallery = document.querySelector('.product-media-gallery__main');
  const thumbnailGallery = document.querySelector(
    '.product-media-gallery__thumbnails'
  );

  if (mainGallery && thumbnailGallery) {
    // Wait for both swipers to be initialized
    const mainSwiper = mainGallery.getSwiper();
    const thumbsSwiper = thumbnailGallery.getSwiper();

    // Once both swipers are ready, connect them
    Promise.all([mainSwiper, thumbsSwiper]).then(
      ([mainSwiper, thumbsSwiper]) => {
        // Update main swiper's thumbs
        mainSwiper.params.thumbs = { swiper: thumbsSwiper };
        mainSwiper.thumbs.init();
        mainSwiper.thumbs.update();

        // Update active thumbnail on main slide change
        mainSwiper.on('slideChange', function () {
          thumbsSwiper.slideTo(mainSwiper.activeIndex);
        });

        // Update main slide when clicking thumbnails
        thumbsSwiper.on('click', function (swiper, event) {
          const clickedIndex = swiper.clickedIndex;
          if (typeof clickedIndex !== 'undefined') {
            mainSwiper.slideTo(clickedIndex);
          }
        });
      }
    );
  }
});
