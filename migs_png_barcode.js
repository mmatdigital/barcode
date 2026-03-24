-- Update after creating new worker to convert --

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Only handle /barcode path
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
      // Forward to barcode-png-app
      const upstreamUrl = new URL('https://barcode-png-app.dahamilton.workers.dev/');
      upstreamUrl.searchParams.set('id', id);

      const resp = await fetch(upstreamUrl);

      // If upstream fails, return 500
      if (!resp.ok) {
        return new Response('Error generating barcode', {
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      // Stream PNG back
      return new Response(resp.body, {
        status: 200,
        headers: { 'Content-Type': 'image/png' }
      });
    } catch (err) {
      return new Response('Error generating barcode: ' + (err.message || err), {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};
