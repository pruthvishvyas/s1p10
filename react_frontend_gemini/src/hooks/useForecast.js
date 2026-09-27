import { useState } from 'react';

export function useForecast() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = async (inputs) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });
      if (!r.ok) throw new Error('Prediction request failed');
      const data = await r.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { predict, result, loading, error };
}