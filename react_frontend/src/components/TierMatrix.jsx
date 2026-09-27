import { EmptyState } from './EmptyState'
import { TIER_COLORS } from '../utils/colors'
import { formatROI, formatUSD } from '../utils/formatters'

const STRATEGY = {
  "Gold Tier":   { label:"Priority Partner",   bg:"#27AE60", text:"#fff" },
  "Silver Tier": { label:"Steady State",        bg:"#2980B9", text:"#fff" },
  "Bronze Tier": { label:"Test Budget Only",    bg:"#E67E22", text:"#fff" },
}

export default function TierMatrix({ tiers }) {
  if (!tiers || !tiers.length)
    return <EmptyState message="No tier data found. Run the pipeline first." icon="🏆" />

  return (
    <div className="tier-grid">
      {tiers.map((tier, i) => {
        const tc   = TIER_COLORS[tier.tier] ?? { bg:"#888", text:"#fff", icon:"🎖️" }
        const strat = STRATEGY[tier.tier] ?? { label:"Review", bg:"#888", text:"#fff" }
        return (
          <div key={i} className="tier-card" style={{ borderTop:`4px solid ${tc.bg}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:"var(--space-3)", marginBottom:"var(--space-4)" }}>
              <span style={{ fontSize:"2rem" }}>{tc.icon}</span>
              <div>
                <div style={{ fontFamily:"var(--font-heading)", fontWeight:800, fontSize:"var(--text-xl)", color:"var(--color-text-primary)" }}>
                  {tier.tier}
                </div>
                <div style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)" }}>
                  {tier.count ?? tier.influencer_count ?? "—"} influencers
                </div>
              </div>
            </div>

            <div>
              {[
                ["ROI Ratio",   formatROI(tier.mean_roi_ratio ?? tier.roi_ratio)],
                ["Engagement",  tier.mean_engagement_rate != null ? `${Number(tier.mean_engagement_rate).toFixed(1)}%` : "—"],
                ["AQ Score",    tier.mean_audience_quality_score != null ? Number(tier.mean_audience_quality_score).toFixed(2) : "—"],
                ["Cost/Conv",   formatUSD(tier.mean_cost_per_conversion ?? tier.cost_per_conversion)],
              ].map(([label, val]) => (
                <div key={label} className="metric-row">
                  <span style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)" }}>{label}</span>
                  <span style={{ fontSize:"var(--text-sm)", fontWeight:700, color:"var(--color-text-primary)" }}>{val}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop:"var(--space-4)" }}>
              <span style={{
                display:"inline-block", background:strat.bg, color:strat.text,
                borderRadius:"var(--radius-pill)", padding:"4px 16px",
                fontSize:"var(--text-xs)", fontWeight:700,
              }}>
                {strat.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}