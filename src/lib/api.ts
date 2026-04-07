export const getTopics = (period = '7d') =>
  fetch(`http://localhost:3001/api/topics?period=${period}`).then(r => r.json());

export const getNews = (topicId?: string) => {
  const url = topicId
    ? `http://localhost:3001/api/news?topicId=${topicId}`
    : `http://localhost:3001/api/news`;
  return fetch(url).then(r => r.json());
};

export const generateScript = (topicId: string) =>
  fetch(`http://localhost:3001/api/scripts/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicId })
  }).then(r => r.json());
