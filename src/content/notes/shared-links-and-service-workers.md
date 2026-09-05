---
title: The service worker URL that breaks every shared link
description: A demo API that answers /api/* worked on the home page and died on every link with a query string. The bug was one template literal.
date: 2026-09-04
tags: ['service workers', 'msw', 'debugging']
project: metrics-board
---

A dashboard whose whole premise is *send this link to a colleague* had a bug
that only ever appeared on a link sent to a colleague. Opening `/` worked.
Opening `/?segments=enterprise&from=2026-08-07` showed an error, every time,
on a cold profile.

The mock API is a service worker, registered like this:

```ts
await worker.start({
  serviceWorker: { url: `${document.baseURI}mockServiceWorker.js` },
})
```

`document.baseURI` is not the origin, and it is not the directory of the current
page. It is the full absolute URL of the document, **query string included**. So
on the shared link, the worker URL came out as:

```
http://localhost:4221/?segments=enterprise&from=2026-08-07mockServiceWorker.js
```

Registration failed, nothing intercepted `/api/metrics`, and the static host
answered with `index.html` — a 200 the app could not parse.

## The fix

Resolve, do not concatenate:

```ts
serviceWorker: { url: new URL('mockServiceWorker.js', document.baseURI).toString() }
```

`new URL()` drops the query and the fragment and keeps the directory, which is
what makes it work on a sub-path deployment too.

## Two things this taught me beyond the typo

**A 200 is not a success.** The app treated any 2xx as data and only checked
`response.ok`. When the body turned out to be HTML, `JSON.parse` threw, the
`catch` handed back `null`, and the screen sat on skeletons forever with no
error anywhere. A response that does not have the shape you asked for is a
failure, and saying so out loud is the difference between a five-minute fix and
an afternoon:

```ts
if (typeof body !== 'object' || body === null || !Array.isArray(body.rows)) {
  throw new UnreadableResponse('The answer could not be read. Reload and try again.')
}
```

**`start()` resolving is not the same as the page being controlled.** A worker
can be registered and activated while the current page is still uncontrolled, so
the first few requests bypass it. Waiting for `controllerchange` (with a
timeout, so a browser that never sends it cannot hang the app) closed that gap:

```ts
if (!navigator.serviceWorker.controller) {
  await new Promise((resolve) => {
    const done = () => resolve()
    navigator.serviceWorker.addEventListener('controllerchange', done, { once: true })
    setTimeout(done, 3000)
  })
}
```

The bug was invisible in every check that started from the home page. It took
opening the app the way its own users would — through a link with parameters in
it — to see it at all.
