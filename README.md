# Nous Nails - Shopify Theme

A modern, responsive Shopify theme designed for nail and cosmetic brands. Built with performance, accessibility, and user experience in mind.

## 🎨 Brand Overview

This theme is custom-built for Nous Nails, featuring:

- Clean, minimalist design aesthetic
- Mobile-first responsive approach
- Accessibility-focused development
- Performance-optimized code

## ✨ Key Features

### 🛍️ E-commerce Functionality

- **Advanced Search Modal** - Predictive search with keyboard navigation
- **Product Galleries** - Swiper.js powered image galleries
- **Cart Drawer** - Smooth slide-out cart functionality
- **Variant Selection** - Radio button and dropdown variant selectors
- **Quick Add to Cart** - Fast product additions without page reload

### 📱 Responsive Design

- **Mobile-First Approach** - Optimized for mobile devices
- **Breakpoints**: 768px (tablet), 1024px (desktop)
- **Touch-Friendly Interface** - Optimized for mobile interactions
- **Progressive Enhancement** - Works without JavaScript

### ♿ Accessibility

- **WCAG Compliant** - Follows web accessibility guidelines
- **Keyboard Navigation** - Full keyboard support throughout
- **Screen Reader Support** - Proper ARIA labels and live regions
- **Focus Management** - Focus trapping in modals and drawers

### ⚡ Performance

- **Lazy Loading** - Images load as needed
- **CSS Optimization** - Minified and organized stylesheets
- **JavaScript Efficiency** - Debounced functions and optimized event handling
- **Asset Organization** - Modular CSS and JS architecture

## 🏗️ Project Structure

```
nous-nails/
├── assets/                 # CSS, JS, images, and fonts
│   ├── base.css           # Base styles and CSS variables
│   ├── grid.css           # Grid system
│   ├── global.js          # Global JavaScript functions
│   ├── theme.js           # Theme-specific JavaScript
│   └── component-*.css    # Component-specific styles
├── config/                # Theme configuration
│   ├── settings_data.json # Theme settings data
│   └── settings_schema.json # Theme settings schema
├── layout/                # Layout templates
│   ├── theme.liquid       # Main theme layout
│   ├── gift_card.liquid   # Gift card layout
│   └── password.liquid    # Password page layout
├── locales/               # Translation files (52 languages)
├── sections/              # Theme sections (51 sections)
├── snippets/              # Reusable Liquid snippets (80 snippets)
└── templates/             # Page templates
    ├── index.json         # Homepage
    ├── product.json       # Product pages
    ├── collection.json    # Collection pages
    └── search.json        # Search results
```

## 🎯 Core Components

### Search Modal System

- **Location**: `assets/component-predictive-search.css` + `assets/predictive-searcj.js`
- **Features**: Real-time search, keyboard navigation, result caching
- **Accessibility**: ARIA labels, focus management, screen reader support

### Header & Navigation

- **Sticky Header**: Auto-hide on scroll, customizable behavior
- **Mega Menu**: Hover-activated dropdown menus
- **Mobile Drawer**: Slide-out navigation for mobile devices

### Product Features

- **Media Gallery**: Swiper.js powered image carousels
- **Variant Selection**: Radio buttons with visual feedback
- **Product Forms**: AJAX-powered add to cart functionality

### Cart System

- **Cart Drawer**: Slide-out cart with smooth animations
- **Cart Notifications**: Toast-style add to cart confirmations
- **Quantity Controls**: Increment/decrement with validation

## 🛠️ Development Setup

### Prerequisites

- Node.js (for development tools)
- Shopify CLI (for theme development)
- Git (for version control)

### Installation

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd nous-nails
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Format CSS comments** (optional)
   ```bash
   npm run format-css-comments
   ```

4. **Critical CSS (local vs pushed branch)**  
   For local dev you want **uncommented** stylesheet links; the pushed branch should keep **commented** links (critical CSS inlined). After clone or pull, run:
   ```bash
   npm run extract-critical-css:restore
   ```
   On **commit**, the pre-commit hook runs `extract-critical-css` (comments link tags and generates `snippets/critical-css.liquid`) so the committed/pushed version has inlined critical CSS. Run `npm run extract-critical-css:restore` yourself when you want uncommented links for local dev.

### Development Workflow

1. **Start local development**

   ```bash
   shopify theme dev --store=hae-beauty
   ```

2. **Deploy to development store**

   ```bash
   shopify theme push --development
   ```

3. **Deploy to production**

   ```bash
   shopify theme push --live
   ```

## 📝 CSS Architecture

### Base Styles (`assets/base.css`)

- CSS custom properties (variables)
- Typography system
- Color palette
- Spacing system
- Reset styles

### Component-Based CSS

- **Naming Convention**: `component-[name].css`
- **Modular Structure**: Each component has its own stylesheet
- **Responsive Design**: Mobile-first with progressive enhancement

### Key CSS Files

- `base.css` - Foundation styles and variables
- `grid.css` - Grid system and layout utilities
- `component-header.css` - Header and navigation styles
- `component-predictive-search.css` - Search modal styles
- `component-cart-drawer.css` - Cart drawer styles
- `component-product-media-gallery.css` - Product gallery styles

## 🎨 Design System

### Typography

- **Primary Font**: Mabry (custom font files included)
- **Font Weights**: Regular (400), Medium (500)
- **Letter Spacing**: 4px for uppercase text
- **Line Heights**: Optimized for readability

### Color System

- **CSS Variables**: Consistent color management
- **Semantic Naming**: `--color-base-text`, `--color-base-background`
- **Theme Support**: Easy color customization

### Spacing System

- **CSS Variables**: `--level1` through `--level10`
- **Consistent Spacing**: Modular spacing scale
- **Responsive Adjustments**: Different spacing for mobile/desktop

## 🚀 JavaScript Features

### Custom Elements

- **SearchToggle**: Handles search modal functionality
- **PredictiveSearch**: Manages search results and API calls
- **MenuDrawer**: Mobile navigation drawer
- **VariantSelects**: Product variant selection
- **QuantityInput**: Quantity controls with validation

### Performance Optimizations

- **Debounced Functions**: Prevents excessive API calls
- **Event Delegation**: Efficient event handling
- **Lazy Loading**: Images and non-critical resources
- **Caching**: Search results and DOM queries

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
/* Base styles: 320px+ */

/* Tablet */
@media screen and (min-width: 768px) {
  /* Tablet styles */
}

/* Desktop */
@media screen and (min-width: 1024px) {
  /* Desktop styles */
}

/* Large Desktop */
@media screen and (min-width: 1300px) {
  /* Large desktop styles */
}
```

## 🔧 Customization

### Theme Settings

- **Header Settings**: Logo, navigation, sticky behavior
- **Color Customization**: Primary and secondary colors
- **Typography**: Font selection and sizing
- **Layout Options**: Column counts, spacing, animations

### Section Configuration

- **Homepage Sections**: Hero, featured collections, testimonials
- **Product Pages**: Gallery layout, variant selection, related products
- **Collection Pages**: Grid layout, filtering, sorting

## 🌐 Multi-Language Support

- **52 Language Files**: Complete localization support
- **RTL Support**: Right-to-left language compatibility
- **Dynamic Content**: Product descriptions, cart text, form labels

## 📊 Performance Metrics

### Core Web Vitals Optimized

- **Largest Contentful Paint (LCP)**: Optimized image loading
- **First Input Delay (FID)**: Efficient JavaScript execution
- **Cumulative Layout Shift (CLS)**: Stable layouts and animations

### Loading Optimizations

- **Critical CSS**: Above-the-fold styles inlined
- **Lazy Loading**: Below-the-fold images deferred
- **Asset Optimization**: Minified CSS and JavaScript
- **Font Loading**: Optimized web font delivery

## 🧪 Testing

### Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Accessibility**: Screen reader testing
- **Performance**: Lighthouse audits

### Quality Assurance

- **Code Standards**: Consistent formatting and naming
- **Accessibility Testing**: WCAG compliance verification
- **Performance Testing**: Core Web Vitals monitoring
- **Cross-Browser Testing**: Multiple device and browser testing

## 📚 Documentation

### Code Comments

- **CSS Comments**: Organized by sections and components
- **JavaScript Comments**: Function documentation and usage examples
- **Liquid Comments**: Template logic explanations

### Development Guidelines

- **CSS Naming**: BEM methodology for class names
- **JavaScript Patterns**: ES6+ features and modern practices
- **Liquid Best Practices**: Efficient template logic and performance

## 🤝 Contributing

### Development Standards

1. **Follow existing code patterns**
2. **Maintain responsive design principles**
3. **Ensure accessibility compliance**
4. **Test across multiple devices and browsers**
5. **Optimize for performance**

### Code Organization

- **Modular CSS**: One component per file
- **Reusable JavaScript**: Custom elements and utilities
- **Clean Liquid**: Efficient template logic

## 📄 License

This theme is proprietary software developed for Nous Nails. All rights reserved.

## 🆘 Support

For technical support or questions about this theme:

- Check the code comments for implementation details
- Review the CSS architecture for styling questions
- Examine the JavaScript custom elements for functionality

---

**Built with ❤️ for Nous Nails** - A modern, accessible, and performant Shopify theme.
