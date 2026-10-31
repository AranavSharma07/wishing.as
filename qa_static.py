#!/usr/bin/env python3
"""Static pre-deployment checks for WishingASR; no network/browser required."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import json, re, subprocess, sys, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parent
class HTMLAudit(HTMLParser):
 def __init__(self): super().__init__(convert_charrefs=True); self.ids=[]; self.refs=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'): self.ids.append(a['id'])
  for key in ('href','src'):
   v=a.get(key,'')
   if v and not v.startswith(('http:','https:','mailto:','tel:','data:','#','javascript:')): self.refs.append((key,v))
errors=[]
for f in sorted(ROOT.glob('*.html')):
 p=HTMLAudit(); p.feed(f.read_text(encoding='utf-8'))
 duplicates=[x for x,n in Counter(p.ids).items() if n>1]
 if duplicates: errors.append(f'{f.name}: duplicate IDs {duplicates}')
 for key,val in p.refs:
  target=val.split('?')[0].split('#')[0].lstrip('/')
  if not target: continue
  if target in {'create','quotes','national-days','blog','tools','about','contact','privacy','terms'}: continue
  if not (ROOT/target).exists(): errors.append(f'{f.name}: missing {key} target {val}')
for js in ('app.js','tools.js'):
 r=subprocess.run(['node','--check',str(ROOT/js)],capture_output=True,text=True)
 if r.returncode: errors.append(f'{js}: syntax error {r.stderr.strip()}')
try:
 config=json.loads((ROOT/'vercel.json').read_text(encoding='utf-8'))
 vercel_routes={item.get('source'):item.get('destination') for item in config.get('rewrites',[])}
 preview_source=(ROOT/'run_local_preview.py').read_text(encoding='utf-8')
 for route,dest in [('/create','/index.html'),('/quotes','/quotes.html'),('/national-days','/national-days.html'),('/blog','/blog.html'),('/tools','/tools.html'),('/about','/about.html'),('/contact','/contact.html'),('/privacy','/privacy.html'),('/terms','/terms.html')]:
  if vercel_routes.get(route)!=dest: errors.append(f'vercel.json: missing/mismatched route {route} -> {dest}')
  if f"'{route}': '{dest}'" not in preview_source: errors.append(f'preview server: missing/mismatched route {route} -> {dest}')
except Exception as e: errors.append(f'vercel.json/routes: {e}')
index_text=(ROOT/'index.html').read_text(encoding='utf-8')
if 'id="heroSearchForm"' in index_text or 'type="search"' in index_text: errors.append('search UI is meant to be removed but search form/input remains in index.html')
try: ET.parse(ROOT/'sitemap.xml')
except Exception as e: errors.append(f'sitemap.xml: {e}')
versions=[]
for f in ROOT.glob('*.html'):
 txt=f.read_text(encoding='utf-8')
 versions+=re.findall(r'(?:styles\.css|app\.js|tools\.js)\?v=(\d+)',txt)
if versions and set(versions)!={'43'}: errors.append(f'asset cache versions differ: {sorted(set(versions))}')
if errors:
 print('FAIL'); print('\n'.join(errors)); sys.exit(1)
print('PASS: JavaScript syntax, HTML local references/IDs, route-map consistency, Vercel JSON, sitemap XML, removed-search state and cache versions.')
