/*------------------------------------*\
  #Details Disclosure
\*------------------------------------*/

class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content =
      this.mainDetailsToggle.querySelector('summary').nextElementSibling;

    this.mainDetailsToggle.addEventListener(
      'focusout',
      this.onFocusOut.bind(this)
    );
    this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this));
  }

  onFocusOut(event) {
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (
        !this.contains(activeElement) ||
        (activeElement.tagName === 'A' && this.content.contains(activeElement))
      ) {
        return;
      }
      this.close();
    });
  }

  onToggle() {
    if (!this.animations) this.animations = this.content.getAnimations();

    if (this.mainDetailsToggle.hasAttribute('open')) {
      this.animations.forEach(animation => animation.play());
    } else {
      this.animations.forEach(animation => animation.cancel());
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle
      .querySelector('summary')
      .setAttribute('aria-expanded', false);
  }
}

customElements.define('details-disclosure', DetailsDisclosure);

/*------------------------------------*\
  #Header Menu
\*------------------------------------*/

class HeaderMenu extends DetailsDisclosure {
  constructor() {
    super();
    this.header = document.querySelector('.header-wrapper');
  }

  onToggle() {
    if (!this.header) return;
    this.header.preventHide = this.mainDetailsToggle.open;

    if (
      document.documentElement.style.getPropertyValue(
        '--header-bottom-position-desktop'
      ) !== ''
    )
      return;
    document.documentElement.style.setProperty(
      '--header-bottom-position-desktop',
      `${Math.floor(this.header.getBoundingClientRect().bottom)}px`
    );
  }
}

customElements.define('header-menu', HeaderMenu);

if (!customElements.get('drawer-disclosure')) {
  class DrawerDisclosure extends HTMLElement {
    constructor() {
      super();
      this.mainDetailsToggle = this.querySelector('details');
      this.summaryToggle = this.mainDetailsToggle.querySelector('summary');
      if (this.summaryToggle) {
        this.summaryToggle.addEventListener(
          'click',
          this.toggleDrawer.bind(this)
        );
      }
      this.ignoreFocusOut = false;
      this.mainDetailsToggle.addEventListener(
        'pointerdown',
        this.onPointerDown.bind(this)
      );
      this.querySelector('[data-drawer-content]').style.height = 0;
      this.mainDetailsToggle.addEventListener(
        'focusout',
        this.onFocusOut.bind(this)
      );
      this.mainDetailsToggle.addEventListener(
        'keydown',
        this.onKeyDown.bind(this)
      );
      this.animationLength = 450;
    }

    connectedCallback() {
      if (Shopify.designMode) {
        document.addEventListener(
          'shopify:block:select',
          this.oncontentBlockSelect.bind(this)
        );
      }
    }

    onKeyDown(event) {
      if (event.key === 'Escape') {
        this.closeDrawer(this);
      }
    }

    onPointerDown(event) {
      if (this.mainDetailsToggle.contains(event.target)) {
        this.ignoreFocusOut = true;
      }
    }

    onFocusOut(event) {
      const relatedTarget = event.relatedTarget;
      setTimeout(() => {
        if (this.ignoreFocusOut) {
          this.ignoreFocusOut = false;
          return;
        }
        const nextFocus = relatedTarget || document.activeElement;
        if (!nextFocus || !this.contains(nextFocus)) this.closeDrawer(this);
      });
    }

    toggleDrawer(event) {
      event.preventDefault();

      if (this.mainDetailsToggle.getAttribute('open')) {
        this.closeDrawer(this);
      } else {
        this.openDrawer(event.currentTarget);
      }
    }

    closeDrawer(pElem) {
      if (!pElem) return;

      const contentElement = pElem.querySelector('[data-drawer-content]');
      contentElement.style.height = 0;
      pElem.querySelector('summary').setAttribute('aria-expanded', false);

      setTimeout(() => {
        pElem.querySelector('details').removeAttribute('open');
      }, this.animationLength);
    }

    openDrawer(pDrawer) {
      console.log(pDrawer);
      const parentDetails = pDrawer.closest('details');

      if (parentDetails && !parentDetails.getAttribute('open')) {
        parentDetails.setAttribute('open', true);
        const contentAnswer = parentDetails.querySelector(
          '[data-drawer-content]'
        );

        requestAnimationFrame(() => {
          const innerContent = contentAnswer.querySelector(
            '[data-drawer-content-inner]'
          );

          console.log(innerContent);
          if (innerContent) {
            const height = innerContent.offsetHeight;
            contentAnswer.style.height = `${height}px`;
          }
        });

        parentDetails
          .querySelector('summary')
          .setAttribute('aria-expanded', true);
        this.activeDrawer = parentDetails.dataset.id;
      }
    }

    oncontentBlockSelect(event) {
      event.preventDefault();
      setTimeout(() => this.openDrawer(event.target), 200);
    }
  }

  customElements.define('drawer-disclosure', DrawerDisclosure);
}
