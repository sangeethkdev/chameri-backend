/**
 * Minimal dependency-free HTML sanitizer for rich-text fields authored in the
 * admin dashboard (e.g. About → Story description).
 *
 * Only the tags/attributes below survive; everything else is unwrapped or
 * dropped, so whatever reaches the public site is safe to render with
 * `dangerouslySetInnerHTML`.
 */

// tag name -> allowed attributes
const ALLOWED_TAGS = {
  p: [],
  br: [],
  strong: [],
  b: [],
  em: [],
  i: [],
  u: [],
  s: [],
  strike: [],
  sub: [],
  sup: [],
  ul: [],
  ol: [],
  li: [],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  h5: [],
  h6: [],
  blockquote: [],
  span: [],
  div: [],
  a: ["href", "target", "rel"],
};

// Tags whose *contents* are thrown away along with the tag itself.
const DANGEROUS_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "noscript",
  "template",
  "svg",
  "math",
  "link",
  "meta",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
];

const VOID_TAGS = new Set(["br"]);

// name="value" | name='value' | name=value | name
const ATTR_RE =
  /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

// A tag: <name attrs> or </name>. Attribute chunk is quote-aware so a ">"
// inside an attribute value does not terminate the match early.
const TAG_RE = /<\s*(\/)?\s*([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>])*)>/g;

const isSafeHref = (value) => {
  // Strip HTML entities & whitespace that could hide "javascript:".
  const normalized = String(value)
    .replace(/&#(\d+);?/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);?/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .split("")
    .filter((ch) => ch.charCodeAt(0) > 32)
    .join("")
    .toLowerCase();

  if (/^(javascript|vbscript|data|file):/.test(normalized)) return false;
  return true;
};

const sanitizeAttributes = (tagName, rawAttrs) => {
  const allowed = ALLOWED_TAGS[tagName];
  if (!allowed || allowed.length === 0) return "";

  const kept = [];
  let match;
  ATTR_RE.lastIndex = 0;
  while ((match = ATTR_RE.exec(rawAttrs)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";

    if (!allowed.includes(name)) continue;
    if (name === "href" && !isSafeHref(value)) continue;

    kept.push(`${name}="${String(value).replace(/"/g, "&quot;")}"`);
  }

  // Every surviving link opens safely.
  if (tagName === "a" && kept.some((a) => a.startsWith("href="))) {
    if (!kept.some((a) => a.startsWith("target="))) kept.push('target="_blank"');
    const relIndex = kept.findIndex((a) => a.startsWith("rel="));
    if (relIndex === -1) kept.push('rel="noopener noreferrer"');
    else kept[relIndex] = 'rel="noopener noreferrer"';
  }

  return kept.length ? ` ${kept.join(" ")}` : "";
};

/**
 * Sanitize an HTML string coming from the rich-text editor.
 * Plain text (no tags) passes through untouched.
 *
 * @param {string} html
 * @returns {string}
 */
const sanitizeHtml = (html) => {
  if (html === undefined || html === null) return "";
  let out = String(html);

  // Comments (including conditional comments) — content and all.
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  out = out.replace(/<![\s\S]*?>/g, "");

  // Dangerous elements — drop the element *and* its content.
  for (const tag of DANGEROUS_TAGS) {
    out = out.replace(
      new RegExp(`<\\s*${tag}\\b[\\s\\S]*?<\\s*\\/\\s*${tag}\\s*>`, "gi"),
      ""
    );
    out = out.replace(new RegExp(`<\\s*\\/?\\s*${tag}\\b[^>]*>`, "gi"), "");
  }

  // Everything else: keep allowed tags with allowed attributes, unwrap the rest.
  out = out.replace(TAG_RE, (full, closing, name, rawAttrs) => {
    const tagName = name.toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(ALLOWED_TAGS, tagName)) return "";
    if (closing) return VOID_TAGS.has(tagName) ? "" : `</${tagName}>`;
    if (VOID_TAGS.has(tagName)) return `<${tagName}>`;
    return `<${tagName}${sanitizeAttributes(tagName, rawAttrs)}>`;
  });

  // A lone empty paragraph is what contentEditable leaves behind when the
  // author clears the field — treat it as empty.
  if (/^(\s|&nbsp;|<p>\s*(<br>)?\s*<\/p>|<br>|<div>\s*<\/div>)*$/i.test(out)) {
    return "";
  }

  return out.trim();
};

module.exports = { sanitizeHtml };
