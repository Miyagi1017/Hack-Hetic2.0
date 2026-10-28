import { GoogleGenAI } from "@google/genai";

/**
 * Concierge IA d'Odyssée.
 *
 * Toute la logique vit dans ce fichier afin que la fonction serverless Vercel
 * soit autonome (aucun import relatif à résoudre au runtime). `server.ts`
 * l'importe pour servir `/api/chat` en développement local.
 */

export interface ChatHistoryMessage {
  sender: "user" | "assistant" | string;
  text: string;
}

export interface ChatTripContext {
  destination?: string;
  duration?: string;
  travelers?: number;
  activities?: Array<{ time?: string; name?: string; address?: string }>;
}

export interface ChatPayload {
  message?: string;
  history?: ChatHistoryMessage[];
  currentTrip?: ChatTripContext;
}

export interface ChatReply {
  text: string;
  groundingChunks: unknown[];
}

const MODEL = "gemini-3.8-flash";

const buildSystemInstruction = (currentTrip?: ChatTripContext): string => {
  const tripContext = currentTrip
    ? `Destination actuelle de l'utilisateur: ${currentTrip.destination} (${currentTrip.duration}, ${currentTrip.travelers}).
Étapes déjà planifiées: ${
        currentTrip.activities
          ?.map((activity) => `${activity.time} - ${activity.name} (${activity.address})`)
          .join(", ") || "Aucune"
      }.`
    : "Aucun voyage actif en cours.";

  return `Tu es l'assistant de voyage Odyssée (inspiré de VoyageZen & Polarsteps), un concierge IA chaleureux, expert local en temps réel et guide cartographique.
${tripContext}

Tes missions:
1. Répondre avec précision aux questions géographiques, touristiques, culinaires et logistiques (adresses réelles, temps de trajet, meilleurs créneaux, astuces locales, règles et restrictions).
2. Pour chaque lieu ou activité que tu recommandes ou mentionnes, fournis son nom exact, une brève description engageante, son quartier/adresse, et si possible ses coordonnées approximatives [latitude, longitude].
3. Formatage: Sois clair, concis, élégant (style éditorial et chaleureux). Tu peux utiliser des listes à puces et du gras pour les noms de lieux.
4. Si l'utilisateur demande d'optimiser un trajet ou d'éviter un conflit horaire, propose des alternatives concrètes et proches.

IMPORTANT: À la fin de ta réponse, si tu mentionnes des lieux spécifiques sur la carte, inclus un bloc JSON spécial au format:
\`\`\`locations
[
  {"name": "Nom du lieu", "address": "Adresse ou quartier", "lat": 41.8902, "lng": 12.4922, "category": "Culture" | "Gastronomie" | "Insolite" | "Nature", "description": "Brève note"}
]
\`\`\`
Ce bloc permettra à la carte interactive de l'application d'afficher immédiatement les épingles correspondantes!`;
};

const buildFallbackReply = (message: string): string => {
  const lower = message.toLowerCase();

  if (lower.includes("colisée") || lower.includes("colosseo") || lower.includes("rome")) {
    return `À Rome près du **Colisée**, voici les meilleures recommandations vérifiées :

• **Trattoria Da Enzo al 29** (Trastevere) : Réputée pour ses *Cacio e Pepe* et *Carbonara* d'anthologie dans une ruelle authentique. À 20 min à pied ou 10 min en bus n°75.
• **Li Rioni a Santiquattro** (Via dei Santissimi Quattro, 24) : Excellente pizzeria au feu de bois à 5 minutes à pied du Colisée, fréquentée par les Romains.
• **Forno Da Milvio** (Rione Monti) : Idéal pour un encas rapide avec d'authentiques *pizza al taglio* et focaccias croquantes.

**Astuce horaire & restriction** : Le Colisée nécessite impérativement une réservation en ligne à l'avance avec créneau horaire fixe. La dernière entrée a lieu 1 heure avant la fermeture.

\`\`\`locations
[
  {"name": "Trattoria Da Enzo al 29", "address": "Via dei Vascellari, 29, Rome", "lat": 41.8885, "lng": 12.4777, "category": "Gastronomie", "description": "Authentique trattoria romaine réputée"},
  {"name": "Li Rioni a Santiquattro", "address": "Via dei SS. Quattro, 24, Rome", "lat": 41.8889, "lng": 12.4975, "category": "Gastronomie", "description": "Pizzeria traditionnelle à 5 min du Colisée"},
  {"name": "Colisée de Rome", "address": "Piazza del Colosseo, 1, Rome", "lat": 41.8902, "lng": 12.4922, "category": "Culture", "description": "Monument emblématique antique"}
]
\`\`\``;
  }

  if (lower.includes("panthéon") || lower.includes("pantheon")) {
    return `Voici les détails essentiels pour le **Panthéon de Rome** :

• **Horaires** : Ouvert tous les jours de 09h00 à 19h00 (dernière entrée à 18h30). Billet d'entrée à 5 € obligatoire.
• **Résolution de trajet** : Si vous venez de la Galerie Borghèse ou de la Piazza Navona, prévoyez 8 min de marche depuis Navona, ou 15 min en bus depuis Termini.
• **À ne pas manquer à côté** : Arrêtez-vous à la célèbre *Gelateria Giolitti* (Via Uffici del Vicario, 40) pour l'une des meilleures glaces artisanales de Rome.

\`\`\`locations
[
  {"name": "Panthéon de Rome", "address": "Piazza della Rotonda, Rome", "lat": 41.8986, "lng": 12.4769, "category": "Culture", "description": "Dôme antique spectaculaire et tombeau de Raphaël"},
  {"name": "Gelateria Giolitti", "address": "Via Uffici del Vicario, 40, Rome", "lat": 41.9009, "lng": 12.4784, "category": "Gastronomie", "description": "Institution historique de gelato italien"}
]
\`\`\``;
  }

  return `Je suis à votre service pour explorer votre destination ! Vous pouvez me demander :
- Les horaires, tarifs et temps de visite des musées et monuments.
- Des adresses de restaurants, cafés ou speakeasies secrets.
- Le meilleur moyen de transport pour relier deux étapes de votre itinéraire.
- Les restrictions locales (zones piétonnes ZTL, billets coupe-file obligatoires, météo).

Comment puis-je enrichir votre voyage aujourd'hui ?`;
};

/**
 * Génère la réponse du concierge. Utilise Gemini si `GEMINI_API_KEY` est
 * définie, sinon bascule sur des recommandations locales de démonstration.
 */
export const generateChatReply = async (payload: ChatPayload): Promise<ChatReply> => {
  const { message = "", history = [], currentTrip } = payload;

  const formattedContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
  if (Array.isArray(history)) {
    for (const entry of history.slice(-8)) {
      formattedContents.push({
        role: entry.sender === "user" ? "user" : "model",
        parts: [{ text: entry.text }],
      });
    }
  }
  formattedContents.push({ role: "user", parts: [{ text: message }] });

  let text = "";
  let groundingChunks: unknown[] = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: formattedContents,
        config: {
          systemInstruction: buildSystemInstruction(currentTrip),
          temperature: 0.7,
          tools: [{ googleSearch: {} }],
        },
      });

      text = response.text || "";
      const candidate = response.candidates?.[0];
      if (candidate?.groundingMetadata?.groundingChunks) {
        groundingChunks = candidate.groundingMetadata.groundingChunks;
      }
    } catch (error) {
      console.warn(
        "Gemini API call failed, falling back to smart local assistant:",
        error instanceof Error ? error.message : error
      );
    }
  }

  if (!text) {
    text = buildFallbackReply(message);
  }

  return { text, groundingChunks };
};

/* ------------------------------------------------------------------ */
/* Handler serverless Vercel — POST /api/chat                          */
/* ------------------------------------------------------------------ */

interface ChatRequestBody {
  message?: string;
  history?: Array<{ sender?: string; text?: string }>;
  currentTrip?: ChatTripContext;
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

const handler = async (req: ApiRequest, res: ApiResponse) => {
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
};

export default handler;
