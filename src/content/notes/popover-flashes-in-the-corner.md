---
title: A popover that flashes in the corner for one frame
description: The Popover API gives Escape, light dismiss and the top layer for free. Placing the panel next to its button is on you — and React does not tell you when.
date: 2026-09-26
tags: ['react', 'popover', 'debugging']
kind: symptom
symptom: Clicking “?” makes the explanation blink in the top-left corner before it jumps next to the button
category: layout
cause: React does not wire onToggle on popover elements, and the panel is placed a task after it is already shown
project: metrics-board
demo: https://mrnednick.github.io/metrics-board/
commit: https://github.com/MrNedNick/metrics-board/blob/bc5c191/src/components/definition/definition.tsx#L26
---

## Symptom

A small "?" next to each metric opens a definition. On click, the panel appeared
for one frame in the top-left corner of the window, then jumped to its place
beside the button. Easy to miss, impossible to unsee.

## How to reproduce

A `popover="auto"` panel positioned with `position: fixed` and `inset: auto`,
placed by script next to the button that opens it:

```tsx
<div popover="auto" onToggle={(e) => place(panel, button)}>…</div>
```

Click the button and record the screen at a high frame rate.

## What it was not

Not CSS anchoring gone wrong, and not a transition: the panel's position was
correct as soon as the placing code ran. The question was *when* it ran — and
with `onToggle` on the element, the answer was "never".

## Cause

Two things stacked. React does not attach `onToggle` to popover elements, so the
placing handler was silently not called and the panel opened at its default
spot. And even with a native listener, `toggle` arrives a task **after** the
popover is shown, so there is always one painted frame at the default position
before anything can move it.

## Fix

Native listeners, and the panel stays invisible from `beforetoggle` until it has
been placed:

```diff
-<div popover="auto" onToggle={…}>
+useEffect(() => {
+  const element = panel.current
+  // `toggle` arrives a task after the panel is shown; hiding it until then
+  // keeps it from flashing in the corner for a frame.
+  const onBeforeToggle = (event) => {
+    if (event.newState === 'open') element.style.visibility = 'hidden'
+  }
+  const onToggle = (event) => {
+    const opened = event.newState === 'open'
+    setOpen(opened)
+    if (opened) place(element, button.current)
+    element.style.visibility = ''
+  }
+  element.addEventListener('beforetoggle', onBeforeToggle)
+  element.addEventListener('toggle', onToggle)
+  return () => { /* remove both */ }
+}, [])
```

The same `toggle` listener keeps `aria-expanded` on the button honest.

## How not to repeat it

When a framework wraps the DOM, check that it actually forwards the event you
rely on — new platform events often are not wired yet. And anything placed by
script after it becomes visible will flash: hide it until it is in place, or let
CSS anchor positioning place it before the first paint.
