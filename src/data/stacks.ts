/**
 * Numbers from real builds on one laptop, all on the same day, all measured the
 * same way — see /notes/measuring-instead-of-guessing for the method. Bytes are
 * what the browser actually downloaded, gzipped, six seconds after navigation.
 *
 * Update them by re-running the measurement, not by editing them here.
 */
export interface Stack {
  readonly name: string
  readonly stack: string
  readonly what: string
  readonly repo: string
  /** Live demo, when available. Measurements retain their original date. */
  readonly demo: string | null
  readonly buildSeconds: number | null
  /** JavaScript downloaded on first load of the main page, gzipped. */
  readonly jsBytes: number | null
  readonly jsRequests: number | null
  /** Part of `jsBytes` that is the in-browser mock API, not the product. */
  readonly mockApiBytes?: number
  readonly worked: string
  readonly friction: string
  readonly caveat?: string
}

export const MEASURED_ON = '2026-09-05'
export const MEASURED_WITH =
  'MacBook, Node 22.18, production builds, local server with gzip, headless Chrome'

export const STACKS: readonly Stack[] = [
  {
    name: 'frontend-notes',
    stack: 'Astro 7',
    what: 'This site: notes, tags, search, RSS.',
    repo: 'https://github.com/MrNedNick/frontend-notes',
    demo: 'https://mrnednick.github.io/frontend-notes/',
    buildSeconds: 2.8,
    jsBytes: 0,
    jsRequests: 0,
    caveat:
      'Zero is the whole page, not a rounding: no script is requested at all. The theme toggle is a few hundred bytes inlined in the HTML, and the search runtime (46 kB) is fetched on the first keystroke, on the notes page only.',
    worked:
      'A page of prose ships no JavaScript at all, so there is nothing to make fast. Content collections turn front matter into a typed API and stop the build on a bad note instead of dropping it silently.',
    friction:
      'Anything interactive has to be an island or hand-written script, so you decide the cost of every widget one at a time — which is the point, and also more work than reaching for a component.',
  },
  {
    name: 'daily-brief',
    stack: 'SvelteKit 2 + Svelte 5',
    what: 'Hacker News reader: three feeds, comment trees, offline reading, search.',
    repo: 'https://github.com/MrNedNick/daily-brief',
    demo: 'https://mrnednick.github.io/daily-brief/',
    buildSeconds: 2.2,
    jsBytes: 44985,
    jsRequests: 14,
    worked:
      'The least JavaScript of any application here by a wide margin, for a product that is not small: three feeds, a collapsible comment tree, IndexedDB storage and search. Runes make reactivity boring for objects and arrays.',
    friction:
      'Runes proxy objects and arrays but not Set and Map — a Set that never triggered a re-render broke collapsing outright, and the fix is to import SvelteSet. A proxied object also cannot be structured-cloned into IndexedDB, so the storage boundary needs $state.snapshot().',
  },
  {
    name: 'booking-desk',
    stack: 'Angular 20',
    what: 'Meeting-room booking: week grid, typed reactive forms, roles behind a guard.',
    repo: 'https://github.com/MrNedNick/booking-desk',
    demo: 'https://mrnednick.github.io/booking-desk/',
    buildSeconds: 4.6,
    jsBytes: 280113,
    jsRequests: 10,
    mockApiBytes: 95232,
    worked:
      'Strictly typed reactive forms with cross-field validators, dependency injection as a real seam for tests, and rxResource turning a request into loading and error signals — three things that are libraries or hand-rolled elsewhere and are simply present here.',
    friction:
      'The slowest cold build in the set, and the largest framework floor before any product code. Resource params must read signals: reading a form control value in one compiles fine and then never refetches, because there is no dependency to track.',
  },
  {
    name: 'metrics-board',
    stack: 'React 19 + TanStack',
    what: 'Analytics dashboard: 10,000-row virtualized table, filters in the URL, linked charts.',
    repo: 'https://github.com/MrNedNick/metrics-board',
    demo: 'https://mrnednick.github.io/metrics-board/',
    buildSeconds: 2.8,
    jsBytes: 421831,
    jsRequests: 2,
    mockApiBytes: 156672,
    worked:
      'The router owning the filter state removes an entire category of bug: there is no second copy of the filters to keep in sync. keepPreviousData means changing a filter dims the screen instead of collapsing it, and Table v9 makes an unused feature a compile error.',
    friction:
      'By far the heaviest bundle here — the charting library and the three TanStack packages are most of it. Table v9 is new enough that the types teach you the API before the documentation does, and the virtualizer needs its scroll element in state rather than a ref, or it never subscribes.',
  },
  {
    name: 'shoelace-vue-mfe',
    stack: 'Vue 3 + Vite',
    what: 'A custom-element bundle a page can import without a framework of its own.',
    repo: 'https://github.com/MrNedNick/shoelace-vue-mfe',
    demo: null,
    buildSeconds: 0.8,
    jsBytes: 73061,
    jsRequests: null,
    worked:
      'The fastest build in the set, and the output is a single custom element: a host page imports one file and needs no framework at all.',
    friction:
      'A library build has no page, so it cannot be compared like for like — the number below is the bundle a host has to import, and the host still has to load the underlying component library itself.',
    caveat: 'Library build: the bundle a host page imports, not a page load.',
  },
  {
    name: 'split-bill',
    stack: 'Expo + React Native',
    what: 'Split a restaurant bill across a group, on iOS and the web.',
    repo: 'https://github.com/MrNedNick/split-bill',
    demo: null,
    buildSeconds: 11.9,
    jsBytes: 307924,
    jsRequests: 1,
    worked:
      'The same code exports to a single-page web bundle with no extra step: one JS request carries the whole app, and a reload on a deep link like /bill/[id] still resolves because the export target is a SPA rather than one static page per route.',
    friction:
      'The only stack here shipped as one bundle instead of route-based chunks, so the whole app pays for every screen on first load — there is no lazy boundary to split it at without leaving the Expo Router defaults.',
    caveat:
      'Measured 2026-09-06, a day after the rest of this table: the app did not exist yet on 2026-09-05.',
  },
]
