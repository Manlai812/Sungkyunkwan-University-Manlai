# Manlai — Ulaanbaatar to Seoul

Personal one-page site: your prep for Mongolia's national exam, IELTS, applying
to Korean universities, and an introduction to SKKU. Bilingual (English /
Монгол).

## Files

```
index.html          Page structure only — no inline CSS or JS
css/styles.css       All styling
js/script.js          All interactivity: language switch + scroll animation
translations.json     English + Mongolian text, edited independently of the HTML
serve.py               Local preview server (see below)
```

## Previewing locally

Don't open `index.html` by double-clicking it — browsers block the
`translations.json` fetch under `file://`, so the language switch won't work.
Instead, from this folder run:

```bash
python3 serve.py
```

It starts a local server and opens `http://localhost:8000` in your browser.
Stop it with `Ctrl+C`. Pass a different port if 8000 is busy:
`python3 serve.py 3000`.

## Adding your video

In `index.html`, inside `<section id="video">`, replace the placeholder
`<div class="placeholder">…</div>` block with:

```html
<video controls poster="your-poster.jpg">
  <source src="your-video.mp4" type="video/mp4">
</video>
```

Put the video file in this folder (or a subfolder like `assets/`) and update
the `src` path to match. If it's hosted on YouTube/Vimeo instead, embed
their iframe there.

## Adding the SKKU logo

In the same file, inside `<section id="skku">`, find `<div class="logo-slot">`
and uncomment/add:

```html
<img src="your-skku-logo.png" alt="SKKU logo">
```

Use the official logo file — it isn't bundled here.

## Editing text / adding a third language

All visible copy lives in `translations.json`, under `"en"` and `"mn"`. Each
key matches a `data-i18n` (plain text) or `data-i18n-html` (text with inline
tags like `<em>` or `<br>`) attribute in `index.html`. Edit the strings
directly — no need to touch the HTML or JS for text changes.

To add a third language: duplicate one of the language blocks in
`translations.json`, translate the values, give it a key (e.g. `"kr"`), then
in `js/script.js` add a button/handler for it (the current toggle only
flips between two languages).

## Publishing on GitHub

This is a static site — three files plus a JSON file, no build step needed.
Push the folder to a repo and either:
- leave it as a private repo you just keep files in (per your plan), or
- enable **GitHub Pages** (Settings → Pages) if you ever want it viewable at
  a URL — pick `main` branch, root folder.

`serve.py` is only for local preview; it isn't needed for GitHub Pages
hosting itself.
