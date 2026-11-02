#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import json, re, subprocess, sys

ROOT = Path(__file__).resolve().parent

class Audit(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inline_scripts = []
        self.script_stack = None
        self.script_type = ""
        self.buttons = []
        self.images = []
        self.meta = []
        self.viewport = False
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "script":
            self.script_type = attrs.get("type", "").lower()
            self.script_stack = [] if "src" not in attrs else None
        if tag == "button":
            self.buttons.append(attrs)
        if tag == "img":
            self.images.append(attrs)
        if tag == "meta" and attrs.get("name", "").lower() == "viewport":
            self.viewport = True
    def handle_data(self, data):
        if self.script_stack is not None:
            self.script_stack.append(data)
    def handle_endtag(self, tag):
        if tag == "script" and self.script_stack is not None:
            text = "".join(self.script_stack).strip()
            if text and self.script_type != "application/ld+json":
                self.inline_scripts.append(text)
            self.script_stack = None

errors = []
pages = sorted(ROOT.glob("*.html"))
for page in pages:
    audit = Audit()
    audit.feed(page.read_text(encoding="utf-8", errors="replace"))
    if audit.inline_scripts:
        errors.append(f"{page.name}: executable inline script remains")
    if not audit.viewport:
        errors.append(f"{page.name}: missing viewport meta")
    if any(not b.get("type") for b in audit.buttons):
        errors.append(f"{page.name}: button missing explicit type")
    if any("alt" not in image or "width" not in image or "height" not in image for image in audit.images):
        errors.append(f"{page.name}: image missing alt or dimensions")
    text = page.read_text(encoding="utf-8", errors="replace")
    if text.count('src="site-ui.js?v=65.9"') != 1:
        errors.append(f"{page.name}: shared page script is missing or duplicated")

config = json.loads((ROOT / "vercel.json").read_text())
global_block = next((b for b in config.get("headers", []) if b.get("source") == "/(.*)"), None)
if not global_block:
    errors.append("vercel.json: global header block missing")
    headers = {}
else:
    headers = {h["key"].lower(): h["value"] for h in global_block.get("headers", [])}

required = [
    "strict-transport-security", "x-content-type-options", "x-frame-options",
    "referrer-policy", "permissions-policy", "cross-origin-opener-policy",
    "cross-origin-resource-policy", "x-permitted-cross-domain-policies"
]
for header in required:
    if header not in headers:
        errors.append(f"vercel.json: required header missing: {header}")
if "content-security-policy" in headers:
    errors.append("vercel.json: enforcing CSP allowlist present; AdSense nonce compatibility must be addressed first")

site_cache = next((b for b in config.get("headers", []) if b.get("source") == "/site-ui.js"), None)
if not site_cache or not any(h["key"].lower() == "cache-control" and "immutable" in h["value"] for h in site_cache.get("headers", [])):
    errors.append("vercel.json: site-ui.js immutable cache rule missing")

for file in ["app.js", "tools.js", "tools-extras.js", "growth.js", "site-ui.js"]:
    result = subprocess.run(["node", "--check", str(ROOT / file)], capture_output=True, text=True)
    if result.returncode:
        errors.append(f"{file}: JavaScript syntax failed: {result.stderr}")

if errors:
    print("FAIL:")
    print("\n".join(errors))
    sys.exit(1)
print(f"PASS: {len(pages)} pages use external same-origin UI script; no executable inline scripts; buttons have explicit types; viewport/image checks pass; required security headers and immutable script cache are valid; 5 JS syntax checks pass.")
