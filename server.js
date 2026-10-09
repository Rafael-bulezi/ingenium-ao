const http = require("http");
const fs = require("fs");
const path = require("path");
const root = __dirname;
const port = Number(process.env.PORT || 3000);
const types = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".ts":"text/plain; charset=utf-8" };
const server = http.createServer((req, res) => {
  const clean = decodeURIComponent((req.url || "/").split("?")[0]);
  const requested = clean === "/" ? "/index.html" : clean === "/manus-routes.json" ? "/public/manus-routes.json" : clean;
  const file = path.resolve(root, "." + requested);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(file, (err, data) => {
    if (err) {
      if (!path.extname(requested)) {
        return fs.readFile(path.join(root, "index.html"), (fallbackErr, fallback) => {
          if (fallbackErr) { res.writeHead(500); return res.end("Preview unavailable"); }
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }); res.end(fallback);
        });
      }
      res.writeHead(404); return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control":"no-cache" }); res.end(data);
  });
});
server.listen(port, "0.0.0.0", () => console.log(`Ingenium listening on ${port}`));
