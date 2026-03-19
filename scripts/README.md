# Scripts Documentation

## Critical CSS Extraction

### Overview

The `extract-critical-css.js` script automates the extraction of critical above-the-fold CSS from various CSS files. This helps prevent FOUT (Flash of Unstyled Text) by inlining essential styles directly in templates.

### Usage

**Extract all critical CSS (header + product):**
```bash
npm run extract-critical-css
```

**Extract header critical CSS only:**
```bash
npm run extract-critical-css:header
```

**Extract product critical CSS only:**
```bash
npm run extract-critical-css:product
```

Or run directly with Node.js:
```bash
node scripts/extract-critical-css.js           # Extract all
node scripts/extract-critical-css.js header    # Header only
node scripts/extract-critical-css.js product   # Product only
```

### What It Does

#### Header Critical CSS

1. **Reads Source CSS Files**: 
   - `assets/component-header.css`
   - `assets/section-header.css`
   - `assets/component-announcement-bar.css`

2. **Extracts Critical Selectors**: 
   - Sticky header wrapper (`[data-sticky-header]`)
   - Header structure (`.header`, `.header__inner`, `.header__heading`)
   - Logo positioning (`.header__logo`)
   - Icon containers (`.header__icons`, `.header__icon`)
   - Cart count bubble (`.cart-count-bubble`)
   - Announcement bar (`.announcement-bar`)
   - Relevant media queries for responsive behavior

3. **Generates Output**: Creates/updates `snippets/critical-css.liquid`

4. **Inlined in Theme**: Automatically included in `layout/theme.liquid`:
   ```liquid
   <style>
     {% render 'critical-css' %}
   </style>
   ```

#### Product Critical CSS

1. **Reads Source CSS Files**:
   - `assets/section-main-product.css`
   - `assets/component-product-variant-picker.css`
   - `assets/component-product-media-gallery.css`
   - `assets/component-price.css`

2. **Extracts Critical Selectors**:
   - Product section container (`.product-section`, `.product__contain`)
   - Product layout (`.product`, `.product__media-wrapper`, `.product__info-wrapper`)
   - Product media/gallery (`.product-media-gallery`, `.media`)
   - Product info (`.product__title`, `.product-form`)
   - Variant picker (`.variant-picker`, `.product-variant-picker`)
   - Price display (`.price`, `.price__container`)
   - Add to cart button (`.product-form__submit`)
   - Breadcrumbs (`.breadcrumbs`)

3. **Generates Output**: Creates/updates `snippets/critical-css-product.liquid`

4. **Inlined in Template**: Automatically included in `sections/product-template.liquid`:
   ```liquid
   <style>
     {% render 'critical-css-product' %}
   </style>
   ```

### Configuration

You can customize the script by editing the `CONFIGS` object in `scripts/extract-critical-css.js`:

```javascript
const CONFIGS = {
  header: {
    sourceFiles: [ /* header CSS files */ ],
    outputFile: 'snippets/critical-css.liquid',
    criticalSelectors: [ /* header selectors */ ],
    includeMediaQueries: true,
  },
  
  product: {
    sourceFiles: [ /* product CSS files */ ],
    outputFile: 'snippets/critical-css-product.liquid',
    criticalSelectors: [ /* product selectors */ ],
    includeMediaQueries: true,
  }
};
```

Each configuration can be customized independently to extract different critical CSS for different page types.

### When to Run

Run this script whenever you:
- Update header-related CSS files (run `extract-critical-css:header`)
- Update product-related CSS files (run `extract-critical-css:product`)
- Add new critical above-the-fold styles
- Modify the header or product structure
- Want to refresh the inlined critical CSS for any template

### Performance Benefits

**Before**: Async CSS loading caused a flash of unstyled content (FOUT)
- Header styles loaded after initial render
- Visible layout shift as styles applied

**After**: Critical CSS inlined in `<head>`
- Header renders immediately with correct styling
- No layout shift or FOUT
- Improved perceived performance and user experience

### Size Considerations

The critical CSS should be:
- **Minimal**: Only above-the-fold styles
- **Essential**: Styles needed for initial render
- **Inline**: Delivered with the HTML document

**Current sizes:**
- Header critical CSS: ~6-8 KB (acceptable)
- Product critical CSS: ~18 KB (acceptable for product pages)

### Maintenance

The full CSS files remain unchanged and continue to load asynchronously:
- Full styles provide hover effects, animations, etc.
- Critical CSS only prevents FOUT on initial load
- No duplication concerns - browser caches full CSS files

### Troubleshooting

**Script doesn't find selectors:**
- Check that CSS files exist in the `assets/` directory
- Verify selector names match those in your CSS files
- Add missing selectors to `CONFIG.criticalSelectors`

**Generated CSS is too large:**
- Reduce the number of selectors
- Remove non-critical styles (animations, hover states, etc.)
- Keep only structural and positioning styles

**Changes not visible:**
- Clear Shopify theme cache
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
- Verify `critical-css.liquid` was updated
- Check that `theme.liquid` includes the critical CSS snippet

### Best Practices

1. **Keep it minimal**: Only include styles for above-the-fold content
2. **Run regularly**: Update when header CSS changes
3. **Test thoroughly**: Verify no FOUT on slow connections
4. **Monitor size**: Keep critical CSS under 10 KB
5. **Review generated output**: Manually check for correctness

### Example Workflows

**Updating header styles:**
```bash
# 1. Make changes to header CSS
vim assets/component-header.css

# 2. Extract updated critical CSS
npm run extract-critical-css:header

# 3. Review the generated file
cat snippets/critical-css.liquid

# 4. Deploy to Shopify
shopify theme push

# 5. Test in browser
```

**Updating product styles:**
```bash
# 1. Make changes to product CSS
vim assets/section-main-product.css

# 2. Extract updated critical CSS
npm run extract-critical-css:product

# 3. Review the generated file
cat snippets/critical-css-product.liquid

# 4. Deploy to Shopify
shopify theme push

# 5. Test product pages
```

**Updating both:**
```bash
# Extract all critical CSS at once
npm run extract-critical-css

# Review both files
cat snippets/critical-css.liquid
cat snippets/critical-css-product.liquid

# Deploy
shopify theme push
```

---

**Note**: This script is optimized for the Nash theme structure. If you modify the theme architecture significantly, you may need to update the script configuration.

