import { useState, useEffect } from 'react';
export function usePlatforms() {
  const [platforms, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/platform_performance.json')
      .then(r => { if (!r.ok) throw new Error('platform_performance.json not found'); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return { platforms, loading, error };
}