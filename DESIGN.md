---
version: alpha
name: meemur
description: >-
  Design system for meemur, a boutique digital agency. An airy, confident,
  data-driven brand built on a teal accent, charcoal ink, a faint tech grid,
  and self-hosted Montserrat.
colors:
  primary: "#00a9b8"
  primary-strong: "#00798a"
  primary-bright: "#1fd6c4"
  secondary: "#6c5ce7"
  neutral: "#3c3c3d"
  muted: "#6b6b6e"
  background: "#f5f7fa"
  surface: "#ffffff"
  surface-subtle: "#fbfcfe"
  on-surface: "#3c3c3d"
  on-primary: "#ffffff"
  outline: "rgba(60, 60, 61, 0.12)"
  grid-line: "rgba(60, 60, 61, 0.05)"
typography:
  display:
    fontFamily: Montserrat
    fontSize: 4.75rem
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 2.6rem
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Montserrat
    fontSize: 1.2rem
    fontWeight: 700
    lineHeight: 1.25
  body-lg:
    fontFamily: Montserrat
    fontSize: 1.3rem
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Montserrat
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  label-caps:
    fontFamily: Montserrat
    fontSize: 0.8rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.16em
rounded:
  sm: 10px
  md: 16px
  lg: 22px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 40px
  section: 112px
  maxw: 1152px
components:
  button-primary:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: 13px 22px
  button-primary-hover:
    backgroundColor: "#015c6a"
  button-ghost:
    backgroundColor: "{colors.background}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    padding: 13px 22px
  button-ghost-hover:
    textColor: "{colors.primary-strong}"
  footer:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.muted}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 28px
  input-field:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: 11px 14px
  cta-band:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: 56px
---

# meemur Design System

## Overview

meemur is a boutique digital agency. The brand should feel **confident, modern,
and quietly technical**, the studio of a senior specialist, not a faceless
corporation. The mood is light and spacious, with generous whitespace and a calm
teal accent over a near-white canvas.

Two motifs carry the identity: a **faint engineering grid** and slow-drifting
**gradient "blobs"** in teal and a single violet accent. Together they signal
craft and measurement (the grid) with warmth and motion (the blobs): "we make
the web work for you," approachable but precise. UI decisions should default to
clarity over decoration: lead with content, keep one clear action per view, and
let the background do the atmosphere so the foreground stays legible.

## Colors

The palette is rooted in a near-white canvas, charcoal ink, and a single teal
accent, with violet reserved for atmosphere only.

- **Primary · Teal (#00a9b8):** The brand teal. Used for graphics, the grid,
  focus rings, and decorative accents (contrast-exempt uses).
- **Primary Strong · Deep Teal (#00798a):** The accessible teal for text, links,
  and primary buttons on light backgrounds, meets WCAG AA (~4.8:1).
- **Primary Bright · Aqua (#1fd6c4):** A lighter teal used inside gradient blobs
  and highlights, never for text.
- **Secondary · Violet (#6c5ce7):** An accent used *only* in the background blobs
  for depth and warmth. It must not appear on solid UI surfaces or buttons.
- **Neutral / Ink (#3c3c3d):** Primary text color and the charcoal half of the
  wordmark.
- **Muted (#6b6b6e):** Secondary text: leads, captions, and supporting copy.
- **Background (#f5f7fa):** The page canvas, a soft, cool off-white.
- **Surface (#ffffff)** and **Surface Subtle (#fbfcfe):** Cards and form fields
  sit on white; the subtle variant is for inset inputs.
- **Outline (rgba(60,60,61,0.12))** and **Grid Line (rgba(60,60,61,0.05)):**
  Hairline borders and the background tech grid, respectively.

## Typography

The single typeface is **Montserrat** (self-hosted, weights 400/600/700) with a
metric-matched Arial fallback to prevent layout shift. The voice is geometric and
contemporary; hierarchy comes from weight and scale, not from extra fonts.

- **Display & Headlines:** Montserrat Bold (700) with tight tracking (-0.02em)
  for hero and section titles. Headlines balance for readability and use fluid
  `clamp()` sizing in implementation; the tokens record the upper bound.
- **Body:** Montserrat Regular (400) at 1rem / 1.6 line-height for comfortable
  long-form reading; leads step up to ~1.3rem in the muted color.
- **Labels (caps):** Montserrat Semi-Bold (600), uppercase, with 0.16em letter
  spacing, used for eyebrows and small section kickers in the strong teal.

## Layout

A centered, **fixed-max-width** column (1152px / 72rem) with fluid gutters that
scale from 20px on mobile to 40px on desktop. Vertical rhythm is set by a fluid
section spacing that tops out around 112px between major blocks.

Card grids prefer **centered flex wrapping** over rigid columns so that an odd
number of items (e.g. six service cards laid out 3 + 3, or a leftover pair)
stays balanced and never strands a single orphan card. Spacing follows a simple
4 / 8 / 16 / 24 / 40px scale. The faint grid line (#0d0d0d at 5%, `grid-line`)
is drawn as a fixed 48px background lattice behind all content.

## Elevation & Depth

Depth is **soft and tonal**, not heavy. Two devices convey hierarchy:

1. **The atmospheric background:** fixed, blurred gradient blobs (teal +
   violet) drifting slowly behind a faint grid, sitting on the `background`
   canvas. It is purely decorative (`aria-hidden`) and respects
   `prefers-reduced-motion`.
2. **Subtle card shadows:** white surfaces lift off the canvas with low-spread,
   low-opacity shadows; a slightly stronger shadow appears on hover alongside a
   1–3px lift. The single hero CTA uses a deeper teal band for emphasis.

## Shapes

The shape language is **soft and rounded**. Cards and inputs use a 10–16px
radius; pills (buttons, tags, chips) use a fully rounded `full` radius. Corners
are consistently rounded; sharp corners are avoided so the brand reads friendly
and modern rather than rigid.

## Components

- **Buttons:** Pill-shaped (`rounded.full`). The **primary** button is solid
  deep teal (`primary-strong`) with white text; hover deepens the teal slightly
  and adds lift + shadow. The **ghost** button is transparent with an outline
  border and ink text, shifting to deep teal on hover. Both use ~13px / 22px
  padding.
- **Cards:** White surface, hairline `outline` border, 16px radius, ~28px
  padding, and a soft shadow that strengthens on hover. Service cards carry a
  tinted-teal rounded icon tile (line icons only, never emoji).
- **Input fields:** Inset on the subtle surface with a 10px radius and a teal
  focus ring (2px `primary`).
- **CTA band:** A full-width rounded block (`rounded.lg`) using a deep-teal
  gradient (`primary-strong` → `#015c6a`) with white text and a white pill
  button. Violet is *not* used here.
- **Tags / chips:** Small pills with a 10%-teal tint and `primary-strong` text.

## Do's and Don'ts

- **Do** keep violet (`secondary`) strictly in the background blobs, never on
  buttons, text, or solid surfaces.
- **Do** use `primary-strong` (#00798a), not `primary` (#00a9b8), for any teal
  text or links to hold WCAG AA contrast.
- **Do** limit each screen to one clear primary action.
- **Do** use proper line/SVG icons; **don't** use emoji as UI icons.
- **Don't** mix sharp and rounded corners in the same view.
- **Don't** introduce a second typeface; express hierarchy with Montserrat
  weight and scale.
- **Do** respect `prefers-reduced-motion` and keep the background decorative and
  `aria-hidden`.
