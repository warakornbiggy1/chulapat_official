"""Turn an Instagram data export into public/assets/posts/ + the IG_POSTS array.

Why an export rather than a URL fetch: ourpost.html runs `img-src 'self'`, so
Instagram's CDN is blocked outright, and its media URLs are signed and expire
within days anyway. The images have to be downloaded and committed. See
docs/instagram-posts.md for the full reasoning.

Usage
-----
  1. Request the export in the Instagram app:
     Settings and activity > Accounts Centre > Your information and permissions
     > Download your information > Download or transfer information
     > select the CHULAPAT account > Some of your information > Posts
     > Download to device > All time > Format: JSON > Media quality: High
  2. Unzip it somewhere.
  3. python tools/build-ig-posts.py <unzipped-export-dir>
  4. Check the printed table. The export carries no shortcodes, so posts are
     paired to the permalinks already in ig-posts.js BY ORDER (both are
     newest-first). If a row looks wrong, fix it by hand after pasting.
  5. Paste the printed array over IG_POSTS in public/js/ig-posts.js and fill in
     each `alt`.

Images are re-encoded rather than copied: the originals are multi-megabyte and
the cards render at roughly 360px.
"""

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

if len(sys.argv) != 2:
    sys.exit(__doc__)

EXPORT = Path(sys.argv[1])
OUT = Path("public/assets/posts")
JS = Path("public/js/ig-posts.js")

if not EXPORT.is_dir():
    sys.exit(f"not a directory: {EXPORT}")
OUT.mkdir(parents=True, exist_ok=True)

# The permalinks already in ig-posts.js, in file order (newest first).
shortcodes = re.findall(r"instagram\.com/(?:p|reel|tv)/([A-Za-z0-9_-]+)",
                        JS.read_text(encoding="utf-8"))
if not shortcodes:
    sys.exit("no post URLs found in public/js/ig-posts.js")

try:
    posts_json = next(EXPORT.rglob("posts_1.json"))
except StopIteration:
    sys.exit(f"no posts_1.json under {EXPORT} — was 'Posts' selected, in JSON format?")

entries = json.loads(posts_json.read_text(encoding="utf-8"))
# `uri` is relative to the export root, which is posts_1.json's grandparent.
export_root = posts_json.parent.parent.parent

if len(entries) != len(shortcodes):
    print(f"! export has {len(entries)} posts, ig-posts.js lists {len(shortcodes)} — "
          f"pairing the first {min(len(entries), len(shortcodes))} in order.\n")

rows = []
for code, entry in zip(shortcodes, entries):
    media = entry["media"][0]          # first frame of a carousel
    caption = (entry.get("title") or media.get("title") or "").strip()
    stamp = datetime.fromtimestamp(media["creation_timestamp"], timezone.utc)

    im = Image.open(export_root / media["uri"]).convert("RGB")
    side = min(im.size)                # centre-crop to square, the card's shape
    im = im.crop(((im.width - side) // 2, (im.height - side) // 2,
                  (im.width + side) // 2, (im.height + side) // 2))
    im.thumbnail((1080, 1080), Image.LANCZOS)
    im.save(OUT / f"{code}.webp", "WEBP", quality=80, method=6)

    rows.append((code, caption, stamp.strftime("%d %b %Y")))

print(f"{'shortcode':14} {'date':13} caption")
print(f"{'-' * 14} {'-' * 13} {'-' * 44}")
for code, caption, date in rows:
    print(f"{code:14} {date:13} {caption[:44]}")

print("\n--- paste over IG_POSTS in public/js/ig-posts.js, then fill in each alt ---\n")
print("  var IG_POSTS = [")
for code, caption, date in rows:
    esc = caption.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ")
    print(f'    {{ url: "https://www.instagram.com/p/{code}/",')
    print(f'      image: "assets/posts/{code}.webp",')
    print(f'      alt: "",  // describe what the photo shows')
    print(f'      caption: "{esc[:110]}",')
    print(f'      date: "{date}" }},')
print("  ];")
