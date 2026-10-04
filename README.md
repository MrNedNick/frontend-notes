# Frontend Notes

[Live demo](https://mrnednick.github.io/frontend-notes/)

Frontend bugs from my own projects, filed under what they looked like — a blank
screen, a header hanging in the wrong place, a layout shift on a page that does
not move — each with the cause, the fix and a live demo where the bug is gone.

![The home page: an index of symptoms with their category, cause and project](docs/index.png)

## What it is

- **Eight bugs, indexed by symptom.** The home page is a list of what people
  saw — *"The app shows a blank page for about a minute"*, *"Clicking ? makes
  the explanation blink in the corner"* — with the category, the cause in one
  line and the project. A plain page per category filters them without
  JavaScript.
- **Each note in the same order:** symptom → how to reproduce → what it was not
  → cause → the fix as one diff → how not to repeat it, with links to the fix in
  the project's history and to a live page where the bug is gone.
- **A stack comparison** with cold build times and the JavaScript each project
  actually hands the browser — measured on one laptop, on one afternoon, all the
  same way.
- **Search across the full text**, tags, an RSS feed, a sitemap, and a generated
  preview image per note.

## How much JavaScript this site ships

Zero, on every page, as counted by the browser:

| Page | JS requests | JS bytes |
|---|---|---|
| Home, a category page, a note, a tag page, the comparison | 0 | 0 |
| The notes index, after you type in the search box | 1 | 46 kB (Pagefind) |

The two scripts on a page are inlined in the HTML and add up to about a
kilobyte: one sets the theme class before the first paint, one handles the toggle.
Nothing else is shipped, because nothing else needs to run — the pages are
rendered at build time and the only interactive thing on the site is the search
box, whose engine is fetched on the first keystroke and never before.

That is the entire argument for this stack, and it is the reason the number is
in the table rather than in a sentence: for a site that is mostly prose,
everything else in the comparison ships between 44 kB and 412 kB before it can
draw anything.

## The stack

| | |
|---|---|
| Framework | Astro 7 — static output, no adapter |
| Content | Content collections with a Zod schema, Markdown and MDX |
| Styling | Tailwind 4 with a token layer, light and dark |
| Search | Pagefind, indexed from the rendered HTML at build time |
| Images | `satori` + `resvg` generating an Open Graph card per note |
| Tests | Vitest — the front matter, the comparison data, and the built site |

## What is worth looking at

- **The schema is the contract.** `src/content/schema.ts` is a plain Zod object
  imported by both the collection config and the tests, so a bug note without a
  symptom, a category, a demo or a link to its fix fails the build with the file
  name and the field, rather than disappearing quietly from a list. Tests also
  check that every bug note is written in the six sections, in order.
- **Drafts live in the open.** A note with `draft: true` renders on the dev
  server and never reaches a production build — no branch, no folder of things
  someone forgot about.
- **Search is the only island, and it is lazy.** The runtime is imported on the
  first keystroke. It also has to be loaded past the bundler: even with a
  runtime path and a `@vite-ignore` comment, the build rewrote the dynamic
  import into its preload helper and left `__VITE_PRELOAD__` unsubstituted in
  the inlined script, so the import threw at runtime. The workaround, and the
  reason for it, are commented where they live.
- **The numbers are reproducible.** `/notes/measuring-instead-of-guessing`
  describes the method: delete every cache, time the build, serve the output
  over a gzipping local server, and let headless Chrome count what it
  downloaded.

## Adding a note

Copy [`docs/note-template.md`](docs/note-template.md) into `src/content/notes/`,
fill in the front matter — the symptom in the words someone would search for,
the category, a one-line cause, the project, a live demo and the fix — and write
the six sections. `npm run build` tells you what is missing.

## Running it

```bash
npm install
npm run dev        # http://localhost:4321
```

```bash
npm run lint       # astro check
npm run build      # astro build + pagefind index
npm test           # 33 tests
```

Node 22. Search only works against a production build, because the index is
generated from the rendered pages — the dev server says so instead of failing
silently.

## Tests

Thirty-three of them, in three layers:

- **Front matter** — every note validates against the same schema the build
  uses, drafts are allowed to be stubs and published notes are not, and no two
  tag spellings collapse into one page.
- **Comparison data** — every row has a repository and a description, a row is
  either fully measured or openly marked as a gap, and a mock-API figure can
  never exceed the bundle it is part of.
- **The built site** — no `<script src>` on a note page, no draft in the output
  or the feed, a preview image and a canonical link for every note, a search
  index, a sitemap and a 404 page.

CI runs lint → build → test, in that order, because the last group asserts on
the built output.

## Deploy

`netlify.toml` is committed: build command, publish directory, immutable caching
for hashed assets and preview images, and no caching for the search index, which
is regenerated on every build.

```bash
npx netlify deploy --prod
```

The public site is hosted on GitHub Pages. Lighthouse on the local
production build reports **100 / 100 / 100 / 100** (performance, accessibility,
best practices, SEO) on both the home page and a note page, with CLS 0.

## Known limits

- Static output only: no server, no comments, no analytics.
- Pagefind indexes the built HTML, so search reflects the last build rather than
  the working tree.
- The comparison covers what has been built. One project in the table has no
  numbers because it does not exist yet, and it says so rather than being
  quietly dropped.

## Deployment

GitHub Actions checks, builds, tests, and deploys the site to GitHub Pages.
Set `GITHUB_PAGES=true` for the `/frontend-notes/` base path; local development stays at `/`.
Navigation, RSS, preview images, and the search index use the configured base path.
