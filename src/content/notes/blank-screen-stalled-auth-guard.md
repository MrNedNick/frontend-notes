---
title: A blank screen for a minute, while the site is perfectly alive
description: An expired token, a backend that no longer exists and a router guard that waits without a deadline. In a clean browser the bug does not exist at all.
date: 2026-09-26
tags: ['routing', 'auth', 'debugging']
kind: symptom
symptom: The app shows a blank page for about a minute, then jumps to the welcome screen
category: network
cause: the router guard awaits an auth check that keeps retrying a token refresh against an unreachable backend
project: VibeOS
demo: https://mrnednick.github.io/VibeOS/
commit: https://github.com/MrNedNick/VibeOS/commit/a3e941a
---

## Symptom

Someone opened the live demo and saw nothing. Not an error — a white page. After
about a minute it jumped to the welcome screen on its own. In my browser, a
fresh profile, the same link opened in a second.

## How to reproduce

Store a signed-in session with an expired token, point the build at a backend
that does not answer, and load the app:

- 33 seconds: still blank;
- 60 seconds: still blank;
- ~65 seconds: redirect to `/welcome`.

A clean browser has no session, needs no network to start, and never shows the
bug — which is why every check from a fresh profile passed.

## What it was not

Not the hosting: the address answered 200, and the 301 from `/VibeOS` to
`/VibeOS/` was fine. Not a stale service worker either — clearing it changed
nothing. The difference between the two browsers was only what was stored in
them.

## Cause

The demo's backend project had been removed, its hostname no longer resolved.
With a session in storage, `getSession()` tries to refresh the expired token,
and the auth client keeps retrying a failed refresh for 30–60 seconds. The
global router guard awaits `auth.ready` before every first navigation — and
`ready` resolved only when `init()` finished. A guard with no deadline turned
"the network is down" into "the app does not exist".

A second link showed up once the first was fixed: module screens with no data
waited for a sync counter that a failed or empty pull never bumped, and stayed on
skeletons forever.

## Fix

```diff
+// supabase-js keeps retrying a failed refresh for ~30-60 s, and the router
+// guard awaits `ready`. Past the cap the app opens on local state.
+const BOOT_SESSION_TIMEOUT_MS = 4000
+
 async function init(): Promise<void> {
+  const bootCap = setTimeout(() => { _markReady(); useSyncBus().markSettled() }, BOOT_SESSION_TIMEOUT_MS)
   try {
-    const { data: { session } } = await sb.auth.getSession()
+    const { data: { session }, error } = await sb.auth.getSession()
     …
-    } else if (_state.value.user?.provider === 'supabase') {
+    } else if (_state.value.user?.provider === 'supabase' && error?.name !== 'AuthRetryableFetchError') {
       _setUser(null)   // a network failure is not a sign-out
     }
   } finally {
+    clearTimeout(bootCap)
     _markReady()
   }
 }
```

The app now opens on local data within about four seconds, a network error no
longer signs anyone out, and a `settled` flag — set when the first pull finishes
in any way, or when no pull is coming — ends the skeletons.

## How not to repeat it

**Every await in a router guard needs a deadline.** A local-first app should
treat the backend as optional at boot. And test with the state real users carry:
an old session, a dead token, a backend that times out — not only a clean
profile.
