import { useState, useEffect, useRef } from 'react'

// Nearest-neighbour fallback — runs entirely in the browser using forecast_lookup.json
// This is used when /api worker is not running (local dev). On Cloudflare the worker handles /api.
function findNearest(lookup, inputs) {
  if (!lookup || !lookup.length) return null
  let best = lookup[0], bestDist = Infinity
  for (const row of lookup) {
    let dist = 0
    for (const [k, v] of Object.entries(inputs)) {
      if (typeof v === "number" && typeof row[k] === "number") dist += Math.pow(v - row[k], 2)
      else if (v !== row[k]) dist += 100
    }
    if (dist < bestDist) { bestDist = dist; best = row }
  }
  return {
    prediction:  best.prediction  ?? 0,
    probability: best.probability ?? 0.5,
    risk_level:  best.risk_level  ?? "MEDIUM",
  }
}

export function useForecast() {
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const lookupRef               = useRef(null)
  const lookupLoadedRef         = useRef(false)

  // Pre-load forecast_lookup.json once so local prediction is instant
  useEffect(() => {
    fetch('/data/forecast_lookup.json')
      .then(r => r.ok ? r.json() : Promise.reject("no lookup"))
      .then(d => { lookupRef.current = d; lookupLoadedRef.current = true })
      .catch(() => { lookupLoadedRef.current = true }) // silently — worker path still works
  }, [])

  async function predict(inputs) {
    setLoading(true)
    setError(null)
    try {
      // 1. Try the Cloudflare Worker /api first (works on Cloudflare deployment)
      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
        signal: AbortSignal.timeout(4000),
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data)
        return
      }
    } catch (_) {
      // Worker not available (local dev) — fall through to local model
    }

    // 2. Local fallback: nearest-neighbour on forecast_lookup.json
    if (lookupRef.current && lookupRef.current.length) {
      const localResult = findNearest(lookupRef.current, inputs)
      setResult(localResult)
    } else {
      // 3. Last resort: fetch lookup now if pre-load missed
      try {
        const r = await fetch('/data/forecast_lookup.json')
        if (!r.ok) throw new Error("lookup not found")
        const lookup = await r.json()
        lookupRef.current = lookup
        setResult(findNearest(lookup, inputs))
      } catch (e) {
        setError("forecast_lookup.json not found — run export_for_frontend.py to generate it")
      }
    }
  }

  return { predict, result, loading, error }
}