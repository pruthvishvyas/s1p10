import { EmptyState } from './EmptyState'
import { formatValue, formatROI, formatUSD } from '../utils/formatters'

const KPI_MAP = {
  high_roi_rate:              { label:"High ROI Rate",       icon:"🎯", format:"percent" },
  mean_roi_ratio:             { label:"Mean ROI Ratio",      icon:"📈", format:"roi" },
  total_campaigns:            { label:"Campaigns Analysed",  icon:"📋", format:"number" },
  total_revenue_usd:          { label:"Total Revenue",       icon:"💰", format:"currency" },
  median_campaign_cost_usd:   { label:"Median Campaign Cost",icon:"💸", format:"currency" },
  gold_tier_count:            { label:"Gold Tier Partners",  icon:"🥇", format:"number" },
  p1_partner_count:           { label:"P1 Strategic Partners",icon:"⭐",format:"number" },
  anomaly_count:              { label:"Anomalous Campaigns", icon:"⚠️", format:"number" },
  mean_audience_quality_score:{ label:"Audience Quality Index",icon:"👥",format:"float" },
}

function kpiColor(key, value) {
  if (key === "high_roi_rate") {
    if (value >= 50) return "var(--color-success)"
    if (value < 30)  return "var(--color-danger)"
  }
  if (key === "mean_roi_ratio") {
    if (value >= 3.0) return "var(--color-success)"
    if (value < 1.5)  return "var(--color-danger)"
  }
  return "var(--color-text-primary)"
}

function formatKPIValue(key, value) {
  if (value === null || value === undefined) return "—"
  const meta = KPI_MAP[key]
  if (!meta) return String(value)
  if (meta.format === "roi")      return formatROI(value)
  if (meta.format === "currency") return formatUSD(value)
  return formatValue(value, meta.format)
}

export default function KPICards({ data }) {
  if (!data) return <EmptyState message="No KPI data found. Run the pipeline first." icon="📊" />
  const keys = Object.keys(KPI_MAP).filter(k => k in data)
  if (keys.length === 0) return <EmptyState message="KPI data is empty." icon="📊" />

  return (
    <div className="kpi-grid">
      {keys.map(key => {
        const meta  = KPI_MAP[key]
        const value = data[key]
        const color = kpiColor(key, value)
        return (
          <div key={key} className="kpi-card">
            <div style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)", marginBottom:"var(--space-2)" }}>
              {meta.icon} {meta.label}
            </div>
            <div style={{
              fontSize:"var(--text-4xl)", fontFamily:"var(--font-heading)",
              fontWeight:800, color, lineHeight:1,
            }}>
              {formatKPIValue(key, value)}
            </div>
            {key === "anomaly_count" && value > 0 && (
              <span style={{
                display:"inline-block", marginTop:"var(--space-2)",
                background:"var(--color-warning)", color:"#fff",
                borderRadius:"var(--radius-pill)", padding:"2px 10px",
                fontSize:"var(--text-xs)", fontWeight:700,
              }}>Requires Review</span>
            )}
            {key === "gold_tier_count" && value > 0 && (
              <span style={{
                display:"inline-block", marginTop:"var(--space-2)",
                background:"var(--color-gold)", color:"#1A1530",
                borderRadius:"var(--radius-pill)", padding:"2px 10px",
                fontSize:"var(--text-xs)", fontWeight:700,
              }}>Priority Partners</span>
            )}
          </div>
        )
      })}
    </div>
  )
}