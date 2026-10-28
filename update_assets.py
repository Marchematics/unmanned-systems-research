#!/usr/bin/env python3
"""Update fingerprinted assets in the home page and individual profiles."""
import hashlib
import re
from pathlib import Path

pages = [Path('index.html'), *sorted(Path('people').glob('*.html'))]
assets = []
for source, attribute in [('style.css', 'href'), ('script.js', 'src')]:
    path = Path(source)
    content = path.read_bytes()
    fingerprint = hashlib.sha256(content).hexdigest()[:12]
    versioned = f'{path.stem}.{fingerprint}{path.suffix}'
    Path(versioned).write_bytes(content)
    assets.append((path, attribute, versioned))

for page in pages:
    html = page.read_text(encoding='utf-8')
    prefix = '' if page.parent == Path('.') else '../'
    for source, attribute, versioned in assets:
        pattern = rf'{attribute}="{re.escape(prefix)}{re.escape(source.stem)}\.[0-9a-f]{{12}}{re.escape(source.suffix)}"'
        html, count = re.subn(pattern, f'{attribute}="{prefix}{versioned}"', html)
        if count != 1:
            raise SystemExit(f'{page}: expected one versioned reference for {source}, found {count}')
    page.write_text(html, encoding='utf-8')
