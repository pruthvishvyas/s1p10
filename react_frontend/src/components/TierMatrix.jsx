import { useState } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { EmptyState } from './EmptyState'
import { TIER_COLORS } from '../utils/colors'
import { formatROI } from '../utils/formatters'

const ORDER = ['Gold Tier', 'Silver Tier', 'Bronze Tier']
const STRATEGY = {
  'Gold Tier':   { label: 'Priority partner', bg: '#27AE60' },
  'Silver Tier': { label: 'Steady state',     bg: '#2980B9' },
  'Bronze Tier': { label: 'Test budget only', bg: '#E67E22' },
}

const norm = t => ({
  tier: t.tier,
  count: t.count ?? t.influencer_count ?? 0,
  roi: t.mean_roi_ratio ?? t.roi_ratio ?? 0,
  eng: t.mean_engagement ?? t.mean_engagement_rate ?? 0,
  aq: t.mean_audience_quality ?? t.mean_audience_quality_score ?? 0,
  cpu: t.mean_cost_per_use ?? t.mean_cost_per_conversion ?? t.cost_per_conversion ?? 0,
})

function ChartCard({ title, hint, children }) {
  return (
    <div className="chart-container" style={{ marginBottom: 0 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>{title}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>{hint}</div>
      <div style={{ position: 'relative', height: 240 }}>{children}</div>
    </div>
  )
}

export default function TierMatrix({ tiers }) {
  const [sel, setSel] = useState(null)
  if (!tiers || !tiers.length)
    return <EmptyState message="No tier data found. Run the pipeline first." icon="🏆" />

  const rows = tiers.map(norm).sort((a, b) => ORDER.indexOf(a.tier) - ORDER.indexOf(b.tier))
  const color = t => (TIER_COLORS[t]?.bg ?? '#888')
  const faded = t => (sel && sel !== t ? color(t) + '55' : color(t))
  const total = rows.reduce((s, r) => s + r.count, 0)
  const portfolioROI = total ? rows.reduce((s, r) => s + r.roi * r.count, 0) / total : 0
  const portfolioCPU = total ? rows.reduce((s, r) => s + r.cpu * r.count, 0) / total : 0
  const picked = rows.find(r => r.tier === sel)
  const labels = rows.map(r => r.tier)
  const pick = i => setSel(s => (s === rows[i].tier ? null : rows[i].tier))

  const barOpts = (fmt) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => fmt(c.parsed.y) } } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } },
    onClick: (e, el) => el.length && pick(el[0].index),
    onHover: (e, el) => { if (e.native) e.native.target.style.cursor = el.length ? 'pointer' : 'default' },
  })
  const bar = key => ({ labels, datasets: [{ data: rows.map(r => r[key]), backgroundColor: rows.map(r => faded(r.tier)), borderRadius: 6 }] })

  return (
    <div>
      <div className="tier-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {rows.map(r => {
          const tc = TIER_COLORS[r.tier] ?? { icon: '🎖️' }
          const st = STRATEGY[r.tier] ?? { label: 'Review', bg: '#888' }
          const on = sel === r.tier
          return (
            <div key={r.tier} className="tier-card" onClick={() => setSel(on ? null : r.tier)}
              style={{ borderTop: `4px solid ${color(r.tier)}`, cursor: 'pointer', outline: on ? `2px solid ${color(r.tier)}` : 'none',
                opacity: sel && !on ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: '2rem' }}>{tc.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-xl)' }}>{r.tier}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{r.count} influencers ({total ? Math.round(100 * r.count / total) : 0}%)</div>
                </div>
              </div>
              {[
                ['Average ROI', formatROI(r.roi)],
                ['Engagement rate', `${r.eng.toFixed(1)}%`],
                ['Audience quality', r.aq.toFixed(2)],
                ['Cost per discount use', `$${r.cpu.toFixed(2)}`],
              ].map(([l, v]) => (
                <div key={l} className="metric-row">
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{l}</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{v}</span>
                </div>
              ))}
              <span style={{ display: 'inline-block', marginTop: 'var(--space-4)', background: st.bg, color: '#fff',
                borderRadius: 'var(--radius-pill)', padding: '4px 16px', fontSize: 'var(--text-xs)', fontWeight: 700 }}>{st.label}</span>
            </div>
          )
        })}
      </div>

      <div className="chart-container" style={{ background: picked ? 'var(--color-surface-raised)' : undefined }}>
        {picked ? (
          <div style={{ fontSize: 'var(--text-base)', lineHeight: 1.6 }}>
            <strong>{picked.tier}</strong> returns <strong>{(picked.roi / portfolioROI).toFixed(1)}x</strong> the roster-average ROI
            ({formatROI(picked.roi)} vs {formatROI(portfolioROI)}) at <strong>{portfolioCPU ? Math.round(100 * picked.cpu / portfolioCPU) : 0}%</strong> of
            the average cost per discount use ($${picked.cpu.toFixed(2)} vs ${portfolioCPU.toFixed(2)}).
            <button className="filter-pill" style={{ marginLeft: 12 }} onClick={() => setSel(null)}>Clear selection</button>
          </div>
        ) : (
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Click a tier card or a bar to compare it with the whole roster. Roster average ROI is {formatROI(portfolioROI)}.
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
        <ChartCard title="Average ROI by tier" hint="Return per dollar spent">
          <Bar data={bar('roi')} options={barOpts(v => `${v.toFixed(2)}x ROI`)} />
        </ChartCard>
        <ChartCard title="Engagement rate by tier" hint="Average engagement, %">
          <Bar data={bar('eng')} options={barOpts(v => `${v.toFixed(1)}%`)} />
        </ChartCard>
        <ChartCard title="Cost per discount use" hint="Lower is cheaper to convert">
          <Bar data={bar('cpu')} options={barOpts(v => `$${v.toFixed(2)}`)} />
        </ChartCard>
        <ChartCard title="Roster mix" hint="Influencers per tier">
          <Doughnut
            data={{ labels, datasets: [{ data: rows.map(r => r.count), backgroundColor: rows.map(r => faded(r.tier)), borderWidth: 0 }] }}
            options={{ responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom' } },
              onClick: (e, el) => el.length && pick(el[0].index) }} />
        </ChartCard>
      </div>
    </div>
  )
}
