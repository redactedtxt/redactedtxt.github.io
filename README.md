# Portfolio: Tejas Soddy

Personal portfolio site: six projects, resume, and contact links, aimed at
recruiters. Plain HTML + CSS, no framework, no build step.

## Run locally

```
npx serve .
```

Then open the printed URL (defaults to http://localhost:3000). Any static file
server works; the site is just `index.html`, `styles.css`, and `assets/`.

## Deploy

The site is fully static, so any static host works:

- **GitHub Pages**: push this folder to a repo, enable Pages on the main
  branch, done.
- **Netlify / Vercel / Render**: point them at the repo; no build command,
  publish directory is the repo root.

## Structure

```
portfolio/
├── index.html    # the whole site: masthead, project index, five project cards
├── styles.css    # editorial styling: paper/ink palette, one green accent
└── assets/       # real project screenshots + resume PDF
```

## Updating

- New screenshot: drop it in `assets/` and update the matching `<img>` in
  `index.html`.
- New resume: replace `assets/Tejas_Soddy_Resume.pdf` (keep the filename and
  the links keep working).
