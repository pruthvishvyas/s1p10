import { useState, useMemo, useEffect } from 'react'
import { Bar, Scatter, Doughnut } from 'react-chartjs-2'
import { EmptyState } from './EmptyState'

const PURPLE = '#6C3FC8', GREEN = '#27AE60', RED = '#C0392B', ORANGE = '#FF6B35'
const FADED = 'rgba(108,63,200,0.25)'
const usd = v => '$' + Math.round(v).toLocaleString()
const avg = a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0)
const groupBy = (rows, key) => {
  const m = {}
  rows.forEach(r => { (m[r[key]] = m[r[key]] || []).push(r) })
  return m
}

function useCampaigns() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => {
    fetch('/data/campaigns.json')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('campaigns.json not found - run: python upgrade_visuals.py'))))
      .then(setRows)
      .catch(e => setError(e.message))
  }, [])
  return { rows, error }
}

const Card = ({ title, hint, children }) => (
  <div className="chart-container" style={{ marginBottom: 0 }}>
    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>{title}</div>
    {hint && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>{hint}</div>}
    <div style={{ position: 'relative', height: 280 }}>{children}</div>
  </div>
)

function Slicer({ label, options, value, onPick }) {
  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</div>
      <div className="filter-pills" style={{ marginBottom: 0 }}>
        {options.map(o => (
          <button key={o} className={`filter-pill ${value === o ? 'active' : ''}`} onClick={() => onPick(o)}>{o}</button>
        ))}
      </div>
    </div>
  )
}

function Kpi({ label, value, color }) {
  return (
    <div className="kpi-card">
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>{label}</div>
      <div style={{ fontSize: 'var(--text-3xl)', fontFamily: 'var(--font-heading)', fontWeight: 800, color: color || 'var(--color-text-primary)', lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function Body({ rows }) {
  const [f, setF] = useState({ platform: null, niche: null, outcome: 'All' })
  const toggle = (k, v) => setF(p => ({ ...p, [k]: p[k] === v ? null : v }))
  const reset = () => setF({ platform: null, niche: null, outcome: 'All' })

  const pass = (r, skip) =>
    (skip === 'platform' || !f.platform || r.platform === f.platform) &&
    (skip === 'niche' || !f.niche || r.niche === f.niche) &&
    (f.outcome === 'All' || (f.outcome === 'High ROI') === (r.high_roi === 1))

  const platforms = useMemo(() => [...new Set(rows.map(r => r.platform))].sort(), [rows])
  const niches = useMemo(() => [...new Set(rows.map(r => r.niche))].sort(), [rows])
  const data = useMemo(() => rows.filter(r => pass(r)), [rows, f])
  const byPlat = useMemo(() => groupBy(rows.filter(r => pass(r, 'platform')), 'platform'), [rows, f])
  const byNiche = useMemo(() => groupBy(rows.filter(r => pass(r, 'niche')), 'niche'), [rows, f])

  const spend = data.reduce((s, r) => s + r.cost, 0)
  const revenue = data.reduce((s, r) => s + r.revenue, 0)
  const highN = data.filter(r => r.high_roi === 1).length
  const active = f.platform || f.niche || f.outcome !== 'All'

  const baseOpts = (onClick) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A1530', padding: 10, cornerRadius: 8 } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true } },
    onClick, onHover: (e, el) => { if (e.native) e.native.target.style.cursor = el.length ? 'pointer' : 'default' },
  })

  const platBar = {
    labels: platforms,
    datasets: [{ data: platforms.map(p => +avg((byPlat[p] || []).map(r => r.roi)).toFixed(2)),
      backgroundColor: platforms.map(p => (f.platform && f.platform !== p ? FADED : PURPLE)), borderRadius: 6 }],
  }
  const nicheBar = {
    labels: niches,
    datasets: [{ data: niches.map(n => { const g = byNiche[n] || []; return g.length ? +(100 * g.filter(r => r.high_roi === 1).length / g.length).toFixed(1) : 0 }),
      backgroundColor: niches.map(n => (f.niche && f.niche !== n ? 'rgba(255,107,53,0.25)' : ORANGE)), borderRadius: 6 }],
  }
  const donut = {
    labels: ['High ROI', 'Low ROI'],
    datasets: [{ data: [highN, data.length - highN], backgroundColor: [GREEN, RED], borderWidth: 0 }],
  }
  const sample = data.length > 600 ? data.filter((_, i) => i % Math.ceil(data.length / 600) === 0) : data
  const scatter = {
    datasets: [
      { label: 'High ROI', data: sample.filter(r => r.high_roi === 1).map(r => ({ x: r.cost, y: r.revenue })), backgroundColor: 'rgba(39,174,96,0.6)', pointRadius: 4 },
      { label: 'Low ROI', data: sample.filter(r => r.high_roi !== 1).map(r => ({ x: r.cost, y: r.revenue })), backgroundColor: 'rgba(192,57,43,0.55)', pointRadius: 4 },
    ],
  }

  const heatRows = rows.filter(r => f.outcome === 'All' || (f.outcome === 'High ROI') === (r.high_roi === 1))
  const heat = {}
  heatRows.forEach(r => { const k = r.platform + '|' + r.niche; (heat[k] = heat[k] || []).push(r.roi) })
  const cell = (p, n) => (heat[p + '|' + n] ? avg(heat[p + '|' + n]) : null)
  const allCells = platforms.flatMap(p => niches.map(n => cell(p, n))).filter(v => v !== null)
  const lo = Math.min(...allCells), hi = Math.max(...allCells)

  const top = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 10)

  return (
    <div>
      <div className="chart-container">
        <Slicer label="Platform" options={platforms} value={f.platform} onPick={v => toggle('platform', v)} />
        <Slicer label="Audience niche" options={niches} value={f.niche} onPick={v => toggle('niche', v)} />
        <Slicer label="Outcome" options={['All', 'High ROI', 'Low ROI']} value={f.outcome} onPick={v => setF(p => ({ ...p, outcome: v }))} />
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span>{active ? 'Filtered view' : 'All campaigns'}. Click any bar, heatmap cell or filter to slice the data.</span>
          {active && <button className="filter-pill active" onClick={reset}>Clear filters</button>}
        </div>
      </div>

      <div className="kpi-grid">
        <Kpi label="Campaigns" value={data.length.toLocaleString()} />
        <Kpi label="High ROI rate" value={data.length ? (100 * highN / data.length).toFixed(1) + '%' : '-'} color={highN / (data.length || 1) >= 0.5 ? 'var(--color-success)' : 'var(--color-danger)'} />
        <Kpi label="Avg ROI" value={avg(data.map(r => r.roi)).toFixed(2) + 'x'} />
        <Kpi label="Total spend" value={usd(spend)} />
        <Kpi label="Total revenue" value={usd(revenue)} />
        <Kpi label="Blended return" value={spend ? (revenue / spend).toFixed(2) + 'x' : '-'} />
      </div>

      {data.length === 0 ? <EmptyState message="No campaigns match these filters. Clear a filter to continue." icon="🔍" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
          <Card title="Average ROI by platform" hint="Click a bar to filter by platform">
            <Bar data={platBar} options={baseOpts((e, el) => el.length && toggle('platform', platforms[el[0].index]))} />
          </Card>
          <Card title="High ROI rate by niche (%)" hint="Click a bar to filter by niche">
            <Bar data={nicheBar} options={baseOpts((e, el) => el.length && toggle('niche', niches[el[0].index]))} />
          </Card>
          <Card title="Outcome split" hint="Share of filtered campaigns">
            <Doughnut data={donut} options={{ responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom' } } }} />
          </Card>
          <Card title="Spend vs revenue" hint={`Each dot is a campaign (${sample.length} shown)`}>
            <Scatter data={scatter} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } },
              scales: { x: { title: { display: true, text: 'Campaign cost (USD)' } }, y: { title: { display: true, text: 'Revenue (USD)' } } } }} />
          </Card>
        </div>
      )}

      <div className="chart-container" style={{ marginTop: 'var(--space-6)' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>Platform x niche: average ROI</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>Darker is better. Click a cell to filter both.</div>
        <div className="table-wrapper"><table>
          <thead><tr><th></th>{niches.map(n => <th key={n} style={{ textAlign: 'center' }}>{n}</th>)}</tr></thead>
          <tbody>{platforms.map(p => (
            <tr key={p}><td style={{ fontWeight: 600 }}>{p}</td>
              {niches.map(n => {
                const v = cell(p, n); const t = v === null || hi === lo ? 0 : (v - lo) / (hi - lo)
                const sel = f.platform === p && f.niche === n
                return <td key={n} onClick={() => setF(s => ({ ...s, platform: p, niche: n }))}
                  style={{ textAlign: 'center', cursor: 'pointer', fontWeight: 600, background: `rgba(108,63,200,${0.06 + t * 0.75})`,
                    color: t > 0.55 ? '#fff' : 'var(--color-text-primary)', outline: sel ? '2px solid #1A1530' : 'none' }}>
                  {v === null ? '-' : v.toFixed(2) + 'x'}</td>
              })}
            </tr>))}</tbody>
        </table></div>
      </div>

      <div className="chart-container">
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>Top 10 campaigns by revenue (current filters)</div>
        <div className="table-wrapper"><table>
          <thead><tr><th>Platform</th><th>Niche</th><th>Cost</th><th>Revenue</th><th>ROI</th><th>Outcome</th></tr></thead>
          <tbody>{top.map((r, i) => (
            <tr key={i}><td>{r.platform}</td><td>{r.niche}</td><td>{usd(r.cost)}</td><td>{usd(r.revenue)}</td>
              <td style={{ fontWeight: 700 }}>{r.roi.toFixed(2)}x</td>
              <td style={{ color: r.high_roi === 1 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>{r.high_roi === 1 ? 'High ROI' : 'Low ROI'}</td></tr>))}
          </tbody>
        </table></div>
      </div>
    </div>
  )
}

export default function Explorer() {
  const { rows, error } = useCampaigns()
  if (error) return <EmptyState message={error} icon="⚠️" />
  if (!rows) return <EmptyState message="Loading campaigns..." icon="⏳" />
  if (!rows.length) return <EmptyState message="campaigns.json is empty. Re-run python upgrade_visuals.py." icon="📭" />
  return <Body rows={rows} />
}

export function PlatformBars({ platforms }) {
  if (!platforms || !platforms.length) return null
  const data = {
    labels: platforms.map(p => p.platform),
    datasets: [{ label: 'Mean ROI', data: platforms.map(p => p.mean_roi_ratio ?? 0), backgroundColor: PURPLE, borderRadius: 6 }],
  }
  return (
    <div className="chart-container">
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>Mean ROI by platform</div>
      <div style={{ position: 'relative', height: 300 }}>
        <Bar data={data} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
      </div>
    </div>
  )
}
