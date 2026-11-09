# Portfolio: Tejas Soddy

Personal portfolio site: seven projects (Scense featured), resume, and contact
links, aimed at recruiters. Plain HTML, CSS, and a little JavaScript. No
framework, no build step. Live at https://tejassoddy.xyz.

## Run locally

```
python -m http.server 8765
```

Then open http://localhost:8765. Any static file server works.

## Deploy

This repo is `redactedtxt/redactedtxt.github.io`, so GitHub Pages serves the
`main` branch automatically. Push to `main` and the site updates within a
minute or two.

## Structure

```
portfolio/
├── index.html    # the whole site: nav, hero + fragrance wheel, projects, toolkit, contact, footer
├── styles.css    # design tokens at the top (spacing, type, radius, color); dark default, light via [data-theme="light"]
├── script.js     # theme toggle, Scense fragrance wheel, image loading states, copy email
└── assets/
    ├── *.png/jpg # project screenshots
    └── Tejas_Soddy_Resume.pdf
```

## Updating

- New project: copy one `<article class="card">` block inside `.grid` in
  `index.html`.
- Styling: change the tokens at the top of `styles.css` rather than one-off
  values. Text colors there are checked for 4.5:1 contrast.
- New screenshot: drop it in `assets/` and update the matching `<img>`.
- New resume: replace `assets/Tejas_Soddy_Resume.pdf` (keep the filename and
  every link keeps working).
