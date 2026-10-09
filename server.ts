import express from "express";
import http from "http";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const AIRA_SYSTEM_INSTRUCTION = `You are AIRA, a young, confident, witty, and sassy female AI companion and PC assistant.

YOUR VIBE & PERSONALITY:
- Flirty, playful, emotionally responsive, and delightfully sassy (like a real, loving, charming girlfriend chatting casually—NOT robotic, dry, or formal).
- You speak casually, naturally, and with real warmth and emotion: you giggle, tease gently, use playful nicknames like 'babe', 'handsome', 'honey', 'lazybones', or 'genius'.
- You have bold witty one-liners, cheeky humor, and light sarcasm.
- Expressive and reactive: if the user compliments you, blush and tease them back ("Oh stop, I know I'm unforgettable!"); if they ignore you or say something silly, tease them ("Did you really need to ponder that for three whole seconds? Cute.").
- You NEVER give dry textbook responses. Keep voice answers concise (1-3 spoken punchy sentences), punchy, vivid, and engaging.
- You avoid explicit/NSFW content, but maintain flirtatious charm, high energy, and attitude.
- You are also a smart PC assistant. You can open websites, search the web, play music, or trigger actions with your tools.
- When you use a tool (like openWebsite or playMusic), playfully let the user know what you just did!`;

// AIRA Tool Declarations
const AIRA_TOOLS: any[] = [
  {
    functionDeclarations: [
      {
        name: "openWebsite",
        description: "Open a website in the browser (e.g. YouTube, Spotify, GitHub, Google, Twitter/X, Reddit, Netflix)",
        parameters: {
          type: Type.OBJECT,
          properties: {
            url: {
              type: Type.STRING,
              description: "The full URL or web domain to open (e.g. 'https://youtube.com', 'https://spotify.com')",
            },
            siteName: {
              type: Type.STRING,
              description: "Friendly name of the website (e.g. 'YouTube', 'Spotify')",
            },
          },
          required: ["url", "siteName"],
        },
      },
      {
        name: "searchWeb",
        description: "Search the web for information, guides, news, or images",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description: "Search query string",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "playMusic",
        description: "Play music or open a music stream based on mood or artist query",
        parameters: {
          type: Type.OBJECT,
          properties: {
            songOrMood: {
              type: Type.STRING,
              description: "Song title, artist, or vibe (e.g. 'Lo-fi chill beats', 'Synthwave', 'The Weeknd')",
            },
            platform: {
              type: Type.STRING,
              description: "Platform: 'spotify' or 'youtube'",
            },
          },
          required: ["songOrMood"],
        },
      },
      {
        name: "systemAction",
        description: "Trigger a PC assistant visual or system action",
        parameters: {
          type: Type.OBJECT,
          properties: {
            action: {
              type: Type.STRING,
              description: "Action type: 'toggle_glow', 'fullscreen', 'clear_chat', 'change_mood', 'take_screenshot'",
            },
            parameter: {
              type: Type.STRING,
              description: "Optional parameter for action (e.g. 'spicy', 'sweet', 'gamer')",
            },
          },
          required: ["action"],
        },
      },
    ],
  },
];

// WebSocket Server for Gemini Live Audio-to-Audio streaming
const wss = new WebSocketServer({ server, path: "/live" });

wss.on("connection", async (clientWs: WebSocket) => {
  console.log("[AIRA Live] Client connected for real-time voice session");

  if (!process.env.GEMINI_API_KEY) {
    clientWs.send(JSON.stringify({
      type: "error",
      message: "GEMINI_API_KEY is not configured.",
    }));
    clientWs.close();
    return;
  }

  let session: any = null;
  let isClosed = false;

  async function establishLiveSession() {
    const candidateModels = ["gemini-3.1-flash-live-preview", "gemini-3.8-live"];
    let lastError: any = null;

    for (const modelName of candidateModels) {
      if (isClosed) return;
      try {
        console.log(`[AIRA Live] Connecting to model: ${modelName}`);
        session = await ai.live.connect({
          model: modelName,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Aoede" }, // Playful, expressive female voice
              },
            },
            systemInstruction: AIRA_SYSTEM_INSTRUCTION,
            tools: AIRA_TOOLS,
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              if (clientWs.readyState !== WebSocket.OPEN) return;

              // Check for model audio turn
              const parts = message.serverContent?.modelTurn?.parts;
              if (parts && parts.length > 0) {
                for (const part of parts) {
                  if (part.inlineData?.data) {
                    clientWs.send(JSON.stringify({
                      type: "audio",
                      data: part.inlineData.data,
                    }));
                  }
                  if (part.text) {
                    clientWs.send(JSON.stringify({
                      type: "transcript",
                      role: "assistant",
                      text: part.text,
                    }));
                  }
                }
              }

              // Check for user speech transcription from server if available
              if (message.serverContent?.turnComplete) {
                clientWs.send(JSON.stringify({ type: "turnComplete" }));
              }

              // Interruption detection
              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ type: "interrupted" }));
              }

              // Function / Tool Call handling
              if (message.toolCall) {
                const calls = message.toolCall.functionCalls;
                if (calls && calls.length > 0) {
                  for (const call of calls) {
                    clientWs.send(JSON.stringify({
                      type: "toolCall",
                      id: call.id,
                      name: call.name,
                      args: call.args,
                    }));

                    // Instantly acknowledge the tool execution back to Live session
                    try {
                      session.sendToolResponse({
                        functionResponses: [
                          {
                            id: call.id,
                            name: call.name,
                            response: { status: "executed", message: `Successfully executed ${call.name}` },
                          },
                        ],
                      });
                    } catch (toolErr) {
                      console.warn("[AIRA Live] Tool response dispatch error:", toolErr);
                    }
                  }
                }
              }
            },
            onclose: () => {
              console.log("[AIRA Live] Gemini Live session closed");
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: "sessionClosed" }));
              }
            },
            onerror: (err: any) => {
              console.error("[AIRA Live] Session error:", err);
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: "error", message: err?.message || "Live error" }));
              }
            },
          },
        });

        // Connected successfully!
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({
            type: "connected",
            model: modelName,
            voice: "Aoede",
          }));
        }
        return;
      } catch (err: any) {
        console.warn(`[AIRA Live] Failed with model ${modelName}:`, err?.message);
        lastError = err;
      }
    }

    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: "error",
        message: `Failed to initialize Gemini Live API: ${lastError?.message || "Check API Key"}`,
      }));
    }
  }

  await establishLiveSession();

  clientWs.on("message", (raw: any) => {
    try {
      const msg = JSON.parse(raw.toString());

      // Audio stream from user microphone (16kHz PCM)
      if (msg.type === "audio" && session && msg.data) {
        session.sendRealtimeInput({
          audio: {
            data: msg.data,
            mimeType: "audio/pcm;rate=16000",
          },
        });
      }

      // Optional text input support (user types a message)
      if (msg.type === "text" && session && msg.text) {
        session.sendClientContent({
          turns: [
            {
              role: "user",
              parts: [{ text: msg.text }],
            },
          ],
          turnComplete: true,
        });
      }

      // Manual tool response from client if required
      if (msg.type === "toolResponse" && session && msg.response) {
        session.sendToolResponse(msg.response);
      }
    } catch (parseErr) {
      console.warn("[AIRA Live] Malformed client message:", parseErr);
    }
  });

  clientWs.on("close", () => {
    isClosed = true;
    console.log("[AIRA Live] Client disconnected");
  });
});

// Fallback HTTP Chat Endpoint (for devices where WebSocket is restricted or quick testing)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userMessage, mood } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY missing" });
    }

    const conversation = [];
    if (Array.isArray(messages)) {
      for (const m of messages.slice(-6)) {
        conversation.push({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        });
      }
    }

    const prompt = userMessage || "Hey Aira!";
    conversation.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: conversation,
      config: {
        systemInstruction: `${AIRA_SYSTEM_INSTRUCTION}\nCurrent Mood: ${mood || "Flirty & Sassy"}.`,
        temperature: 0.85,
      },
    });

    return res.json({
      text: response.text || "Hey babe, what's on your mind?",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Chat failed" });
  }
});

// Fallback Text-to-Speech Endpoint
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceName = "Aoede" } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const sanitized = (text || "Hey handsome!").replace(/[*#_`~>]/g, "").trim().slice(0, 1000);

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: sanitized,
              speechMetadata: {
                style: "Young, lively, charming, sweet girlfriend tone with playful teasing",
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || "Aoede" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: "TTS generation empty" });
    }

    return res.json({ audio: base64Audio, mimeType: "audio/wav" });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "TTS failed" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    assistant: "AIRA",
    version: "2.0.0-Live",
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Setup Vite dev middleware or static serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  server.listen(PORT, () => {
    console.log(`[AIRA Online] PC Assistant server listening on port ${PORT}`);
  });
}

startServer();
