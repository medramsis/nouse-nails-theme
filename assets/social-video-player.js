/**
 * Social Video Player Custom Element
 * Plays video on hover (desktop) or tap (mobile)
 */
class SocialVideoPlayer extends HTMLElement {
  constructor() {
    super();
    this.video = null;
    this.isPlaying = false;
    this.isTouchDevice = false;
    this.hasInteracted = false;
    this.observer = null;
  }

  connectedCallback() {
    this.video = this.querySelector('video');
    if (!this.video) return;

    // Detect touch device
    this.isTouchDevice = this.detectTouchDevice();

    // Set initial state
    this.video.muted = true;
    this.video.loop = true;
    this.video.preload = 'metadata';

    // Add event listeners based on device type
    if (this.isTouchDevice) {
      this.setupTouchEvents();
    } else {
      // Setup autoplay if enabled
      if (!this.hasAttribute('data-autoplay')) {
        this.setupHoverEvents();
      }
    }

    // Handle video events
    this.video.addEventListener(
      'loadedmetadata',
      this.handleVideoReady.bind(this)
    );
    this.video.addEventListener('play', this.handleVideoPlay.bind(this));
    this.video.addEventListener('pause', this.handleVideoPause.bind(this));
    this.video.addEventListener('ended', this.handleVideoEnded.bind(this));

    // Setup autoplay if enabled
    if (this.hasAttribute('data-autoplay')) {
      this.setupAutoplay();
    }
  }

  disconnectedCallback() {
    // Clean up event listeners
    if (this.isTouchDevice) {
      this.removeTouchEvents();
    } else {
      this.removeHoverEvents();
    }

    if (this.video) {
      this.video.removeEventListener(
        'loadedmetadata',
        this.handleVideoReady.bind(this)
      );
      this.video.removeEventListener('play', this.handleVideoPlay.bind(this));
      this.video.removeEventListener('pause', this.handleVideoPause.bind(this));
      this.video.removeEventListener('ended', this.handleVideoEnded.bind(this));
    }

    // Disconnect observer if it exists
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupAutoplay() {
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.playVideo();
          } else {
            this.pauseVideo();
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of element is visible
      }
    );

    this.observer.observe(this);
  }

  detectTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  setupHoverEvents() {
    this.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  setupTouchEvents() {
    this.addEventListener('click', this.handleTouch.bind(this));
    this.addEventListener('touchend', this.handleTouch.bind(this));
  }

  removeHoverEvents() {
    this.removeEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  removeTouchEvents() {
    this.removeEventListener('click', this.handleTouch.bind(this));
    this.removeEventListener('touchend', this.handleTouch.bind(this));
  }

  handleMouseEnter() {
    if (!this.video || this.isPlaying) return;
    this.playVideo();
  }

  handleMouseLeave() {
    if (!this.video) return;
    this.pauseVideo();
  }

  handleTouch(event) {
    event.preventDefault();

    if (!this.video) return;

    if (this.isPlaying) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  handleVideoReady() {
    // Video metadata is loaded
    this.classList.add('video-ready');

    // Add touch indicator for mobile
    if (this.isTouchDevice) {
      this.classList.add('touch-device');
    }
  }

  handleVideoPlay() {
    this.isPlaying = true;
    this.classList.add('video-playing');
    this.classList.remove('video-paused');
  }

  handleVideoPause() {
    this.isPlaying = false;
    this.classList.remove('video-playing');
    this.classList.add('video-paused');
  }

  handleVideoEnded() {
    // Restart video if it's still being hovered (desktop) or if it's a touch device
    if (this.isTouchDevice) {
      // For touch devices, don't auto-restart - let user tap again
      return;
    }

    if (this.matches(':hover')) {
      this.video.currentTime = 0;
      this.playVideo();
    }
  }

  async playVideo() {
    if (!this.video || this.isPlaying) return;

    // Lazily assign src from data-src on first play so the browser doesn't
    // fetch all video files on page load
    const source = this.video.querySelector('source[data-src]');
    if (source) {
      source.src = source.dataset.src;
      source.removeAttribute('data-src');
      this.video.load();
    }

    try {
      if (this.video.ended) {
        this.video.currentTime = 0;
      }

      await this.video.play();
    } catch (error) {
      console.warn('Could not play video:', error);
    }
  }

  pauseVideo() {
    if (!this.video || !this.isPlaying) return;

    this.video.pause();
  }

  // Public methods for external control
  play() {
    this.playVideo();
  }

  pause() {
    this.pauseVideo();
  }

  stop() {
    if (this.video) {
      this.video.pause();
      this.video.currentTime = 0;
    }
  }
}

// Register the custom element
customElements.define('social-video-player', SocialVideoPlayer);

// // Initialize existing elements on page load
// document.addEventListener('DOMContentLoaded', () => {
//   // Convert existing video blocks to custom elements
//   const videoBlocks = document.querySelectorAll('[data-video-block]');

//   videoBlocks.forEach(block => {
//     // Create the custom element
//     const socialPlayer = document.createElement('social-video-player');

//     // Move the content into the custom element
//     while (block.firstChild) {
//       socialPlayer.appendChild(block.firstChild);
//     }

//     // Replace the original block with the custom element
//     block.parentNode.replaceChild(socialPlayer, block);
//   });
// });

// // Export for module usage
// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = SocialVideoPlayer;
// }
