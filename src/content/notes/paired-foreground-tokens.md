---
title: text-white on your accent fails AA in dark mode
description: One token pair fixes a contrast failure that every button in a design system inherits.
date: 2026-08-30
tags: ['design systems', 'accessibility', 'css']
kind: symptom
symptom: The primary button passes contrast in the light theme and fails it (3.33:1) in the dark one
category: accessibility
cause: the accent colour is themed but the text on it is a constant white
project: metrics-board
demo: https://mrnednick.github.io/metrics-board/
commit: https://github.com/MrNedNick/metrics-board/blob/2e66db8/src/styles/tokens.css#L42
---

## Symptom

Lighthouse accessibility, 96. One failing audit, two elements: the primary
button and the brand badge.

> Element has insufficient color contrast of 3.33 (foreground `#ffffff`,
> background `#5b86ff`). Expected 4.5:1.

Only in the dark theme.

## How to reproduce

Switch to the dark theme and run Lighthouse or axe on any screen with a primary
button. Both offenders come from the same line in the component library:

```
primary: 'bg-accent text-white hover:bg-accent-hover'
```

## What it was not

Not a wrong accent colour. A light theme needs a *dark* accent so it reads
against white: `#3b6cf6` with white text is 4.7:1, comfortably AA. A dark theme
needs a *lighter* accent so it reads against near-black. Both accents are right.

## Cause

The accent is themed. The foreground written on top of it was a constant:
`#5b86ff` with white text is 3.33:1. One of the two had to lose.

## Fix

Every background token that carries text gets a foreground token that travels
with it:

```diff
 @theme {
   --color-accent: #3b6cf6;
+  --color-on-accent: #ffffff;
 }
 :root:where(.dark) {
   --color-accent: #5b86ff;
+  --color-on-accent: #0b1225;  /* near-black text on the lighter accent */
 }
-primary: 'bg-accent text-white hover:bg-accent-hover'
+primary: 'bg-accent text-on-accent hover:bg-accent-hover'
```

Accessibility went 96 → 100, and no component has to know which theme is
active. The same defect was sitting in the `danger` variant, unseen only because
no destructive button happened to be on screen during the audit.

## How not to repeat it

**Grep your component library for `text-white`.** Every hit is a colour decision
that a themed background can invalidate. And audit both themes — a single run in
the default one misses exactly this.
