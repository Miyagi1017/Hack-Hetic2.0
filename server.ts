import "dotenv/config";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { generateChatReply } from "./server/chat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// Concierge IA : même logique que la fonction serverless Vercel (api/chat.ts).
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], currentTrip } = req.body ?? {};

    if (!message) {
      return res.status(400).json({ error: "Message manquant" });
    }

    const reply = await generateChatReply({ message, history, currentTrip });
    return res.json(reply);
  } catch (error) {
    console.error("Chat endpoint error:", error);
    const detail = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({ error: detail });
  }
});

// Serve the Vite app in development and the built assets in production.
async function startServer() {
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== "production") {
    const isHmrDisabled = process.env.DISABLE_HMR === "true";
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server },
        watch: isHmrDisabled ? null : {},
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server ready at http://localhost:${PORT}`);
  });
}

startServer();
