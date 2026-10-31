#!/usr/bin/env python3
"""Serve WishingASR locally on a free port for preview/testing."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
import socket

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)

class Handler(SimpleHTTPRequestHandler):
    ROUTES = {'/create': '/index.html', '/quotes': '/quotes.html', '/national-days': '/national-days.html', '/blog': '/blog.html', '/tools': '/tools.html', '/about': '/about.html', '/contact': '/contact.html', '/privacy': '/privacy.html', '/terms': '/terms.html'}

    def _rewrite_friendly_route(self):
        from urllib.parse import urlsplit
        parsed = urlsplit(self.path)
        target = self.ROUTES.get(parsed.path.rstrip('/') or '/')
        if target:
            self.path = target + (('?' + parsed.query) if parsed.query else '')

    def do_GET(self):
        self._rewrite_friendly_route()
        return super().do_GET()

    def do_HEAD(self):
        self._rewrite_friendly_route()
        return super().do_HEAD()

    def log_message(self, fmt, *args):
        print('[preview] ' + (fmt % args))

server = None
for port in list(range(8787, 8800)) + [0]:
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), Handler)
        break
    except OSError:
        continue
if server is None:
    raise SystemExit('Could not open a local preview port. Close other local servers and retry.')
print(f'WishingASR Responsive Preview v43: http://127.0.0.1:{server.server_port}/')
print('Keep this window open. Press Ctrl+C to stop.')
try:
    server.serve_forever()
except KeyboardInterrupt:
    print('\nPreview stopped.')
finally:
    server.server_close()
