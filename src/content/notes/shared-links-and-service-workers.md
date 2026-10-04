---
title: The service worker URL that breaks every shared link
description: A demo API that answers /api/* worked on the home page and died on every link with a query string. The bug was one template literal.
date: 2026-09-04
tags: ['service workers', 'msw', 'debugging']
kind: symptom
symptom: The dashboard works from the home page but every shared link with filters shows an error
category: network
cause: the service worker URL is built by concatenating document.baseURI, which carries the query string
project: metrics-board
demo: https://mrnednick.github.io/metrics-board/?segments=enterprise
commit: https://github.com/MrNedNick/metrics-board/blob/2e66db8/src/mocks/browser.ts#L18
---

## Symptom

A dashboard whose whole premise is *send this link to a colleague* had a bug
that only ever appeared on a link sent to a colleague. Opening `/` worked.
Opening `/?segments=enterprise&from=2026-08-07` showed an error, every time, on
a cold profile.

## How to reproduce

Open a link with a query string in a fresh profile, so no service worker is
registered yet. The mock API is a service worker, registered like this:

```ts
await worker.start({
  serviceWorker: { url: `${document.baseURI}mockServiceWorker.js` },
})
```

## What it was not

Not the data, and not the filters — the same filters chosen on the page worked.
And not a failing request in the obvious sense: `/api/metrics` answered **200**.
The static host was serving `index.html` for it, a 200 the app could not parse.

## Cause

`document.baseURI` is not the origin, and it is not the directory of the current
page. It is the full absolute URL of the document, **query string included**. So
on the shared link the worker URL came out as:

```
http://localhost:4221/?segments=enterprise&from=2026-08-07mockServiceWorker.js
```

Registration failed, nothing intercepted `/api/metrics`, and the HTML fallback
went to `JSON.parse`. The app treated any 2xx as data, the `catch` handed back
`null`, and the screen sat on skeletons with no error anywhere.

## Fix

Resolve, do not concatenate:

```diff
-serviceWorker: { url: `${document.baseURI}mockServiceWorker.js` },
+serviceWorker: { url: new URL('mockServiceWorker.js', document.baseURI).toString() },
```

`new URL()` drops the query and the fragment and keeps the directory. Two more
changes came with it: a response without the expected shape now throws a
readable error instead of becoming `null`, and the app waits for
`controllerchange` (with a timeout) before its first request, because `start()`
resolving does not mean the page is controlled yet.

## How not to repeat it

**A 200 is not a success** — check the shape of what came back. Build URLs with
`new URL()`, never by gluing strings onto `baseURI`. And test the app the way its
users open it: through a link with parameters, in a clean profile.
