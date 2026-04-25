const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${BASE}${path}`, init);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
};

export const getTopics = (period = "7d") =>
  apiFetch(`/api/topics?period=${period}`);

export const getNews = (topicId?: string) => {
  const url = topicId ? `/api/news?topicId=${topicId}` : "/api/news";
  return apiFetch(url);
};

export const generateScript = (topicId: string, niche?: string, language?: string, voiceStyle?: string) =>
  apiFetch("/api/scripts/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topicId, niche, language, voiceStyle }),
  });

export const generateHooks = (topic: string, niche?: string, language?: string) =>
  apiFetch("/api/scripts/hooks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, niche, language }),
  });

export const generateIdeas = (topic: string, niche?: string, language?: string) =>
  apiFetch("/api/scripts/ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, niche, language }),
  });

export const chatWithAI = (message: string) =>
  apiFetch("/api/scripts/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

export const analyzeVoiceStyle = (transcript: string) =>
  apiFetch("/api/scripts/analyze-voice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });