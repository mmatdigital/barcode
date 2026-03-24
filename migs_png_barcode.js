import { Buffer } from 'node:buffer';
const bwipjs = require('bwip-js');

// We'll dynamically load the WASM helper via a script tag or CDN in a Worker context.
// This is a common pattern for browser/CDN‑based WASM; you can adapt it for Workers.

// In practice, you can use a CDN‑hosted JS/WASM combo like svg2png‑wasm,
// but for pure Worker deployment, the easiest way is to let the Worker build
// install a WASM‑based npm package automatically (via package.json).
//
// However, *without* Node.js, you need a pre‑bundled JS file that contains both
// the WASM and the JS wrapper, which you host somewhere Workers can fetch.
//
// Option explored below:
//
// 1. Host a pre‑built JS file that exposes `svgToPng(svgString) → Uint8Array`
// 2. In your Worker:
//    - Import that JS directly (as a script or via `import()`).
//    - Call `svgToPng` on the SVG from bwip-js.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname !== '/barcode') {
      return new Response('Not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const id = url.searchParams.get('id');

    if (!id) {
      return new Response('Missing required query parameter: id', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    try {
      // 1. Generate SVG using bwip-js
      const svg = bwipjs.toSVG({
        bcid: 'code128',
        text: id,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: 'center',
      });

      // 2. Call a WASM helper that returns PNG bytes.
      // Because you can’t run `npm install` locally, you need:
      // - a URL to a JS file that exposes `svgToPng` (e.g., hosted on CF Pages, S3, etc.)
      // - that JS file bundles the WASM module.

      // Example simplified:
      // const { svgToPng } = await fetch('https://your-cdn.com/svg2png-worker.js').then(r => r.json());
      // const pngBytes = svgToPng(svg);

      // 3. Turn into Uint8Array
      const bytes = pngBytes instanceof Uint8Array
        ? pngBytes
        : new Uint8Array(pngBytes);

      // 4. Return PNG
      return new Response(bytes, {
        status: 200,
        headers: { 'Content-Type': 'image/png' }
      });
    } catch (err) {
      console.error('Error generating barcode PNG:', err);
      return new Response(
        'Error generating barcode: ' + (err.message || err),
        {
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        }
      );
    }
  }
};
