import { useState, useEffect } from 'react'

export function useInsights() {
  const [insights, set_insights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    fetch('/data/insights.json')
      .then(r => { if (!r.ok) throw new Error('insights.json not found'); return r.json() })
      .then(d => { set_insights(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return { insights, loading, error }
}