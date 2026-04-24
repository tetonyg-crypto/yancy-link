/**
 * Vercel serverless function — returns 410 Gone for any request.
 *
 * Mounted at /api/gone and invoked via rewrite rule in vercel.json
 * for any request matching /archive/*. Tells Google (and any other
 * crawler) that the requested URL has been permanently removed and
 * should be dropped from the index. 410 is a stronger deindex
 * signal than 404 — per Google's own docs, 410 triggers faster
 * removal from search results.
 *
 * Content is plain text, deliberately small — nothing to parse,
 * nothing to cache, nothing to show in search snippets.
 */
export default function handler(_req, res) {
  res.status(410);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.send('410 Gone — This URL has been permanently removed.');
}
