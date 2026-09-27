import { useState } from 'react'
import { EmptyState } from './EmptyState'
import { SEVERITY_COLORS } from '../utils/colors'

const CATEGORY_LABELS = {
  CAMPAIGN_ROI_PREVALENCE:    "📊 ROI Prevalence",
  BEST_PLATFORM:              "📡 Best Platform",
  BEST_NICHE:                 "🎯 Best Niche",
  MICRO_VS_MEGA:              "👥 Micro vs Mega",
  ENGAGEMENT_ROI_CORRELATION: "📈 Engagement Signal",
  COST_EFFICIENCY_FINDING:    "💰 Cost Efficiency",
  TOP_PLATFORM_NICHE_COMBO:   "🔥 Top Combo",
  ANOMALY_PROFILE:            "⚠️ Anomaly Profile",
  GOLD_TIER_PROFILE:          "🥇 Gold Tier Profile",
  MODEL_PERFORMANCE:          "🤖 Model Performance",
}

const SEV_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 }

export default function InsightCards({ insights }) {
  const [filter, setFilter] = useState("All")

  if (!insights || !insights.length)
    return <EmptyState message="No insights generated. Run the pipeline first." icon="💡" />

  const sorted   = [...insights].sort((a,b) => (SEV_ORDER[a.severity]??3) - (SEV_ORDER[b.severity]??3))
  const filtered = filter === "All" ? sorted : sorted.filter(i => i.severity === filter)

  return (
    <div>
      <div className="filter-pills">
        {["All","HIGH","MEDIUM","LOW"].map(f => (
          <button key={f} className={`filter-pill ${filter===f?"active":""}`}
            onClick={() => setFilter(f)}>{f}
          </button>
        ))}
      </div>

      {filtered.map((ins, i) => {
        const sevColor  = SEVERITY_COLORS[ins.severity] ?? { bg:"#888", text:"#fff" }
        const catLabel  = CATEGORY_LABELS[ins.category] ?? ins.category ?? ""
        return (
          <div key={i} className="insight-card">
            <div style={{ display:"flex", gap:"var(--space-2)", flexWrap:"wrap", marginBottom:"var(--space-4)" }}>
              <span style={{ background:sevColor.bg, color:sevColor.text,
                borderRadius:"var(--radius-pill)", padding:"2px 12px",
                fontSize:"var(--text-xs)", fontWeight:700, textTransform:"uppercase" }}>
                {ins.severity}
              </span>
              {catLabel && (
                <span style={{ background:"#2C3E50", color:"#fff",
                  borderRadius:"var(--radius-pill)", padding:"2px 10px",
                  fontSize:"var(--text-xs)" }}>
                  {catLabel}
                </span>
              )}
            </div>
            <p style={{ fontSize:"var(--text-base)", color:"var(--color-text-primary)", fontWeight:600, marginBottom:"var(--space-3)", lineHeight:1.5 }}>
              {ins.finding}
            </p>
            {ins.evidence && (
              <div className="evidence-box">
                <strong style={{ fontSize:"var(--text-xs)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Evidence</strong>
                <p style={{ margin:"var(--space-1) 0 0" }}>{ins.evidence}</p>
              </div>
            )}
            {ins.action && (
              <div className="action-box">
                <strong style={{ fontSize:"var(--text-xs)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Action</strong>
                <p style={{ margin:"var(--space-1) 0 0" }}>{ins.action}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}