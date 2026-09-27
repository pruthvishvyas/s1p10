import { useState, useEffect } from 'react';
export function useTiers() {
  const [tiers, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/influencer_tiers.json')
      .then(r => { if (!r.ok) throw new Error('influencer_tiers.json not found'); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return { tiers, loading, error };
}