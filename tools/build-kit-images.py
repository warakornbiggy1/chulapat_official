"""Derive the deployed kit images from the untracked masters in shirt-model/.

Run from the repo root:  python tools/build-kit-images.py

The masters are 12 PNGs at 1080x1080 (~12 MB total) and live outside public/,
so they are never deployed and are gitignored. This writes WebP versions into
public/assets/kit/, which is what jersey.html actually references.

Sources are already 1080x1080 — exactly 2x the 540px display box (.kit-shot in
css/styles.css) — so nothing is resampled. Only the encoding changes.
"""

from PIL import Image
from pathlib import Path

SRC = Path("shirt-model")
OUT = Path("public/assets/kit")
OUT.mkdir(parents=True, exist_ok=True)

# "photo"  — the model shots are fully opaque, so drop the useless all-255
#            alpha channel before encoding.
# "cutout" — the product shots are ~50% transparent and must keep alpha.
JOBS = [
    ("basketball-model.png",  "basketball-model.webp",    "photo"),
    ("basketball-shirt.png",  "basketball-product.webp",  "cutout"),
    ("volleyball-model.png",  "volleyball-model.webp",    "photo"),
    ("volleyball-shirt.png",  "volleyball-product.webp",  "cutout"),
    ("tabletennis-model.png", "tabletennis-model.webp",   "photo"),
    # The master filename is misspelled "tabelt". Fixed here, once, on export,
    # so the typo lives in one line instead of in every <img src>.
    ("tabeltennis-shirt.png", "tabletennis-product.webp", "cutout"),
    ("futsal-model.png",      "futsal-model.webp",        "photo"),
    ("futsal-shirt.png",      "futsal-product.webp",      "cutout"),
    ("petanque-model.png",    "petanque-model.webp",      "photo"),
    ("petanque-shirt.png",    "petanque-product.webp",    "cutout"),
    ("badminton-model.png",   "badminton-model.webp",     "photo"),
    ("badminton-shirt.png",   "badminton-product.webp",   "cutout"),
]

total = 0
for src, dst, kind in JOBS:
    im = Image.open(SRC / src).convert("RGB" if kind == "photo" else "RGBA")
    im.save(OUT / dst, format="WEBP", quality=80, method=6)
    kb = (OUT / dst).stat().st_size / 1024
    total += kb
    print(f"{dst:28} {kb:7.1f} KB")

print(f"{'':28} {'-' * 10}")
print(f"{'total':28} {total:7.1f} KB")
