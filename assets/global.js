function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "button, summary, a[href], button:enabled, [role='button'], [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach(summary => {
  // Skip if this summary is inside a drawer-disclosure component
  if (summary.closest('drawer-disclosure')) return;

  summary.setAttribute('role', 'button');
  summary.setAttribute(
    'aria-expanded',
    summary.parentNode.hasAttribute('open')
  );

  if (summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', event => {
    event.currentTarget.setAttribute(
      'aria-expanded',
      !event.currentTarget.closest('details').hasAttribute('open')
    );
  });

  if (summary.closest('header-drawer, menu-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = event => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key

    console.log(event);
    console.log(event.target);
    console.log(last);

    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();

  if (
    elementToFocus.tagName === 'INPUT' &&
    ['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
    elementToFocus.value
  ) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length);
  }
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(':focus-visible');
} catch (e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = [
    'ARROWUP',
    'ARROWDOWN',
    'ARROWLEFT',
    'ARROWRIGHT',
    'TAB',
    'ENTER',
    'SPACE',
    'ESCAPE',
    'HOME',
    'END',
    'PAGEUP',
    'PAGEDOWN',
  ];
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', event => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', event => {
    mouseClick = true;
  });

  window.addEventListener(
    'focus',
    () => {
      if (currentFocusedElement)
        currentFocusedElement.classList.remove('focused');

      if (mouseClick) return;

      currentFocusedElement = document.activeElement;
      currentFocusedElement.classList.add('focused');
    },
    true
  );
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach(video => {
    video.contentWindow.postMessage(
      '{"event":"command","func":"' + 'pauseVideo' + '","args":""}',
      '*'
    );
  });
  document.querySelectorAll('.js-vimeo').forEach(video => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach(video => video.pause());
  document.querySelectorAll('product-model').forEach(model => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });

    this.querySelectorAll('button').forEach(button =>
      button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    // Find the actual button element (in case we clicked on a child element)
    const button = event.target.closest('button');
    const buttonName = button ? button.name : event.target.name;

    // Debug logging to help identify the issue
    console.log('Button clicked:', buttonName, 'Target:', event.target.name);

    // Check if it's a plus button (more robust check)
    if (buttonName === 'plus') {
      this.input.stepUp();
    } else {
      this.input.stepDown();
    }

    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

/*
 * Commonly Used JS Functions
 *
 */
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: `application/${type}`,
    },
  };
}

const serializeForm = form => {
  const obj = {};
  const formData = new FormData(form);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }
  return JSON.stringify(obj);
};

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent('on' + eventName, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement('form');
  form.setAttribute('method', method);
  form.setAttribute('action', path);

  for (var key in params) {
    var hiddenField = document.createElement('input');
    hiddenField.setAttribute('type', 'hidden');
    hiddenField.setAttribute('name', key);
    hiddenField.setAttribute('value', params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (
  country_domid,
  province_domid,
  options
) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(
    options['hideElement'] || province_domid
  );

  Shopify.addListener(
    this.countryEl,
    'change',
    Shopify.bind(this.countryHandler, this)
  );

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function (e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    var raw = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = '';
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  },
};

Shopify.utils = function () {};

Shopify.utils.prototype = {
  /**
   * Return an object from an array of objects that matches the provided key and value
   *
   * @param {array} array - Array of objects
   * @param {string} key - Key to match the value against
   * @param {string} value - Value to get match of
   */
  findInstance: function (array, key, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][key] === value) {
        return array[i];
      }
    }
  },

  /**
   * Remove an object from an array of objects by matching the provided key and value
   *
   * @param {array} array - Array of objects
   * @param {string} key - Key to match the value against
   * @param {string} value - Value to get match of
   */
  removeInstance: function (array, key, value) {
    var i = array.length;
    while (i--) {
      if (array[i][key] === value) {
        array.splice(i, 1);
        break;
      }
    }

    return array;
  },

  /**
   * _.compact from lodash
   * Remove empty/false items from array
   * Source: https://github.com/lodash/lodash/blob/master/compact.js
   *
   * @param {array} array
   */
  compact: function (array) {
    var index = -1;
    var length = array == null ? 0 : array.length;
    var resIndex = 0;
    var result = [];

    while (++index < length) {
      var value = array[index];
      if (value) {
        result[resIndex++] = value;
      }
    }
    return result;
  },

  /**
   * _.defaultTo from lodash
   * Checks `value` to determine whether a default value should be returned in
   * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
   * or `undefined`.
   * Source: https://github.com/lodash/lodash/blob/master/defaultTo.js
   *
   * @param {*} value - Value to check
   * @param {*} defaultValue - Default value
   * @returns {*} - Returns the resolved value
   */
  defaultTo: function (value, defaultValue) {
    return value == null || value !== value ? defaultValue : value;
  },
};

Shopify.currency = function () {};

Shopify.currency.prototype = {
  formatMoney: function (cents, format) {
    var moneyFormat = '${{amount}}';

    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }

    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = format || moneyFormat;

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = new Shopify.utils().defaultTo(precision, 2);
      thousands = new Shopify.utils().defaultTo(thousands, ',');
      decimal = new Shopify.utils().defaultTo(decimal, '.');

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(
        /(\d)(?=(\d\d\d)+(?!\d))/g,
        '$1' + thousands
      );
      var centsAmount = parts[1] ? decimal + parts[1] : '';

      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_space_separator':
        value = formatWithDelimiters(cents, 2, ' ', '.');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, ',', '.');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  },
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');
    this.activateOnHover = this.getAttribute('data-activate-on') === 'hover';

    if (navigator.platform === 'iPhone')
      document.documentElement.style.setProperty(
        '--viewport-height',
        `${window.innerHeight}px`
      );

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));

    // Capture link clicks at the earliest possible moment
    this.mainDetailsToggle.addEventListener(
      'click',
      event => {
        const link = event.target.closest('a');
        if (link && !link.closest('summary')) {
          // Don't let the click reach the details element
          event.preventDefault();
          event.stopPropagation();
          // Navigate to the link's URL
          window.location.href = link.href;
        }
      },
      true
    ); // Use capture phase to handle before other listeners

    this.bindEvents();
    document.addEventListener('click', event => {
      if (
        !this.contains(event.target) &&
        this.mainDetailsToggle.hasAttribute('open')
      ) {
        this.closeMenuDrawer(event);
      }
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  bindEvents() {
    const activateOnHover = this.activateOnHover;

    if (!activateOnHover) {
      this.querySelectorAll('summary')[0].addEventListener(
        'click',
        this.onSummaryClick.bind(this)
      );
      this.querySelectorAll(
        'button:not(.localization-selector):not(.country-selector__close-button):not(.country-filter__reset-button)'
      ).forEach(button =>
        button.addEventListener('click', this.onCloseButtonClick.bind(this))
      );
    } else {
      this.querySelectorAll('summary').forEach(summary => {
        if (activateOnHover) {
          summary.addEventListener('click', event => {
            const link = event.target.closest('a');

            if (link) {
              event.preventDefault();
              event.stopPropagation();
              window.location.href = link.href;
              return;
            }

            event.preventDefault();
          });

          summary.addEventListener('mouseenter', event => {
            this.onSummaryClick(event, true);
          });

          summary.closest('details').addEventListener('mouseleave', event => {
            if (summary.closest('details').hasAttribute('open')) {
              // Add a delay to allow user to move mouse to mega menu
              setTimeout(() => {
                if (
                  summary.closest('details').hasAttribute('open') &&
                  !summary.closest('details').matches(':hover')
                ) {
                  this.closeMenuDrawer(event);
                }
              }, 300); // 300ms delay
            }
          });

          // Prevent closing when hovering over mega menu content
          const megaMenuContent = summary
            .closest('details')
            .querySelector('.mega-menu__content');
          const headerMegaMenu = summary
            .closest('details')
            .querySelector('.header__mega-menu');

          if (megaMenuContent) {
            megaMenuContent.addEventListener('mouseenter', () => {
              // Clear any pending close timeouts
              clearTimeout(this.closeTimeout);
            });

            megaMenuContent.addEventListener('mouseleave', () => {
              // Close after a short delay when leaving mega menu
              this.closeTimeout = setTimeout(() => {
                if (summary.closest('details').hasAttribute('open')) {
                  this.closeMenuDrawer();
                }
              }, 15);
            });
          }

          // Also protect header__mega-menu
          if (headerMegaMenu) {
            headerMegaMenu.addEventListener('mouseenter', () => {
              // Clear any pending close timeouts
              clearTimeout(this.closeTimeout);
            });

            headerMegaMenu.addEventListener('mouseleave', () => {
              // Close after a short delay when leaving mega menu
              this.closeTimeout = setTimeout(() => {
                if (summary.closest('details').hasAttribute('open')) {
                  this.closeMenuDrawer();
                }
              }, 15);
            });
          }
        }
      });
    }
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle
      ? this.closeMenuDrawer(
          event,
          this.mainDetailsToggle.querySelector('summary')
        )
      : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event, pIsHover) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const linkElement = event.target.closest('a');

    if (!pIsHover && linkElement) {
      // Don't interfere with link clicks
      event.stopPropagation();
      // Let the link navigation happen first, then close menus
      requestAnimationFrame(() => {
        const headerDrawer = this.closest('header-drawer');
        if (headerDrawer) {
          headerDrawer.closeMenuDrawer(
            event,
            headerDrawer.querySelector('summary')
          );
        } else {
          this.closeMenuDrawer(event, summaryElement);
        }
      });
      return;
    }

    if (pIsHover) {
      if (!isOpen) {
        detailsElement.setAttribute('open', 'true');
      } else {
        return;
      }
    }

    function addTrapFocus() {
      trapFocus(
        summaryElement.nextElementSibling,
        detailsElement.querySelector('button')
      );
      summaryElement.nextElementSibling.removeEventListener(
        'transitionend',
        addTrapFocus
      );
    }

    if (detailsElement === this.mainDetailsToggle) {
      // Only prevent default if it's not a link and the menu is open
      const isLink = event.target.closest('a');
      if (isOpen && !isLink && event.target.tagName !== 'A') {
        event.preventDefault();
      }
      isOpen
        ? this.closeMenuDrawer(event, summaryElement)
        : this.openMenuDrawer(summaryElement);
    } else {
      const isNestedLink = event.target.closest('a');
      if (isNestedLink) return;

      setTimeout(() => {
        this.mainDetailsToggle.classList.remove('menu-close');
        detailsElement.classList.add('menu-open');
        parentMenuElement && parentMenuElement.classList.add('submenu-open');

        if (!this.activateOnHover) {
          !reducedMotion || reducedMotion.matches
            ? addTrapFocus()
            : summaryElement.nextElementSibling.addEventListener(
                'transitionend',
                addTrapFocus
              );
        }
      }, 100);
      // } else {
      //   this.closeSubmenu(detailsElement);
      // }
    }
  }

  openMenuDrawer(summaryElement) {
    // Close other open menu drawers
    document.querySelectorAll('details[open]').forEach(openDetails => {
      if (openDetails !== summaryElement.parentNode) {
        this.closeSubmenu(openDetails);
      }
    });

    setTimeout(() => {
      this.mainDetailsToggle.classList.remove('menu-close');
      this.mainDetailsToggle.classList.add('menu-open');
    });

    // Remove this line - let DrawerDisclosure handle aria-expanded
    // summaryElement.setAttribute('aria-expanded', true);

    if (!this.activateOnHover) {
      trapFocus(this.mainDetailsToggle, summaryElement);
    }
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false, pIsHover = false) {
    if (event === undefined && !this.activateOnHover) return;

    // Add closing class for animation
    const megaMenu = this.mainDetailsToggle.querySelector('.mega-menu');

    if (megaMenu) {
      megaMenu.classList.add('closing');
    }

    // Wait for animation to complete before actually closing
    setTimeout(() => {
      this.mainDetailsToggle.classList.remove('menu-open');
      this.mainDetailsToggle.classList.add('menu-close');

      if (megaMenu) {
        megaMenu.classList.remove('closing');
      }

      this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
        details.removeAttribute('open');
        details.classList.remove('menu-open');
        details.classList.add('menu-close');
        console.log('class change');
      });
      this.mainDetailsToggle
        .querySelectorAll('.submenu-open')
        .forEach(submenu => {
          submenu.classList.remove('submenu-open');
        });
      document.body.classList.remove(`overflow-hidden`);
      if (!this.activateOnHover) {
        removeTrapFocus(elementToFocus);
      }
    }, 300); // Match the CSS transition duration
    this.closeAnimation(this.mainDetailsToggle);
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (
        this.mainDetailsToggle.hasAttribute('open') &&
        !this.mainDetailsToggle.contains(document.activeElement)
      )
        this.closeMenuDrawer();
    });
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-open');
    detailsElement
      .querySelector('summary')
      .setAttribute('aria-expanded', false);
    if (!this.activateOnHover) {
      removeTrapFocus(detailsElement.querySelector('summary'));
    }
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = time => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]') && !this.activateOnHover) {
          trapFocus(
            detailsElement.closest('details[open]'),
            detailsElement.querySelector('summary')
          );
        }
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    console.log('OPEN ELEM');

    this.header = this.header || document.querySelector('header');
    this.borderOffset =
      this.borderOffset ||
      this.closest('.header-wrapper').classList.contains(
        'header-wrapper--border-bottom'
      )
        ? 1
        : 0;
    document.documentElement.style.setProperty(
      '--header-bottom-position',
      `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`
    );

    setTimeout(() => {
      this.mainDetailsToggle.classList.remove('menu-close');
      this.mainDetailsToggle.classList.add('menu-open');
      this.header.classList.add('menu-open');
      this.header.classList.remove('menu-close');
    });

    summaryElement.setAttribute('aria-expanded', true);
    window.addEventListener('resize', this.onResize);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    if (!elementToFocus) return;
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
    this.header.classList.add('menu-close');
    this.mainDetailsToggle.classList.remove('menu-open');
    window.removeEventListener('resize', this.onResize);
    document.body.classList.remove(
      `overflow-hidden-${this.dataset.breakpoint}`
    );
  }

  onResize = () => {
    this.header &&
      document.documentElement.style.setProperty(
        '--header-bottom-position',
        `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`
      );
    document.documentElement.style.setProperty(
      '--viewport-height',
      `${window.innerHeight}px`
    );
  };
}

customElements.define('header-drawer', HeaderDrawer);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(
        this.querySelector('template').content.firstElementChild.cloneNode(true)
      );

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(
        content.querySelector('video, model-viewer, iframe')
      );
      if (focus) deferredElement.focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('change', event => {
      const target = this.getInputForEventTarget(event.target);
      this.updateSelectionMetadata(event);

      publish(PUB_SUB_EVENTS.optionValueSelectionChange, {
        data: {
          event,
          target,
          selectedOptionValues: this.selectedOptionValues,
        },
      });
    });
  }

  updateSelectionMetadata({ target }) {
    const { tagName } = target;

    if (tagName === 'SELECT' && target.selectedOptions.length) {
      if (target.options[0].getAttribute('selected')) {
        Array.from(target.options)
          .find(option => option.getAttribute('selected'))
          .removeAttribute('selected');
        target.selectedOptions[0].setAttribute('selected', 'selected');
      }

      const swatchValue = target.selectedOptions[0].dataset.optionSwatchValue;
      const selectedDropdownSwatchValue = target
        .closest('.product-form__input')
        .querySelector('[data-selected-value] > .swatch');
      if (!selectedDropdownSwatchValue) return;
      if (swatchValue) {
        selectedDropdownSwatchValue.style.setProperty(
          '--swatch--background',
          swatchValue
        );
        selectedDropdownSwatchValue.classList.remove('swatch--unavailable');
      } else {
        selectedDropdownSwatchValue.style.setProperty(
          '--swatch--background',
          'unset'
        );
        selectedDropdownSwatchValue.classList.add('swatch--unavailable');
      }

      selectedDropdownSwatchValue.style.setProperty(
        '--swatch-focal-point',
        target.selectedOptions[0].dataset.optionSwatchFocalPoint || 'unset'
      );
    } else if (tagName === 'INPUT' && target.type === 'radio') {
      const selectedSwatchValue = target
        .closest(`.product-form__input`)
        .querySelector('[data-selected-value]');
      if (selectedSwatchValue) selectedSwatchValue.innerHTML = value;
    }
  }

  getInputForEventTarget(target) {
    return target.tagName === 'SELECT' ? target.selectedOptions[0] : target;
  }

  get selectedOptionValues() {
    return Array.from(
      this.querySelectorAll('select option[selected], fieldset input:checked')
    ).map(({ dataset }) => dataset.optionValueId);
  }
}

customElements.define('variant-selects', VariantSelects);
class VariantRadios extends VariantSelects {
  constructor() {
    super();
    this.setUpEvents();
  }

  updateOptions() {
    if (this.querySelectorAll('input[type="radio"]:checked').length > 0) {
      this.options = Array.from(
        this.querySelectorAll('input[type="radio"]:checked'),
        input => input.value
      );
    } else {
      this.options = Array.from(
        this.querySelectorAll('input[type="radio"]'),
        input => input.value
      );
    }
  }

  alertAvailability(pAvailable, pVariant) {
    let productForm = document.querySelector(
      `product-form[data-section="${this.dataset.section}"]`
    );

    // Create a custom event
    const notInStockEvent = new CustomEvent('alert-not-in-stock', {
      bubbles: true, // Allow the event to bubble up the DOM tree
      cancelable: true, // Allow the event to be cancelable,
      detail: pVariant,
    });

    // Create a custom event
    const inStockEvent = new CustomEvent('alert-in-stock', {
      bubbles: true, // Allow the event to bubble up the DOM tree
      cancelable: true, // Allow the event to be cancelable
      detail: pVariant,
    });

    //Dispatch Event on product form
    if (pAvailable) {
      productForm.dispatchEvent(inStockEvent);
    } else {
      productForm.dispatchEvent(notInStockEvent);
    }
  }

  toggleAddButton(pSoldOutStatus, pDisableButton) {
    if (
      document.querySelector(
        `[data-product-card][data-section="${this.dataset.section}"]`
      )
    ) {
      let quickAddButton = document
        .querySelector(
          `[data-product-card][data-section="${this.dataset.section}"]`
        )
        .querySelector('quick-add-button')
        .querySelector('button');
      let quickAddButtonText = document
        .querySelector(
          `[data-product-card][data-section="${this.dataset.section}"]`
        )
        .querySelector('quick-add-button')
        .querySelector('span');
      this.toggleQuickAddButton(
        pSoldOutStatus,
        pDisableButton,
        quickAddButton,
        quickAddButtonText
      );
    }

    let productForm = document.querySelector(
      `product-form[data-section="${this.dataset.section}"]`
    );

    let disable = pDisableButton;
    if (!productForm) return;

    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');

    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', true);
      if (pSoldOutStatus === 'sold-out') {
        addButtonText.textContent = window.variantStrings.soldOut;
      }
      if (pSoldOutStatus === 'variant-sold-out') {
        addButtonText.textContent = window.variantStrings.currentOptionSoldOut;
      }
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }
  }

  updateMasterVariantId() {
    this.currentVariant = this.getVariantData().find(variant => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#quick-add-form-${this.dataset.section}, #product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`
    );

    productForms.forEach(productForm => {
      if (productForm.querySelector('input[name="id"]')) {
        const input = productForm.querySelector('input[name="id"]');
        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  getVariantData() {
    this.variantData =
      this.variantData ===
      JSON.parse(this.querySelector('[type="application/json"]').textContent)
        ? this.variantData
        : JSON.parse(
            this.querySelector('[type="application/json"]').textContent
          );
    return this.variantData;
  }

  setSoldOutOptions() {
    let data = {
      productVariants: JSON.parse(
        this.querySelector('[type="application/json"]').innerHTML
      ),
    };

    let allProductVariants = data.productVariants;

    let sizeOptions = [];

    this.querySelectorAll('input').forEach(function (elem) {
      sizeOptions.push(elem);
      elem.parentElement.classList.remove('is-sold-out');
      elem.disabled = false;
      elem.setAttribute('aria-disabled', false);
    });

    for (var i = 0; i < allProductVariants.length; i++) {
      if (allProductVariants[i].available == false) {
        sizeOptions.forEach(elem => {
          if (
            allProductVariants[i].option1 == elem.value ||
            allProductVariants[i].option2 == elem.value
          ) {
            elem.parentElement.classList.add('is-sold-out');
            elem.disabled = true;
            elem.setAttribute('aria-disabled', true);
          }
        });
      }
    }

    if (!this.currentVariant.available) {
      if (
        this.querySelectorAll("input[type='radio']:not([disabled])").length ===
        0
      ) {
        if (this.dataset.isQuickAdd == 'true') {
          this.toggleAddButton('sold-out', true, true);
        }
        this.toggleAddButton('sold-out', true);
      }

      if (
        this.querySelectorAll("input[type='radio']:not([disabled])").length > 0
      ) {
        if (this.dataset.isQuickAdd == 'true') {
          this.toggleAddButton('variant-sold-out', true, true);
        }
        this.toggleAddButton('variant-sold-out', true);
      }
    } else {
      if (this.dataset.isQuickAdd == 'true') {
        this.toggleAddButton(false, false, true);
      }
      this.toggleAddButton(false, false, true);
    }

    this.alertAvailability(this.currentVariant.available, this.currentVariant);
  }

  setUpEvents() {
    if (this.querySelector('[data-current-option]')) {
      let currentOption = this.querySelector(
        '[data-current-option]'
      ).textContent;

      function showOption(pColor) {
        let colorContainer = document.querySelector('[data-current-option]');
        colorContainer.textContent = pColor.replace(/[\n\r]+|[\s]{2,}/g, '');
      }

      this.querySelectorAll('[data-option-label]').forEach(element => {
        element.addEventListener('click', event => {
          let name = event.target.dataset.optionName;
          currentOption = name;
          showOption(name);
        });

        element.addEventListener('mouseenter', event => {
          let name = event.target.dataset.optionName;
          showOption(name);
        });

        element.addEventListener('mouseleave', event => {
          showOption(currentOption);
        });
      });

      this.querySelectorAll('input[type="radio"]').forEach(element => {
        element.addEventListener('focus', event => {
          let name = event.target.value;
          showOption(name);
        });

        element.addEventListener('blur', event => {
          showOption(currentOption);
        });
      });
    }
  }
}

customElements.define('variant-radios', VariantRadios);

class CustomInputWrapper extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    let textFieldWrapper = this;

    if (this.querySelector('input') !== null) {
      this.querySelector('input').addEventListener('change', function (event) {
        let input = event.currentTarget;

        if (input.value.length > 0) {
          textFieldWrapper.classList.add('is-active');
        } else {
          textFieldWrapper.classList.remove('is-active');
        }
      });

      let changeEvent = new Event('change');

      this.querySelector('input').dispatchEvent(changeEvent);

      this.querySelector('input').addEventListener('focus', function () {
        textFieldWrapper.classList.add('is-active');
      });

      this.querySelector('input').addEventListener('blur', function (event) {
        let input = event.currentTarget;
        if (input.value.length > 0) {
          textFieldWrapper.classList.add('is-active');
        } else {
          textFieldWrapper.classList.remove('is-active');
        }
      });
    }
  }
}

customElements.define('custom-input-wrapper', CustomInputWrapper);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      console.log(modal);
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this, false)
    );
    this.addEventListener('keyup', event => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', event => {
        if (
          event.pointerType === 'mouse' &&
          !event.target.closest('deferred-media, product-model')
        )
          this.hide();
      });
    } else {
      this.addEventListener('click', event => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class HTMLUpdateUtility {
  /**
   * Used to swap an HTML node with a new node.
   * The new node is inserted as a previous sibling to the old node, the old node is hidden, and then the old node is removed.
   *
   * The function currently uses a double buffer approach, but this should be replaced by a view transition once it is more widely supported https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
   */
  static viewTransition(
    oldNode,
    newContent,
    preProcessCallbacks = [],
    postProcessCallbacks = []
  ) {
    preProcessCallbacks?.forEach(callback => callback(newContent));

    const newNodeWrapper = document.createElement('div');
    HTMLUpdateUtility.setInnerHTML(newNodeWrapper, newContent.outerHTML);
    const newNode = newNodeWrapper.firstChild;

    // dedupe IDs
    const uniqueKey = Date.now();
    oldNode.querySelectorAll('[id], [form]').forEach(element => {
      element.id && (element.id = `${element.id}-${uniqueKey}`);
      element.form &&
        element.setAttribute(
          'form',
          `${element.form.getAttribute('id')}-${uniqueKey}`
        );
    });

    oldNode.parentNode.insertBefore(newNode, oldNode);
    oldNode.style.display = 'none';

    postProcessCallbacks?.forEach(callback => callback(newNode));

    setTimeout(() => oldNode.remove(), 500);
  }

  // Sets inner HTML and reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
  static setInnerHTML(element, html) {
    element.innerHTML = html;
    element.querySelectorAll('script').forEach(oldScriptTag => {
      const newScriptTag = document.createElement('script');
      Array.from(oldScriptTag.attributes).forEach(attribute => {
        newScriptTag.setAttribute(attribute.name, attribute.value);
      });
      newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
      oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
    });
  }
}

class GlobalModal extends HTMLElement {
  constructor() {
    super();

    this.modalId = this.id;
    this.modal =
      this.querySelector('[role="dialog"]') || this.querySelector('dialog');
    this.modalTriggers = document.querySelectorAll(
      `button[data-modal="${this.modalId}"]`
    );
    this.close = this.querySelectorAll('[data-modal-close]');
    //   this.openButton = this.shadowRoot.querySelector('#openModalButton');
    //   this.modal = this.shadowRoot.querySelector('#modal');
    //   this.closeButton = this.shadowRoot.querySelector('#closeModalButton');

    //   this.openButton.addEventListener('click', () => this.openModal());
    //   this.closeButton.addEventListener('click', () => this.closeModal());
    this.initEvents();
  }

  initEvents() {
    this.modalTriggers.forEach(elem => {
      elem.addEventListener('click', event => this.openModal(event));
    });

    this.close.forEach(elem => {
      elem.addEventListener('click', () => this.closeModal());
    });
  }

  openModal(pEvent) {
    if (pEvent) {
      pEvent.target.closest('button').setAttribute('aria-expanded', true);
    }

    this.modal.setAttribute('aria-hidden', 'false');

    if (!this.modal.dataset.allowScroll) {
      document.body.classList.add(`overflow-hidden`);
    }
  }

  closeModal() {
    this.modalTriggers.forEach(elem => {
      elem.setAttribute('aria-expanded', 'false');
    });

    this.modal.setAttribute('aria-hidden', 'true');

    document.body.classList.remove(`overflow-hidden`);

    // setTimeout(()=> {
    //   this.modal.style.display = 'none';
    // }, 600);
  }
}

customElements.define('global-modal', GlobalModal);

function loadScript(scriptUrl) {
  const script = document.createElement('script');
  script.src = scriptUrl;
  document.body.appendChild(script);

  return new Promise((res, rej) => {
    script.onload = function () {
      res();
    };
    script.onerror = function () {
      rej();
    };
  });
}

function getAbsoluteHeight(el) {
  // Get the DOM Node if you pass in a string
  el = typeof el === 'string' ? document.querySelector(el) : el;

  var styles = window.getComputedStyle(el);
  var margin =
    parseFloat(styles['marginTop']) + parseFloat(styles['marginBottom']);

  return Math.ceil(el.offsetHeight + margin);
}

class SearchToggle extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector('button');
    this.setUpEvents();
    console.log(this.button);

    document.addEventListener('click', event => {
      var isClickInside = document
        .querySelector('[data-search-modal]')
        .contains(event.target);
      var isToggleButton = this.contains(event.target);

      if (!isClickInside && !isToggleButton) {
        this.closeSearch();
      }
    });
  }

  setUpCloseEvents() {
    document.addEventListener(
      'keyup',
      evt => {
        evt.code === 'Escape' && this.closeSearch();
      },
      { once: true }
    );
  }

  closeSearch() {
    this.button.setAttribute('aria-expanded', false);
    this.button.blur();
    document
      .querySelector('[data-search-modal]')
      .setAttribute('aria-hidden', true);
  }

  setUpEvents() {
    this.button.addEventListener('click', event => {
      if (this.button.getAttribute('aria-expanded') == 'false') {
        this.button.setAttribute('aria-expanded', true);
      } else {
        this.button.setAttribute('aria-expanded', false);
      }

      this.button.blur();

      if (
        document
          .querySelector('[data-search-modal]')
          .getAttribute('aria-hidden') == 'false'
      ) {
        document
          .querySelector('[data-search-modal]')
          .setAttribute('aria-hidden', true);
        removeTrapFocus();
      } else {
        this.setUpCloseEvents();
        document
          .querySelector('[data-search-modal]')
          .setAttribute('aria-hidden', false);
        trapFocus(
          document.querySelector('[data-search-modal]'),
          document.querySelector('[data-search-modal] input[type="search"]')
        );
      }
    });

    document
      .querySelector('[data-modal-close]')
      .addEventListener('click', () => {
        this.closeSearch();
      });
  }
}

customElements.define('search-toggle', SearchToggle);

class StickyHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.header = document.querySelector('.section-header');
    this.headerIsAlwaysSticky =
      this.getAttribute('data-sticky-type') === 'always' ||
      this.getAttribute('data-sticky-type') === 'reduce-logo-size';
    this.headerBounds = {};

    this.setHeaderHeight();

    window
      .matchMedia('(max-width: 940px)')
      .addEventListener('change', this.setHeaderHeight.bind(this));

    if (this.headerIsAlwaysSticky) {
      this.header.classList.add('shopify-section-header-sticky');
    }

    this.currentScrollTop = 0;
    this.preventReveal = false;

    this.onScrollHandler = this.onScroll.bind(this);
    this.hideHeaderOnScrollUp = () => (this.preventReveal = true);

    this.addEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
    window.addEventListener('scroll', this.onScrollHandler, false);

    this.createObserver();
  }

  setHeaderHeight() {
    document.documentElement.style.setProperty(
      '--header-height',
      `${this.header.offsetHeight}px`
    );
  }

  disconnectedCallback() {
    this.removeEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
    window.removeEventListener('scroll', this.onScrollHandler);
  }

  createObserver() {
    let observer = new IntersectionObserver((entries, observer) => {
      this.headerBounds = entries[0].intersectionRect;
      observer.disconnect();
    });

    observer.observe(this.header);
  }

  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (
      scrollTop > this.currentScrollTop &&
      scrollTop > this.headerBounds.bottom
    ) {
      this.header.classList.add('scrolled-past-header');
      if (this.preventHide) return;
      requestAnimationFrame(this.hide.bind(this));
    } else if (
      scrollTop < this.currentScrollTop &&
      scrollTop > this.headerBounds.bottom
    ) {
      this.header.classList.add('scrolled-past-header');
      if (!this.preventReveal) {
        requestAnimationFrame(this.reveal.bind(this));
      } else {
        window.clearTimeout(this.isScrolling);

        this.isScrolling = setTimeout(() => {
          this.preventReveal = false;
        }, 66);

        requestAnimationFrame(this.hide.bind(this));
      }
    } else if (scrollTop <= this.headerBounds.top) {
      this.header.classList.remove('scrolled-past-header');
      requestAnimationFrame(this.reset.bind(this));
    }

    this.currentScrollTop = scrollTop;
  }

  hide() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.add(
      'shopify-section-header-hidden',
      'shopify-section-header-sticky'
    );
    this.closeMenuDisclosure();
  }

  reveal() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.add('shopify-section-header-sticky', 'animate');
    this.header.classList.remove('shopify-section-header-hidden');
  }

  reset() {
    if (this.headerIsAlwaysSticky) return;
    this.header.classList.remove(
      'shopify-section-header-hidden',
      'shopify-section-header-sticky',
      'animate'
    );
  }

  closeMenuDisclosure() {
    this.disclosures =
      this.disclosures || this.header.querySelectorAll('header-menu');
    this.disclosures.forEach(disclosure => disclosure.close());
  }
}

customElements.define('sticky-header', StickyHeader);

// document.addEventListener('DOMContentLoaded', () => {
//   const observerOptions = {
//     root: null,
//     rootMargin: '0px',
//     threshold: 0.1
//   };

//   const observer = new IntersectionObserver((entries, observer) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         const parentElement = entry.target;
//         const textElements = parentElement.querySelectorAll('.animate-text');

//         textElements.forEach((textElement, index) => {
//           const text = textElement.textContent;
//           textElement.textContent = '';

//           for (let i = 0; i < text.length; i++) {
//             const span = document.createElement('span');
//             const char = text[i];
//             const parentTag = textElement.cloneNode(false);
//             parentTag.textContent = '';
//             span.textContent = char;
//             span.style.opacity = 0;
//             span.style.transition = `opacity 1s ease ${(index * 0.5) + (i * 0.1)}s`;
//             parentTag.appendChild(span);
//             textElement.appendChild(parentTag);

//             requestAnimationFrame(() => {
//               span.style.opacity = 1;
//             });
//           }
//         });

//         observer.unobserve(parentElement);
//       }
//     });
//   }, observerOptions);

//   document.querySelectorAll('.anima-text').forEach(element => {
//     observer.observe(element.parentElement);
//   });
// });

class TabbedInterface extends HTMLElement {
  constructor() {
    super();
    this.tabs = this.querySelectorAll('[role="tab"]');
    console.log(this.tabs);
    this.tabPanels = this.querySelectorAll('[role="tabpanel"]');
  }

  connectedCallback() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', this.onTabClick.bind(this));
    });
  }

  onTabClick(event) {
    const clickedTab = event.currentTarget;
    console.log('clicked');

    // Deselect all tabs
    this.tabs.forEach(tab => {
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    });

    // Hide all tab panels
    this.tabPanels.forEach(panel => (panel.hidden = true));

    // Select the clicked tab
    clickedTab.setAttribute('aria-selected', 'true');
    clickedTab.setAttribute('tabindex', '0');

    // Show the associated tab panel
    const panelId = clickedTab.getAttribute('aria-controls');
    this.querySelector(`#${panelId}`).hidden = false;
  }
}

customElements.define('tabbed-interface', TabbedInterface);

// Setsup custom green dot cursor across all links with "green-dot-hover prop"

function initGreenDotEffect() {
  // SVG code for the cursor
  const customCursorSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 210 201" fill="none">
  <path d="M209.608 112.836C209.315 111.798 208.906 110.786 208.561 109.763C205.709 101.331 207.037 92.1564 207.064 83.2554C207.084 76.4672 198.859 78.7778 194.297 78.8757C187.588 79.0195 180.877 79.1623 174.168 79.306C167.46 79.4498 160.75 79.5926 154.042 79.7364C147.551 79.875 139.658 81.218 133.373 79.8863C135.649 70.5437 142.642 60.6709 146.97 51.9963C151.662 42.5926 156.353 33.1899 161.044 23.7862C162.809 20.2478 162.6 17.2907 158.807 15.6123C150.851 14.1153 143.737 10.1548 136.8 6.17796C133.695 4.39858 129.401 0.73886 125.868 0.101545C121.38 -0.707081 121.387 3.45229 119.573 7.65143C112.448 24.1451 104.535 40.3136 95.5072 55.86C94.3973 57.7719 93.355 60.5088 90.8314 57.2814C83.0552 47.3332 75.508 37.2035 68.3087 26.8321C64.709 21.6469 61.1953 16.4015 57.7828 11.0909C56.2106 8.64463 54.6322 4.53726 52.4718 2.62939C48.1878 -1.15473 42.4748 6.34009 38.9068 8.87202C32.7417 13.2455 26.0026 16.8135 18.9097 19.4433C10.2077 22.6707 24.59 36.5152 27.4808 40.6694C35.3368 51.9586 42.7141 63.5577 50.3574 74.9856C51.9767 77.4033 51.7844 78.2731 48.6185 78.6432C33.4199 80.4196 17.8039 80.4185 2.51735 81.2659C-1.3626 81.4902 0.37535 102.373 0.460253 104.807C0.620852 109.367 0.256691 114.517 1.11492 119.005C2.5327 126.419 17.5032 121.617 23.2868 121.27C31.6287 120.769 39.9921 120.633 48.3464 120.861C51.2433 120.941 56.8929 119.548 59.3285 121.588C63.4222 125.017 57.3368 132.9 55.6091 136.291C48.1725 150.884 40.7348 165.477 33.2981 180.07C30.2212 186.108 42.1464 187.739 45.5517 189.05C52.4892 191.719 59.0922 195.255 65.1499 199.556C74.5301 206.217 78.9543 188.031 82.1458 181.645C87.7688 170.393 93.3028 159.098 98.7478 147.76C99.4393 146.32 100.252 144.759 101.736 144.153C105.671 142.55 115.644 159.459 117.812 162.395C125.78 173.186 133.357 184.27 140.294 195.75C142.472 199.355 145.19 202.109 149.352 199.248C150.766 198.276 151.889 196.951 153.078 195.717C159.331 189.236 167.628 185.116 176.002 181.771C177.011 181.368 178.051 180.957 178.83 180.202C181.785 177.334 175.202 171.171 173.471 169.217C165.584 160.313 158.789 150.448 153.288 139.909C151.413 136.318 140.321 124.745 149.15 123.253C166.423 120.335 184.023 119.335 201.519 120.277C205.718 120.502 210.648 119.656 209.927 114.333C209.859 113.826 209.745 113.328 209.606 112.837L209.608 112.836Z" fill="#FF6100"/>
</svg>
  `;

  // Create the cursor div only once and reuse it
  let cursorDiv = document.createElement('div');
  cursorDiv.setAttribute('id', 'custom-green-dot-cursor');
  cursorDiv.style.position = 'fixed';
  cursorDiv.style.pointerEvents = 'none';
  cursorDiv.style.zIndex = '9999';
  cursorDiv.style.width = '24px';
  cursorDiv.style.height = '24px';
  cursorDiv.classList.remove('is-active');
  cursorDiv.innerHTML = customCursorSVG;
  document.body.appendChild(cursorDiv);

  let active = false;

  // Move the cursor div to follow the mouse
  function moveCursor(e) {
    cursorDiv.style.left = `${e.clientX - 5}px`; // center the circle on pointer
    cursorDiv.style.top = `${e.clientY - 5}px`;
  }

  // Add event listeners to the target elements
  const targetElements = document.querySelectorAll(
    '[data-custom-cursor], .swiper-pagination-bullet'
  );
  if (targetElements) {
    targetElements.forEach(elem => {
      elem.addEventListener('mouseenter', function (event) {
        active = true;
        cursorDiv.classList.add('is-active');
        elem.style.cursor = 'none';
        document.body.style.cursor = 'none';
        // move immediately for mouseenter
        moveCursor(event);
        // follow mouse while hovering
        window.addEventListener('mousemove', moveCursor, true);
      });
      elem.addEventListener('mousemove', moveCursor);
      elem.addEventListener('mouseleave', function () {
        active = false;
        cursorDiv.classList.remove('is-active');
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', moveCursor, true);
      });
    });
  }
}

const greenDotEnabled =
  window.theme && window.theme.settings
    ? window.theme.settings.enableGreenDotEffect
    : true;

if (greenDotEnabled) {
  setTimeout(() => {
    initGreenDotEffect();
  }, 200);
}
