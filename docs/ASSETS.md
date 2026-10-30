# Asset sources and design notes

Collected or created for this local website on 28 October 2026. Web captures document the public interfaces on that date; Ikitai uses existing app captures from its store-asset project. They do not establish current prices, audience size, or release status.

## Beyond Blockchain

The user supplied the original SVG wordmark and PNG icon.

- `public/brand/beyond-blockchain-logo.svg` preserves the supplied paths and blue gradients. Its large embedded noise bitmap/pattern was removed to reduce file weight.
- `public/brand/beyond-blockchain-mark.svg` isolates the original icon paths with the rocket cutout intact.
- `public/brand/beyond-blockchain-icon.png` is the supplied raster icon, used as the favicon.
- `src/content/brand-mark.ts` splits the original mark path into the full hexagon, the rocket’s trail, the rocket and its window; masking the hexagon with them rebuilds the original exactly. `src/components/BrandMark.vue` uses these for the one-time logo animation, then shows the untouched SVG.
- `public/social/*.png` are the 1200 × 630 link previews, one per public page and language (`home`, `quentin`, `work-<slug>`, each `.en` and `.ja`), rendered by `tools/share-cards.mjs` from the live content with the real product screens and marks.

## Current projects

| Local asset under public/             | Origin and treatment                                                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `projects/ikitai-logo.svg`            | Original inline SVG from [Ikitai](https://getikitai.com)                                                                     |
| `projects/ikitai-timeline.jpg`        | Real Ikitai app timeline, copied from `Ikitai/store/screenshots/captures/iphone/en/timeline-concert.jpg` (1320 × 2868)       |
| `projects/ikitai-detail.jpg`          | Real app plan details, from the same capture set’s `detail.jpg` (1320 × 2868)                                                |
| `projects/ikitai-calendar.jpg`        | Real app calendar, from the same capture set’s `calendar.jpg` (1320 × 2868)                                                  |
| `projects/ikitai-source-post.png`     | Fictional concert post used by the Ikitai demo, from `Ikitai/store/screenshots/src/sources/out/post-photo.png` (1080 × 1600) |
| `projects/fairmints-logo.svg`         | Original SVG from [Fairmints](https://fairmints.io)                                                                          |
| `projects/fairmints-capture.png`      | Actual 1280 × 720 Fairmints desktop dashboard, captured after loading completed                                              |
| `projects/fairmints-mobile.png`       | Actual 390 × 844 responsive Fairmints dashboard                                                                              |
| `projects/festcompass-logo.svg`       | Original SVG from [FestCompass](https://festcompass.jp)                                                                      |
| `projects/festcompass-background.jpg` | Original illustration from FestCompass’s public website                                                                      |
| `projects/festcompass-guide.png`      | Actual 1280 × 720 [festival guide](https://festcompass.jp/festivals)                                                         |
| `projects/festcompass-mobile.png`     | Actual 390 × 844 responsive festival guide                                                                                   |
| `projects/taplog-logo.svg`            | TapLog’s app icon, from `taplog/frontend/public/brand/taplog-app-icon.svg`                                                   |
| `projects/taplog-capture.png`         | Actual 1280 × 720 [TapLog](https://taplog.jp) home page (Japanese), captured 30 October 2026                                 |
| `projects/taplog-mobile.png`          | Actual 390 × 844 responsive TapLog home page, captured the same day                                                          |
| `projects/taplog-clip.mp4`            | Silent clip of the live TapLog home page scrolling, 960 × 540, recorded 30 October 2026 with `tools/record-clips.mjs`        |
| `projects/fairmints-clip.mp4`         | Silent clip of the live Fairmints dashboard scrolling to its token table, recorded the same way and day                      |
| `projects/festcompass-clip.mp4`       | Silent clip of the live FestCompass festival guide scrolling, recorded the same way and day (its install banner dismissed)   |
| `favicon.ico`, `apple-touch-icon.png` | Generated from `brand/beyond-blockchain-icon.png`; the touch icon sits on the site's porcelain background                    |

Ikitai’s existing store captures were produced from the real app with fictional demo plans, frozen at 21 October 2026. The caption makes the demo data explicit. A CSS device frame surrounds the unchanged captures. The project window shows the timeline, plan details, and calendar side by side; the list lives in `src/content/app-screens.ts`. No product interface, testimonial, or portrait was invented for this website. The previous cropped website demonstration is no longer used.

## Previous work

| Local asset under public/  | Public source                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `story/ownest-logo.svg`    | [Ownest logo](https://ownest.io/img/ownest-logo.svg)                                       |
| `story/ownest-desktop.png` | [Ownest desktop product preview](https://ownest.io/img/desktop.png)                        |
| `story/ownest-mobile.png`  | [Ownest mobile product preview](https://ownest.io/img/mobile.png)                          |
| `story/nakamotos-logo.png` | [The Nakamotos Club logo](https://thenakamotos.club/img/naka-logo.png)                     |
| `story/nakamoto-card.svg`  | [Original card displayed by the club](https://thenakamotos.club/img/RAREPEPE.5d0ec499.svg) |

The Rare Pepe card is shown as a referenced collectible, not artwork authored by Quentin. Ownest’s images are public product previews from its own website.

## Typography and references

Fonts are self-hosted through Fontsource packages, which include their licenses: DM Sans (400 and 500) for body text, Bricolage Grotesque Variable (width and weight axes) for the studio’s display type, Newsreader Variable (optical size, with italics) for the personal page, and DM Mono for small labels.

Design research included the primary sites [Basement](https://basement.studio/), [Emil Kowalski](https://emilkowal.ski/), [Rauno](https://rauno.me/projects), and [Linear](https://linear.app/). The resulting choices are a distinct brand object, direct typography, generous spacing, and actual product interfaces. No template, artwork, or source code from those sites was copied.

The layout uses authentic project imagery rather than a portrait, invented statistics, stock illustrations, testimonials, or decorative blockchain graphics. Each project retains its own visual character within shared typography and navigation.
