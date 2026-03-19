/**
 * Product Media Slideshow Component
 * A custom element that creates a slideshow for product media images
 * Integrates with existing product template structure and thumbnail system
 */
class ProductMediaSlideshow extends HTMLElement {
  constructor() {
    super();
    this.currentSlide = 0;
    this.slides = [];
    this.thumbnails = [];
    this.isInitialized = false;
    this.originalThumbnails = [];
  }

  connectedCallback() {
    if (this.isInitialized) return;

    this.initializeSlideshow();
  }

  disconnectedCallback() {
    this.isInitialized = false;
  }

  initializeSlideshow() {
    if (this.isInitialized) return;

    // Get all media slides
    this.slides = Array.from(
      this.querySelectorAll('.product-single__media-wrapper')
    );

    if (this.slides.length <= 1) {
      // No need for slideshow if only one image
      return;
    }

    // Store reference to original thumbnails
    this.originalThumbnails = Array.from(
      this.querySelectorAll('.product-single__thumbnails-item')
    );

    // Create slideshow structure
    this.createSlideshowStructure();

    // Initialize thumbnails
    this.createThumbnails();

    // Show first slide
    this.showSlide(0);

    // Bind thumbnail clicks
    this.bindThumbnailClicks();

    this.isInitialized = true;
  }

  createSlideshowStructure() {
    // Create main slideshow container
    const slideshowMain = document.createElement('div');
    slideshowMain.className = 'product-media-slideshow__main';

    // Create slideshow slides
    this.slides.forEach((slide, index) => {
      const slideshowSlide = document.createElement('div');
      slideshowSlide.className = `product-media-slideshow__slide${index === 0 ? ' product-media-slideshow__slide--active' : ''}`;
      slideshowSlide.setAttribute('data-slide-index', index);

      // Clone the slide content
      const slideContent = slide.cloneNode(true);
      slideshowSlide.appendChild(slideContent);

      slideshowMain.appendChild(slideshowSlide);
    });

    // Create navigation
    const navigation = this.createNavigation();

    // Insert slideshow before the original media
    this.insertBefore(slideshowMain, this.slides[0]);
    this.insertBefore(navigation, slideshowMain.nextSibling);

    // Hide original media
    this.slides.forEach(slide => {
      slide.style.display = 'none';
    });
  }

  createNavigation() {
    const navigation = document.createElement('div');
    navigation.className = 'product-media-slideshow__navigation';

    const prevButton = document.createElement('button');
    prevButton.className =
      'product-media-slideshow__nav-button product-media-slideshow__nav-button--prev';
    prevButton.setAttribute('aria-label', 'Previous image');
    prevButton.innerHTML = '←';
    prevButton.addEventListener('click', () => this.previousSlide());

    const nextButton = document.createElement('button');
    nextButton.className =
      'product-media-slideshow__nav-button product-media-slideshow__nav-button--next';
    nextButton.setAttribute('aria-label', 'Next image');
    nextButton.innerHTML = '→';
    nextButton.addEventListener('click', () => this.nextSlide());

    navigation.appendChild(prevButton);
    navigation.appendChild(nextButton);

    return navigation;
  }

  createThumbnails() {
    const thumbnailsContainer = document.createElement('div');
    thumbnailsContainer.className = 'product-media-slideshow__thumbnails';

    this.slides.forEach((slide, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = `product-media-slideshow__thumbnail${index === 0 ? ' product-media-slideshow__thumbnail--active' : ''}`;
      thumbnail.setAttribute('data-thumbnail-index', index);

      // Get the image from the slide
      const img = slide.querySelector('img');
      if (img) {
        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = img.src;
        thumbnailImg.alt = img.alt || `Product image ${index + 1}`;
        thumbnail.appendChild(thumbnailImg);
      }

      thumbnail.addEventListener('click', () => this.showSlide(index));
      thumbnailsContainer.appendChild(thumbnail);
      this.thumbnails.push(thumbnail);
    });

    // Insert thumbnails after navigation
    const navigation = this.querySelector(
      '.product-media-slideshow__navigation'
    );
    if (navigation) {
      navigation.parentNode.insertBefore(
        thumbnailsContainer,
        navigation.nextSibling
      );
    }
  }

  bindThumbnailClicks() {
    // Bind clicks to original thumbnails to work with our slideshow
    this.originalThumbnails.forEach((thumbnail, index) => {
      const link = thumbnail.querySelector('a');
      if (link) {
        link.addEventListener('click', e => {
          e.preventDefault();
          this.showSlide(index);
        });
      }
    });
  }

  showSlide(index) {
    if (index < 0 || index >= this.slides.length) return;

    // Hide all slides
    const slideshowSlides = this.querySelectorAll(
      '.product-media-slideshow__slide'
    );
    slideshowSlides.forEach(slide => {
      slide.classList.remove('product-media-slideshow__slide--active');
    });

    // Remove active class from all thumbnails
    this.thumbnails.forEach(thumbnail => {
      thumbnail.classList.remove('product-media-slideshow__thumbnail--active');
    });

    // Update original thumbnails
    this.originalThumbnails.forEach((thumbnail, i) => {
      thumbnail.classList.toggle('active', i === index);
    });

    // Show selected slide
    const selectedSlide = this.querySelector(`[data-slide-index="${index}"]`);
    if (selectedSlide) {
      selectedSlide.classList.add('product-media-slideshow__slide--active');
    }

    // Update thumbnail
    if (this.thumbnails[index]) {
      this.thumbnails[index].classList.add(
        'product-media-slideshow__thumbnail--active'
      );
    }

    this.currentSlide = index;
    this.updateNavigation();
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.showSlide(nextIndex);
  }

  previousSlide() {
    const prevIndex =
      this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.showSlide(prevIndex);
  }

  updateNavigation() {
    const prevButton = this.querySelector(
      '.product-media-slideshow__nav-button--prev'
    );
    const nextButton = this.querySelector(
      '.product-media-slideshow__nav-button--next'
    );

    if (prevButton) {
      prevButton.disabled = this.slides.length <= 1;
    }

    if (nextButton) {
      nextButton.disabled = this.slides.length <= 1;
    }
  }

  // Public methods for external control
  goToSlide(index) {
    this.showSlide(index);
  }

  getCurrentSlide() {
    return this.currentSlide;
  }

  getSlideCount() {
    return this.slides.length;
  }
}

// Register the custom element
customElements.define('product-media-slideshow', ProductMediaSlideshow);
