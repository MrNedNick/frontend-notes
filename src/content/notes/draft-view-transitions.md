---
title: View transitions between static pages
description: Notes in progress on cross-document view transitions and what they cost on a site that ships no JavaScript.
date: 2026-09-05
tags: ['css', 'view transitions']
draft: true
---

Cross-document view transitions need only a CSS at-rule and no script, which
makes them the rare progressive enhancement that costs nothing on a static site.

Still working through: how they interact with `prefers-reduced-motion`, whether
the naming scheme survives more than two page types, and what happens to the
back button. Not ready to be read yet.
