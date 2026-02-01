const http = require('http');
const data = JSON.stringify({ email: 'admin@example.com', password: 'password123' });
const opts = {
  hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
};
const req = http.request(opts, res => {
  console.log('status', res.statusCode);
  let bufs = [];
  res.on('data', c => bufs.push(c));
  res.on('end', () => {
    const body = Buffer.concat(bufs).toString();
    console.log('body:', body);
  });
});
req.on('error', e => console.error('req err', e));
req.write(data);
req.end();
