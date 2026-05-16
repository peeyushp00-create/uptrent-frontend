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
    contentTypePrompt?: string;
    contentType?: string;
  },
  niche?: string,
  language?: string,
  voiceStyle?: string,
  duration?: number
) => {
  const savedLanguage = localStorage.getItem('userLanguage') || 'english';
  const savedStyle = localStorage.getItem('userStyle') || 'casual';
  let body: Record<string, any>;

  if (typeof params === 'string') {
    body = {
      topicId: params,
      niche,
      language: language || savedLanguage,
      voiceStyle,
      duration,
    };
  } else {
    body = {
      topicId: params.topic || params.topicId,
      niche: params.niche,
      language: params.language || savedLanguage,
      style: params.style || savedStyle,
      voiceStyle: params.voiceStyle,
      duration: params.duration,
      platform: params.platform,
      contentTypePrompt: params.contentTypePrompt,
      contentType: params.contentType,
    };
  }

  body.language = body.language || savedLanguage;
  console.log('generateScript called with language:', body.language, 'contentType:', body.contentType);

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