import { useState, useEffect } from 'react';
export function useCharts() {
  const [charts, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/charts.json')
      .then(r => { if (!r.ok) throw new Error('charts.json not found'); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return { charts, loading, error };
}