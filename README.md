# Muhammad Owais Mushtaq — Portfolio Website

The source of my personal portfolio: a fast, single-page static site that introduces who I am, what I build, my education and research, the tools I work with, and how to reach me.

**Live site:** [muhammadowaismushtaq.github.io](https://muhammadowaismushtaq.github.io)

---

## ✨ Features

- **Eight languages.** English, Spanish, French, German, Chinese, Japanese, Arabic and Urdu, picked from the header menu. The choice is remembered, links such as `?lang=fr` open the site straight in a language, and Arabic and Urdu switch the page to right-to-left.
- **Dark and light themes.** A toggle in the header switches themes; the choice is remembered for the next visit.
- **Résumé download.** "Download Résumé" in the About section opens the latest PDF.
- **WhatsApp chat pop-up.** The WhatsApp icons open a chat window in a pop-up. It is loaded only on first open, so it never slows down the page.
- **Contact form.** Messages are delivered by [Formspree](https://formspree.io), with a hidden honeypot field to filter out spam bots.
- **Smart loading screen.** The animated loader closes as soon as the page, fonts and chosen language are ready, instead of after a fixed delay (with a safety timeout so it can never get stuck).
- **Adaptive header.** If a language's menu words are longer, the menu font shrinks to fit beside the logo instead of overlapping it.
- **Responsive.** Layouts for phones, tablets and desktops, with a full-screen menu on small screens.
- **Link previews.** Open Graph and Twitter card tags give a proper title, description and banner image when the site is shared on LinkedIn, WhatsApp or X.
- **Security-minded.** A Content Security Policy limits scripts, styles, fonts, images, frames and form posts to the sources the page needs; the third-party icon script is pinned to a version and checked with Subresource Integrity; external links use `rel="noopener noreferrer"`; and scripts only insert plain text, never HTML.

---

## 🗂️ Project structure

```text
muhammadowaismushtaq.github.io/
├── index.html                  # The whole page: header, hero, stats, about, education,
│                               # skills, portfolio, contact form, footer, WhatsApp pop-up
├── favicon.svg
├── assets/
│   ├── css/
│   │   └── style.css           # All styles, themes and responsive breakpoints
│   ├── js/
│   │   ├── i18n.js             # Language switching (loads before script.js)
│   │   └── script.js           # Header, menu, themes, skills toggle, loader,
│   │                           # WhatsApp pop-up, copyright year
│   ├── i18n/
│   │   ├── en.json             # One file per language, all with the same keys
│   │   └── es.json, fr.json, de.json, zh.json, ja.json, ar.json, ur.json
│   ├── images/                 # Photos, project images, skill icons, loader animation
│   └── resume/
│       └── Resume - Muhammad Owais Mushtaq.pdf
├── .github/workflows/
│   └── jekyll-gh-pages.yml     # Builds and deploys the site to GitHub Pages
└── LICENSE
```

There is no build step or framework: plain HTML, CSS and JavaScript. External resources are limited to Google Fonts (Poppins, Roboto, Russo One) and [Ionicons](https://ionic.io/ionicons) for icons.

---

## 🚀 Deployment

The site is hosted on **GitHub Pages**. Every push to `main` runs the GitHub Actions workflow in `.github/workflows/jekyll-gh-pages.yml`, which builds the site and publishes it to [muhammadowaismushtaq.github.io](https://muhammadowaismushtaq.github.io). Progress and logs are under the repository's **Actions** tab.

Work happens on feature branches (for example `enhancement/ui-update` or `feature/i18n`) and reaches the live site when merged into `main`.

---

## 💻 Run locally

1. Clone the repository:
   ```bash
   git clone https://github.com/muhammadowaismushtaq/muhammadowaismushtaq.github.io.git
   ```
2. Serve the folder with any static file server, for example:
   ```bash
   npx serve .
   ```
   or `python -m http.server`, then open the address it prints.

Opening `index.html` directly from disk mostly works, but the translations are loaded with `fetch`, which browsers block for `file://` pages, so use a local server to test languages.

---

## 🌐 Languages

Each piece of text in `index.html` has a key: `data-i18n="hero.title"` for an element's text, or `data-i18n-attr="placeholder:contact.form.namePlaceholder"` for an attribute (several pairs separated by `;`). `assets/js/i18n.js` swaps in the text from `assets/i18n/<language>.json`. The English text written in `index.html` is the fallback, so a missing translation simply shows in English.

**To change or add text:**
1. Edit the text in `index.html` and give the element a `data-i18n` key.
2. Add the same key to `assets/i18n/en.json` and to every other language file.

**To add a language:** copy `assets/i18n/en.json` to `assets/i18n/<code>.json`, translate the values, add the code to `SUPPORTED_LANGUAGES` in `assets/js/i18n.js` (and to `RIGHT_TO_LEFT_LANGUAGES` for a right-to-left script), and add an `<option>` to the language menu in `index.html`.

---

## ✏️ Common updates

- **Résumé:** replace `assets/resume/Resume - Muhammad Owais Mushtaq.pdf`, keeping the same file name so the download link keeps working.
- **Portfolio card:** copy an existing `<li>` in the `#portfolio` section of `index.html`, change its link, image (in `assets/images/`), title and date, and add translation keys for the title and date.
- **Skill icon:** add the icon to `assets/images/` and copy an existing `<li>` in the skills or tools list.

---

## 📄 License

[MIT](LICENSE) © Muhammad Owais Mushtaq
