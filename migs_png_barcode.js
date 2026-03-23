const bwipjs = require('bwip-js');
const http = require('http');
const { URL } = require('url');
 
const PORT = 3000;
 
const server = http.createServer((req, res) => {
const { pathname, searchParams } = new URL(req.url, `http://localhost:${PORT}`);
 
if (pathname !== '/barcode') {
res.writeHead(404, { 'Content-Type': 'text/plain' });
return res.end('Not found');
}
 
const id = searchParams.get('id');
 
if (!id) {
res.writeHead(400, { 'Content-Type': 'text/plain' });
return res.end('Missing required query parameter: id');
}
 
bwipjs.toBuffer({
bcid: 'code128',
text: id,
scale: 3,
height: 10,
includetext: true,
textxalign: 'center',
}, (err, png) => {
if (err) {
res.writeHead(500, { 'Content-Type': 'text/plain' });
return res.end('Error generating barcode');
}
 
res.writeHead(200, { 'Content-Type': 'image/png' });
res.end(png);
});
});
 
server.listen(PORT, () => {
console.log(`Barcode server running at http://localhost:${PORT}`);
console.log(`Example: http://localhost:${PORT}/barcode?id=123456789`);
});
