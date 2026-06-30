const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

const VOID_TAGS = new Set(["br"]);
const RICH_TEXT_ALLOWED_TAGS = new Set([
  "a",
  "b",
  "br",
  "code",
  "em",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "ul",
]);

const RICH_TEXT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "rel", "target", "title"],
  code: ["class"],
  pre: ["class"],
  span: ["class"],
};

interface SanitizeHtmlOptions {
  allowedTags: Set<string>;
  allowedAttributes?: Record<string, string[]>;
  escapeDisallowedTags?: boolean;
  transformLinks?: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeClassName(value: string): string | undefined {
  const classes = value.split(/\s+/).filter((className) => /^[a-zA-Z0-9_-]+$/.test(className));
  return classes.length > 0 ? classes.join(" ") : undefined;
}

function sanitizeUrl(value: string): string | undefined {
  const trimmedValue = value.trim();

  if (trimmedValue.startsWith("#") || trimmedValue.startsWith("/")) {
    return trimmedValue;
  }

  try {
    const parsedUrl = new URL(trimmedValue, window.location.origin);
    return ["http:", "https:", "mailto:", "tel:"].includes(parsedUrl.protocol) ? trimmedValue : undefined;
  } catch {
    return undefined;
  }
}

function sanitizeAttribute(tagName: string, attribute: Attr): [string, string] | undefined {
  const name = attribute.name.toLowerCase();
  const value = attribute.value;

  if (name.startsWith("on") || name === "style") {
    return undefined;
  }

  if (name === "class") {
    const className = sanitizeClassName(value);
    return className ? [name, className] : undefined;
  }

  if (tagName === "a" && name === "href") {
    const href = sanitizeUrl(value);
    return href ? [name, href] : undefined;
  }

  if (tagName === "a" && name === "target") {
    return value === "_blank" ? [name, value] : undefined;
  }

  return [name, value];
}

function sanitizeNode(node: ChildNode, options: SanitizeHtmlOptions): string {
  if (node.nodeType === TEXT_NODE) {
    return escapeHtml(node.textContent ?? "");
  }

  if (node.nodeType !== ELEMENT_NODE) {
    return "";
  }

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();

  if (!options.allowedTags.has(tagName)) {
    return options.escapeDisallowedTags
      ? escapeHtml(element.outerHTML)
      : Array.from(element.childNodes)
          .map((childNode) => sanitizeNode(childNode, options))
          .join("");
  }

  const allowedAttributes = new Set(options.allowedAttributes?.[tagName] ?? []);
  const attributes = Array.from(element.attributes).reduce<Record<string, string>>((safeAttributes, attribute) => {
    if (!allowedAttributes.has(attribute.name.toLowerCase())) {
      return safeAttributes;
    }

    const sanitizedAttribute = sanitizeAttribute(tagName, attribute);
    if (sanitizedAttribute) {
      const [name, value] = sanitizedAttribute;
      safeAttributes[name] = value;
    }
    return safeAttributes;
  }, {});

  if (options.transformLinks && tagName === "a") {
    attributes.target = "_blank";
    attributes.rel = "noopener noreferrer";
  }

  const serializedAttributes = Object.entries(attributes)
    .map(([name, value]) => ` ${name}="${escapeHtml(value)}"`)
    .join("");

  if (VOID_TAGS.has(tagName)) {
    return `<${tagName}${serializedAttributes}>`;
  }

  const children = Array.from(element.childNodes)
    .map((childNode) => sanitizeNode(childNode, options))
    .join("");

  return `<${tagName}${serializedAttributes}>${children}</${tagName}>`;
}

function sanitizeHtmlFragment(html: string, options: SanitizeHtmlOptions): string {
  if (typeof document === "undefined") {
    return escapeHtml(html);
  }

  const template = document.createElement("template");
  template.innerHTML = html;

  return Array.from(template.content.childNodes)
    .map((node) => sanitizeNode(node, options))
    .join("");
}

export function sanitizeRichHtml(html: string): string {
  return sanitizeHtmlFragment(html, {
    allowedTags: RICH_TEXT_ALLOWED_TAGS,
    allowedAttributes: RICH_TEXT_ALLOWED_ATTRIBUTES,
    transformLinks: true,
  });
}

export function sanitizeAnsiHtml(html: string): string {
  return sanitizeHtmlFragment(html, {
    allowedTags: new Set(["span"]),
    allowedAttributes: {
      span: ["class"],
    },
    escapeDisallowedTags: true,
  });
}
