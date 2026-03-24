export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        }
      });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    if (url.pathname !== '/barcode') {
      return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
    }

    const id = url.searchParams.get('id');
    if (!id) {
      return new Response('Missing required query parameter: id', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    try {
      const upstreamUrl = new URL('https://barcode-png-app.dahamilton.workers.dev/');
      upstreamUrl.searchParams.set('id', id);
      const resp = await fetch(upstreamUrl);

      if (!resp.ok) {
        return new Response('Error generating barcode', {
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      return new Response(resp.body, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=86400',
        }
      });
    } catch (err) {
      return new Response('Error generating barcode: ' + (err.message || err), {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};
