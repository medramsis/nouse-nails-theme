class ProductStickyButton extends HTMLElement {
  constructor() {
    super();
    this.stickyButton = this.querySelector('[data-sticky-button]');
    this.sectionId = this.dataset.section;
    this.mainForm = document.querySelector(
      `product-form[data-section-id="${this.sectionId}"]`
    );
    this.mainSubmitButton = document.querySelector(
      `#ProductSubmitButton-${this.sectionId}`
    );
    this.stickySubmitButton = this.querySelector(
      `#ProductSubmitButtonSticky-${this.sectionId}`
    );
    this.stickyForm = this.querySelector('form');
    this.mainFormElement = this.mainForm?.querySelector('form');
    this.mainQuantityInput = document.querySelector(
      `#Quantity-${this.sectionId}`
    );
    this.stickyQuantityInput = this.stickyForm?.querySelector('.quantity__input');

    if (!this.stickyButton || !this.mainForm) return;

    this.init();
  }

  init() {
    this.syncVariantId();
    this.syncQuantity();
    this.syncButtonState();

    document.addEventListener('variant:change', () => {
      this.syncVariantId();
      this.syncQuantity();
      this.syncButtonState();
    });

    if (this.mainQuantityInput && this.stickyQuantityInput) {
      this.mainQuantityInput.addEventListener('change', () => {
        this.syncQuantity();
      });
    }

    // Sync variant ID right before form submission to prevent race conditions
    if (this.stickyForm) {
      this.stickyForm.addEventListener(
        'submit',
        () => {
          // Sync variant ID synchronously right before submission
          this.syncVariantId();
        },
        { capture: true }
      );
    }

    if (this.mainSubmitButton) {
      const observer = new MutationObserver(() => {
        this.syncButtonState();
      });

      observer.observe(this.mainSubmitButton, {
        attributes: true,
        attributeFilter: ['disabled', 'aria-disabled'],
      });
    }

    this.handleScroll();
    window.addEventListener('scroll', () => this.handleScroll(), {
      passive: true,
    });
  }

  syncVariantId() {
    const mainVariantInput = this.mainFormElement?.querySelector(
      '.product-variant-id'
    );
    const stickyVariantInput = this.stickyForm?.querySelector(
      '.product-variant-id'
    );

    if (mainVariantInput && stickyVariantInput) {
      stickyVariantInput.value = mainVariantInput.value;
      stickyVariantInput.disabled = mainVariantInput.disabled;
    }
  }

  syncQuantity() {
    if (!this.mainQuantityInput || !this.stickyQuantityInput) return;

    this.stickyQuantityInput.value = this.mainQuantityInput.value;
    this.stickyQuantityInput.min = this.mainQuantityInput.min;
    this.stickyQuantityInput.step = this.mainQuantityInput.step;
    if (this.mainQuantityInput.hasAttribute('max')) {
      this.stickyQuantityInput.max = this.mainQuantityInput.max;
      this.stickyQuantityInput.setAttribute(
        'data-max',
        this.mainQuantityInput.getAttribute('data-max') || ''
      );
    } else {
      this.stickyQuantityInput.removeAttribute('max');
      this.stickyQuantityInput.removeAttribute('data-max');
    }
    this.stickyQuantityInput.setAttribute(
      'data-min',
      this.mainQuantityInput.getAttribute('data-min') || '1'
    );
    this.stickyQuantityInput.setAttribute(
      'data-cart-quantity',
      this.mainQuantityInput.getAttribute('data-cart-quantity') || '0'
    );
  }

  syncButtonState() {
    if (!this.mainSubmitButton || !this.stickySubmitButton) return;

    const isDisabled =
      this.mainSubmitButton.disabled ||
      this.mainSubmitButton.getAttribute('aria-disabled') === 'true';
    this.stickySubmitButton.disabled = isDisabled;

    const mainButtonText = this.mainSubmitButton
      .querySelector('span')
      ?.textContent.trim();
    if (mainButtonText) {
      const stickyButtonText = this.stickySubmitButton.querySelector('span');
      if (stickyButtonText) {
        stickyButtonText.textContent = mainButtonText;
      }
    }
  }

  handleScroll() {
    if (window.innerWidth >= 750) return;

    const scrollPosition = window.scrollY || window.pageYOffset;
    const shouldShow = scrollPosition > 200;

    if (shouldShow) {
      this.stickyButton.classList.remove('is-hidden');
    } else {
      this.stickyButton.classList.add('is-hidden');
    }
  }
}

customElements.define('product-sticky-button', ProductStickyButton);
