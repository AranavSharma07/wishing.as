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
VERSION = '55'
ROUTES = {
    '/create': '/index.html', '/quotes': '/quotes.html',
    '/national-days': '/national-days.html', '/blog': '/blog.html',
    '/tools': '/tools.html', '/about': '/about.html',
    '/contact': '/contact.html', '/privacy': '/privacy.html',
    '/terms': '/terms.html',
'/diwali-wishes': '/diwali-wishes.html',
'/birthday-wishes': '/birthday-wishes.html',
'/christmas-wishes': '/christmas-wishes.html',
'/holi-wishes': '/holi-wishes.html',
'/eid-wishes': '/eid-wishes.html',
'/wedding-wishes': '/wedding-wishes.html',
'/anniversary-wishes': '/anniversary-wishes.html',
'/raksha-bandhan-wishes': '/raksha-bandhan-wishes.html'
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
for script in ('app.js','tools.js','growth.js','rigged-characters.js','qa_canvas_layout.cjs','qa_tools_runtime.cjs','qa_calendar_runtime.cjs','qa_calendar_data_runtime.cjs','qa_growth_runtime.cjs'):
    if script.endswith(('.js','.cjs')):
        result = subprocess.run(['node','--check',str(ROOT/script)],capture_output=True,text=True)
        if result.returncode: errors.append(f'{script}: syntax error: {result.stderr.strip()}')
for script in ('qa_canvas_layout.cjs','qa_tools_runtime.cjs','qa_calendar_runtime.cjs','qa_calendar_data_runtime.cjs','qa_growth_runtime.cjs'):
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
    for script in ('/styles.css','/app.js','/tools.js','/growth.js','/rigged-characters.js'):
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
    versions += re.findall(r'(?:styles\.css|app\.js|tools\.js|rigged-characters\.js)\?v=(\d+)', path.read_text(encoding='utf-8'))
if versions and set(versions) != {VERSION}:
    errors.append(f'asset cache versions differ: {sorted(set(versions))}')
if not (ROOT/'assets/social-preview.jpg').exists(): errors.append('missing assets/social-preview.jpg')
else:
    if (ROOT/'assets/social-preview.jpg').stat().st_size > 300_000:
        errors.append('social preview image exceeds 300 KB')

# Critical calendar dates are tracked explicitly as known regression checks.
app = (ROOT/'app.js').read_text(encoding='utf-8')
for required_function in ('function renderOccasions(', 'function fillSelect('):
    if required_function not in app:
        errors.append(f'app.js: critical startup function missing: {required_function}')

# v54: rigged character accessibility, fallback and AA Group brand integrity.
index = (ROOT/'index.html').read_text(encoding='utf-8')
rigged = (ROOT/'rigged-characters.js').read_text(encoding='utf-8')
for marker in ('type="module" src="rigged-characters.js?v=55"','id="heroIllustration"'):
    if marker not in index: errors.append(f'index.html: missing rigged character integration {marker}')
for marker in ('new THREE.WebGLRenderer','MutationObserver','waveUntil','IntersectionObserver','webglcontextlost','prefers-reduced-motion'):
    if marker not in rigged: errors.append(f'rigged-characters.js: missing resilience/animation feature {marker}')
if '.hero-character-stage.rigged-3d-active .hero-character{opacity:0;pointer-events:auto' not in (ROOT/'styles.css').read_text(encoding='utf-8'):
    errors.append('styles.css: invisible character buttons must remain interactive and keyboard accessible')
for page in sorted(ROOT.glob('*.html')):
    html=page.read_text(encoding='utf-8')
    if 'AA Group. All rights reserved.' not in html: errors.append(f'{page.name}: missing AA Group copyright')
    if 'WishingASR is a product of' not in html: errors.append(f'{page.name}: missing AA Group product attribution')

# Occasion-specific character props and particle direction regressions.
for marker in [
    'function applyCharacterCostumes(',
    "diwali:{hands:['🪔','🪔']",
    "christmas:{hands:['🎁','🔔'],hat:'santa'",
    "const fallMotion={christmas:'snow'",
    "art.dataset.motion=motion",
]:
    if marker not in app: errors.append(f'seasonal scenes: missing app.js marker {marker}')
styles = (ROOT/'styles.css').read_text(encoding='utf-8')
for marker in [
    '@keyframes festival-fall',
    '.hero-character-stage[data-occasion="diwali"] .accessory-hand',
    '.hero-character .accessory-hat{',
    '@keyframes seasonal-hand-bob',
    '@media(prefers-reduced-motion:reduce)',
]:
    if marker not in styles: errors.append(f'seasonal scenes: missing CSS marker {marker}')
for marker in [
    "date:'2027-05-20'",  # Buddha Purnima (India, 2027)
    "dates:['2026-11-08','2027-10-29']",  # Diwali 2026 and 2027
    "dates:['2026-11-13','2026-11-14','2026-11-15','2026-11-16','2027-11-02','2027-11-03','2027-11-04','2027-11-05']",  # Four-day Chhath observance

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
    'function occasionDateKeys(',
    'function buildEventDates(',
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

# v50: theme colour cascade and mobile-readability regression checks.
styles_v50 = (ROOT/'styles.css').read_text(encoding='utf-8')
restore_marker = '/* v50: restore the individual occasion palettes'
if restore_marker not in styles_v50:
    errors.append('styles.css: missing restored occasion theme palettes')
else:
    before_restore, restored = styles_v50.split(restore_marker, 1)
    restored_themes = set(re.findall(r'body\[data-theme="([^"]+)"\]', restored))
    original_themes = set(re.findall(r'body\[data-theme="([^"]+)"\]\{([^{}]+)\}', before_restore))
    original_palettes = {name for name, declarations in original_themes if '--bg:' in declarations and '--accent:' in declarations}
    missing = sorted(original_palettes - restored_themes)
    if missing: errors.append(f'styles.css: missing final colour tokens for {missing}')
for marker in ('env(safe-area-inset-top', 'env(safe-area-inset-bottom', 'text-rendering:optimizeLegibility', '@media(prefers-reduced-motion:reduce)'):
    if marker not in styles_v50: errors.append(f'styles.css: missing responsive/accessibility refinement {marker}')
if 'id="featureTicker" aria-live="off"' not in (ROOT/'index.html').read_text(encoding='utf-8'):
    errors.append('index.html: decorative rotating feature ticker should not repeatedly announce to screen readers')

# v55 organic discovery, copy/share helpers and AA Group schema checks.
for slug in ('diwali-wishes', 'birthday-wishes', 'christmas-wishes', 'holi-wishes', 'eid-wishes', 'wedding-wishes', 'anniversary-wishes', 'raksha-bandhan-wishes'):
    page=ROOT/(slug+'.html')
    if not page.exists(): errors.append(f'missing SEO guide page {page.name}')
    else:
        content=page.read_text(encoding='utf-8')
        for token in ('rel="canonical"','name="description"','property="og:title"','copy-wish','wish-share-inline','href="/create?occasion='):
            if token not in content: errors.append(f'{page.name}: missing guide feature {token}')
if 'growth.js?v=55' not in (ROOT/'index.html').read_text(encoding='utf-8'):
    errors.append('index.html: missing growth helper script')
if '"@type":"Organization"' not in (ROOT/'index.html').read_text(encoding='utf-8') or 'AA Group' not in (ROOT/'index.html').read_text(encoding='utf-8'):
    errors.append('index.html: missing AA Group Organization structured data')
for marker in ('data-copy-text','navigator.clipboard.writeText','navigator.share'):
    if marker not in (ROOT/'growth.js').read_text(encoding='utf-8') and marker != 'navigator.share':
        errors.append(f'growth.js: missing copy/share capability {marker}')

if errors:
    print('FAIL')
    print('\n'.join(f'- {item}' for item in errors))
    sys.exit(1)
print('PASS: HTML semantics/accessibility, labels and links, SEO/social metadata, JS syntax, canvas QA, tools runtime regressions, calendar date-selection and multi-year date-data runtime, sitemap, Vercel routes/security/cache rules.')
