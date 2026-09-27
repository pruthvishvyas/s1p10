import { useRef, useEffect } from 'react'
import { Bar, Line, Scatter } from 'react-chartjs-2'
import { EmptyState } from './EmptyState'
import { getChartColors } from '../utils/colors'

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1A1530",
      titleColor: "#fff",
      bodyColor: "rgba(255,255,255,0.8)",
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(0,0,0,0.04)' } },
  },
}

function HeatmapTable({ chart }) {
  const rows   = chart.rows ?? []
  const cols   = chart.columns ?? []
  const matrix = chart.matrix ?? {}
  if (!rows.length || !cols.length) return <EmptyState message="No heatmap data." icon="🗺️" />

  const allVals = rows.flatMap(r => cols.map(c => matrix?.[r]?.[c] ?? 0))
  const minV = Math.min(...allVals)
  const maxV = Math.max(...allVals)
  const norm  = v => maxV === minV ? 0 : (v - minV) / (maxV - minV)

  return (
    <div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ background:"var(--color-surface-raised)" }}></th>
              {cols.map(c => <th key={c} style={{ background:"var(--color-surface-raised)", textAlign:"center" }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r}>
                <td style={{ fontWeight:600, color:"var(--color-text-secondary)" }}>{r}</td>
                {cols.map(c => {
                  const v = matrix?.[r]?.[c] ?? 0
                  const n = norm(v)
                  const bg = `rgba(108,63,200,${0.05 + n * 0.75})`
                  const fg = n > 0.55 ? "#fff" : "var(--color-text-primary)"
                  return <td key={c} style={{ background:bg, color:fg, textAlign:"center", fontWeight:600 }}>{typeof v === "number" ? v.toFixed(2) : v}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"var(--space-2)", marginTop:"var(--space-3)", fontSize:"var(--text-xs)", color:"var(--color-text-muted)" }}>
        <span>Low</span>
        <div style={{ flex:1, height:8, borderRadius:"var(--radius-pill)", background:"linear-gradient(90deg, rgba(108,63,200,0.05), rgba(108,63,200,0.8))" }} />
        <span>High ROI</span>
      </div>
    </div>
  )
}

function SingleChart({ chart }) {
  const colors = getChartColors()
  const labels = chart.labels ?? chart.x ?? []
  const vals   = chart.values ?? chart.y ?? chart.data ?? []

  if (!vals.length && chart.type !== "heatmap")
    return <EmptyState message="No chart data available." icon="📈" />

  if (chart.type === "heatmap") return <HeatmapTable chart={chart} />

  const dataset = {
    label: chart.label ?? chart.title ?? "",
    data: vals,
    backgroundColor: chart.type === "line" ? "rgba(108,63,200,0.08)" : colors.palette,
    borderColor: colors.primary,
    borderWidth: 2,
    tension: 0.4,
    fill: chart.type === "line",
    pointRadius: chart.type === "scatter" ? 4 : 3,
  }

  const chartData = { labels, datasets: [dataset] }

  const ChartComp = chart.type === "line" ? Line :
                    chart.type === "scatter" ? Scatter : Bar

  return <ChartComp data={chartData} options={CHART_OPTIONS} />
}

export default function ChartPanel({ charts, filter }) {
  if (!charts || !charts.length)
    return <EmptyState message="No chart data. Run the pipeline first." icon="📈" />

  const visible = filter ? charts.filter(c => c.category === filter) : charts

  return (
    <div>
      {visible.map((chart, i) => (
        <div key={i} className="chart-container">
          <div style={{ marginBottom:"var(--space-4)" }}>
            <div style={{ fontFamily:"var(--font-heading)", fontWeight:700, fontSize:"var(--text-lg)", color:"var(--color-text-primary)" }}>
              {chart.title ?? `Chart ${i+1}`}
            </div>
            {chart.subtitle && <div style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)", marginTop:"var(--space-1)" }}>{chart.subtitle}</div>}
          </div>
          <div className="chart-wrapper">
            <SingleChart chart={chart} />
          </div>
        </div>
      ))}
    </div>
  )
}