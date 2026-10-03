import { useState, useEffect } from 'react'

// Fetches visual_reports.json — a manifest of report images exported by the pipeline.
// Each entry: { filename, title, category, description }
// The actual image files live in public/reports/ (copied there by export_for_frontend_patch.py)
export function useReports() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    fetch('/data/visual_reports.json')
      .then(r => r.ok ? r.json() : Promise.reject(
        r.status === 404
          ? "visual_reports.json not found — run export_for_frontend_patch.py"
          : `HTTP ${r.status}`
      ))
      .then(d => { setReports(Array.isArray(d) ? d : d.reports ?? []); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return { reports, loading, error }
}