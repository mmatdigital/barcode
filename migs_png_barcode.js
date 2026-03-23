import bwipjs from 'bwip-js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Only handle /barcode path
    if (url.pathname !== '/barcode') {
      return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
    }

    const id = url.searchParams.get('id');

    if (!id) {
      return new Response('Missing required query parameter: id', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    try {
      // bwip-js in Workers with nodejs_compat can generate Buffers
      const png = await bwipjs.toBuffer({
        bcid: 'code128',
        text: id,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: 'center',
      });

      // Convert Node Buffer to Uint8Array (Workers `Response` accepts ArrayBuffer/TypedArray)
      const bytes = png instanceof Uint8Array ? png : new Uint8Array(png);

      return new Response(bytes, {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      });
    } catch (err) {
  console.error('Error generating barcode:', err);
  return new Response('Error generating barcode: ' + (err.message || err), {
    status: 500,
    headers: { 'Content-Type': 'text/plain' },
  });
}

  },
};
