#!/usr/bin/env python3
"""Update versioned asset references after editing the website's CSS or JS."""
import hashlib
import re
from pathlib import Path

index = Path('index.html')
html = index.read_text(encoding='utf-8')
for source, attribute in [('style.css', 'href'), ('script.js', 'src')]:
    path = Path(source)
    content = path.read_bytes()
    fingerprint = hashlib.sha256(content).hexdigest()[:12]
    versioned = f'{path.stem}.{fingerprint}{path.suffix}'
    Path(versioned).write_bytes(content)
    pattern = rf'{attribute}="{re.escape(path.stem)}\.[0-9a-f]{{12}}{re.escape(path.suffix)}"'
    html, count = re.subn(pattern, f'{attribute}="{versioned}"', html)
    if count != 1:
        raise SystemExit(f'Expected one versioned reference for {source}, found {count}')
index.write_text(html, encoding='utf-8')
