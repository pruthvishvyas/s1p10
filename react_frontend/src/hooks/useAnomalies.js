import { useState, useEffect } from 'react'

// Fetches anomalies.json — exported by export_for_frontend.py from the pipeline CSV.
// Falls back to an empty array with a clear message if the file is missing.
export function useAnomalies() {
  const [anomalies, setAnomalies] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    fetch('/data/anomalies.json')
      .then(r => {
        if (!r.ok) throw new Error(
          r.status === 404
            ? "anomalies.json not found — run export_for_frontend.py to generate it from your pipeline CSV"
            : `HTTP ${r.status}`
        )
        return r.json()
      })
      .then(d => {
        // Support both array of rows and {rows: [...]} envelope
        const rows = Array.isArray(d) ? d : (d.rows ?? d.anomalies ?? d.data ?? [])
        setAnomalies(rows)
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return { anomalies, loading, error }
}