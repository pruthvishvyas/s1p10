import { useState, useMemo } from 'react'
import { EmptyState } from './EmptyState'
import { formatROI, formatUSD } from '../utils/formatters'

export default function PlatformPerformance({ platforms }) {
  const [sortKey, setSortKey] = useState("mean_roi_ratio")
  const [sortDir, setSortDir] = useState("desc")

  if (!platforms || !platforms.length)
    return <EmptyState message="No platform data found. Run the pipeline first." icon="📡" />

  const sorted = useMemo(() => {
    return [...platforms].sort((a, b) => {
      const va = a[sortKey] ?? 0
      const vb = b[sortKey] ?? 0
      return sortDir === "asc" ? va - vb : vb - va
    })
  }, [platforms, sortKey, sortDir])

  const bestPlatform = useMemo(() => {
    if (!platforms.length) return null
    return [...platforms].sort((a,b) => (b.mean_roi_ratio??0)-(a.mean_roi_ratio??0))[0]?.platform
  }, [platforms])

  function handleSort(key) {
    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
  }

  function roiColor(rate) {
    if (rate >= 50) return "var(--color-success)"
    if (rate >= 30) return "var(--color-warning)"
    return "var(--color-danger)"
  }

  const cols = [
    { key:"platform",        label:"Platform" },
    { key:"campaign_count",  label:"Campaigns" },
    { key:"high_roi_rate",   label:"High ROI Rate" },
    { key:"mean_roi_ratio",  label:"Mean ROI" },
    { key:"mean_cost_usd",   label:"Mean Cost" },
    { key:"mean_revenue_usd",label:"Mean Revenue" },
  ]

  return (
    <div className="chart-container">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {cols.map(c => (
                <th key={c.key} onClick={() => handleSort(c.key)}>
                  {c.label} {sortKey===c.key ? (sortDir==="asc"?"↑":"↓") : "↕"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const isBest = row.platform === bestPlatform
              return (
                <tr key={i} style={{
                  borderLeft: isBest ? "3px solid var(--color-success)" : undefined,
                  background: isBest ? "rgba(39,174,96,0.04)" : undefined,
                }}>
                  <td style={{ fontWeight:600 }}>{row.platform}</td>
                  <td>{row.campaign_count ?? row.campaigns ?? "—"}</td>
                  <td style={{ color: roiColor(row.high_roi_rate ?? 0) }}>
                    {row.high_roi_rate != null ? `${Number(row.high_roi_rate).toFixed(1)}%` : "—"}
                  </td>
                  <td style={{ fontWeight:700 }}>{formatROI(row.mean_roi_ratio)}</td>
                  <td>{formatUSD(row.mean_cost_usd ?? row.mean_campaign_cost_usd)}</td>
                  <td>{formatUSD(row.mean_revenue_usd ?? row.mean_revenue)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}