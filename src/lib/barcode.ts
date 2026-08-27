import "server-only";
// Explicit /node subpath — the package's default export condition resolves
// to its browser build under this project's bundler-style moduleResolution,
// which doesn't have the Buffer-returning toBuffer() this file needs.
import bwipjs from "bwip-js/node";

/**
 * Renders a Code 128 barcode for the given SKU/barcode string as a
 * "data:image/png;base64,..." URI — small enough to embed directly in a
 * server-rendered label page with no separate image request, and no
 * client-side barcode library needed just to display one.
 */
export async function generateBarcodeDataUri(code: string): Promise<string> {
  const png = await bwipjs.toBuffer({
    bcid: "code128",
    text: code,
    scale: 3,
    height: 12,
    includetext: true,
    textxalign: "center",
  });
  return `data:image/png;base64,${png.toString("base64")}`;
}
