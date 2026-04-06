// Shim: simple-xml-to-json is CJS with no default export, but
// @blocksuite/blocks uses `import c from 'simple-xml-to-json'`.
// Re-export with a synthetic default.
import mod from "simple-xml-to-json/lib/simpleXmlToJson.min.js";
export default mod;
export const convertXML = mod.convertXML;
