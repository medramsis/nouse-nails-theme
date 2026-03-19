/**
 * Instagram Slideshow Custom Element
 * Extends SwiperSlideshow with Instagram-specific functionality
 */
class InstagramSlideshow extends SwiperSlideshow {
  constructor() {
    super();
  }
 
  // Remove the getConfig() method entirely - let it use the base class behavior

  
  async initializeSwiper() {
    // Call parent initialization
    await super.initializeSwiper();

    if (!this.swiper) return;
    
    // Add Instagram-specific event listeners
    this.setupInstagramEventListeners();
  }

  setupInstagramEventListeners() {
    const sliderContainer = this.querySelector('[data-swiper-slideshow]');
    if (!sliderContainer) return;

    // Pause autoplay when hovering over slides
    sliderContainer.addEventListener('mouseenter', () => {
      if (this.hasAutoplay()) {
        this.swiper.autoplay.stop();
      }
    });

    sliderContainer.addEventListener('mouseleave', () => {
      if (this.hasAutoplay()) {
        this.swiper.autoplay.start();
      }
    });
  }

  hasAutoplay() {
    return Boolean(this.swiper?.autoplay && this.swiper?.params?.autoplay);
  }

  // Instagram-specific methods
  handleSwiperInit() {
    // Pause videos when slide changes
    const videos =
      this.swiper.slides[this.swiper.activeIndex].querySelectorAll('video');
    videos.forEach(video => {
      if (!video.paused) {
        video.pause();
      }
    });
  }

  handleSlideChange() {
    // Pause all videos when slide changes
    const allVideos = this.querySelectorAll('.instagram-slideshow__video');
    allVideos.forEach(video => {
      if (!video.paused) {
        video.pause();
      }
    });
  }
}

// Register the custom element
customElements.define('instagram-slideshow', InstagramSlideshow);