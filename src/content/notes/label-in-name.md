---
title: Label in name, or why your aria-label can fail an audit for being too good
description: An accessible name that reads beautifully and does not contain the visible text is a WCAG failure. Voice control is the reason.
date: 2026-08-31
tags: ['accessibility', 'wcag', 'aria']
kind: symptom
symptom: Saying “click Design review” to voice control does nothing, though the button says Design review
category: accessibility
cause: the aria-label starts with the time, so the visible words are not contained in the accessible name
project: booking-desk
demo: https://mrnednick.github.io/booking-desk/
commit: https://github.com/MrNedNick/booking-desk/blob/f1fb952/src/app/features/schedule/schedule-page.ts#L156
---

## Symptom

A booking block in a schedule grid shows two lines: the meeting title and who
booked it. A voice-control user says *"click Design review"* — and nothing
happens. The audit flags WCAG 2.5.3, *label in name*.

## How to reproduce

```html
<button aria-label="11:00–11:30 Design review, booked by Tomas Neruda">
  <span>Design review</span>
  <span>Tomas Neruda</span>
</button>
```

Run axe on it, or speak the visible text to Voice Control on macOS.

## What it was not

The label is not wrong, short or vague — it is a *good* label, more informative
than the visible text. And Lighthouse stays at 100: this audit is weighted zero,
so the score does not move while the control stays unusable by voice.

## Cause

Voice control matches what was said against the element's **accessible name**.
If the visible text is not contained in that name — in order — the match fails.
"Design review Tomas Neruda" is not a substring of "11:00–11:30 Design review,
booked by Tomas Neruda", so the words a person would speak do not address the
control.

## Fix

Lead with the visible text, then add the detail:

```diff
-<button aria-label="11:00–11:30 Design review, booked by Tomas Neruda">
+<button aria-label="Design review Tomas Neruda 11:00–11:30">
```

It reads slightly less like prose and considerably more like the thing on
screen, which is the entire point.

## How not to repeat it

**The accessible name starts with exactly what is written on the control**, and
everything extra comes after. A green Lighthouse number is not the same as an
accessible interface: check label-in-name with axe, or by voice.
