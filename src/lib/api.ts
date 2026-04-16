const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getTopics = (period = '7d', type = 'instagram') =>
  fetch(`${BASE}/api/topics?period=${period}&type=${type}`).then(r => r.json());

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
