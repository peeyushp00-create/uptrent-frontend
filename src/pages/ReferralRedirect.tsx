import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ReferralRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      localStorage.setItem('sr_ref', code);
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `sr_ref=${encodeURIComponent(code)}; expires=${expires}; path=/; SameSite=Lax`;
    }
    navigate(`/?ref=${code ?? ''}`, { replace: true });
  }, [code, navigate]);

  return null;
}
