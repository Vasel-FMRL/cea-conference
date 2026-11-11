# Cleaner Earth & Atmosphere Conference (CEA) website

Static website for the CEA conference, hosted with GitHub Pages.

- `index.html` contains the whole site: content, styles and scripts.
- `assets/` holds photos, headshots, logos, book covers and downloadable documents.
- `media/hero.mp4` is the looping background video in the header. `media/hero-scene-source.html` is the animation it was rendered from.

## Updating content

Most yearly updates are in `index.html`:

- **Important dates:** the `DATES` list near the bottom of the file.
- **Registration fees:** the `FEES` list.
- **Past editions:** the `PAST` list. Add a cover image to `assets/books/<year>.jpg`.
- **Speakers and committee:** the `#speakers` and `#committee` sections. Headshots go in `assets/people/`.

Commit to `main`, and GitHub Pages republishes the site within a minute or two.
