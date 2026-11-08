# Muhammad Owais Mushtaq — Portfolio

Welcome to my personal website repository! This GitHub Pages site is where I showcase who I am, what I do, and the projects I'm passionate about.

[Visit the live site →](https://muhammadowaismushtaq.github.io)

---

## 🚀 About Me

Hi there — I’m **Muhammad Owais Mushtaq**, a software developer with a strong interest in backend engineering, enterprise architecture, and open-source development. On this site, I share:

- My **professional journey** and background  
- Key **projects and works** I’ve built or contributed to  
- My **tech stack**, skills, and what I'm learning now  
- Ways to connect with me (socials, email, etc.)

---

## 💻 Featured Projects

Here are some highlighted projects from my GitHub portfolio that you’ll find on this site:

- **ATM Cash Predictor** — A machine-learning project forecasting ATM cash refills.  
- **Parallel Cryptography** — Cryptographic algorithms implemented in parallel for efficiency.  
- **Steganographer** — A steganography utility for hiding and extracting data.  
- **Dynamic Problem Solver** — Tools & algorithms for solving dynamic / optimization problems.

_(For a full list of my projects, check out the Projects section on the site or browse my GitHub repositories.)_

---

## 🧰 Tech Stack & Tools

This website is powered by:

- **GitHub Pages** — Hosting the site with GitHub’s free Pages service  
- **HTML / CSS / JavaScript** — For the front‑end structure and styling  
- *(Optional: Jekyll, if you're using a static site generator)*  

---

## 📚 How to Run Locally

If you want to run this site locally (for development or testing), here’s how:

1. Clone this repository  
   ```bash
   git clone https://github.com/muhammadowaismushtaq/muhammadowaismushtaq.github.io.git
   ```
2. Open `index.html` in a browser, or serve the folder with any static file server.

---

## 🌐 Languages

The site is available in English, Spanish, French, German, Chinese, Japanese, Arabic and Urdu. Visitors pick a language from the menu in the header; the choice is remembered, and a link such as `?lang=fr` opens the site directly in that language. Arabic and Urdu switch the page to right-to-left.

**How it works:** each piece of text in `index.html` has a key (`data-i18n="hero.title"`, or `data-i18n-attr="placeholder:contact.form.name"` for attributes). `assets/js/i18n.js` swaps in the text from `assets/i18n/<language>.json`. The English text in `index.html` is the fallback, so a missing translation simply shows in English.

**To change or add text:**
1. Edit the text in `index.html` and give the element a `data-i18n` key.
2. Add the same key to `assets/i18n/en.json` and to every other language file.

**To add a language:** copy `assets/i18n/en.json` to `assets/i18n/<code>.json`, translate the values, add the code to `SUPPORTED_LANGUAGES` in `assets/js/i18n.js` (and to `RIGHT_TO_LEFT_LANGUAGES` for a right-to-left script), and add an `<option>` to the language menu in `index.html`.
