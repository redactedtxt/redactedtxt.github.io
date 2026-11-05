# Portfolio: Tejas Soddy

Personal portfolio site: seven projects (Scense featured), resume, and contact
links, aimed at recruiters. Plain HTML, CSS, and a little JavaScript. No
framework, no build step. Live at https://redactedtxt.github.io.

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
├── index.html    # the whole site: nav, hero + deploy terminal, projects, toolkit, footer
├── styles.css    # dark by default, light via [data-theme="light"]; purple accent, green for live/passing
├── script.js     # theme toggle, deploy-terminal replay, scroll progress, card reveal
└── assets/
    ├── icons/    # tech-stack SVGs (Devicon, MIT)
    ├── *.png/jpg # project screenshots
    └── Tejas_Soddy_Resume.pdf
```

## Updating

- New project: copy one `<article class="card">` block inside `.grid` in
  `index.html`, then renumber.
- New screenshot: drop it in `assets/` and update the matching `<img>`.
- New resume: replace `assets/Tejas_Soddy_Resume.pdf` (keep the filename and
  every link keeps working).
