import { useState, useEffect } from 'react'

export function useKPIs() {
  const [data, set_data] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    fetch('/data/kpis.json')
      .then(r => { if (!r.ok) throw new Error('kpis.json not found'); return r.json() })
      .then(d => { set_data(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return { data, loading, error }
}