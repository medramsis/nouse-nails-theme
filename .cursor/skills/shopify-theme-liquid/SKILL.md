---
name: shopify-theme-liquid
description: Guides Shopify theme development with Liquid templating, section/snippet/template structure, schema conventions, and performance practices. Use when editing or creating Liquid files, sections, snippets, templates, theme architecture, or when the user mentions Shopify theme, Liquid, or storefront.
---

# Shopify Theme Liquid

## When to Use This Skill

Apply when working with:
- `.liquid` files (sections, snippets, templates, layout)
- Theme structure (where to put new sections/snippets)
- Section schemas and settings
- Liquid logic, filters, and object access
- Theme performance (queries, pagination, assets)

## Theme File Structure

| Purpose | Location | Use for |
|--------|----------|---------|
| Sections | `sections/*.liquid` | Reusable, schema-driven blocks (header, product, hero) |
| Snippets | `snippets/*.liquid` | Small reusable fragments (icons, cards, form fields) |
| Templates | `templates/*.liquid` or `templates/*.json` | Page structure; JSON = section list |
| Layout | `layout/theme.liquid` | HTML shell, head, body |
| Assets | `assets/*` | CSS, JS, images (reference with `asset_url`) |
| Config | `config/settings_schema.json`, `settings_data.json` | Theme settings |
| Locales | `locales/*.json` | Translations; use `t` filter in Liquid |

**Rule:** Prefer sections for anything that needs customizer settings or to be reordered. Use snippets for repeated markup without their own schema.

## Liquid Conventions

**Output and null safety:**
```liquid
{{ product.title | default: 'No title' }}
{{ section.settings.heading | default: 'Heading' }}
```

**Multi-line logic:** Prefer `{% liquid %}` for readability:
```liquid
{% liquid
  if product.available
    assign button_text = 'Add to cart'
  else
    assign button_text = 'Sold out'
  endif
%}
```

**Comments:** Use `{% comment %} ... {% endcomment %}` for block docs; keep them short.

**Naming:** Follow Shopify handles (lowercase, hyphens): `featured-collection`, `product-card`.

## Section Schema

- Every section that is configurable must have a `{% schema %}` block (JSON).
- Use semantic setting names and `"type"` (text, checkbox, color, range, etc.).
- Group related settings in schema for clearer customizer UX.

```liquid
{% schema %}
{
  "name": "Featured collection",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Featured"
    }
  ],
  "presets": [{ "name": "Featured collection" }]
}
{% endschema %}
```

## Performance

- Minimize loops and repeated logic; avoid unnecessary `all_products` or broad collection queries.
- Use `{% paginate %}` for large collections (e.g. `paginate collection.products by 24`).
- Images: `loading="lazy"`, appropriate `width`/`height` or `sizes`.
- Assets: always use filters so they go through the CDN: `{{ 'base.css' | asset_url | stylesheet_tag }}`, `{{ 'theme.js' | asset_url | script_tag }}`.

## File and Code Organization

- Keep sections modular and single-purpose; reuse via snippets when markup is shared.
- Descriptive filenames, Shopify-style: `product-template.liquid`, `cart-drawer.liquid`.
- Separate logic (Liquid) from presentation (HTML/CSS structure); keep schema aligned with the section's purpose.

## Cross-References in This Project

- **CSS:** Check `assets/base.css` before adding new utilities or variables. Use BEM and the project's section comment style (see project rules).
- **JS:** Use Shopify's AJAX patterns for cart; modern ES6+; handle errors on API calls.
- **Project rules:** Follow `.cursor/rules/shopify-rules.mdc` for security, sanitization, and workflow details.

## Additional Resources

- For Liquid filters and objects, see [reference.md](reference.md).

## Quick Checklist for New Sections

- [ ] File in `sections/` with a clear name
- [ ] Null-safe output for dynamic content
- [ ] `{% schema %}` with name, settings, and preset
- [ ] No heavy or unbounded queries; paginate if listing many items
- [ ] Assets loaded via `asset_url` (and appropriate tag filters)
- [ ] `{% comment %}` where it helps future maintainers
