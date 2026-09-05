---
title: Label in name, or why your aria-label can fail an audit for being too good
description: An accessible name that reads beautifully and does not contain the visible text is a WCAG failure. Voice control is the reason.
date: 2026-08-31
tags: ['accessibility', 'wcag', 'aria']
project: booking-desk
---

A booking block in a schedule grid shows two lines: the meeting title and who
booked it. It had this label:

```html
<button aria-label="11:00–11:30 Design review, booked by Tomas Neruda">
  <span>Design review</span>
  <span>Tomas Neruda</span>
</button>
```

That is a good label. It is also a WCAG 2.5.3 failure, and the audit is right.

## Who this rule is for

Someone using voice control says *"click Design review"*. The software matches
what they said against the element's **accessible name**. If the visible text is
not contained in that name — in order — the match fails and the control cannot
be operated by voice at all.

My label started with the time. "Design review Tomas Neruda" is not a substring
of "11:00–11:30 Design review, booked by Tomas Neruda", so the visible words a
person would speak do not address the control.

## The fix

Lead with the visible text, then add the detail:

```html
<button aria-label="Design review Tomas Neruda 11:00–11:30">
```

It reads slightly less like prose and considerably more like the thing on
screen, which is the entire point. The rule of thumb I now use: **the accessible
name starts with exactly what is written on the control**, and everything extra
comes after.

Worth knowing: this audit is weighted zero in Lighthouse, so the score stays 100
while the control stays unusable by voice. A green number is not the same as an
accessible interface.
