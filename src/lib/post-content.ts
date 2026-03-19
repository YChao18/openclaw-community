import sanitizeHtml from "sanitize-html";

export const POST_RICH_CONTENT_PREFIX = "<!--claw-pond:rich-content-->";

const RICH_CONTENT_ALLOWED_TAGS = ["br", "em", "img", "p", "strong"];
const RICH_CONTENT_ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] =
  {
    img: ["alt", "src", "title"],
  };

const RICH_CONTENT_ALLOWED_SCHEMES = ["http", "https"];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getSanitizedRichHtml(html: string) {
  return sanitizeHtml(html, {
    allowedAttributes: RICH_CONTENT_ALLOWED_ATTRIBUTES,
    allowedSchemes: RICH_CONTENT_ALLOWED_SCHEMES,
    allowedTags: RICH_CONTENT_ALLOWED_TAGS,
    disallowedTagsMode: "discard",
  }).trim();
}

export function isRichPostContent(content: string) {
  return content.startsWith(POST_RICH_CONTENT_PREFIX);
}

export function normalizeRichPostContentForStorage(html: string) {
  const sanitized = getSanitizedRichHtml(html);
  return `${POST_RICH_CONTENT_PREFIX}${sanitized}`;
}

export function normalizePostContentForStorage(content: string) {
  if (!isRichPostContent(content)) {
    return content.trim();
  }

  return normalizeRichPostContentForStorage(
    content.slice(POST_RICH_CONTENT_PREFIX.length),
  );
}

export function getPostPlainTextContent(content: string) {
  if (!isRichPostContent(content)) {
    return content.replace(/\s+/g, " ").trim();
  }

  return sanitizeHtml(content.slice(POST_RICH_CONTENT_PREFIX.length), {
    allowedAttributes: {},
    allowedTags: [],
  })
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function postContentHasInlineImage(content: string) {
  if (!isRichPostContent(content)) {
    return false;
  }

  return /<img\b/i.test(
    getSanitizedRichHtml(content.slice(POST_RICH_CONTENT_PREFIX.length)),
  );
}

export function getRenderablePostContent(content: string) {
  if (!isRichPostContent(content)) {
    return null;
  }

  return getSanitizedRichHtml(content.slice(POST_RICH_CONTENT_PREFIX.length));
}

export function getEditorPostContent(content: string) {
  if (isRichPostContent(content)) {
    return getSanitizedRichHtml(content.slice(POST_RICH_CONTENT_PREFIX.length));
  }

  const trimmed = content.trim();

  if (!trimmed) {
    return "<p></p>";
  }

  return (
    trimmed
      .split(/\n{2,}/)
      .map(
        (paragraph) =>
          `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`,
      )
      .join("") || "<p></p>"
  );
}
