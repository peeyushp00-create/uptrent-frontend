const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getTopics = (period = '7d') =>
  fetch(`${BASE}/api/topics?period=${period}`).then(r => r.json());

export const getNews = (topicId?: string) => {
  const url = topicId
    ? `${BASE}/api/news?topicId=${topicId}`
    : `${BASE}/api/news`;
  return fetch(url).then(r => r.json());
};

export const generateScript = (topicId: string) =>
  fetch(`${BASE}/api/scripts/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId })
  }).then(r => r.json());
  export const chatWithAI = (message: string) =>
  fetch(`${BASE}/api/scripts/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  }).then(r => r.json());