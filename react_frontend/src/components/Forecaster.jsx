import { useState } from 'react'
import { useForecast } from '../hooks/useForecast'
import { EmptyState } from './EmptyState'

const INPUT_SCHEMA = [{"name": "Follower_Count", "type": "int", "range": [1000, 5000000]}, {"name": "Engagement_Rate_Pct", "type": "float", "range": [0.1, 20.0]}, {"name": "Avg_Comments_Per_Post", "type": "int", "range": [0, 5000]}, {"name": "Past_Brand_Collaborations", "type": "int", "range": [0, 50]}, {"name": "Campaign_Cost_USD", "type": "float", "range": [100, 500000]}, {"name": "Discount_Code_Uses", "type": "int", "range": [0, 10000]}, {"name": "Platform", "type": "str", "range": ["Instagram", "YouTube", "TikTok", "Twitter", "Facebook"]}, {"name": "Audience_Niche", "type": "str", "range": ["Fashion", "Tech", "Fitness", "Food", "Travel", "Beauty", "Gaming", "Finance"]}]

function getRecommendation(prediction, probability) {
  if (prediction === 1 && probability >= 0.80)
    return "Strong buy signal. Profile matches your Gold Tier characteristics — high engagement, proven conversion. Proceed with full budget."
  if (prediction === 1 && probability >= 0.65)
    return "Positive signal. This profile has the key ROI indicators. Recommend committing campaign budget with standard monitoring."
  if (prediction === 1)
    return "Moderate positive. Borderline signal — consider a test at 50% budget before full commitment."
  if (prediction === 0 && probability <= 0.30)
    return "High risk. Profile does not match high-ROI patterns. Low engagement or poor cost efficiency detected. Recommend alternative influencer."
  return "Uncertain. Mixed signals detected. Run a small pilot campaign (10-20% budget) to validate before scaling."
}

function SignalBar({ label, score }) {
  const color = score >= 70 ? "var(--color-success)" : score >= 45 ? "var(--color-warning)" : "var(--color-danger)"
  return (
    <div style={{ marginBottom:"var(--space-2)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:"var(--text-xs)", color:"var(--color-text-secondary)" }}>{label}</span>
        <span style={{ fontSize:"var(--text-xs)", fontWeight:700, color }}>{score}/100</span>
      </div>
      <div style={{ height:6, background:"var(--color-border)", borderRadius:"var(--radius-pill)", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${score}%`, background:color,
          borderRadius:"var(--radius-pill)", transition:"width 0.4s ease" }} />
      </div>
    </div>
  )
}

export default function Forecaster({ contract }) {
  const schema = contract?.forecaster?.input_schema ?? INPUT_SCHEMA
  const { predict, result, loading, error } = useForecast()
  const [form, setForm] = useState(() => {
    const init = {}
    schema.forEach(f => {
      init[f.name] = f.type === "str" ? (f.range?.[0] ?? "") : ""
    })
    return init
  })
  const [validationErrors, setValidationErrors] = useState({})

  if (!schema || !schema.length)
    return <EmptyState message="No forecaster schema found in contract." icon="🎯" />

  function handleChange(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
    setValidationErrors(prev => { const n = {...prev}; delete n[name]; return n })
  }

  function handleSubmit() {
    const errs = {}
    const inputs = {}
    schema.forEach(f => {
      const raw = form[f.name]
      if (f.type === "str") {
        inputs[f.name] = raw || (f.range?.[0] ?? "")
      } else {
        const v = f.type === "float" ? parseFloat(raw) : parseInt(raw, 10)
        if (raw === "" || raw === undefined || isNaN(v)) {
          errs[f.name] = "Required"
        } else if (f.range && (v < f.range[0] || v > f.range[1])) {
          errs[f.name] = `Must be ${f.range[0]}–${f.range[1]}`
        } else {
          inputs[f.name] = v
        }
      }
    })
    if (Object.keys(errs).length > 0) { setValidationErrors(errs); return }
    setValidationErrors({})
    predict(inputs)
  }

  const isPositive = result?.prediction === 1
  const pct = result ? Math.round(result.probability * 100) : 0

  return (
    <div style={{ maxWidth:700 }}>
      <h2 style={{ fontFamily:"var(--font-heading)", fontWeight:800, fontSize:"var(--text-2xl)",
        color:"var(--color-text-primary)", marginBottom:"var(--space-2)" }}>
        🎯 ROI Prediction Engine
      </h2>
      <p style={{ color:"var(--color-text-secondary)", marginBottom:"var(--space-6)", fontSize:"var(--text-base)" }}>
        Fill in the influencer profile below. The engine scores 7 independent ROI signals
        and gives you a verdict with a confidence breakdown.
      </p>

      <div className="chart-container">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:"var(--space-4)" }}>
          {schema.map(field => {
            const err = validationErrors[field.name]
            return (
              <div key={field.name} className="form-group" style={{ marginBottom:0 }}>
                <label style={{ color: err ? "var(--color-danger)" : "var(--color-text-primary)" }}>
                  {field.name.replace(/_/g," ").replace(/\b\w/g, c => c.toUpperCase())}
                  {field.range && field.type !== "str" && (
                    <span style={{ color:"var(--color-text-muted)", fontWeight:400, marginLeft:6, fontSize:"var(--text-xs)" }}>
                      ({field.range[0].toLocaleString()} – {field.range[1].toLocaleString()})
                    </span>
                  )}
                </label>
                {field.type === "str" ? (
                  <select
                    value={form[field.name] ?? ""}
                    onChange={e => handleChange(field.name, e.target.value)}
                    style={{ borderColor: err ? "var(--color-danger)" : undefined }}
                  >
                    {(field.range ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={field.range?.[0]}
                    max={field.range?.[1]}
                    step={field.type === "float" ? 0.1 : 1}
                    placeholder={field.range ? `e.g. ${field.type === "float" ? field.range[0].toFixed(1) : field.range[0].toLocaleString()}` : ""}
                    value={form[field.name] ?? ""}
                    onChange={e => handleChange(field.name, e.target.value)}
                    style={{ borderColor: err ? "var(--color-danger)" : undefined }}
                  />
                )}
                {err && <span style={{ fontSize:"var(--text-xs)", color:"var(--color-danger)", marginTop:2 }}>{err}</span>}
              </div>
            )
          })}
        </div>

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop:"var(--space-6)", maxWidth:300 }}
        >
          {loading ? "Analysing…" : "⚡ Predict ROI Outcome"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop:"var(--space-4)", padding:"var(--space-4)",
          background:"rgba(192,57,43,0.06)", border:"1px solid rgba(192,57,43,0.2)",
          borderRadius:"var(--radius-md)", color:"var(--color-danger)", fontSize:"var(--text-sm)" }}>
          ⚠️ {error}
        </div>
      )}

      {result && !error && (
        <div className="forecast-result" style={{ marginTop:"var(--space-6)", display:"grid",
          gridTemplateColumns:"1fr 1fr", gap:"var(--space-6)" }}>

          {/* Verdict card */}
          <div className="chart-container" style={{ borderTop:`4px solid ${isPositive ? "var(--color-success)" : "var(--color-danger)"}` }}>
            <div style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)", marginBottom:"var(--space-2)" }}>Prediction</div>
            <div style={{ fontFamily:"var(--font-heading)", fontWeight:800, fontSize:"var(--text-3xl)",
              color: isPositive ? "var(--color-success)" : "var(--color-danger)", lineHeight:1, marginBottom:"var(--space-3)" }}>
              {isPositive ? "High ROI" : "Low ROI"}
            </div>

            {/* Probability gauge */}
            <div style={{ marginBottom:"var(--space-4)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:"var(--text-sm)", color:"var(--color-text-secondary)" }}>Confidence</span>
                <span style={{ fontWeight:800, fontSize:"var(--text-xl)",
                  color: isPositive ? "var(--color-success)" : "var(--color-danger)" }}>{pct}%</span>
              </div>
              <div style={{ height:12, background:"var(--color-border)", borderRadius:"var(--radius-pill)", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`,
                  background: isPositive ? "var(--color-success)" : "var(--color-danger)",
                  borderRadius:"var(--radius-pill)", transition:"width 0.5s ease" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:"var(--text-xs)", color:"var(--color-text-muted)" }}>
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>

            <div style={{ display:"flex", gap:"var(--space-2)", marginBottom:"var(--space-4)" }}>
              <span style={{
                background: isPositive ? "var(--color-success)" : "var(--color-danger)",
                color:"#fff", borderRadius:"var(--radius-pill)", padding:"3px 14px",
                fontSize:"var(--text-xs)", fontWeight:700
              }}>{result.prediction === 1 ? "POSITIVE" : "NEGATIVE"}</span>
              <span style={{
                background: result.risk_level === "LOW" ? "rgba(39,174,96,0.12)" :
                            result.risk_level === "MEDIUM" ? "rgba(230,126,34,0.12)" : "rgba(192,57,43,0.12)",
                color: result.risk_level === "LOW" ? "var(--color-success)" :
                       result.risk_level === "MEDIUM" ? "var(--color-warning)" : "var(--color-danger)",
                borderRadius:"var(--radius-pill)", padding:"3px 14px",
                fontSize:"var(--text-xs)", fontWeight:700
              }}>{result.risk_level} RISK</span>
            </div>

            <div style={{ borderLeft:"3px solid var(--color-primary)",
              paddingLeft:"var(--space-3)", fontSize:"var(--text-sm)",
              color:"var(--color-text-secondary)", lineHeight:1.7 }}>
              {getRecommendation(result.prediction, result.probability)}
            </div>
          </div>

          {/* Signal breakdown card */}
          <div className="chart-container">
            <div style={{ fontWeight:700, fontSize:"var(--text-base)", marginBottom:"var(--space-4)",
              color:"var(--color-text-primary)" }}>📊 Signal Breakdown</div>
            {result.signal_breakdown && Object.entries(result.signal_breakdown).map(([label, score]) => (
              <SignalBar key={label} label={label} score={score} />
            ))}
            <div style={{ marginTop:"var(--space-4)", padding:"var(--space-3)",
              background:"var(--color-surface-raised)", borderRadius:"var(--radius-md)",
              fontSize:"var(--text-xs)", color:"var(--color-text-muted)", lineHeight:1.6 }}>
              Scores 7 independent ROI signals. Green ≥70 · Orange 45–69 · Red &lt;45
            </div>
          </div>
        </div>
      )}
    </div>
  )
}