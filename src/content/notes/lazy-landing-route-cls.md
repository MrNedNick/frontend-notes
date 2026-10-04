---
title: A lazy landing route is a layout shift you are paying for
description: CLS 0.37 on a page whose content never moved. The shift was the footer, and the cause was code splitting on the route that always loads.
date: 2026-09-02
tags: ['performance', 'core web vitals', 'routing']
kind: symptom
symptom: Lighthouse reports a layout shift of 0.37 on a page where nothing visibly moves
category: performance
cause: the landing route is lazily loaded, so the footer paints under an empty main and is pushed 700 px down
project: booking-desk
demo: https://mrnednick.github.io/booking-desk/
commit: https://github.com/MrNedNick/booking-desk/blob/f1fb952/src/app/app.routes.ts#L12
---

## Symptom

Lighthouse on a production build: performance 79, Cumulative Layout Shift
**0.373**. The offender it named was `<main>`, which was odd — nothing inside
`main` moves after it renders.

## How to reproduce

Make the page everyone lands on a lazily loaded route, keep the app shell —
header, `<main>`, footer — in the initial bundle, and record a performance trace
of a cold load.

## What it was not

Not late images, web fonts or an ad slot — there are none. Nothing inside
`main` moves. `main` itself grows.

## Cause

The first frames of the page look like this:

1. Header and footer paint, with an empty `main` between them. The footer sits
   near the top of the viewport, in plain view.
2. The route chunk arrives and renders about 1,400 pixels of grid.
3. The footer is pushed 700 pixels down the page.

That last step is the layout shift. The content did not move; the *furniture
below it* did, and Core Web Vitals counts that the same way a reader does.
Splitting the route that always loads buys nothing: it cannot be prefetched
earlier than the bundle that references it, and it guarantees a frame where the
page is empty.

## Fix

The landing route became a static import; every other route stayed lazy.

```diff
 {
   path: 'schedule',
-  loadComponent: () => import('./features/schedule/schedule-page'),
+  // Not lazy: it is the landing page, and loading it in a second chunk means
+  // painting the shell around an empty page.
+  component: SchedulePage,
 },
```

CLS went from 0.373 to **0**, and performance from 79 to **100**. The initial
bundle grew by about 240 kB raw — 45 kB over the wire — which is a trade I would
take every time for the page everyone lands on.

## How not to repeat it

Never lazy-load the route everyone lands on. And make loading states hold the
space their content will take: a skeleton 350 pixels tall standing in for a
1,050-pixel grid is the same bug in miniature.
