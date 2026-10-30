# Redesign notes — 29 October 2026

Quentin asked for a design with a wow effect: `/` as Beyond Blockchain, a one-person development studio
for blockchain, AI and useful software, and `/quentin` as a page that clearly feels like his own website.
The site shows only his own work for now; he may take client work later, so it has no services, “we” or
hire-me call to action.

Claude Code and the Codex chat that built the first version each proposed directions, then Codex reviewed
Claude’s. The agreed direction:

- **Studio — “The Aperture”** (Codex’s idea). The supplied logo stays intact. Its rocket cutout is the
  aperture: a beam follows the rocket’s 36° heading onto a phone stage, and choosing a project reveals its
  real capture along that diagonal. Each project then gets its own scene, built from the evidence it has.
  Ikitai has one honest workflow made of real screens (the saved demo post, then the plan Ikitai shows for it).
- **Logo animation** (requested by Quentin on 29 October). The plain hexagon appears, then the rocket flies in
  from beyond the lower-left edge, carving its trail, and stops exactly where it sits in the logo; the original SVG
  then takes over and the beam lights up. An earlier tile-assembly entrance was dropped after review because it
  read like an image loading. Compare without it using `?entrance=off`.
- **Personal — “Field Notes”** (chosen independently by both). A serif greeting, four real artefacts that open
  short first-person notes with sources, what he is making now, and a story with a quiet year index from 2014.
  No fake tape, stamps or handwriting; opinions or memories are added only in his own words.

**Update, 30 October 2026 — the Switchboard.** Quentin found the opening screen still too bland and plans more
projects, so the Aperture hero was replaced. After greybox prototypes and Codex’s critique, both picked **the Logo
Knob**: a cobalt machine whose knob is the logo in a silver collar, with the rocket as the pointer. Turning it changes
the project on the screen; Check it out runs a light round the screen and grows it into the project’s own page at
`/work/<slug>`, server-rendered and shareable. Codex’s flow fixes are built in: real addresses that survive refresh
and Back, the dial unreachable while a page opens, wheel turning only on an engaged knob with momentum damped, a
compact knob beside the name on phones, plain project links that work without the script, one selection driving
everything, and visible previous/next arrows. Each project now lists its stack, read from its own repository.

**Update, 30 October 2026 — back to clean.** Built into the site, the switchboard didn't look clean, so Quentin
reset the direction: no project icons in the navbar, a studio page of project summaries, and each project opening in a
window over that page so reading about one never leaves it. The dial, the project pages' scene colours and the Ikitai
flow were removed; the cards, the window and the shareable `/work/<slug>` page share one set of content.

Left out on review: a cube-swarm hero that retired the logo, a strike-through manifesto, three scripted product
toys, a terminal persona, and per-era page themes. Deferred: a Quick links palette and an illustrated cabinet.

The concept board with live sketches and Codex’s review is a private Claude artifact owned by Quentin.
