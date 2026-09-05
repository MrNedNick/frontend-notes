---
title: A lazy landing route is a layout shift you are paying for
description: CLS 0.37 on a page whose content never moved. The shift was the footer, and the cause was code splitting on the route that always loads.
date: 2026-09-02
tags: ['performance', 'core web vitals', 'routing']
project: booking-desk
---

Lighthouse on a production build: performance 79, Cumulative Layout Shift
**0.373**. The offender it named was `<main>`, which was odd — nothing inside
`main` moves after it renders.

Nothing inside it moves. `main` itself grows.

## The sequence

The app shell — header, `<main>`, footer — is in the initial bundle. The
schedule page is a lazily loaded route. So the first frames of the page look
like this:

1. Header and footer paint, with an empty `main` between them. The footer sits
   near the top of the viewport, in plain view.
2. The route chunk arrives and renders about 1,400 pixels of grid.
3. The footer is pushed 700 pixels down the page.

That last step is the layout shift. The content did not move; the *furniture
below it* did, and Core Web Vitals counts that the same way a reader does.

## The fix is the diagnosis

Splitting the route that always loads buys nothing. It cannot be prefetched
earlier than the bundle that references it, and it guarantees a frame where the
page is empty. So: the landing route became a static import, every other route
stayed lazy.

```ts
{
  // Not lazy: it is the landing page, and loading it in a second chunk means
  // painting the shell around an empty page.
  path: 'schedule',
  component: SchedulePage,
},
{
  path: 'bookings',
  loadComponent: () => import('./features/bookings/my-bookings-page'),
},
```

CLS went from 0.373 to **0**, and performance from 79 to **100**. The initial
bundle grew by about 240 kB raw — 45 kB over the wire — which is a trade I would
take every time for the page everyone lands on.

## The second half of the fix

The loading state also has to hold the space its content will take. A skeleton
that is 350 pixels tall standing in for a 1,050-pixel grid is the same bug in
miniature:

```html
<!-- Same height as the grid it becomes: loading must not move the page. -->
<app-skeleton [count]="1" [height]="totalHeight" />
```

A skeleton exists to keep the layout still. One that is the wrong size is just a
grey rectangle with extra steps.
