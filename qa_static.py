#!/usr/bin/env python3
"""Static production checks for WishingASR. No browser or network required."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
VERSION = '45'
ROUTES = {
    '/create': '/index.html', '/quotes': '/quotes.html',
    '/national-days': '/national-days.html', '/blog': '/blog.html',
    '/tools': '/tools.html', '/about': '/about.html',
    '/contact': '/contact.html', '/privacy': '/privacy.html',
    '/terms': '/terms.html',
}

class HTMLAudit(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.refs, self.tags = [], [], []
        self.controls, self.labels, self.images, self.anchors = [], [], [], []
        self.main_ids, self.skip_targets = [], []
        self.h1_count = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags.append((tag, a))
        if a.get('id'): self.ids.append(a['id'])
        if tag == 'main': self.main_ids.append(a.get('id'))
        if tag == 'h1': self.h1_count += 1
        if tag == 'label': self.labels.append(a.get('for'))
        if tag in ('input', 'select', 'textarea') and a.get('type') not in ('hidden','submit','button','image'):
            self.controls.append(a)
        if tag == 'img': self.images.append(a)
        if tag == 'a': self.anchors.append(a)
        if tag == 'a' and 'skip-link' in a.get('class','').split():
            self.skip_targets.append(a.get('href','').lstrip('#'))
        for key in ('href','src'):
            value = a.get(key, '')
            if value and not value.startswith(('http:','https:','mailto:','tel:','data:','#','javascript:')):
                self.refs.append((key, value))

errors = []
html_files = sorted(p for p in ROOT.glob('*.html') if p.name != '404.html')
for path in sorted(ROOT.glob('*.html')):
    audit = HTMLAudit()
    try:
        audit.feed(path.read_text(encoding='utf-8'))
    except Exception as exc:
        errors.append(f'{path.name}: HTML parse failed: {exc}')
        continue
    duplicates = [key for key, count in Counter(audit.ids).items() if count > 1]
    if duplicates: errors.append(f'{path.name}: duplicate IDs {duplicates}')
    if len(audit.main_ids) != 1 or not audit.main_ids[0]:
        errors.append(f'{path.name}: expected exactly one main landmark with an ID')
    if audit.h1_count != 1: errors.append(f'{path.name}: expected one H1, found {audit.h1_count}')
    if audit.skip_targets and audit.skip_targets[0] not in audit.ids:
        errors.append(f'{path.name}: skip link target does not exist')
    for control in audit.controls:
        control_id = control.get('id')
        labelled = bool(control_id and control_id in audit.labels)
        if not labelled and not control.get('aria-label') and not control.get('aria-labelledby'):
            errors.append(f'{path.name}: unlabelled {control.get("type", control.get("name", "form"))} control #{control_id or "(no id)"}')
    for image in audit.images:
        if image.get('alt') is None: errors.append(f'{path.name}: image missing alt text: {image.get("src")}')
    for anchor in audit.anchors:
        if anchor.get('target') == '_blank' and not {'noopener','noreferrer'}.intersection((anchor.get('rel') or '').split()):
            errors.append(f'{path.name}: target=_blank link missing noopener/noreferrer: {anchor.get("href")}')
    for key, value in audit.refs:
        target = value.split('?')[0].split('#')[0].lstrip('/')
        if not target: continue
        if target in {route.lstrip('/') for route in ROUTES}: continue
        if not (ROOT / target).exists(): errors.append(f'{path.name}: missing {key} target {value}')
    text = path.read_text(encoding='utf-8')
    for required in ('name="description"', 'rel="canonical"', 'property="og:image"', 'name="twitter:image"'):
        if required not in text: errors.append(f'{path.name}: missing {required}')
    if len(re.findall(r'<meta[^>]+name=["\']twitter:card', text, re.I)) != 1:
        errors.append(f'{path.name}: expected exactly one twitter:card declaration')

# JavaScript syntax and deterministic tools runtime regression suite.
for script in ('app.js','tools.js','qa_canvas_layout.cjs','qa_tools_runtime.cjs'):
    if script.endswith('.js'):
        result = subprocess.run(['node','--check',str(ROOT/script)],capture_output=True,text=True)
        if result.returncode: errors.append(f'{script}: syntax error: {result.stderr.strip()}')
for script in ('qa_canvas_layout.cjs','qa_tools_runtime.cjs','qa_calendar_runtime.cjs'):
    result = subprocess.run(['node',str(ROOT/script)],capture_output=True,text=True)
    if result.returncode: errors.append(f'{script}: failed: {result.stderr.strip()}')

try:
    config = json.loads((ROOT/'vercel.json').read_text(encoding='utf-8'))
    vercel_routes = {item.get('source'):item.get('destination') for item in config.get('rewrites',[])}
    preview = (ROOT/'run_local_preview.py').read_text(encoding='utf-8')
    for route, destination in ROUTES.items():
        if vercel_routes.get(route) != destination: errors.append(f'vercel.json: route mismatch {route} -> {destination}')
        if f"'{route}': '{destination}'" not in preview: errors.append(f'preview server: missing route {route} -> {destination}')
    header_items = {(h.get('key'),h.get('value')) for entry in config.get('headers',[]) for h in entry.get('headers',[])}
    for required in [
        ('X-Content-Type-Options','nosniff'), ('X-Frame-Options','DENY'),
        ('Referrer-Policy','strict-origin-when-cross-origin'),
        ('Strict-Transport-Security','max-age=31536000'),
    ]:
        if required not in header_items: errors.append(f'vercel.json: missing security header {required[0]}')
    for script in ('/styles.css','/app.js','/tools.js'):
        if not any(entry.get('source') == script for entry in config.get('headers',[])):
            errors.append(f'vercel.json: missing immutable cache rule for {script}')
except Exception as exc:
    errors.append(f'vercel.json/routes: {exc}')

try:
    ET.parse(ROOT/'sitemap.xml')
except Exception as exc:
    errors.append(f'sitemap.xml: {exc}')
versions = []
for path in html_files:
    versions += re.findall(r'(?:styles\.css|app\.js|tools\.js)\?v=(\d+)', path.read_text(encoding='utf-8'))
if versions and set(versions) != {VERSION}:
    errors.append(f'asset cache versions differ: {sorted(set(versions))}')
if not (ROOT/'assets/social-preview.jpg').exists(): errors.append('missing assets/social-preview.jpg')
else:
    if (ROOT/'assets/social-preview.jpg').stat().st_size > 300_000:
        errors.append('social preview image exceeds 300 KB')

# Critical calendar dates are tracked explicitly as known regression checks.
app = (ROOT/'app.js').read_text(encoding='utf-8')
for marker in [
    "date:'2027-08-25'",  # Janmashtami
    "date:'2027-09-04'",  # Ganesh Chaturthi
    "date:'2027-09-30'",  # Sharad Navratri
    "date:'2027-10-09'",  # Dussehra
    "date:'2027-01-15'",  # Pongal / Makara Sankranti
]:
    if marker not in app: errors.append(f'app.js: missing corrected calendar date {marker}')


for marker in [
    'id="calendarSelection"',
    'function renderCalendarSelection(',
    'data-calendar-create=',
    'data-calendar-explore',
    'aria-pressed=',
    'const changeCalendarMonth=',
]:
    if marker not in (app + (ROOT/'index.html').read_text(encoding='utf-8')):
        errors.append(f'calendar: missing interaction feature {marker}')

# Regressions fixed in the tools interface.
tools = (ROOT/'tools.js').read_text(encoding='utf-8')
for marker in ["invitationReady", "captionReady", "Array.isArray(value)", "document.execCommand('copy')===true"]:
    if marker not in tools: errors.append(f'tools.js: missing regression protection {marker}')

if errors:
    print('FAIL')
    print('\n'.join(f'- {item}' for item in errors))
    sys.exit(1)
print('PASS: HTML semantics/accessibility, labels and links, SEO/social metadata, JS syntax, canvas QA, tools runtime regressions, calendar date-selection runtime, sitemap, Vercel routes/security/cache rules.')
