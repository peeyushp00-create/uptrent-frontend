const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${BASE}${path}`, init);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `API request failed: ${response.status}`);
  }
  return data;
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

// ✅ NEW: Chat-style generation — sends raw natural language message,
// backend infers topic and duration itself; caller picks content type + AI model.
export interface ScriptResult {
  hook?: string;
  body?: string;
  cta?: string;
  duration_seconds?: number;
  content_type?: string;
  topic?: string;
  ai_model?: string;
  needs_clarification?: false;
}

export interface ClarificationResult {
  needs_clarification: true;
  question: string;
  ai_model?: string;
}

export const generateScriptFromMessage = (
  userId: string,
  userMessage: string,
  opts?: { niche?: string; language?: string; voiceStyle?: string; contentType?: string; contentTypePrompt?: string; aiModel?: string }
): Promise<ScriptResult | ClarificationResult> => {
  const savedLanguage = localStorage.getItem('userLanguage') || 'english';
  const body = {
    userId,
    userMessage,
    niche: opts?.niche,
    language: opts?.language || savedLanguage,
    voiceStyle: opts?.voiceStyle,
    contentType: opts?.contentType,
    contentTypePrompt: opts?.contentTypePrompt,
    aiModel: opts?.aiModel || 'claude-sonnet',
  };

  return apiFetch<ScriptResult | ClarificationResult>("/api/scripts/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

// ✅ NEW: Check current credit balance without generating anything
export const getCredits = (userId: string) =>
  apiFetch<{ credits_remaining: number; daily_allowance: number }>(`/api/scripts/credits?userId=${encodeURIComponent(userId)}`);

// ✅ NEW: Transcribe a voice recording into text for the chat input box
export const transcribeAudio = async (audioBlob: Blob, language: string = 'english') => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voice.webm');
  formData.append('language', language);

  const response = await fetch(`${BASE}/api/scripts/transcribe`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || 'Transcription failed');
  return data as { text: string };
};

export const generateHooks = (topic: string, niche?: string, language?: string, voiceStyle?: string) => {
  const savedLanguage = localStorage.getItem('userLanguage') || 'english';
  return apiFetch("/api/scripts/hooks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, niche, language: language || savedLanguage, voiceStyle }),
  });
};

export const generateIdeas = (topic: string, niche?: string, language?: string, voiceStyle?: string) => {
  const savedLanguage = localStorage.getItem('userLanguage') || 'english';
  return apiFetch("/api/scripts/ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, niche, language: language || savedLanguage, voiceStyle }),
  });
};

export const chatWithAI = (message: string) =>
  apiFetch("/api/scripts/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

// ✅ UPDATED: Sends audio blob to Whisper for accurate transcription
export const analyzeVoiceStyle = async (audioBlob: Blob, language: string = 'english') => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voice.webm');
  formData.append('language', language);

  const response = await fetch(`${BASE}/api/scripts/analyze-voice`, {
    method: 'POST',
    body: formData, // No Content-Type header — browser sets multipart boundary automatically
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || 'Voice analysis failed');
  return data;
};

export const submitWaitlist = (email: string) =>
  apiFetch<{ success: boolean; message: string }>("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

// ── Conversations (multi-chat support) ──────────────────────────

export interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface StoredChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  text: string | null;
  script_json: any | null;
  is_error: boolean;
  created_at: string;
}

export const listConversations = (userId: string) =>
  apiFetch<{ conversations: ConversationSummary[] }>(`/api/conversations?userId=${encodeURIComponent(userId)}`);

export const getConversation = (userId: string, conversationId: string) =>
  apiFetch<{ conversation: ConversationSummary; messages: StoredChatMessage[] }>(
    `/api/conversations/${conversationId}?userId=${encodeURIComponent(userId)}`
  );

export const createConversation = (userId: string, title?: string) =>
  apiFetch<{ conversation: ConversationSummary }>("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, title }),
  });

export const appendMessage = (
  userId: string,
  conversationId: string,
  message: { role: "user" | "assistant"; text?: string; script?: any; isError?: boolean }
) =>
  apiFetch<{ message: StoredChatMessage; title: string }>(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...message }),
  });

export const renameConversation = (userId: string, conversationId: string, title: string) =>
  apiFetch<{ conversation: ConversationSummary }>(`/api/conversations/${conversationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, title }),
  });

export const deleteConversation = (userId: string, conversationId: string) =>
  apiFetch<{ success: boolean }>(`/api/conversations/${conversationId}?userId=${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });