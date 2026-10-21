// Zero-dependency static server for local review of the site.
// Usage: node tools/serve.cjs [port] [--no-open]
const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const openBrowser = !args.includes("--no-open");
const startPort = parseInt(args.find((a) => /^\d+$/.test(a)) || "8080", 10);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".md": "text/plain; charset=utf-8",
};

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }
  let file = path.join(ROOT, urlPath);
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  if (urlPath.endsWith("/")) file = path.join(file, "index.html");

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found: " + urlPath);
      console.log("404", urlPath);
      return;
    }
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store", // always show the latest edits
    });
    res.end(data);
  });
});

function listen(port, triesLeft) {
  server.once("error", (e) => {
    if (e.code === "EADDRINUSE" && triesLeft > 0) listen(port + 1, triesLeft - 1);
    else { console.error(e.message); process.exit(1); }
  });
  server.listen(port, "127.0.0.1", () => {
    const url = `http://localhost:${port}/`;
    console.log("");
    console.log("  Lamalo Publication - local preview");
    console.log("  Home page: " + url);
    console.log("  Book page: " + url + "two-messiahs.html");
    console.log("");
    console.log("  Other languages:");
    console.log("    " + url + "?lang=zh-Hans");
    console.log("    " + url + "?lang=en");
    console.log("    " + url + "?lang=he");
    console.log("");
    console.log("  Press Ctrl+C to stop.");
    console.log("");
    if (openBrowser) {
      const cmd = process.platform === "win32" ? `start "" "${url}"`
        : process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`;
      exec(cmd);
    }
  });
}

listen(startPort, 10);
