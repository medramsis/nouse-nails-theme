#!/usr/bin/env node

/**
 * Critical CSS Extractor for Shopify Theme
 *
 * Scans Liquid files for <link> tags with inline-css="true" and inlines the
 * CSS content directly in the same file — no global snippet, no every-page load.
 *
 * Each inline block is wrapped with reversible markers so the script is
 * idempotent (re-runs update CSS content) and --restore works cleanly.
 *
 * Usage:
 *   node scripts/extract-critical-css.js           # Inline CSS per-file (production)
 *   node scripts/extract-critical-css.js --restore # Restore <link> tags (development)
 */

const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

const cleanCSS = new CleanCSS({ level: 2 });

const LIQUID_DIRS = ['sections', 'templates', 'snippets', 'layout'];
const CRITICAL_CSS_SNIPPET = 'snippets/critical-css.liquid';

// Markers used to wrap generated <style> blocks — must stay in sync with restore logic
const BLOCK_START = '[CSS-INLINE';   // opened as: [CSS-INLINE: filename.css | <link ...>]
const BLOCK_END   = '[/CSS-INLINE]';

// ─────────────────────────────────────────────────────────────────────────────
// File discovery
// ─────────────────────────────────────────────────────────────────────────────

function findLiquidFiles(rootDir) {
  const files = [];
  for (const dir of LIQUID_DIRS) {
    const dirPath = path.join(rootDir, dir);
    if (!fs.existsSync(dirPath)) continue;
    for (const file of fs.readdirSync(dirPath, { recursive: true })) {
      if (typeof file === 'string' && file.endsWith('.liquid')) {
        files.push(path.join(dir, file));
      }
    }
  }
  return files;
}

// ─────────────────────────────────────────────────────────────────────────────
// Link-tag parsing helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Walk forward from startPos to find the closing > of a <link …> tag,
 * respecting quoted attribute values so an embedded > doesn't terminate early.
 * Returns the index just past the >, or -1 if the tag is unclosed.
 */
function findTagEnd(content, startPos) {
  let i = startPos;
  let inQuotes = false;
  let quoteChar = null;
  while (i < content.length) {
    const ch = content[i];
    if (!inQuotes && (ch === '"' || ch === "'")) {
      inQuotes = true; quoteChar = ch;
    } else if (inQuotes && ch === quoteChar) {
      inQuotes = false; quoteChar = null;
    } else if (!inQuotes && ch === '>') {
      return i + 1;
    }
    i++;
  }
  return -1;
}

/** Return the CSS asset filename referenced by a Liquid <link> tag, or null. */
function cssFilenameFromTag(tag) {
  const m = tag.replace(/\s+/g, ' ')
               .match(/\{\{\s*['"]([^'"]+\.css)['"]\s*\|\s*asset_url\s*\}\}/);
  return m ? m[1] : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Target discovery — finds everything that needs inlining in a Liquid file
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns an array of replacement targets sorted by ascending position:
 *
 *   { start, end, linkTag, cssFilename, kind }
 *
 * kind values:
 *   'block'    — existing {% comment %}[CSS-INLINE: …]{% endcomment %}<style>…</style>{% comment %}[/CSS-INLINE]{% endcomment %}
 *   'inlined'  — {% comment %}[INLINED]<link …>{% endcomment %}  (legacy comment wrapping)
 *   'plain'    — bare <link … inline-css="true"> tag
 */
function findTargets(content) {
  const targets = [];

  // 1. Existing per-file inline blocks from a previous run (idempotent updates)
  //    {% comment %}[CSS-INLINE: file.css | <link ...>]{% endcomment %}
  //    <style>...</style>
  //    {% comment %}[/CSS-INLINE]{% endcomment %}
  const blockRe = /\{%\s*comment\s*%\}\[CSS-INLINE:\s*[^\]|]+\|\s*(<link[\s\S]*?>)\s*\]\s*\{%\s*endcomment\s*%\}[\s\S]*?\{%\s*comment\s*%\}\[\/CSS-INLINE\]\s*\{%\s*endcomment\s*%\}/g;
  for (const m of content.matchAll(blockRe)) {
    const linkTag = m[1];
    const cssFilename = cssFilenameFromTag(linkTag);
    if (cssFilename) {
      targets.push({ start: m.index, end: m.index + m[0].length, linkTag, cssFilename, kind: 'block' });
    }
  }

  // Helper: check whether a position falls inside an already-found target
  const isInsideTarget = (pos) => targets.some(t => pos >= t.start && pos < t.end);

  // 2. Legacy {% comment %}[INLINED]<link …>{% endcomment %} pattern
  const inlinedRe = /\{%\s*comment\s*%\}\s*\[INLINED\](<link[\s\S]*?>)\s*\{%\s*endcomment\s*%\}/g;
  for (const m of content.matchAll(inlinedRe)) {
    if (isInsideTarget(m.index)) continue;
    const linkTag = m[1];
    const cssFilename = cssFilenameFromTag(linkTag);
    if (cssFilename) {
      targets.push({ start: m.index, end: m.index + m[0].length, linkTag, cssFilename, kind: 'inlined' });
    }
  }

  // 3. Plain <link … inline-css="true"> tags
  let pos = 0;
  while (pos < content.length) {
    const linkStart = content.indexOf('<link', pos);
    if (linkStart === -1) break;
    const linkEnd = findTagEnd(content, linkStart + 5);
    if (linkEnd === -1) break;
    const tag = content.substring(linkStart, linkEnd);
    if (/inline-css\s*=\s*["']?true["']?/i.test(tag) && !isInsideTarget(linkStart)) {
      const cssFilename = cssFilenameFromTag(tag);
      if (cssFilename) {
        targets.push({ start: linkStart, end: linkEnd, linkTag: tag, cssFilename, kind: 'plain' });
      }
    }
    pos = linkEnd;
  }

  return targets.sort((a, b) => a.start - b.start);
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS processing
// ─────────────────────────────────────────────────────────────────────────────

function readCSSFile(filename, rootDir) {
  try {
    return fs.readFileSync(path.join(rootDir, 'assets', filename), 'utf8');
  } catch (e) {
    console.warn(`  ⚠️  Could not read assets/${filename}: ${e.message}`);
    return '';
  }
}

/** Minify CSS: strip comments, collapse whitespace, optimise rules. */
function processCSS(css) {
  const result = cleanCSS.minify(css);
  if (result.errors && result.errors.length) {
    result.errors.forEach(e => console.warn(`  ⚠️  CSS minify error: ${e}`));
  }
  return result.styles || css.replace(/\/\*[\s\S]*?\*\//g, '').trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Block builder / parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wrap processed CSS in a reversible Liquid block.
 * The original <link> tag is stored in the opening marker so --restore can
 * reconstruct the exact tag without any guesswork.
 */
function buildInlineBlock(cssFilename, linkTag, cssContent) {
  const start = `{% comment %}[CSS-INLINE: ${cssFilename} | ${linkTag.trim()}]{% endcomment %}`;
  const end   = `{% comment %}[/CSS-INLINE]{% endcomment %}`;
  return `${start}\n<style>\n${cssContent}\n</style>\n${end}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main — inline CSS per-file
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  const rootDir = path.join(__dirname, '..');

  console.log('\n🚀 Critical CSS Extractor — per-file inline mode\n');
  console.log('📂 Scanning Liquid files...\n');

  const liquidFiles = findLiquidFiles(rootDir);
  console.log(`   ${liquidFiles.length} Liquid file(s) found\n`);

  let totalFilesUpdated = 0;
  let totalLinksInlined = 0;
  const cssFilesSeen = new Set();

  for (const relativePath of liquidFiles) {
    const filePath = path.join(rootDir, relativePath);
    let content;
    try { content = fs.readFileSync(filePath, 'utf8'); }
    catch (e) { console.warn(`⚠️  Could not read ${relativePath}: ${e.message}`); continue; }

    const targets = findTargets(content);
    if (targets.length === 0) continue;

    console.log(`📄 ${relativePath}`);

    // Apply replacements in reverse order to keep earlier offsets valid
    let modified = content;
    let fileChanged = false;

    for (let i = targets.length - 1; i >= 0; i--) {
      const { start, end, linkTag, cssFilename } = targets[i];

      const rawCSS = readCSSFile(cssFilename, rootDir);
      if (!rawCSS) { console.log(`   ⚠️  Skipped ${cssFilename} (empty/missing)`); continue; }

      const cssContent = processCSS(rawCSS);
      const block = buildInlineBlock(cssFilename, linkTag, cssContent);

      modified = modified.substring(0, start) + block + modified.substring(end);
      console.log(`   ✓  ${cssFilename}`);
      cssFilesSeen.add(cssFilename);
      totalLinksInlined++;
      fileChanged = true;
    }

    if (fileChanged && modified !== content) {
      try {
        fs.writeFileSync(filePath, modified, 'utf8');
        totalFilesUpdated++;
      } catch (e) {
        console.warn(`   ⚠️  Could not write ${relativePath}: ${e.message}`);
      }
    }
  }

  // Clear critical-css.liquid — CSS is now owned per-file
  clearCriticalCSSSnippet(rootDir);

  console.log(`\n✅ Inlined ${totalLinksInlined} CSS file(s) across ${totalFilesUpdated} Liquid file(s)`);
  console.log(`   Unique files: ${[...cssFilesSeen].sort().join(', ')}`);
  printTips();
}

// ─────────────────────────────────────────────────────────────────────────────
// Restore — remove inline blocks, put back <link> tags
// ─────────────────────────────────────────────────────────────────────────────

function runRestore() {
  const rootDir = path.join(__dirname, '..');

  console.log('\n🔄 Critical CSS Restore — development mode\n');
  console.log('📂 Removing inline CSS blocks and restoring <link> tags...\n');

  const liquidFiles = findLiquidFiles(rootDir);
  let totalRestored = 0;

  for (const relativePath of liquidFiles) {
    const filePath = path.join(rootDir, relativePath);
    let content;
    try { content = fs.readFileSync(filePath, 'utf8'); }
    catch (e) { continue; }

    const targets = findTargets(content);
    const restorable = targets.filter(t => t.kind === 'block' || t.kind === 'inlined');
    if (restorable.length === 0) continue;

    let modified = content;
    for (let i = restorable.length - 1; i >= 0; i--) {
      const { start, end, linkTag } = restorable[i];
      modified = modified.substring(0, start) + linkTag.trim() + modified.substring(end);
    }

    try {
      fs.writeFileSync(filePath, modified, 'utf8');
      console.log(`📝 ${relativePath}: restored ${restorable.length} link(s)`);
      totalRestored += restorable.length;
    } catch (e) {
      console.warn(`⚠️  Could not write ${relativePath}: ${e.message}`);
    }
  }

  clearCriticalCSSSnippet(rootDir);

  if (totalRestored > 0) {
    console.log(`\n✅ Restored ${totalRestored} <link> tag(s). Ready for development.\n`);
  } else {
    console.log('\n✓  No inline CSS blocks found — files already in development state.\n');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function clearCriticalCSSSnippet(rootDir) {
  const outputPath = path.join(rootDir, CRITICAL_CSS_SNIPPET);
  // Static content — no timestamp so repeated runs never produce a git diff.
  const desired = `{% comment %}
  critical-css.liquid is intentionally empty.
  CSS is inlined per-file by scripts/extract-critical-css.js.
  Run: npm run extract-critical-css
{% endcomment %}
`;
  try {
    const existing = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
    if (existing === desired) return; // already correct — skip write
    fs.writeFileSync(outputPath, desired, 'utf8');
    console.log(`\n📝 ${CRITICAL_CSS_SNIPPET}: cleared`);
  } catch (e) {
    console.warn(`⚠️  Could not clear ${CRITICAL_CSS_SNIPPET}: ${e.message}`);
  }
}

function printTips() {
  console.log('\n' + '─'.repeat(60));
  console.log('💡 Each CSS file is now inlined only where it is used.');
  console.log('   Re-run this script whenever a source CSS file changes.');
  console.log('   Use --restore to switch back to development mode.');
  console.log('─'.repeat(60) + '\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────────

if (require.main === module) {
  if (process.argv.includes('--restore')) {
    runRestore();
  } else {
    main();
  }
}

module.exports = { findLiquidFiles, findTargets, processCSS, buildInlineBlock };
