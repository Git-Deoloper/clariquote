# Deployment

## Cloudflare Pages

Connect the repository to Cloudflare Pages and configure:

- Build command: `npm run build`
- Build output: `dist`
- Node.js: 22

Verify that your host applies the `_headers` file, serves over HTTPS, and has not introduced analytics or third-party scripts.

## GitHub Pages

Deploy the generated `dist/` directory as static files using a Pages workflow. GitHub Pages does not automatically apply Cloudflare-style `_headers`; configure equivalent headers only on a host that supports them. The security guarantees differ without a strict Content Security Policy.

## Review before going live

1. Test in current Safari, Chrome, Firefox, and mobile Safari/Chrome.
2. Create a blank proposal, add/remove a deliverable, change currencies and themes.
3. Export PDF and verify pagination, totals, and missing-field warnings.
4. Export JSON, reload, import it, compare values, then copy Markdown.
5. Open developer tools Network: verify proposal editing makes no requests.
6. Confirm the host sets CSP, Referrer-Policy and X-Content-Type-Options.
7. Add absolute canonical and social URLs **after you select a real public domain**; avoid publishing broken placeholder domains.
8. Perform trademark/name review and ensure all code/artwork belongs to this repository before publishing.
