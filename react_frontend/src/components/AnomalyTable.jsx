import { useState, useMemo } from 'react'
import { EmptyState } from './EmptyState'
import { formatUSD, formatROI } from '../utils/formatters'
import { PRIORITY_COLORS } from '../utils/colors'

const PAGE_SIZE = 20

export default function AnomalyTable({ anomalies }) {
  const [sortKey, setSortKey] = useState("Campaign_Cost_USD")
  const [sortDir, setSortDir] = useState("desc")
  const [page,    setPage]    = useState(0)

  if (!anomalies || !anomalies.length)
    return <EmptyState message="No anomalies found. Ensure pipeline has run and export_for_frontend.py was executed." icon="✅" />

  const cols = Object.keys(anomalies[0] ?? {})

  const sorted = useMemo(() => {
    return [...anomalies].sort((a, b) => {
      const va = a[sortKey] ?? 0
      const vb = b[sortKey] ?? 0
      if (typeof va === "number") return sortDir === "asc" ? va - vb : vb - va
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })
  }, [anomalies, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const visible    = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleSort(key) {
    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc"); setPage(0) }
  }

  function renderCell(col, val) {
    if (val === null || val === undefined) return "—"
    if (col === "Campaign_Cost_USD" || col === "Revenue_Generated_USD") return formatUSD(val)
    if (col === "roi_ratio") return formatROI(val)
    if (col === "partnership_priority") {
      const pc = PRIORITY_COLORS[val]
      return pc ? <span style={{ background:pc.bg, color:pc.text, borderRadius:"var(--radius-pill)", padding:"2px 8px", fontSize:"var(--text-xs)", fontWeight:700 }}>{pc.label}</span> : String(val)
    }
    return String(val)
  }

  const pct = anomalies.length

  return (
    <div>
      <div style={{ fontSize:"var(--text-sm)", color:"var(--color-text-secondary)", marginBottom:"var(--space-4)" }}>
        <strong>{anomalies.length}</strong> campaigns flagged as anomalous
      </div>
      <div className="chart-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {cols.map(c => (
                  <th key={c} onClick={() => handleSort(c)}>
                    {c.replace(/_/g," ")} {sortKey===c ? (sortDir==="asc"?"↑":"↓") : "↕"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row, i) => {
                const isP1 = row.partnership_priority === "P1_STRATEGIC_PARTNER"
                return (
                  <tr key={i} style={{
                    borderLeft: isP1 ? "3px solid #C0392B" : undefined,
                    background: isP1 ? "rgba(192,57,43,0.04)" : undefined,
                  }}>
                    {cols.map(c => <td key={c}>{renderCell(c, row[c])}</td>)}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => p-1)} disabled={page===0}>← Prev</button>
            <span style={{ fontSize:"var(--text-sm)", color:"var(--color-text-secondary)" }}>
              Page {page+1} of {totalPages}
            </span>
            <button onClick={() => setPage(p => p+1)} disabled={page>=totalPages-1}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}