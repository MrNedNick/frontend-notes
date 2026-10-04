/**
 * A link inside the site, under the deploy base. Pages are folders here
 * (`trailingSlash: 'always'`), so a page link gets its slash up front instead
 * of a 404 in dev and a redirect on the host; files keep their extension.
 */
export function sitePath(path: string): string {
  const clean = path.replace(/^\//, '')
  const isFile = /\.[a-z0-9]+$/i.test(clean)
  const slashed = clean === '' || clean.endsWith('/') || isFile ? clean : `${clean}/`
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${slashed}`
}
