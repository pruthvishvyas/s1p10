import { useContract } from '../hooks/useContract'

const TABS = ['ROI Overview','Platform Analysis','Influencer Tiers','Campaign Insights','ROI Forecaster','Anomalies']
const ICONS = ['📊','📡','🏆','💡','🎯','⚠️']

export default function Sidebar({ activeTab, onTabChange }) {
  const { contract } = useContract()
  const srcType = contract?.source?.type ?? "csv"

  return (
    <aside className="sidebar" style={{
      width:"var(--sidebar-width)", background:"var(--color-surface)",
      borderRight:"1px solid var(--color-border)", display:"flex",
      flexDirection:"column", height:"100vh", overflow:"hidden", flexShrink:0,
    }}>
      <div style={{ padding:"var(--space-6)", borderBottom:"1px solid var(--color-border)" }}>
        <div className="project-name" style={{
          fontFamily:"var(--font-heading)", fontSize:"var(--text-lg)",
          fontWeight:800, color:"var(--color-text-primary)", lineHeight:1.2,
        }}>
          🎯 Influencer ROI Intelligence
        </div>
        <div style={{ fontSize:"var(--text-xs)", color:"var(--color-text-muted)", marginTop:"var(--space-1)" }}>
          Marketing Analytics
        </div>
      </div>

      <nav style={{ flex:1, padding:"var(--space-4) 0", overflowY:"auto" }}>
        {TABS.map((tab, i) => {
          const isActive = activeTab === i
          return (
            <button key={tab} onClick={() => onTabChange(i)} style={{
              display:"flex", alignItems:"center", gap:"var(--space-3)",
              width:"100%", padding:"var(--space-3) var(--space-6)",
              background: isActive ? "rgba(108,63,200,0.08)" : "transparent",
              border:"none", borderLeft: isActive ? "3px solid var(--color-primary)" : "3px solid transparent",
              cursor:"pointer", textAlign:"left",
              color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
              fontWeight: isActive ? 600 : 400,
              fontSize:"var(--text-sm)", fontFamily:"var(--font-body)",
              transition:"all 0.15s ease",
            }}>
              <span>{ICONS[i]}</span>
              <span className="nav-label">{tab}</span>
            </button>
          )
        })}
      </nav>

      <div style={{ padding:"var(--space-4) var(--space-6)", borderTop:"1px solid var(--color-border)" }}>
        <span className="source-pill" style={{
          display:"inline-block",
          background: srcType === "bigquery" ? "#1A73E8" : "#5F6368",
          color:"#fff", borderRadius:"var(--radius-pill)",
          padding:"2px 10px", fontSize:"var(--text-xs)", fontWeight:600,
        }}>
          {srcType === "bigquery" ? "BigQuery" : "CSV"}
        </span>
      </div>
    </aside>
  )
}