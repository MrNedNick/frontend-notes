---
title: Sticky headers slide the wrong way inside a horizontal scroller
description: A week grid whose day headers sat 68 pixels down inside the table. The cause is a rule about overflow that is easy to forget.
date: 2026-09-03
tags: ['css', 'layout', 'debugging']
project: booking-desk
---

A schedule grid, five day columns, sticky headers at the top. The headers
rendered 68 pixels *below* where they belonged, overlapping the first two rows
of the grid. Nothing was scrolled.

The markup was ordinary:

```html
<div class="grid-scroll">   <!-- overflow-x: auto -->
  <div class="grid">
    <div class="day-head">Mon</div>   <!-- position: sticky; top: 68px -->
```

The `top: 68px` was there to clear the page header, which is itself sticky. That
is the right number — for an element sticking to the **viewport**.

## The rule that bites

A sticky element positions itself against its nearest scrollport, not against
the window. And `overflow-x: auto` with `overflow-y: visible` is not a thing the
CSS box model allows: when one axis is `auto` or `scroll`, the other computes to
`auto` as well. So the wrapper that only meant to scroll sideways became a
scroll container in **both** directions — and the headers dutifully stuck 68
pixels from *its* top edge, which is inside the grid.

## What to do about it

The honest options, in the order I would try them:

1. **Drop the stickiness.** If the scroller is roughly one screen tall, the page
   header is already doing the job. This is what the grid ended up with.
2. **Stick to `top: 0`** and let the wrapper be the reference frame — correct
   when the wrapper actually scrolls vertically and you want the header pinned
   inside it.
3. **Move the scroll container**, so the sticky element and the scrollport are
   the ones you meant them to be.

The general lesson is smaller than the bug: `overflow-x: auto` on its own is
almost never what you mean. It creates a scroll container, and every
`position: sticky` inside it now answers to that container instead of the page.
