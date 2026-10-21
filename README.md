# Lamalo Publication — website

Static site for Lamalo Publication in Traditional Chinese, Simplified Chinese, English and Hebrew (right-to-left). No build step is needed: open `index.html` in a browser or upload the folder to any static host (GitHub Pages, Netlify, Cloudflare Pages, etc.).

- `index.html` is the **home page**, about the publisher and the author, with the first book featured.
- `two-messiahs.html` is the **book page** for *兩種彌賽亞 / Two Messiahs*.

**Local preview:** double-click `preview.bat`. It starts a server at http://localhost:8080/ and opens your browser. Close the window to stop it.

```
preview.bat             start a local preview server (uses Node.js, or Python as a fallback)
index.html              home page: publisher + author (Traditional Chinese text)
two-messiahs.html       book page (Traditional Chinese text)
assets/css/style.css    all styling
assets/js/main.js       language switching, menu, animations, SITE_CONFIG
assets/i18n/en.js       English text for both pages
assets/i18n/he.js       Hebrew text for both pages
assets/i18n/zh-Hans.js  Simplified Chinese text (generated, see below)
assets/img/             cover art, author photo, share image, favicon, ink splatter
tools/                  Simplified Chinese generator and the preview server
```

## Common edits

**Purchase links and contact email.** Open `assets/js/main.js` and fill in `SITE_CONFIG` at the top. Empty values keep the "即將上架 / Coming soon" state. A filled link turns the matching edition button into a "購買／預訂" link. An email shows the contact section on the home page and a "與我們聯絡" line under the book's editions.

**Changing text.**
- Traditional Chinese: edit `index.html` or `two-messiahs.html` directly. Each translatable element has a `data-i18n="key"`. A key used on both pages (the author bio, footer, edition names) must have the same text on both.
- English / Hebrew: edit the same key in `assets/i18n/en.js` or `assets/i18n/he.js`.
- Simplified Chinese: after editing the Traditional text, regenerate it:
  ```
  cd tools
  npm install
  npm run build:zh-hans
  ```
  This converts every Traditional string on both pages with OpenCC (Taiwan → Mainland), switches 「」 to “”, and changes 西元 to 公元. It warns if a shared key has different text on the two pages.

**Language links.** Add `?lang=zh-Hans`, `?lang=en` or `?lang=he` to a URL to open the page in that language, for example to share an English link. Visitors who arrive without the parameter get a language chosen from their browser settings, their last choice is remembered, and links between the two pages keep the current language.

## Link previews (WhatsApp, Facebook, LINE…)

Both pages use `assets/img/share-two-messiahs.jpg` (1200×630, the book cover with the English and Hebrew titles beside it) as the preview image. The preview tags are in the `<head>` of each page and point to the full public address:

```
https://yoniwick.github.io/lamalopubliscation/
```

- Previews only work once the site is online at that address. WhatsApp can't see `localhost` or files on your computer.
- If you move to your own domain, replace that address in the `<head>` of `index.html` and `two-messiahs.html`. The tags to change are `canonical`, `og:url`, `og:image`, `og:image:secure_url` and `twitter:image`.
- WhatsApp caches previews. If you change the image later, give it a new filename (or add `?v=2` to the `og:image` URL) so WhatsApp fetches it again.
- To check a preview before sharing, paste the URL into https://developers.facebook.com/tools/debug/. WhatsApp reads the same tags.
