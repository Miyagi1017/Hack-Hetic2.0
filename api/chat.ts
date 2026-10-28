import { generateChatReply } from "../server/chat";

/**
 * Fonction serverless Vercel pour le concierge IA.
 * Remplace la route Express `/api/chat` utilisée en développement local.
 */

interface ChatRequestBody {
  message?: string;
  history?: Array<{ sender?: string; text?: string }>;
  currentTrip?: {
    destination?: string;
    duration?: string;
    travelers?: number;
    activities?: Array<{ time?: string; name?: string; address?: string }>;
  };
}

interface ApiRequest {
  method?: string;
  body?: ChatRequestBody;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  json(payload: unknown): void;
  setHeader(name: string, value: string): void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  const { message, history = [], currentTrip } = req.body ?? {};

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Message manquant" });
    return;
  }

  try {
    const reply = await generateChatReply({
      message,
      history: Array.isArray(history)
        ? history
            .filter((entry) => typeof entry?.text === "string")
            .map((entry) => ({ sender: entry.sender ?? "user", text: entry.text as string }))
        : [],
      currentTrip,
    });

    res.status(200).json(reply);
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erreur serveur",
    });
  }
}
