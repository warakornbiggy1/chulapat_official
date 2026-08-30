# Getting real Instagram posts onto the Our Post page

`public/js/ig-posts.js` already holds the post permalinks and renders a card for
each one. What it is missing is the media. Until a post has an `image`, its card
falls back to the dark contact-sheet plate showing only the shortcode — it still
links to the real post, so nothing is broken while the images are pending.

This is how the images get there.

## Why you cannot just link Instagram's image URLs

Two independent blockers, either one fatal:

1. **The page's CSP.** `ourpost.html` sets `img-src 'self' data:`. Anything served
   from `scontent-*.cdninstagram.com` is blocked — silently, with no broken-image
   icon and no console error that points at the cause.
2. **Instagram's CDN URLs expire.** They are signed and time-limited, on the order
   of hours to days. Even with the CSP relaxed, hard-coded CDN links would go dead
   shortly after they were pasted in and stay dead.

So the images have to be downloaded and committed under `public/assets/`. That is
not a workaround; for a static site it is the only durable option.

## The route: the account's own data export

Do not save fourteen images by hand, and do not use a third-party "Instagram
downloader" site — those breach Instagram's terms and mean handing the account's
content to a stranger. Instagram gives account owners a first-party export.

In the Instagram app:

> **Settings and activity → Accounts Centre → Your information and permissions →
> Download your information → Download or transfer information →** select the
> CHULAPAT account **→ Some of your information → Posts → Download to device →**
> Date range **All time** → Format **JSON** → Media quality **High**

It arrives by email as a ZIP, usually within a few minutes but occasionally up to
a day. Unzip it. Inside:

```
your_instagram_activity/media/posts_1.json     captions + timestamps
media/posts/YYYYMM/<filename>.jpg              the original images
```

`posts_1.json` gives, per post, `media[].uri` (the path inside the export),
`media[].creation_timestamp` (Unix seconds) and `title` (the caption).

## Then run the script

```
python tools/build-ig-posts.py <unzipped-export-dir>
```

It centre-crops each image to a square, re-encodes it to WebP at 1080px into
`public/assets/posts/<shortcode>.webp`, and prints a ready-to-paste `IG_POSTS`
array with the caption and date filled in.

**One gap to check.** The export does not contain shortcodes or permalinks, so it
cannot be joined to the existing URLs by ID. The script pairs them **by order** —
both the export and the `IG_POSTS` array are newest-first — and prints a table of
`shortcode / date / caption` so you can confirm the pairing before pasting. If a
row is wrong, fix that one entry by hand.

`alt` is deliberately left empty for you to fill in. A caption is not a
description of a photograph, and `ig-posts.js` treats an empty `alt` as
decorative because the surrounding link already carries a descriptive label.

## Adding a single new post later

The script is for bulk. For one post, add the line by hand as the file's own
header comment describes, drop a square image into `public/assets/posts/`, and
point `image` at it.

## Why there is no automatic feed

The only fully-automatic route is the **Instagram Graph API**
(`GET /me/media?fields=id,caption,media_url,permalink,timestamp,media_type`). It
requires the account converted to Business or Creator, a Meta developer app, and
a long-lived token refreshed every 60 days — and `media_url` is *still* a
temporary CDN link that has to be downloaded.

On top of that, this site deploys as a static Cloudflare Worker with no server to
hold a token, and `default-src 'self'` means the page cannot call a third-party
API at runtime either. So even the API route collapses into a build-time script
that commits images: the same shape as the one above, plus a token to babysit.
Not worth it for a feed that updates a few times a term. Worth revisiting if
posting becomes frequent.

Scraping is not an option either: the old `?__a=1` endpoints are gone, unofficial
scrapers break constantly, and running one against Instagram breaches their terms.
