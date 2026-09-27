import { useState, useEffect } from 'react'

export function useContract() {
  const [contract, set_contract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    fetch('/data/frontend_contract.json')
      .then(r => { if (!r.ok) throw new Error('frontend_contract.json not found'); return r.json() })
      .then(d => { set_contract(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return { contract, loading, error }
}