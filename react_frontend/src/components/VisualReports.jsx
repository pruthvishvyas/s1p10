import { useState } from 'react'
import { EmptyState } from './EmptyState'

const CATEGORY_META = {
  roi:         { label:"ROI Analysis",       icon:"📈", color:"#6C3FC8" },
  platform:    { label:"Platform Breakdown",  icon:"📡", color:"#2980B9" },
  tier:        { label:"Influencer Tiers",    icon:"🏆", color:"#F1C40F" },
  niche:       { label:"Audience Niches",     icon:"🎯", color:"#27AE60" },
  anomaly:     { label:"Anomaly Detection",   icon:"⚠️", color:"#E67E22" },
  model:       { label:"Model Performance",   icon:"🤖", color:"#95A5A6" },
  correlation: { label:"Correlations",        icon:"🔗", color:"#FF6B35" },
  cost:        { label:"Cost Analysis",       icon:"💰", color:"#CD7F32" },
  other:       { label:"Other Reports",       icon:"📊", color:"#4A4565" },
}

function getCategory(filename) {
  const f = (filename ?? "").toLowerCase()
  if (f.includes("roi"))         return "roi"
  if (f.includes("platform"))    return "platform"
  if (f.includes("tier"))        return "tier"
  if (f.includes("niche"))       return "niche"
  if (f.includes("anomal"))      return "anomaly"
  if (f.includes("model") || f.includes("roc") || f.includes("confusion") || f.includes("feature")) return "model"
  if (f.includes("corr"))        return "correlation"
  if (f.includes("cost"))        return "cost"
  return "other"
}

function makeTitle(filename) {
  return (filename ?? "")
    .replace(/\.png$/i, "").replace(/\.jpg$/i, "").replace(/\.jpeg$/i, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\s+/g, " ").trim()
}

function ReportCard({ report, onClick }) {
  const cat  = report.category ?? getCategory(report.filename)
  const meta = CATEGORY_META[cat] ?? CATEGORY_META.other
  const src  = report.url ?? `/reports/${report.filename}`
  const title = report.title ?? makeTitle(report.filename)

  return (
    <div
      onClick={() => onClick(report)}
      style={{
        background:"var(--color-surface)", border:"1px solid var(--color-border)",
        borderRadius:"var(--radius-lg)", overflow:"hidden",
        boxShadow:"var(--shadow-card)", cursor:"pointer",
        transition:"all 0.15s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="var(--shadow-raised)" }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="var(--shadow-card)" }}
    >
      {/* Image */}
      <div style={{ position:"relative", paddingBottom:"62%", background:"var(--color-surface-raised)", overflow:"hidden" }}>
        <img
          src={src}
          alt={title}
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", padding:8 }}
          onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex" }}
        />
        <div style={{ display:"none", position:"absolute", inset:0, alignItems:"center",
          justifyContent:"center", flexDirection:"column", gap:8,
          color:"var(--color-text-muted)", fontSize:"var(--text-sm)" }}>
          <span style={{ fontSize:"2rem" }}>🖼️</span>
          <span>Image not loaded</span>
          <span style={{ fontSize:"var(--text-xs)" }}>Copy to public/reports/</span>
        </div>
        {/* Category badge overlay */}
        <span style={{
          position:"absolute", top:10, left:10,
          background: meta.color, color:"#fff",
          borderRadius:"var(--radius-pill)", padding:"3px 10px",
          fontSize:"var(--text-xs)", fontWeight:700,
        }}>
          {meta.icon} {meta.label}
        </span>
      </div>
      {/* Footer */}
      <div style={{ padding:"var(--space-4)" }}>
        <div style={{ fontWeight:700, fontSize:"var(--text-sm)", color:"var(--color-text-primary)",
          marginBottom:"var(--space-1)", lineHeight:1.4 }}>{title}</div>
        {report.description && (
          <div style={{ fontSize:"var(--text-xs)", color:"var(--color-text-muted)", lineHeight:1.5 }}>
            {report.description}
          </div>
        )}
      </div>
    </div>
  )
}

function LightboxModal({ report, onClose }) {
  if (!report) return null
  const src   = report.url ?? `/reports/${report.filename}`
  const title = report.title ?? makeTitle(report.filename)
  const cat   = report.category ?? getCategory(report.filename)
  const meta  = CATEGORY_META[cat] ?? CATEGORY_META.other

  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, background:"rgba(26,21,48,0.85)",
        zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center",
        padding:"var(--space-8)", backdropFilter:"blur(4px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:"var(--color-surface)", borderRadius:"var(--radius-xl)",
          overflow:"hidden", maxWidth:"90vw", maxHeight:"90vh",
          display:"flex", flexDirection:"column", boxShadow:"0 24px 80px rgba(0,0,0,0.4)",
        }}
      >
        {/* Modal header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"var(--space-4) var(--space-6)",
          borderBottom:"1px solid var(--color-border)",
        }}>
          <div>
            <span style={{ background:meta.color, color:"#fff",
              borderRadius:"var(--radius-pill)", padding:"2px 10px",
              fontSize:"var(--text-xs)", fontWeight:700, marginRight:"var(--space-3)" }}>
              {meta.icon} {meta.label}
            </span>
            <span style={{ fontWeight:700, color:"var(--color-text-primary)", fontSize:"var(--text-base)" }}>
              {title}
            </span>
          </div>
          <button onClick={onClose} style={{
            background:"none", border:"1px solid var(--color-border)",
            borderRadius:"var(--radius-md)", width:32, height:32,
            cursor:"pointer", fontSize:"1rem", color:"var(--color-text-secondary)",
          }}>✕</button>
        </div>
        {/* Image */}
        <div style={{ overflow:"auto", padding:"var(--space-4)", flex:1 }}>
          <img src={src} alt={title}
            style={{ maxWidth:"100%", height:"auto", display:"block", margin:"0 auto" }} />
        </div>
        {report.description && (
          <div style={{
            padding:"var(--space-4) var(--space-6)",
            borderTop:"1px solid var(--color-border)",
            fontSize:"var(--text-sm)", color:"var(--color-text-secondary)",
          }}>
            {report.description}
          </div>
        )}
      </div>
    </div>
  )
}

export default function VisualReports({ reports }) {
  const [activeFilter, setActiveFilter] = useState("all")
  const [lightbox, setLightbox]         = useState(null)
  const [search, setSearch]             = useState("")

  if (!reports || !reports.length) return (
    <div>
      <EmptyState message="No visual reports found." icon="🖼️" />
      <div style={{ textAlign:"center", marginTop:"var(--space-4)" }}>
        <p style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)", marginBottom:"var(--space-3)" }}>
          Run the patch script to import your pipeline PNG reports:
        </p>
        <code style={{ background:"var(--color-surface-raised)", padding:"var(--space-3) var(--space-4)",
          borderRadius:"var(--radius-md)", fontSize:"var(--text-sm)", display:"inline-block",
          border:"1px solid var(--color-border)", color:"var(--color-primary)", fontWeight:600 }}>
          python export_for_frontend_patch.py
        </code>
      </div>
    </div>
  )

  // Build category counts
  const cats = {}
  reports.forEach(r => {
    const c = r.category ?? getCategory(r.filename)
    cats[c] = (cats[c] ?? 0) + 1
  })

  const filtered = reports.filter(r => {
    const c = r.category ?? getCategory(r.filename)
    const t = (r.title ?? makeTitle(r.filename)).toLowerCase()
    const matchesCat  = activeFilter === "all" || c === activeFilter
    const matchSearch = !search || t.includes(search.toLowerCase())
    return matchesCat && matchSearch
  })

  return (
    <div>
      <LightboxModal report={lightbox} onClose={() => setLightbox(null)} />

      {/* Header + search */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:"var(--space-4)", flexWrap:"wrap", gap:"var(--space-3)" }}>
        <div style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)" }}>
          {filtered.length} of {reports.length} reports
        </div>
        <input
          type="text"
          placeholder="Search reports…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding:"var(--space-2) var(--space-4)", border:"1px solid var(--color-border)",
            borderRadius:"var(--radius-pill)", fontFamily:"var(--font-body)", fontSize:"var(--text-sm)",
            outline:"none", width:220, background:"var(--color-surface)",
          }}
        />
      </div>

      {/* Category filter pills */}
      <div className="filter-pills" style={{ marginBottom:"var(--space-6)" }}>
        <button className={`filter-pill ${activeFilter==="all"?"active":""}`}
          onClick={() => setActiveFilter("all")}>
          All ({reports.length})
        </button>
        {Object.entries(cats).map(([cat, count]) => {
          const meta = CATEGORY_META[cat] ?? CATEGORY_META.other
          return (
            <button key={cat}
              className={`filter-pill ${activeFilter===cat?"active":""}`}
              onClick={() => setActiveFilter(cat)}>
              {meta.icon} {meta.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Report grid */}
      {filtered.length === 0 ? (
        <EmptyState message="No reports match this filter." icon="🔍" />
      ) : (
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",
          gap:"var(--space-6)",
        }}>
          {filtered.map((r, i) => (
            <ReportCard key={i} report={r} onClick={setLightbox} />
          ))}
        </div>
      )}
    </div>
  )
}