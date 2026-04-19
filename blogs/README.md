# IndiBargain Blog Subdomain

This folder is an isolated blog site designed for `blogs.indibargain.com`.

## Compatibility

- 100% static (HTML, CSS, JS, JSON only)
- No backend/server-side code required
- Works on GitHub Pages

## Publish as a subdomain

If you are using **GitHub Pages**, publish this folder from a separate repo or branch and set its custom domain to:

`blogs.indibargain.com`

Then add this DNS record in your domain provider:

- Type: `CNAME`
- Host/Name: `blogs`
- Value/Target: your GitHub Pages host (example: `yourusername.github.io`)

If you are using Netlify/Cloudflare/Vercel, deploy this folder as a separate site and bind the same subdomain.

## Add new articles

Edit `blogs/data/posts.json` and add a new object with:

- `slug`
- `title`
- `excerpt`
- `content`
- `category`
- `author`
- `date`
- `readTime`
