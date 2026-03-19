/**
 * Swiper Slideshow Custom Element
 * A reusable component that automatically initializes Swiper with responsive behavior
 */
class SwiperSlideshow extends HTMLElement {
  constructor() {
    super();
    this.swiper = null;
    this.isInitialized = false;
    this.mediaQueries = {
      mediumUp: window.matchMedia('(min-width: 750px)'),
      largeUp: window.matchMedia('(min-width: 940px)'),
    };
  }

  connectedCallback() {
    if (this.isInitialized) return;

    this.waitForSwiper().then(() => {
      this.initializeSwiper();
    });
  }

  disconnectedCallback() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
    this.isInitialized = false;
  }

  getConfig() {
    // Get all possible attributes from the element - Mobile-first approach
    const attrs = {
      // Mobile values (base attributes)
      slidesPerView: this.getAttribute('slides-per-view'),
      spaceBetween: this.getAttribute('space-between'),
      loop: this.getAttribute('loop'),
      centeredSlides: this.getAttribute('centered-slides'),
      speed: this.getAttribute('speed'),
      effect: this.getAttribute('effect'),
      direction: this.getAttribute('direction'),
      autoplay: this.getAttribute('autoplay'),
      autoplayDelay: this.getAttribute('autoplay-delay'),
      freeMode: this.getAttribute('free-mode'),
      slidesOffsetBefore: this.getAttribute('slides-offset-before'),

      // Desktop overrides (desktop-* prefixed attributes)
      desktopSlidesPerView: this.getAttribute('desktop-slides-per-view'),
      desktopSpaceBetween: this.getAttribute('desktop-space-between'),
      desktopLoop: this.getAttribute('desktop-loop'),
      desktopCenteredSlides: this.getAttribute('desktop-centered-slides'),
      desktopDirection: this.getAttribute('desktop-direction'),
      desktopAutoplay: this.getAttribute('desktop-autoplay'),
      desktopAutoplayDelay: this.getAttribute('desktop-autoplay-delay'),
      desktopFreeMode: this.getAttribute('desktop-free-mode'),
      desktopSlidesOffsetBefore: this.getAttribute(
        'desktop-slides-offset-before'
      ),
      desktopEffect: this.getAttribute('desktop-effect'),

      // Navigation
      showNavigation: this.getAttribute('show-navigation'),

      // Pagination
      pagination: this.getAttribute('pagination'),
      showPagination: this.getAttribute('show-pagination'),
      numberPagination: this.getAttribute('number-pagination'),

      // Advanced features
      grabCursor: this.getAttribute('grab-cursor'),
      allowTouchMove: this.getAttribute('allow-touch-move'),
      autoHeight: this.getAttribute('auto-height'),

      // Scrollbar
      showScrollbar: this.getAttribute('show-scrollbar'),

      // Mousewheel (desktop horizontal scroll)
      mousewheel: this.getAttribute('mousewheel'),
    };

    // Set up base configuration using mobile values as defaults
    const config = {
      // Basic settings - mobile values as base
      slidesPerView: attrs.slidesPerView || 1,
      spaceBetween: parseInt(attrs.spaceBetween || 20),
      loop: attrs.loop === 'true' || false,
      centeredSlides: attrs.centeredSlides === 'true' || false,
      speed: parseInt(attrs.speed || 400),
      effect: attrs.effect || 'slide',
      direction: attrs.direction || 'horizontal',
      freeMode: attrs.freeMode === 'true' || false,
      slidesOffsetBefore: parseInt(attrs.slidesOffsetBefore || 0),

      // Navigation - Update to use our custom navigation classes
      navigation:
        attrs.showNavigation === 'true'
          ? {
              nextEl: '.swiper-slideshow__nav-button--next',
              prevEl: '.swiper-slideshow__nav-button--prev',
              lockClass: 'swiper-slideshow__nav-button--lock',
              disabledClass: 'swiper-slideshow__nav-button--disabled',
            }
          : false,

      // Pagination
      pagination:
        attrs.pagination === 'true' || attrs.showPagination === 'true'
          ? {
              el: '.swiper-slideshow__pagination',
              clickable: true,
              type: attrs.numberPagination === 'true' ? 'fraction' : 'bullets',
              renderBullet:
                attrs.numberPagination === 'true'
                  ? (index, className) =>
                      `<span class="${className}">0${index + 1}</span>`
                  : undefined,
            }
          : false,

      // Scrollbar
      scrollbar:
        attrs.showScrollbar === 'true'
          ? {
              el: '.swiper-scrollbar',
              draggable: true,
              dragSize: 'auto',
              hide: false,
            }
          : false,

      // Advanced features
      grabCursor: attrs.grabCursor !== 'false',
      allowTouchMove: attrs.allowTouchMove !== 'false',
      autoHeight: attrs.autoHeight === 'true',
      preloadImages: false,
      watchSlidesProgress: true,
      preventClicksPropagation: true,

      // Mousewheel - maps vertical scroll to horizontal slide on desktop
      mousewheel:
        attrs.mousewheel === 'true'
          ? {
              forceToAxis: true,
              releaseOnEdges: true,
              sensitivity: 1,
            }
          : false,

      // Autoplay - mobile values as base
      autoplay:
        attrs.autoplay === 'true'
          ? {
              delay: parseInt(attrs.autoplayDelay || 5000),
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }
          : false,

      // Accessibility
      a11y: {
        prevSlideMessage: 'Previous slide',
        nextSlideMessage: 'Next slide',
        firstSlideMessage: 'This is the first slide',
        lastSlideMessage: 'This is the last slide',
      },

      // Breakpoints for responsive design - desktop overrides at 750px+
      breakpoints: attrs.breakpoints?.value
        ? this.convertToObject(attrs.breakpoints.value)
        : {
            750: {
              effect: attrs.desktopEffect || attrs.effect || 'slide',
              slidesPerView:
                attrs.desktopSlidesPerView || attrs.slidesPerView || 'auto',
              spaceBetween: parseInt(
                attrs.desktopSpaceBetween || attrs.spaceBetween || 20
              ),
              loop:
                attrs.desktopLoop === 'true' || attrs.loop === 'true' || false,
              centeredSlides:
                attrs.desktopCenteredSlides === 'true' ||
                attrs.centeredSlides === 'true' ||
                false,
              direction:
                attrs.desktopDirection || attrs.direction || 'horizontal',
              freeMode:
                attrs.desktopFreeMode === 'true' ||
                attrs.freeMode === 'true' ||
                false,
              slidesOffsetBefore: parseInt(
                attrs.desktopSlidesOffsetBefore || attrs.slidesOffsetBefore || 0
              ),
              autoplay:
                attrs.desktopAutoplay === 'true'
                  ? {
                      delay: parseInt(
                        attrs.desktopAutoplayDelay ||
                          attrs.autoplayDelay ||
                          5000
                      ),
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : attrs.autoplay === 'true'
                    ? {
                        delay: parseInt(attrs.autoplayDelay || 5000),
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }
                    : false,
            },
          },
    };

    return config;
  }

  async waitForSwiper() {
    if (typeof Swiper !== 'undefined') return;

    return new Promise(resolve => {
      const checkSwiper = () => {
        if (typeof Swiper !== 'undefined') {
          resolve();
        } else {
          setTimeout(checkSwiper, 50);
        }
      };
      checkSwiper();
    });
  }

  convertToObject(stringObject) {
    try {
      return JSON.parse(stringObject.replace(/'/g, '"'));
    } catch (error) {
      console.error('Error parsing breakpoints:', error);
      return {};
    }
  }

  async initializeSwiper() {
    if (this.isInitialized) return;

    const sliderContainer = this.querySelector('[data-swiper-slideshow]');
    if (!sliderContainer) return;

    const disableOn = this.getAttribute('disableOn');
    if (disableOn && this.mediaQueries[disableOn]?.matches) {
      this.setupDesktopLayout();
      return;
    }

    // Create navigation if needed
    if (
      this.getAttribute('create-elements') === 'true' &&
      this.getAttribute('show-navigation') === 'true'
    ) {
      this.createNavigationElements(sliderContainer);
    }

    // Create scrollbar if needed
    if (
      this.getAttribute('create-elements') === 'true' &&
      this.getAttribute('show-scrollbar') === 'true'
    ) {
      this.createScrollbarElement(sliderContainer);
    }

    const config = this.getConfig();

    // Add observer to handle resize and update properly
    config.observer = true;
    config.observeParents = true;
    config.resizeObserver = true;
    config.updateOnWindowResize = true;

    // Handle thumbnails
    const thumbnailsAttr = this.getAttribute('thumbnails');
    if (thumbnailsAttr) {
      await this.setupControlledSwiper(config, thumbnailsAttr);
    } else {
      this.swiper = new Swiper(sliderContainer, config);
    }

    // Force update after a brief delay to ensure proper sizing
    setTimeout(() => {
      if (this.swiper) {
        this.swiper.update();
      }
    }, 100);

    this.setupEventListeners();
    this.isInitialized = true;
  }

  async setupControlledSwiper(config, thumbnailsSelector) {
    const sliderContainer = this.querySelector('[data-swiper-slideshow]');

    if (thumbnailsSelector) {
      // Wait for the thumbnail slider to be ready
      const thumbnailElement = document.querySelector(
        `[${thumbnailsSelector}]`
      );
      if (thumbnailElement) {
        const thumbnailSwiper =
          await this.waitForSwiperInstance(thumbnailElement);
        if (thumbnailSwiper) {
          config.thumbs = {
            swiper: thumbnailSwiper,
            multipleActiveThumbs: false,
          };
        }
      }
      this.swiper = new Swiper(sliderContainer, config);
    } else {
      // Initialize as a thumbnail slider
      this.swiper = new Swiper(sliderContainer, {
        ...config,
        watchSlidesProgress: true,
        slideToClickedSlide: true,
      });
    }
  }

  async waitForSwiperInstance(element) {
    if (!element) return null;

    // Try to get the swiper instance immediately
    let swiper = element.swiper || element.getSwiper?.();
    if (swiper) return swiper;

    // Wait for the swiper to be initialized
    return new Promise(resolve => {
      const checkSwiper = () => {
        swiper = element.swiper || element.getSwiper?.();
        if (swiper) {
          resolve(swiper);
        } else {
          setTimeout(checkSwiper, 50);
        }
      };
      checkSwiper();
    });
  }

  setupEventListeners() {
    if (!this.swiper) return;

    // Add resize observer to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (this.swiper) {
        this.swiper.update();
      }
    });

    resizeObserver.observe(this.swiper.el);

    this.swiper.on('slideChange', () => {
      this.dispatchEvent(
        new CustomEvent('swiper:slideChange', {
          detail: { swiper: this.swiper },
        })
      );
    });

    window.addEventListener('resize', this.handleResize.bind(this));
  }

  handleResize() {
    const disableOn = this.getAttribute('disableOn');
    if (disableOn) {
      if (this.mediaQueries[disableOn].matches) {
        if (this.swiper) {
          this.swiper.destroy(true, true);
          this.swiper = null;
        }
        this.setupDesktopLayout();
      } else if (!this.swiper) {
        this.initializeSwiper();
      }
    }
  }

  setupDesktopLayout() {
    const sliderContainer = this.querySelector('[data-swiper-slideshow]');
    if (!sliderContainer) return;

    sliderContainer.classList.remove('swiper');
    const wrapper = sliderContainer.querySelector('.swiper-wrapper');
    if (wrapper) {
      wrapper.classList.remove('swiper-wrapper');
      const slides = wrapper.querySelectorAll('.swiper-slide');
      slides.forEach(slide => {
        slide.classList.remove('swiper-slide');
        sliderContainer.appendChild(slide);
      });
      wrapper.remove();
    }
  }

  createNavigationElements(container) {
    // Create navigation container
    const navigation = document.createElement('div');
    navigation.className = 'swiper-slideshow__navigation';

    // Create prev button
    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.className =
      'swiper-slideshow__nav-button swiper-slideshow__nav-button--prev';
    prevButton.setAttribute('aria-label', 'Previous slide');
    prevButton.innerHTML = this.getChevronLeftIcon();

    // Create next button
    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className =
      'swiper-slideshow__nav-button swiper-slideshow__nav-button--next';
    nextButton.setAttribute('aria-label', 'Next slide');
    nextButton.innerHTML = this.getChevronRightIcon();

    // Add buttons to navigation
    navigation.appendChild(prevButton);
    navigation.appendChild(nextButton);

    // Add navigation after the swiper-wrapper
    const wrapper = container.querySelector('.swiper-wrapper');
    if (wrapper) {
      wrapper.parentNode.insertBefore(navigation, wrapper.nextSibling);
    }
  }

  createScrollbarElement(container) {
    const scrollbar = document.createElement('div');
    scrollbar.className = 'swiper-scrollbar';

    // Add scrollbar after the swiper-wrapper
    const wrapper = container.querySelector('.swiper-wrapper');
    if (wrapper) {
      wrapper.parentNode.insertBefore(scrollbar, wrapper.nextSibling);
    }
  }

  createPaginationElement(container) {
    const pagination = document.createElement('div');
    pagination.className = 'swiper-slideshow__pagination';

    const navigation = container.querySelector('.swiper-slideshow__navigation');
    if (navigation) {
      navigation.parentNode.insertBefore(pagination, navigation.nextSibling);
    } else {
      const wrapper = container.querySelector('.swiper-wrapper');
      if (wrapper) {
        wrapper.parentNode.insertBefore(pagination, wrapper.nextSibling);
      }
    }
  }

  getChevronLeftIcon() {
    return ` ← `;
  }

  getChevronRightIcon() {
    return ` → `;
  }

  // Public methods
  getSwiper() {
    return this.swiper;
  }

  slideNext() {
    this.swiper?.slideNext();
  }

  slidePrev() {
    this.swiper?.slidePrev();
  }

  slideTo(index) {
    this.swiper?.slideTo(index);
  }

  startAutoplay() {
    this.swiper?.autoplay?.start();
  }

  stopAutoplay() {
    this.swiper?.autoplay?.stop();
  }

  destroy() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
    this.isInitialized = false;
  }

  refresh() {
    this.swiper?.update();
  }
}

if (!customElements.get('swiper-slideshow')) {
  customElements.define('swiper-slideshow', SwiperSlideshow);
}
