const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${BASE}${path}`, init);
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json();
};

export const getTopics = (period = "7d") =>
  apiFetch(`/api/topics?period=${period}`);

export const getNews = (topicId?: string) => {
  const url = topicId ? `/api/news?topicId=${topicId}` : "/api/news";
  return apiFetch(url);
};

// ✅ Updated to accept object OR positional params
export const generateScript = (
  params: string | {
    topic?: string;
    topicId?: string;
    niche?: string;
    language?: string;
    style?: string;
    voiceStyle?: string;
    duration?: number;
    platform?: string;
  },
  niche?: string,
  language?: string,
  voiceStyle?: string,
  duration?: number
) => {
  // ✅ Always read language from localStorage as the source of truth
  const savedLanguage = localStorage.getItem('userLanguage') || 'english';
  const savedStyle = localStorage.getItem('userStyle') || 'casual';

  let body: Record<string, any>;

  if (typeof params === 'string') {
    // Old positional call: generateScript(topicId, niche, language, voiceStyle, duration)
    body = {
      topicId: params,
      niche,
      language: language || savedLanguage,
      voiceStyle,
      duration,
    };
  } else {
    // New object call: generateScript({ topic, niche, language, ... })
    body = {
      topicId: params.topic || params.topicId,
      niche: params.niche,
      language: params.language || savedLanguage,
      style: params.style || savedStyle,
      voiceStyle: params.voiceStyle,
      duration: params.duration,
      platform: params.platform,
    };
  }

  // ✅ Force language from localStorage — never let it be undefined
  body.language = body.language || savedLanguage;

  console.log('generateScript called with language:', body.language);

  return apiFetch("/api/scripts/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

export const generateHooks = (topic: string, niche?: string, language?: string) => {
  const savedLanguage = localStorage.getItem('userLanguage') || 'english';
  return apiFetch("/api/scripts/hooks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, niche, language: language || savedLanguage }),
  });
};

export const generateIdeas = (topic: string, niche?: string, language?: string) => {
  const savedLanguage = localStorage.getItem('userLanguage') || 'english';
  return apiFetch("/api/scripts/ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, niche, language: language || savedLanguage }),
  });
};

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