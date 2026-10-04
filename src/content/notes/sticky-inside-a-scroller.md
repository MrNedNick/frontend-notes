---
title: Sticky headers slide the wrong way inside a horizontal scroller
description: A week grid whose day headers sat 68 pixels down inside the table. The cause is a rule about overflow that is easy to forget.
date: 2026-09-03
tags: ['css', 'layout', 'debugging']
kind: symptom
symptom: The sticky day headers sit 68 px down, on top of the first rows of the grid
category: layout
cause: overflow-x auto turns the wrapper into a scroll container in both directions, and sticky answers to it
project: booking-desk
demo: https://mrnednick.github.io/booking-desk/
commit: https://github.com/MrNedNick/booking-desk/blob/f1fb952/src/app/features/schedule/schedule-page.scss#L89
---

## Symptom

A schedule grid, five day columns, sticky headers at the top. The headers
rendered 68 pixels *below* where they belonged, overlapping the first two rows
of the grid. Nothing was scrolled.

## How to reproduce

```html
<div class="grid-scroll">   <!-- overflow-x: auto -->
  <div class="grid">
    <div class="day-head">Mon</div>   <!-- position: sticky; top: 68px -->
```

Open the page without scrolling: the day headers already hang inside the grid.

## What it was not

The `top: 68px` looked like the culprit, but it is the right number — the page
header above is itself sticky and 68 pixels tall. For an element sticking to the
**viewport**, the offset was correct. Nor was it a z-index or a margin: the
headers were exactly 68 pixels from *something*, just not from the window.

## Cause

A sticky element positions itself against its nearest scrollport, not against
the window. And `overflow-x: auto` with `overflow-y: visible` is not a thing the
CSS box model allows: when one axis is `auto` or `scroll`, the other computes to
`auto` as well. So the wrapper that only meant to scroll sideways became a
scroll container in **both** directions — and the headers dutifully stuck 68
pixels from *its* top edge, which is inside the grid.

## Fix

The grid is roughly one screen tall, so the page header already does the job:
the stickiness went.

```diff
 .day-head {
-  position: sticky;
-  top: 68px;
+  /* Not sticky: .grid-scroll scrolls horizontally, which makes it the sticky
+     reference — and 68px would then be measured inside the grid. */
 }
```

The other honest options: stick to `top: 0` when the wrapper really scrolls
vertically and the header should pin inside it, or move the scroll container so
the sticky element and the scrollport are the ones you meant.

## How not to repeat it

`overflow-x: auto` on its own is almost never what you mean. It creates a
scroll container, and every `position: sticky` inside it now answers to that
container instead of the page. When a sticky element misbehaves, look for the
nearest ancestor with any `overflow` other than `visible` first.
