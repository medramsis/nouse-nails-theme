# Shopify Theme Liquid — Reference

## Common Liquid Objects

| Object | Context | Typical use |
|--------|---------|-------------|
| `product` | Product template, product card | `product.title`, `product.price`, `product.featured_media` |
| `collection` | Collection template, collection list | `collection.title`, `collection.products`, `collection.handle` |
| `cart` | Cart drawer, cart page | `cart.item_count`, `cart.total_price` |
| `shop` | Global | `shop.name`, `shop.currency` |
| `section` | Inside a section | `section.settings`, `section.id` |
| `block` | Inside a block (e.g. within section) | `block.settings`, `block.type` |
| `request` | Global | `request.design_mode` (theme editor) |

## Useful Filters

- **Output safety / i18n:** `default`, `t` (translations from locales)
- **Money:** `money`, `money_without_trailing_zeros`
- **Assets:** `asset_url`, `asset_img_url`; use with `stylesheet_tag`, `script_tag`, `img_tag`
- **Images:** `image_url` (with width/height), `img_url` (legacy)
- **Strings:** `strip`, `truncate`, `split`, `join`
- **Arrays:** `first`, `last`, `size`, `where` (e.g. `product.images | where: 'alt', 'thumb'`)
- **HTML:** `escape`, `strip_html`

## JSON Templates

- `templates/*.json` define which sections appear on a template and in what order.
- Each key is a section type; value includes `"settings"` and optional `"blocks"`.
- Example: `templates/index.json` lists sections for the homepage (e.g. hero, featured collection, footer).

## Schema Setting Types

Common `"type"` values in `{% schema %}`: `text`, `textarea`, `html`, `checkbox`, `number`, `range`, `select`, `color`, `url`, `image_picker`, `font_picker`, `product`, `collection`, `video`, `richtext`.

Use `"default"` for initial values. Use `"info"` type for non-editable helper text in the theme editor.
