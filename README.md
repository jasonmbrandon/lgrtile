# LGR Tile Installation — spec website

A six-page static marketing site built from the October 2026 brief. No framework,
no build step: plain HTML, CSS and one JavaScript file.

**Positioning:** *Tile done by a tile specialist, not a handyman.* Every page ends
in the same quote form, and the service pages exist for Google.

## Run it

From this folder:

```sh
python -m http.server 4321 --bind 127.0.0.1
```

Then open <http://127.0.0.1:4321/>. Serve from the folder root so the clean URLs
(`/quote/`, `/gallery/`, …) work; opening `index.html` from disk breaks the
root-relative asset and page links.

## Pages

| URL | File | Job |
| --- | --- | --- |
| `/` | `index.html` | Hero, proof bar, the wall-building scroll scene, six services, positioning band, recent work, finishes band, reviews, three steps, service area, quote form |
| `/showers-bathrooms/` | `showers-bathrooms/index.html` | Ranks for "tile shower Orlando": waterproofing, process, gallery, FAQ |
| `/backsplashes/` | `backsplashes/index.html` | Entry offer: styles, what to send, three-step job, gallery, FAQ |
| `/floors/` | `floors/index.html` | Volume jobs: prep, large-format, transitions, `#stone` section, gallery, FAQ |
| `/gallery/` | `gallery/index.html` | 18 photo slots, filterable by job type |
| `/quote/` | `quote/index.html` | Photo-upload quote form, small-job block |
| `/thank-you/` | `thank-you/index.html` | Confirmation page after a server-side submit (noindex) |

`robots.txt`, `sitemap.xml` and `assets/og.png` (1200×630) are included.

## Brand

Taken from the brief and the placeholder logo:

- Navy `#141A24` — header, footer, hero, dark sections
- Teal `#1FAE8C` — buttons, links, icons
- Orange `#F39020` — one call to action per screen
- Off-white `#F7F5F2` — light section backgrounds
- Headings: Roboto Slab (variable, self-hosted) · Body: Montserrat (variable, self-hosted)

`assets/logo-header-dark.svg` is the compact header lockup (tile mark +
"LGR Tile"), sized to stay readable at 40px tall; `logo-header-light.svg` is
its navy version. `assets/logo-dark.svg` is the full white wordmark for dark sections and
`assets/logo-light.svg` is the navy wordmark for white sections; both come from
`placeholder-logo-dark.svg`. `assets/favicon.svg` is the tile mark on its own.
Swap in Lucas's own logo files when he approves one — same names, same folders,
nothing else changes.

## The photos

The site runs on LGR's own job photos. They were cropped out of screenshots of
the company Instagram grid, colour corrected lightly, upscaled, sharpened and
encoded to WebP — 20 files in `assets/photos/`, 11–46 KB each.

| Files | Show |
| --- | --- |
| `shower-marble-portrait`, `shower-gray-plank-43`, `shower-gray-plank-wide` | Marble-look and gray plank-look showers |
| `shower-gray-niche` | Pebble mosaic niche |
| `shower-subway-stacked` | Stacked subway tile on a shower wall |
| `shower-in-progress`, `shower-goboard`, `bathroom-demo` | The build: pan waterproofed, walls boarded and seams taped, room stripped back |
| `bathroom-floor-detail`, `bathroom-accent-wall`, `bathroom-wood-ceiling` | Bathroom floor, accent wall, wood-look ceiling |
| `kitchen-herringbone-43`, `-detail`, `-wide` | Herringbone mosaic backsplash, three framings |
| `kitchen-herringbone-white`, `kitchen-mosaic-dark`, `kitchen-mosaic-detail`, `kitchen-subway-green` | More kitchens: white herringbone, dark marble mosaic wide and close, subway under green cabinets |
| `floor-sunroom-wide`, `floor-sunroom-43` | Large-format floor in a sunroom |

The three build photos are the weakest on resolution and the strongest on
credibility — the taped GoBoard shower is the only proof on the site that the
waterproofing is real, so they are used where a prospect is deciding whether to
believe the pitch.

**Resolution ceiling:** each screenshot tile is about 465 px wide, so these files
are upscaled roughly 1.5x for cards and 1.7x for the hero. They read fine at normal
size and go soft on a large high-DPI screen. Replacing them with the originals —
the Thumbtack portfolio or an Instagram data export — needs no other change: same
filenames, same folder.

**One slot is still a placeholder:** `floors-stone` on the Floors page is reserved
for a natural stone job, and none of the current photos are stone. It shows its
labelled panel until one exists.

### How the slots work

Each slot in the HTML carries `data-photo="key"`; `assets/site.js` maps keys to
files in the `PHOTOS` object at the top. Mapped slots are pre-rendered: the
`<img>` is written into the HTML (with width, height and lazy loading, and
`fetchpriority="high"` on hero slots), so photos show without JavaScript, load
faster and can be indexed. An unmapped key keeps the labelled panel, and the
script still fills any mapped slot that has no `<img>` yet. To add a photo, drop
the file in `assets/photos/`, add the key, and add the matching `<img>` to the
slot (copy one from another slot).

| Page | Keys |
| --- | --- |
| Home | `hero-shower`, `work-1` ... `work-9` |
| Showers & bathrooms | `showers-hero`, `showers-waterproof`, `bathroom-floor`, `sb-1` ... `sb-6` |
| Backsplashes | `backsplash-hero`, `backsplash-styles`, `bs-1` ... `bs-3` |
| Floors | `floors-hero`, `floors-stone`, `fl-1` ... `fl-4` |
| Gallery | `g-01` ... `g-12` |

`data-alt` on every filled slot describes the actual photograph, not the job type
it was reserved for.

## The quote form

Fields are the brief's: name, phone, ZIP, job type, rough size, "I already have
my tile", photos, plus optional timing, message and email. It validates in the
browser, has a honeypot for bots, and only spends a request when the form is
genuinely filled in.

Quote requests are emailed to **serviceslgrtile@gmail.com** (LGR's inbox) through
[FormSubmit](https://formsubmit.co) (no account needed). The form posts natively
(`formMode = 'native'` in `assets/site.js`), so the photos arrive as email
attachments, and the visitor lands on `/thank-you/`. Each email has the subject
"New tile quote request: <job type> (<ZIP>)", a table of the fields, and the
customer's email as reply-to when they give one.

**First submission:** FormSubmit emails an activation link to that inbox before
it forwards anything. Send one test quote from the live site, click the link,
then send a second test. After activating, FormSubmit offers a random alias
address; swap it into `formEndpoint` so the Gmail address is not in the page
source.

To send leads somewhere else, change the address in `formEndpoint`. To use a
background API instead (n8n webhook, Formspree, Getform, a Worker), set
`formMode = 'fetch'` and point `formEndpoint` at it: the form then posts
multipart/form-data and redirects to `/thank-you/` on a 2xx. Without an
endpoint, it falls back to opening the visitor's mail app.

`assets/site.js` also fires `quote_request`, `call_click`, `text_click` and
`gallery_filter` events through `gtag` / `dataLayer`, so form submissions can be
tracked as conversions once GA4 is added.

## Design notes

- Mobile gets a sticky **Call / Get a quote** bar, and phone numbers are
  tap-to-call; there is a text-us link in the header area, footer and thank-you page.
- Sections fade in on scroll with IntersectionObserver, including a fallback for
  views that never paint, so content can never stay invisible.
- All motion is off under `prefers-reduced-motion: reduce`.
- Fonts are self-hosted, lazy-loaded, and preloaded for the two weight axes used
  above the fold.

## The motion layer

Two files sit on top of the static site: `assets/motion.css` and
`assets/motion.js`. Both are optional — drop the `<link>` and `<script>` pair from
a page and it falls back to a still photo. No dependency, no build step, and the
same two files can be copied into another spec site.

- **The wall scene** (`#build`, home page) — a sticky viewport inside a 150vh
  section (shortened from 260vh so the services come sooner). One shower photo is cut into 48 tiles (24 on phones) that start below
  the frame and lift into place course by course, bottom row first. The grout
  joints are a 1px inset shadow on each tile; the finished wall is the original
  photo reassembled pixel-exactly. Scroll drives every transform, so scrubbing
  backwards re-stacks the wall.
- **Finishes band** (`#finishes`) — four CSS-3D slabs that tilt toward the pointer
  and drift against each other on scroll. Transforms only, no WebGL.
- **Rotating hero word** — above 760px the headline cycles the material in
  "… specialist": tile and mosaic. Marble, stone and slate were taken out because
  the site has no stone jobs to back them up; add them back only if Lucas does
  that work and there are photos of it. The phrase is given its own
  line so a longer name can never re-wrap the rest of the headline, and under
  760px the headline is static — phones never see a layout shift. Edit the list in
  `data-spec` on the `<em>` in `index.html`.
- **Smaller touches** — a reading-progress hairline, staggered card and gallery
  reveals, a pointer tilt on cards and job photos, hero parallax, and the proof
  bar counting up once to its real figures.

The effect works with two or more words in `data-spec`.

All of it runs through a single `requestAnimationFrame` loop, and the
scroll-driven code only computes while its section is near the viewport. Under
`prefers-reduced-motion` the wall section collapses to the finished photo and
the tilt is skipped.

**Swapping the scene photo:** the wall reads
`assets/photos/shower-subway-stacked.webp` (moved off the gray plank shower,
which is now the hero photo), set once as `--wall-photo` in
`assets/motion.css`. A better photo of a tiled wall needs no other change — but
it must be **4:3**, or the tiles will stretch.

## If Lucas commissions a 3D asset

The most useful model is not a whole bathroom. It is one tile slab, delivered
four times with different materials, floating in a materials section:

- **Shape** — 600 × 1200 mm slab, 10 mm thick, lightly bevelled front edge.
- **Materials** — marble-look porcelain, herringbone mosaic sheet, wood-look
  plank, pebble mosaic. PBR metallic-roughness, 2K maps (base colour, roughness,
  normal, AO), no baked lighting and no reflections painted into the texture.
- **File** — `.glb`, Y-up, metres, origin at the slab's centre, one object per
  file, Draco or meshopt compressed, under 1 MB each including textures.
- **Use** — three loaded at a time, lazy-loaded on desktop only; phones keep the
  WebP photos that are there now. Choosing the finish is the decision customers
  stall on, so a slab they can turn over does more for the pitch than a flat
  photo.

If a bigger scene is on the table, the one worth paying for is a **shower wall
cutaway**: the same wall with the tile peeling back to the waterproofing
membrane. It answers "is the prep real?" in a single movement. Budget 40–60k
triangles and 2K textures, or it will not open on a phone.

Either one needs three.js (roughly 150 KB gzipped, self-hosted in
`assets/vendor/` — nothing to install at runtime). Don't start that until the
models exist; the CSS-3D band above is the placeholder that proves the section.

## Still needs Lucas

Nothing invented: no price, deadline, testimonial or statistic appears on the site
that is not in the brief. These are the gaps the brief lists, and where each one
lands:

- **Phone** — the site uses **(407) 435-2706** everywhere. The brief lists
  `321-443-3046` as an alternative posted in a Nextdoor reply; confirm which is
  public. One change in `assets/site.js` (`CONTACT.phone`) plus the `tel:` and
  `sms:` links in each page.
- **Email** — `serviceslgrtile@gmail.com`, from Facebook, unconfirmed.
- **Last name** — Lucas is named by first name only; no surname appears. The
  brief has "Ananias" vs "Bellissimo" open.
- **Address** — deliberately not published. The schema declares Orlando as the
  locality and lists service areas only, no street address.
- **Hours** — none are stated anywhere, because none were confirmed. Footer
  shows call/text instead of opening times; add them when known.
- **Insurance** — the site never claims to be insured or licensed.
- **Service area** — Orlando, Lake Nona, Kissimmee, Winter Park, Windermere,
  Oviedo, as the brief suggests; confirm which cities he will actually drive to.
- **Thumbtack reviews** — four quotes are used verbatim, credited as "Thumbtack
  review · July 2026" without names. Get his OK (and Thumbtack's terms) before
  launch, and add the profile URL where the reviews are credited — no link is
  invented in the build.
- **Instagram** — not linked. The brief says `@lgrtile` is unconfirmed, and a
  wrong link is worse than none. Add it to the footer once confirmed.
- **Photos** — the site uses Instagram screenshots (see above). Get Lucas's written
  OK to publish them, then swap in the originals when he sends them.
- **Pricing** — none shown. "Starting at" pricing only if he wants it.
- **Domain** — canonicals, Open Graph and the sitemap assume
  `https://lgrtileorlando.com`. Change `https://lgrtileorlando.com` everywhere
  if the domain lands differently, and keep the `LGR Tiles Ltd` (Ontario) clash
  in mind.

## Before launch

1. Confirm the phone number, email and service area.
2. Get written OK for the review quotes and the photos.
3. Activate FormSubmit: the first test quote sends an activation link to
   serviceslgrtile@gmail.com, which Lucas has to click. Then test end to end.
4. Create and verify the Google Business Profile, link it to the site, and ask
   past Thumbtack customers for Google reviews — the brief calls this the top
   local-search lever.
5. Add GA4 and mark `quote_request` as a conversion.
6. Re-check the page titles and descriptions after the service area is confirmed,
   then add city pages (Lake Nona, Winter Park) as a second wave.
