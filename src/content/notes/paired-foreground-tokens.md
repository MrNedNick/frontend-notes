---
title: text-white on your accent fails AA in dark mode
description: One token pair fixes a contrast failure that every button in a design system inherits.
date: 2026-08-30
tags: ['design systems', 'accessibility', 'css']
project: metrics-board
---

Lighthouse accessibility, 96. One failing audit, two elements: the primary
button and the brand badge.

> Element has insufficient color contrast of 3.33 (foreground `#ffffff`,
> background `#5b86ff`). Expected 4.5:1.

Both come from the same line in the component library:

```
primary: 'bg-accent text-white hover:bg-accent-hover'
```

## Why it only breaks in the dark theme

A light theme needs a *dark* accent so it reads against white: `#3b6cf6` with
white text is 4.7:1, comfortably AA. A dark theme needs a *lighter* accent so it
reads against near-black — and `#5b86ff` with white text is 3.33:1.

The accent is themed. The foreground written on top of it was a constant. One of
the two had to lose.

## The pair

Every background token that carries text needs a foreground token that travels
with it:

```css
@theme {
  --color-accent: #3b6cf6;
  --color-on-accent: #ffffff;
}

:root:where(.dark) {
  --color-accent: #5b86ff;
  --color-on-accent: #0b1225;  /* near-black text on the lighter accent */
}
```

```
primary: 'bg-accent text-on-accent hover:bg-accent-hover'
```

Accessibility went 96 → 100, and no component has to know which theme is
active — which was the point of tokens in the first place. The same defect was
sitting in the `danger` variant, unseen only because no destructive button
happened to be on screen during the audit.

If you take one habit from this: **grep your component library for
`text-white`**. Every hit is a colour decision that a themed background can
invalidate.
