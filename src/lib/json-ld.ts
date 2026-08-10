// JSON-LD blocks are injected via dangerouslySetInnerHTML — safe when the
// data is fixed strings, but several of these now embed admin-editable
// content (product name/description, site name, social URLs). A stray
// "</script>" in any of those would close the tag early and let whatever
// follows execute as real JS for every visitor. JSON.stringify does not
// escape "<", so the escaping has to happen here explicitly. U+2028/U+2029
// are also escaped since they're valid in JSON strings but illegal in JS,
// which historically made some JSON-LD payloads throw as inline scripts.
//
// Built from explicit char codes (not literal characters in source) so
// there's no ambiguity about what's actually being matched/replaced.
const LT = String.fromCharCode(0x3c); // "<"
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

export function jsonLdScriptProps(data: unknown) {
  const json = JSON.stringify(data)
    .split(LT)
    .join("\\u003c")
    .split(LINE_SEPARATOR)
    .join("\\u2028")
    .split(PARAGRAPH_SEPARATOR)
    .join("\\u2029");
  return { dangerouslySetInnerHTML: { __html: json } };
}
