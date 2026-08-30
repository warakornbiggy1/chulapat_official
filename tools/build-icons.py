"""Derive every site icon from the one master emblem.

Run from the repo root:  python tools/build-icons.py

Source is public/assets/logo-mark.png — the masks emblem on a transparent
canvas. The artwork only occupies 684x505 of that 700x700 canvas and is
noticeably wide, so everything here crops to the real bounding box first and
re-pads to square; pasting the raw file into a 32px favicon would waste a third
of the height on empty pixels and leave the mark unreadable.

Writes:
  public/favicon.ico          16 / 32 / 48, transparent — the browser tab
  public/assets/icon-192.png  PWA / Android home screen
  public/assets/icon-512.png  PWA splash + store listing
  public/assets/icon-maskable-512.png  Android adaptive icon (safe-zone inset)
  public/assets/apple-touch-icon.png   180x180, iOS home screen (opaque: iOS
                                       composites transparency onto black)
  public/assets/og-cover.png  1200x630 link preview for LINE / Facebook
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC = Path("public/assets/logo-mark.png")
OUT = Path("public/assets")
ROOT = Path("public")

INK = (5, 3, 4)
FLAME = (255, 106, 26)
BONE = (246, 237, 226)
GOLD_HI = (255, 227, 174)

# Bahnschrift is the closest thing on Windows to the site's Big Shoulders
# Display: condensed, heavy, geometric. Only used for the share-preview card.
FONT_CANDIDATES = [
    r"C:\Windows\Fonts\bahnschrift.ttf",
    r"C:\Windows\Fonts\ariblk.ttf",
    r"C:\Windows\Fonts\impact.ttf",
]


def load_font(size, weight="bold"):
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            try:
                f = ImageFont.truetype(path, size)
                if "bahnschrift" in path.lower():
                    try:
                        f.set_variation_by_name("Bold Condensed" if weight == "bold"
                                                else "SemiBold Condensed")
                    except Exception:
                        pass
                return f
            except OSError:
                continue
    return ImageFont.load_default()


def emblem(margin=0.0):
    """The mark, cropped to its artwork and re-padded to a square canvas.
    `margin` is the fraction of the square left empty around it."""
    im = Image.open(SRC).convert("RGBA")
    bbox = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    art = im.crop(bbox)
    side = int(max(art.size) / (1 - 2 * margin))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(art, ((side - art.width) // 2, (side - art.height) // 2), art)
    return canvas


def rounded_plate(size, radius_ratio, colour=INK):
    plate = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(plate)
    d.rounded_rectangle([0, 0, size - 1, size - 1],
                        radius=int(size * radius_ratio), fill=colour + (255,))
    return plate


def bloom(size, strength=0.55, spread=0.42):
    """The flame halo the site puts behind every lit surface."""
    g = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(g)
    r = int(size * spread)
    d.ellipse([size // 2 - r, size // 2 - r, size // 2 + r, size // 2 + r],
              fill=int(255 * strength))
    return g.filter(ImageFilter.GaussianBlur(size * 0.16))


def on_plate(px, margin, radius_ratio, glow=True):
    """Emblem centred on an ink plate — used for every opaque icon."""
    plate = rounded_plate(px, radius_ratio)
    if glow:
        plate = Image.composite(Image.new("RGBA", (px, px), FLAME + (255,)),
                                plate, bloom(px, 0.30))
        plate.putalpha(rounded_plate(px, radius_ratio).getchannel("A"))
    art = emblem(margin).resize((px, px), Image.LANCZOS)
    plate.alpha_composite(art)
    return plate


# ---------------------------------------------------------------- favicon ---
# Transparent, and cropped hard: at 16px every empty pixel is one the mark
# cannot use. No plate, so it sits on light and dark browser chrome alike.
fav = emblem(margin=0.02)
fav.resize((256, 256), Image.LANCZOS).save(
    ROOT / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print(f"favicon.ico                    {(ROOT / 'favicon.ico').stat().st_size / 1024:6.1f} KB")

# ------------------------------------------------------------- PWA icons ---
for px in (192, 512):
    icon = on_plate(px, margin=0.10, radius_ratio=0.22)
    icon.save(OUT / f"icon-{px}.png")
    print(f"assets/icon-{px}.png{'':12} {(OUT / f'icon-{px}.png').stat().st_size / 1024:6.1f} KB")

# Android adaptive icons crop to a circle of ~80% width, so the mark has to sit
# well inside the safe zone and the plate has to fill the whole square.
mask_icon = Image.new("RGBA", (512, 512), INK + (255,))
mask_icon = Image.composite(Image.new("RGBA", (512, 512), FLAME + (255,)),
                            mask_icon, bloom(512, 0.30))
mask_icon.alpha_composite(emblem(margin=0.22).resize((512, 512), Image.LANCZOS))
mask_icon.save(OUT / "icon-maskable-512.png")
print(f"assets/icon-maskable-512.png   {(OUT / 'icon-maskable-512.png').stat().st_size / 1024:6.1f} KB")

# iOS ignores transparency and composites onto black, so this one is opaque by
# design rather than by accident.
on_plate(180, margin=0.12, radius_ratio=0.0).convert("RGB").save(
    OUT / "apple-touch-icon.png")
print(f"assets/apple-touch-icon.png    {(OUT / 'apple-touch-icon.png').stat().st_size / 1024:6.1f} KB")

# ------------------------------------------------------------- OG cover ----
W, H = 1200, 630
cover = Image.new("RGBA", (W, H), INK + (255,))

# Same lit-from-behind language as the pages, but kept tight and low: the
# ground has to stay ink, or the card reads muddy brown instead of dark circus.
halo = Image.new("L", (W, H), 0)
ImageDraw.Draw(halo).ellipse([W * 0.07, H * 0.10, W * 0.40, H * 0.92], fill=64)
cover = Image.composite(Image.new("RGBA", (W, H), FLAME + (255,)), cover,
                        halo.filter(ImageFilter.GaussianBlur(120)))

art = emblem(margin=0.02)
art_px = int(H * 0.62)
art = art.resize((art_px, art_px), Image.LANCZOS)
cover.alpha_composite(art, (int(W * 0.06), (H - art_px) // 2))

d = ImageDraw.Draw(cover)
x = int(W * 0.06) + art_px + 44
d.text((x, 214), "CHULAPAT", font=load_font(96), fill=BONE)
d.text((x, 306), "_OFFICIAL", font=load_font(96), fill=FLAME)
# The identity phrase is one word with a colour seam, exactly as the pages
# typeset it: Black in bone, Orange in flame, no space between them.
sub = load_font(30, "semi")
d.text((x, 418), "BLACK", font=sub, fill=BONE)
seam = x + int(d.textlength("BLACK", font=sub))
d.text((seam, 418), "ORANGE", font=sub, fill=FLAME)
d.text((seam + int(d.textlength("ORANGE", font=sub)), 418),
       "  ·  DARK CIRCUS", font=sub, fill=GOLD_HI)

# the marquee hairline the site rules its sections with
d.rectangle([x, 400, x + 300, 402], fill=(232, 185, 106))

cover.convert("RGB").save(OUT / "og-cover.png", optimize=True)
print(f"assets/og-cover.png            {(OUT / 'og-cover.png').stat().st_size / 1024:6.1f} KB")
