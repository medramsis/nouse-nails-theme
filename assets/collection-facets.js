(() => {
  const SECTION_SELECTOR = '[data-section-type="collection-template"]';

  class CollectionFacetsController {
    constructor(section) {
      this.section = section;
      this.sectionId = section.dataset.sectionId;
      this.abortController = null;
      this.loadMoreAbortController = null;
      this.isLoading = false;
      this.savedScrollPosition = null;

      this.handleSectionChange = this.handleSectionChange.bind(this);
      this.handleSectionSubmit = this.handleSectionSubmit.bind(this);
      this.handleSectionClick = this.handleSectionClick.bind(this);
      this.handleEscape = this.handleEscape.bind(this);
      this.handlePopState = this.handlePopState.bind(this);

      this.section.addEventListener('change', this.handleSectionChange);
      this.section.addEventListener('submit', this.handleSectionSubmit);
      this.section.addEventListener('click', this.handleSectionClick);
      document.addEventListener('keyup', this.handleEscape);
      window.addEventListener('popstate', this.handlePopState);

      this.updateUiState();
    }

    get facetsWrapper() {
      return this.section.querySelector('[data-facets-form]');
    }

    get filtersForm() {
      return this.section.querySelector('[data-facets-filters]');
    }

    get sortForm() {
      return this.section.querySelector('[data-facets-sort]');
    }

    get sortSelect() {
      return this.section.querySelector('[data-sort-select]');
    }

    get sortInput() {
      return this.section.querySelector('[data-sort-input]');
    }

    get sortToggle() {
      return this.section.querySelector('[data-sort-open]');
    }

    get sortDialog() {
      return this.section.querySelector('[data-sort-dialog]');
    }

    get sortOverlay() {
      return this.section.querySelector('[data-sort-overlay]');
    }

    get sortLabelTarget() {
      return this.section.querySelector('[data-sort-label]');
    }

    get sortOptions() {
      return this.section.querySelectorAll('[data-sort-option]');
    }

    get productsContainer() {
      return this.section.querySelector('[data-products-container]');
    }

    get productGrid() {
      return this.section.querySelector('[data-product-grid]');
    }

    get productList() {
      return this.section.querySelector('[data-product-list]');
    }

    get loadingOverlay() {
      return this.section.querySelector('[data-loading]');
    }

    get clearButton() {
      return this.section.querySelector('[data-clear-filters]');
    }

    get loadMoreButton() {
      return this.section.querySelector('[data-load-more]');
    }

    get loadMoreContainer() {
      return this.section.querySelector('[data-load-more-container]');
    }

    get productCountElement() {
      return this.section.querySelector('#ProductCount');
    }

    get activeCountBadge() {
      return this.section.querySelector('[data-facet-count]');
    }

    get collectionUrl() {
      const wrapper = this.facetsWrapper;
      return wrapper
        ? wrapper.dataset.collectionUrl || window.location.pathname
        : window.location.pathname;
    }

    set collectionUrl(value) {
      if (this.facetsWrapper) {
        this.facetsWrapper.dataset.collectionUrl = value;
      }
    }

    handleSectionChange(event) {
      const target = event.target;
      if (target.matches('[data-facet-input]')) {
        event.preventDefault();
        this.submitFacetForms();
        return;
      }

      if (target.matches('[data-sort-select]')) {
        event.preventDefault();
        this.submitFacetForms();
        return;
      }
    }

    handleSectionSubmit(event) {
      const form = event.target;
      if (
        form.matches('[data-facets-filters]') ||
        form.matches('[data-facets-sort]')
      ) {
        event.preventDefault();
        this.submitFacetForms();
      }
    }

    handleSectionClick(event) {
      const toggleButton = event.target.closest('[data-facets-open]');
      if (toggleButton) {
        event.preventDefault();
        this.openDialog();
        return;
      }

      const closeButton = event.target.closest('[data-facets-close]');
      if (closeButton) {
        event.preventDefault();
        this.closeDialog();
        return;
      }

      const sortToggle = event.target.closest('[data-sort-open]');
      if (sortToggle) {
        event.preventDefault();
        if (sortToggle.getAttribute('aria-expanded') === 'true') {
          this.closeSortDialog();
          return;
        }
        this.openSortDialog();
        return;
      }

      const sortClose = event.target.closest('[data-sort-close]');
      if (sortClose) {
        event.preventDefault();
        this.closeSortDialog();
        return;
      }

      const sortOverlay = event.target.closest('[data-sort-overlay]');
      if (sortOverlay) {
        event.preventDefault();
        this.closeSortDialog();
        return;
      }

      const sortOption = event.target.closest('[data-sort-option]');
      if (sortOption) {
        event.preventDefault();
        this.handleSortSelection(sortOption);
        return;
      }

      const removeLink = event.target.closest('[data-facet-remove]');
      if (removeLink) {
        event.preventDefault();
        this.renderFromUrl(removeLink.getAttribute('href'));
        return;
      }

      const clearLink = event.target.closest('[data-facets-clear]');
      if (clearLink) {
        event.preventDefault();
        this.renderFromUrl(clearLink.getAttribute('href'));
        return;
      }

      const clearButton = event.target.closest('[data-clear-filters]');
      if (clearButton) {
        event.preventDefault();
        const url =
          clearButton.dataset.clearUrl ||
          this.collectionUrl ||
          window.location.pathname;
        this.renderFromUrl(url);
        return;
      }

      const loadMoreTrigger = event.target.closest('[data-load-more]');
      if (loadMoreTrigger) {
        event.preventDefault();
        this.loadMoreProducts(loadMoreTrigger);
        return;
      }
    }

    handleEscape(event) {
      if (event.code !== 'Escape') return;
      const dialog = this.section.querySelector('[data-facets-drawer]');
      if (dialog && dialog.getAttribute('aria-hidden') === 'false') {
        this.closeDialog();
      }

      const sortDialog = this.sortDialog;
      if (sortDialog && sortDialog.getAttribute('aria-hidden') === 'false') {
        this.closeSortDialog();
      }
    }

    handlePopState() {
      this.renderFromUrl(window.location.href, { updateHistory: false });
    }

    submitFacetForms() {
      const filterForm = this.filtersForm;
      const sortSelect = this.sortSelect;
      const formData = filterForm ? new FormData(filterForm) : new FormData();

      if (sortSelect && sortSelect.value) {
        formData.set('sort_by', sortSelect.value);
      } else {
        formData.delete('sort_by');
      }

      const baseUrl = this.collectionUrl || window.location.pathname;
      const url = new URL(baseUrl, window.location.origin);
      const searchParams = new URLSearchParams(formData);

      // Clean empty values to avoid invalid params
      searchParams.forEach((value, key) => {
        if (value === '') {
          searchParams.delete(key);
        }
      });

      const sortInput = this.sortInput;
      if (!this.sortSelect && sortInput && sortInput.value) {
        searchParams.set('sort_by', sortInput.value);
      }

      url.search = searchParams.toString();
      this.renderFromUrl(url.toString());
    }

    renderFromUrl(url, options = { updateHistory: true }) {
      if (!url) return;
      const fetchUrl = new URL(url, window.location.origin);
      fetchUrl.searchParams.set('section_id', this.sectionId);

      const shouldAutoClose = this.shouldAutoCloseFacets();
      const keepDrawerOpen = !shouldAutoClose && this.isDrawerOpen();

      this.setLoadingState(true);
      if (shouldAutoClose) {
        this.closeDialog();
      }
      this.closeSortDialog();

      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();

      fetch(fetchUrl.toString(), { signal: this.abortController.signal })
        .then(response => {
          if (!response.ok) throw new Error(response.statusText);
          return response.text();
        })
        .then(html => {
          this.renderResponse(html, { keepDrawerOpen });
          if (options.updateHistory) {
            const cleanUrl = new URL(fetchUrl.toString());
            cleanUrl.searchParams.delete('section_id');
            window.history.pushState(
              { sectionId: this.sectionId },
              '',
              cleanUrl.pathname + cleanUrl.search
            );
            this.collectionUrl = cleanUrl.pathname;
          } else {
            const cleanUrl = new URL(fetchUrl.toString());
            cleanUrl.searchParams.delete('section_id');
            this.collectionUrl = cleanUrl.pathname;
          }
        })
        .catch(error => {
          if (error.name === 'AbortError') return;
          console.error('Collection facets error', error);
        })
        .finally(() => {
          this.setLoadingState(false);
        });
    }

    renderResponse(htmlString, options = {}) {
      if (!htmlString) return;
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      const newSection = doc.querySelector(
        `${SECTION_SELECTOR}[data-section-id="${this.sectionId}"]`
      );
      if (!newSection) return;

      const newFacets = newSection.querySelector('[data-facets-form]');
      const newProducts = newSection.querySelector('[data-products-container]');

      const previouslyOpenFacets = this.getOpenFacetIds();

      if (newFacets && this.facetsWrapper) {
        this.facetsWrapper.innerHTML = newFacets.innerHTML;
        this.facetsWrapper.dataset.collectionUrl =
          newFacets.dataset.collectionUrl || this.collectionUrl;
        this.restoreFacetDrawerState(previouslyOpenFacets);
      }

      if (newProducts && this.productsContainer) {
        this.productsContainer.innerHTML = newProducts.innerHTML;
        if (newProducts.dataset.nextUrl !== undefined) {
          this.productsContainer.dataset.nextUrl = newProducts.dataset.nextUrl;
        } else {
          delete this.productsContainer.dataset.nextUrl;
        }
      }

      if (options.keepDrawerOpen && !this.shouldAutoCloseFacets()) {
        this.restoreDrawerOpenState();
      }

      this.updateUiState();
    }

    loadMoreProducts(buttonElement) {
      const button = buttonElement || this.loadMoreButton;
      const nextUrl =
        (button && button.dataset.loadNext) ||
        (this.productsContainer && this.productsContainer.dataset.nextUrl);

      if (!nextUrl) {
        this.updateLoadMoreButton('');
        return;
      }

      if (this.loadMoreAbortController) {
        this.loadMoreAbortController.abort();
      }
      this.loadMoreAbortController = new AbortController();

      this.savedScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop || 0;

      this.setLoadMoreLoading(true);

      const fetchUrl = new URL(nextUrl, window.location.origin);
      fetchUrl.searchParams.set('section_id', this.sectionId);

      fetch(fetchUrl.toString(), {
        signal: this.loadMoreAbortController.signal,
      })
        .then(response => {
          if (!response.ok) throw new Error(response.statusText);
          return response.text();
        })
        .then(html => {
          this.appendProducts(html);
        })
        .catch(error => {
          if (error.name === 'AbortError') return;
          console.error('Collection load more error', error);
        })
        .finally(() => {
          this.setLoadMoreLoading(false);
        });
    }

    appendProducts(htmlString) {
      if (!htmlString) return;
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      const newSection = doc.querySelector(
        `${SECTION_SELECTOR}[data-section-id="${this.sectionId}"]`
      );
      if (!newSection) return;

      const newProductsContainer = newSection.querySelector(
        '[data-products-container]'
      );
      if (!newProductsContainer) return;

      const currentGrid = this.productGrid;
      const currentList = this.productList;
      const newGrid = newProductsContainer.querySelector('[data-product-grid]');
      const newList = newProductsContainer.querySelector('[data-product-list]');
      let appendedCount = 0;
      let scrollTarget = null;

      if (currentGrid && newGrid) {
        const previousLast = currentGrid.lastElementChild;
        appendedCount = this.appendNodes(currentGrid, newGrid.children);
        scrollTarget =
          (previousLast && previousLast.nextElementSibling) ||
          currentGrid.lastElementChild;
      } else if (currentList && newList) {
        const previousLast = currentList.lastElementChild;
        appendedCount = this.appendNodes(currentList, newList.children);
        scrollTarget =
          (previousLast && previousLast.nextElementSibling) ||
          currentList.lastElementChild;
      }

      const newCount = newProductsContainer.querySelector('#ProductCount');
      if (newCount && this.productCountElement) {
        this.productCountElement.innerHTML = newCount.innerHTML;
      }

      const nextUrl = newProductsContainer.dataset.nextUrl || '';
      if (this.productsContainer) {
        if (nextUrl) {
          this.productsContainer.dataset.nextUrl = nextUrl;
        } else {
          delete this.productsContainer.dataset.nextUrl;
        }
      }

      this.updateLoadMoreButton(nextUrl);
      this.updateUiState();
      this.restoreScrollPosition();

      document.dispatchEvent(
        new CustomEvent('collection:products-appended', {
          detail: {
            sectionId: this.sectionId,
            appendedCount,
          },
        })
      );
    }

    appendNodes(target, nodes) {
      const fragment = document.createDocumentFragment();
      let count = 0;
      Array.from(nodes).forEach(node => {
        fragment.appendChild(node.cloneNode(true));
        count += 1;
      });
      target.appendChild(fragment);
      return count;
    }

    restoreScrollPosition() {
      if (this.savedScrollPosition == null) return;
      const y = Math.max(this.savedScrollPosition, 0);
      window.scrollTo(0, y);
      this.savedScrollPosition = null;
    }

    openDialog() {
      const dialog = this.section.querySelector('[data-facets-drawer]');
      if (!dialog) return;

      dialog.classList.remove('is-closing');
      dialog.setAttribute('aria-hidden', 'false');
      dialog.classList.add('is-open');

      const overlay = this.section.querySelector('[data-facets-overlay]');
      if (overlay) {
        overlay.setAttribute('aria-hidden', 'false');
        overlay.classList.add('is-showing');
      }

      const toggleButton = this.section.querySelector('[data-facets-open]');
      if (toggleButton) {
        toggleButton.setAttribute('aria-expanded', 'true');
      }

      if (typeof trapFocus === 'function') {
        const focusTarget =
          dialog.querySelector(
            '[data-facet-input], button, a, input, select'
          ) || dialog;
        trapFocus(dialog, focusTarget);
      }
    }

    closeDialog() {
      const dialog = this.section.querySelector('[data-facets-drawer]');
      if (!dialog) return;
      if (dialog.classList.contains('is-closing')) return;

      const overlay = this.section.querySelector('[data-facets-overlay]');
      const toggleButton = this.section.querySelector('[data-facets-open]');
      const dialogPanel = dialog.querySelector(
        '.collection-facets__dialog-panel'
      );

      const finishClose = () => {
        dialog.setAttribute('aria-hidden', 'true');
        dialog.classList.remove('is-open', 'is-closing');

        if (overlay) {
          overlay.setAttribute('aria-hidden', 'true');
          overlay.classList.remove('is-showing');
        }

        if (toggleButton) {
          toggleButton.setAttribute('aria-expanded', 'false');
        }

        if (typeof removeTrapFocus === 'function') {
          removeTrapFocus(toggleButton || null);
        }
      };

      if (!dialog.classList.contains('is-open')) {
        finishClose();
        return;
      }

      dialog.classList.add('is-closing');

      requestAnimationFrame(() => {
        dialog.classList.remove('is-open');

        if (overlay) {
          overlay.classList.remove('is-showing');
        }

        const prefersReducedMotion =
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const hasTransition = (() => {
          if (!dialogPanel || prefersReducedMotion) return false;
          const computed = getComputedStyle(dialogPanel);
          return computed.transitionDuration
            .split(',')
            .some(value => parseFloat(value) > 0);
        })();

        if (dialogPanel && hasTransition) {
          const handleTransitionEnd = event => {
            if (event.target !== dialogPanel) return;
            dialogPanel.removeEventListener(
              'transitionend',
              handleTransitionEnd
            );
            finishClose();
          };
          dialogPanel.addEventListener('transitionend', handleTransitionEnd);

          // Fallback in case transitionend doesn't fire
          setTimeout(() => {
            if (dialog.classList.contains('is-closing')) {
              finishClose();
            }
          }, 600);
        } else {
          finishClose();
        }
      });
    }

    setLoadingState(isLoading) {
      this.isLoading = isLoading;
      const overlay = this.loadingOverlay;
      if (overlay) {
        overlay.classList.toggle('is-active', isLoading);
        overlay.setAttribute('aria-hidden', isLoading ? 'false' : 'true');
      }
    }

    setLoadMoreLoading(isLoading) {
      const button = this.loadMoreButton;
      if (!button) return;
      button.disabled = isLoading;
      button.classList.toggle('is-loading', isLoading);
      if (isLoading) {
        button.setAttribute('aria-busy', 'true');
      } else {
        button.removeAttribute('aria-busy');
      }
    }

    updateLoadMoreButton(nextUrl) {
      const button = this.loadMoreButton;
      if (!button) return;
      if (nextUrl) {
        button.dataset.loadNext = nextUrl;
        button.classList.remove('hidden');
        button.disabled = false;
      } else {
        button.classList.add('hidden');
        button.disabled = true;
        button.removeAttribute('aria-busy');
        delete button.dataset.loadNext;
      }
    }

    updateUiState() {
      const countBadge = this.activeCountBadge;
      const clearButton = this.clearButton;
      let appliedCount = 0;

      if (countBadge) {
        const parsedCount = parseInt(countBadge.textContent, 10);
        appliedCount = Number.isNaN(parsedCount) ? 0 : parsedCount;
        countBadge.classList.toggle('is-hidden', appliedCount === 0);
      }

      if (clearButton) {
        if (appliedCount > 0) {
          clearButton.classList.remove('hidden');
          clearButton.setAttribute('aria-expanded', 'true');
        } else {
          clearButton.classList.add('hidden');
          clearButton.setAttribute('aria-expanded', 'false');
        }
      }

      const loadMoreNext =
        (this.loadMoreButton && this.loadMoreButton.dataset.loadNext) ||
        (this.productsContainer && this.productsContainer.dataset.nextUrl) ||
        '';
      this.updateLoadMoreButton(loadMoreNext);

      const dialog = this.section.querySelector('[data-facets-drawer]');
      if (
        dialog &&
        dialog.getAttribute('aria-hidden') === 'false' &&
        this.shouldAutoCloseFacets()
      ) {
        this.closeDialog();
      }

      //this.closeSortDialog();
      this.syncSortState();
    }

    openSortDialog() {
      const dialog = this.sortDialog;
      if (!dialog) return;

      dialog.classList.add('is-open');
      dialog.setAttribute('aria-hidden', 'false');

      const overlay = this.sortOverlay;
      if (overlay) {
        overlay.classList.add('is-showing');
        overlay.setAttribute('aria-hidden', 'false');
      }

      const toggle = this.sortToggle;
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
      }

      if (typeof trapFocus === 'function') {
        const focusTarget =
          dialog.querySelector('[data-sort-option]') || dialog;
        trapFocus(dialog, focusTarget);
      }
    }

    closeSortDialog() {
      const dialog = this.sortDialog;
      if (!dialog) return;

      dialog.classList.remove('is-open');
      dialog.setAttribute('aria-hidden', 'true');

      const overlay = this.sortOverlay;
      if (overlay) {
        overlay.classList.remove('is-showing');
        overlay.setAttribute('aria-hidden', 'true');
      }

      const toggle = this.sortToggle;
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }

      if (typeof removeTrapFocus === 'function') {
        removeTrapFocus(toggle || null);
      }
    }

    handleSortSelection(option) {
      if (!option) return;
      const value = option.dataset.value || '';
      const sortInput = this.sortInput;
      if (!sortInput) return;

      const currentValue = sortInput.value;
      if (currentValue === value) {
        this.closeSortDialog();
        return;
      }

      sortInput.value = value;
      this.updateSortOptionsState(value);
      this.closeSortDialog();
      this.submitFacetForms();
    }

    syncSortState() {
      const currentValue = this.getCurrentSortValue();
      this.updateSortOptionsState(currentValue);
      this.updateSortLabel(currentValue);
    }

    updateSortOptionsState(selectedValue) {
      const options = this.sortOptions;
      if (!options || options.length === 0) return;

      options.forEach(option => {
        const value = option.dataset.value || '';
        const isActive = value === selectedValue;
        option.classList.toggle('is-active', isActive);
        if (isActive) {
          option.setAttribute('aria-selected', 'true');
        } else {
          option.removeAttribute('aria-selected');
        }
      });
    }

    updateSortLabel(selectedValue) {
      const labelTarget = this.sortLabelTarget;
      if (!labelTarget) return;

      let labelText = labelTarget.textContent;
      const options = this.sortOptions;
      if (options && options.length > 0) {
        options.forEach(option => {
          if ((option.dataset.value || '') === selectedValue) {
            labelText = option.textContent.trim();
          }
        });
      } else if (this.sortSelect) {
        const currentOption =
          this.sortSelect.options[this.sortSelect.selectedIndex];
        if (currentOption) {
          labelText = currentOption.textContent;
        }
      }

      if (labelText) {
        labelTarget.textContent = labelText;
      }
    }

    getCurrentSortValue() {
      const sortSelect = this.sortSelect;
      if (sortSelect) {
        return sortSelect.value || '';
      }

      const sortInput = this.sortInput;
      return sortInput ? sortInput.value || '' : '';
    }

    shouldAutoCloseFacets() {
      const wrapper = this.facetsWrapper;
      if (!wrapper) return true;
      const attr = wrapper.dataset.autoCloseFacets;
      if (attr === undefined) return true;
      return attr === 'true';
    }

    isDrawerOpen() {
      const dialog = this.section.querySelector('[data-facets-drawer]');
      return dialog ? dialog.getAttribute('aria-hidden') === 'false' : false;
    }

    restoreDrawerOpenState() {
      const dialog = this.section.querySelector('[data-facets-drawer]');
      if (!dialog) return;
      const overlay = this.section.querySelector('[data-facets-overlay]');

      this.disableDrawerAnimations([dialog, overlay]);

      dialog.setAttribute('aria-hidden', 'false');
      dialog.classList.add('is-open');

      if (overlay) {
        overlay.setAttribute('aria-hidden', 'false');
        overlay.classList.add('is-showing');
      }

      const toggleButton = this.section.querySelector('[data-facets-open]');
      if (toggleButton) {
        toggleButton.setAttribute('aria-expanded', 'true');
      }

      this.resetDrawerAnimations([dialog, overlay]);
    }

    disableDrawerAnimations(elements = []) {
      elements.forEach(element => {
        if (!element) return;
        element.dataset.drawerTransitionBackup = element.style.transition || '';
        element.dataset.drawerAnimationBackup = element.style.animation || '';
        element.style.transition = 'none';
        element.style.animation = 'none';
      });
    }

    resetDrawerAnimations(elements = []) {
      requestAnimationFrame(() => {
        elements.forEach(element => {
          if (!element) return;

          if (element.dataset.drawerTransitionBackup !== undefined) {
            const previousTransition = element.dataset.drawerTransitionBackup;
            if (previousTransition) {
              element.style.transition = previousTransition;
            } else {
              element.style.removeProperty('transition');
            }
            delete element.dataset.drawerTransitionBackup;
          } else {
            element.style.removeProperty('transition');
          }

          if (element.dataset.drawerAnimationBackup !== undefined) {
            const previousAnimation = element.dataset.drawerAnimationBackup;
            if (previousAnimation) {
              element.style.animation = previousAnimation;
            } else {
              element.style.removeProperty('animation');
            }
            delete element.dataset.drawerAnimationBackup;
          } else {
            element.style.removeProperty('animation');
          }
        });
      });
    }

    getOpenFacetIds() {
      if (!this.facetsWrapper) return [];
      return Array.from(
        this.facetsWrapper.querySelectorAll('[data-facet][open]')
      )
        .map(detail => detail.dataset.id)
        .filter(Boolean);
    }

    restoreFacetDrawerState(openFacetIds = []) {
      if (!openFacetIds || openFacetIds.length === 0 || !this.facetsWrapper)
        return;

      openFacetIds.forEach(id => {
        const detailsElement = this.facetsWrapper.querySelector(
          `[data-facet][data-id="${id}"]`
        );
        if (!detailsElement) return;

        detailsElement.setAttribute('open', 'true');
        const summary = detailsElement.querySelector('summary');
        if (summary) {
          summary.setAttribute('aria-expanded', 'true');
        }

        const host = detailsElement.closest('drawer-disclosure');
        if (host && typeof host.openDrawer === 'function') {
          host.openDrawer(detailsElement);
        } else {
          const content = detailsElement.querySelector('[data-drawer-content]');
          if (content) {
            content.style.height = 'auto';
          }
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(SECTION_SELECTOR).forEach(section => {
      if (!section.__collectionFacetsController) {
        section.__collectionFacetsController = new CollectionFacetsController(
          section
        );
      }
    });
  });
})();
