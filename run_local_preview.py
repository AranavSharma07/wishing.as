#!/usr/bin/env python3
"""Serve WishingASR locally on a free port for preview/testing."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
import socket

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)

class Handler(SimpleHTTPRequestHandler):
    ROUTES = {'/create': '/index.html', '/quotes': '/quotes.html', '/national-days': '/national-days.html', '/blog': '/blog.html', '/tools': '/tools.html', '/about': '/about.html', '/contact': '/contact.html', '/privacy': '/privacy.html', '/terms': '/terms.html', '/aa-group': '/aa-group.html', '/diwali-wishes': '/diwali-wishes.html', '/birthday-wishes': '/birthday-wishes.html', '/christmas-wishes': '/christmas-wishes.html', '/holi-wishes': '/holi-wishes.html', '/eid-wishes': '/eid-wishes.html', '/wedding-wishes': '/wedding-wishes.html', '/anniversary-wishes': '/anniversary-wishes.html', '/raksha-bandhan-wishes': '/raksha-bandhan-wishes.html', '/good-morning-wishes': '/good-morning-wishes.html', '/good-night-wishes': '/good-night-wishes.html', '/love-messages': '/love-messages.html', '/chhath-puja-wishes': '/chhath-puja-wishes.html', '/new-year-wishes': '/new-year-wishes.html', '/whatsapp-status-captions': '/whatsapp-status-captions.html', '/birthday-wishes-hindi': '/birthday-wishes-hindi.html', '/birthday-wishes-english': '/birthday-wishes-english.html', '/hindi-wishes': '/hindi-wishes.html', '/english-wishes': '/english-wishes.html', '/hinglish-wishes': '/hinglish-wishes.html'}

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
print(f'WishingASR Responsive Preview v65: http://127.0.0.1:{server.server_port}/')
print('Keep this window open. Press Ctrl+C to stop.')
try:
    server.serve_forever()
except KeyboardInterrupt:
    print('\nPreview stopped.')
finally:
    server.server_close()
