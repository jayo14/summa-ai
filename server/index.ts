import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  const apiUrl = process.env.API_URL || "http://127.0.0.1:8000";

  // Proxy /api requests to FastAPI backend
  app.use("/api", async (req, res) => {
    try {
      const targetUrl = `${apiUrl.replace(/\/+$/, "")}/api${req.url}`;
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (value && key.toLowerCase() !== "host") {
          headers[key] = Array.isArray(value) ? value.join(", ") : value;
        }
      }

      const body = ["GET", "HEAD"].includes(req.method)
        ? undefined
        : await new Promise<Buffer>((resolve) => {
            const chunks: Buffer[] = [];
            req.on("data", (chunk) => chunks.push(chunk));
            req.on("end", () => resolve(Buffer.concat(chunks)));
          });

      const proxyResp = await fetch(targetUrl, {
        method: req.method,
        headers,
        body,
      });

      res.status(proxyResp.status);
      proxyResp.headers.forEach((val, key) => {
        if (key.toLowerCase() !== "transfer-encoding") {
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

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
