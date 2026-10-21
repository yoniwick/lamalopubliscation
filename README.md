# Lamalo Publication — website

Static one-page site for *兩種彌賽亞 / Two Messiahs* in Traditional Chinese, Simplified Chinese, English and Hebrew (right-to-left). No build step is needed: open `index.html` in a browser or upload the folder to any static host (Netlify, Cloudflare Pages, GitHub Pages, etc.).

**Local preview:** double-click `preview.bat`. It starts a server at http://localhost:8080/ and opens your browser. Close the window to stop it.

```
preview.bat             start a local preview server (uses Node.js, or Python as a fallback)
index.html              page structure + the Traditional Chinese text
assets/css/style.css    all styling
assets/js/main.js       language switching, menu, animations, SITE_CONFIG
assets/i18n/en.js       English text
assets/i18n/he.js       Hebrew text
assets/i18n/zh-Hans.js  Simplified Chinese text (generated, see below)
assets/img/             cover art, author photo, favicon, ink splatter
tools/                  generator for the Simplified Chinese file
```

## Common edits

**Purchase links and contact email.** Open `assets/js/main.js` and fill in `SITE_CONFIG` at the top. Empty values keep the "即將上架 / Coming soon" state. A filled link turns the matching edition button into a "購買／預訂" link, and an email shows a "與我們聯絡" line under the editions.

**Changing text.**
- Traditional Chinese: edit `index.html` directly. Each translatable element has a `data-i18n="key"`.
- English / Hebrew: edit the same key in `assets/i18n/en.js` or `assets/i18n/he.js`.
- Simplified Chinese: after editing the Traditional text, regenerate it:
  ```
  cd tools
  npm install
  npm run build:zh-hans
  ```
  This converts every Traditional string with OpenCC (Taiwan → Mainland), switches 「」 to “”, and changes 西元 to 公元.

**Language links.** Add `?lang=zh-Hans`, `?lang=en` or `?lang=he` to the URL to open the page in that language, for example to share an English link. Visitors who arrive without the parameter get a language chosen from their browser settings, and their last choice is remembered.
