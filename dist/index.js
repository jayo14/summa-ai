// server/index.ts
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var server = createServer(app);
var staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public");
var apiUrl = process.env.API_URL || "http://127.0.0.1:8000";
app.use("/api", async (req, res) => {
  try {
    const subPath = req.url.startsWith("/v1") ? req.url : `/v1${req.url.startsWith("/") ? "" : "/"}${req.url}`;
    const targetUrl = `${apiUrl.replace(/\/+$/, "")}/api${subPath}`;
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value && key.toLowerCase() !== "host") {
        headers[key] = Array.isArray(value) ? value.join(", ") : value;
      }
    }
    const body = ["GET", "HEAD"].includes(req.method) ? void 0 : await new Promise((resolve) => {
      const chunks = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => resolve(Buffer.concat(chunks)));
    });
    const proxyResp = await fetch(targetUrl, {
      method: req.method,
      headers,
      body
    });
    res.status(proxyResp.status);
    const hopByHopHeaders = ["transfer-encoding", "content-encoding", "content-length"];
    proxyResp.headers.forEach((val, key) => {
      if (!hopByHopHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, val);
      }
    });
    const buffer = await proxyResp.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("API proxy error:", err);
    res.status(502).json({ detail: "Backend API service unavailable" });
  }
});
app.use(express.static(staticPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});
async function startServer() {
  const port = process.env.PORT || 3e3;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
if (process.env.VERCEL !== "1" && process.env.NODE_ENV !== "test" && process.argv[1]?.endsWith("index.js")) {
  startServer().catch(console.error);
}
var index_default = app;
export {
  app,
  index_default as default,
  server,
  startServer
};
