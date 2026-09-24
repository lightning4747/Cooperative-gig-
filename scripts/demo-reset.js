#!/usr/bin/env node

const http = require('http');

const token = process.env.DEMO_RESET_TOKEN || 'cooperative-demo-reset-2026';
const host = process.env.DEMO_HOST || 'localhost';
const port = parseInt(process.env.DEMO_PORT || '8080', 10);

console.log(`[demo:reset] Connecting to http://${host}:${port}/api/demo/reset...`);

const options = {
  hostname: host,
  port: port,
  path: '/api/demo/reset',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Demo-Reset-Token': token
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Demo reset succeeded! Baseline data restored:');
      try {
        const json = JSON.parse(body);
        console.log(JSON.stringify(json.stats || json, null, 2));
      } catch {
        console.log(body);
      }
      process.exit(0);
    } else {
      console.error(`❌ Demo reset failed with HTTP ${res.statusCode}:`);
      console.error(body);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error(`❌ Network error connecting to backend on http://${host}:${port}:`, err.message);
  console.error('Make sure the backend is running (e.g. on port 8080).');
  process.exit(1);
});

req.end();
