import { useState } from 'react'
import { useForecast } from '../hooks/useForecast'
import { EmptyState } from './EmptyState'

const INPUT_SCHEMA = [{"name": "Follower_Count", "type": "int", "range": [1000, 5000000]}, {"name": "Engagement_Rate_Pct", "type": "float", "range": [0.1, 20.0]}, {"name": "Avg_Comments_Per_Post", "type": "int", "range": [0, 5000]}, {"name": "Past_Brand_Collaborations", "type": "int", "range": [0, 50]}, {"name": "Campaign_Cost_USD", "type": "float", "range": [100, 500000]}, {"name": "Discount_Code_Uses", "type": "int", "range": [0, 10000]}, {"name": "Platform", "type": "str", "range": ["Instagram", "YouTube", "TikTok", "Twitter", "Facebook"]}, {"name": "Audience_Niche", "type": "str", "range": ["Fashion", "Tech", "Fitness", "Food", "Travel", "Beauty", "Gaming", "Finance"]}]

function getRecommendation(prediction, probability) {
  if (prediction === 1 && probability > 0.75)
    return "Strong positive signal. This influencer profile aligns with your Gold Tier characteristics. Recommend proceeding with full campaign budget."
  if (prediction === 1)
    return "Moderate positive signal. Consider a test budget at 50% of planned spend before full commitment."
  if (prediction === 0 && probability > 0.75)
    return "High risk of low ROI. This profile does not match your historical high-performers. Recommend alternative influencer."
  return "Uncertain signal. Run a small test campaign before committing budget."
}

export default function Forecaster({ contract }) {
  const schema = contract?.forecaster?.input_schema ?? INPUT_SCHEMA
  const { predict, result, loading, error } = useForecast()
  const [form, setForm] = useState(() => {
    const init = {}
    schema.forEach(f => { init[f.name] = f.type === "str" ? (f.range?.[0] ?? "") : "" })
    return init
  })

  if (!schema || !schema.length)
    return <EmptyState message="No forecaster schema found in contract." icon="🎯" />

  function handleChange(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleSubmit() {
    const inputs = {}
    schema.forEach(f => {
      inputs[f.name] = f.type === "str" ? form[f.name] :
                       f.type === "float" ? parseFloat(form[f.name]) : parseInt(form[f.name], 10)
    })
    predict(inputs)
  }

  const isPositive = result?.prediction === 1

  return (
    <div style={{ maxWidth:640 }}>
      <h2 style={{ fontFamily:"var(--font-heading)", fontWeight:800, fontSize:"var(--text-2xl)", color:"var(--color-text-primary)", marginBottom:"var(--space-2)" }}>
        ROI Prediction Engine
      </h2>
      <p style={{ color:"var(--color-text-secondary)", marginBottom:"var(--space-8)", fontSize:"var(--text-base)" }}>
        Enter an influencer's profile to predict campaign ROI outcome before committing budget.
      </p>

      <div className="chart-container">
        {schema.map(field => (
          <div key={field.name} className="form-group">
            <label>
              {field.name.replace(/_/g," ").replace(/\b\w/g, c => c.toUpperCase())}
              {field.range && field.type !== "str" && (
                <span style={{ color:"var(--color-text-muted)", fontWeight:400, marginLeft:8, fontSize:"var(--text-xs)" }}>
                  ({field.range[0]} – {field.range[1]})
                </span>
              )}
            </label>
            {field.type === "str" ? (
              <select value={form[field.name] ?? ""} onChange={e => handleChange(field.name, e.target.value)}>
                {(field.range ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input
                type="number"
                min={field.range?.[0]}
                max={field.range?.[1]}
                step={field.type === "float" ? 0.01 : 1}
                placeholder={`e.g. ${field.range?.[0] ?? ""}`}
                value={form[field.name] ?? ""}
                onChange={e => handleChange(field.name, e.target.value)}
              />
            )}
          </div>
        ))}

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"var(--space-2)" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation:"spin 0.8s linear infinite" }}>
                <circle cx="8" cy="8" r="6" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="30" strokeDashoffset="10" />
              </svg>
              Predicting…
            </span>
          ) : "Predict ROI Outcome"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop:"var(--space-4)", padding:"var(--space-4)", background:"rgba(192,57,43,0.06)", border:"1px solid rgba(192,57,43,0.2)", borderRadius:"var(--radius-md)" }}>
          <p style={{ color:"var(--color-danger)", fontSize:"var(--text-sm)", fontWeight:600, marginBottom:"var(--space-2)" }}>
            ⚠️ Prediction unavailable
          </p>
          <p style={{ color:"var(--color-text-secondary)", fontSize:"var(--text-sm)", lineHeight:1.6 }}>
            {error}
          </p>
          <p style={{ color:"var(--color-text-muted)", fontSize:"var(--text-xs)", marginTop:"var(--space-2)" }}>
            Fix: ensure <code>forecast_lookup.json</code> exists in <code>public/data/</code> — run <code>export_for_frontend.py</code> from your pipeline.
          </p>
        </div>
      )}

      {result && !error && (
        <div className="forecast-result chart-container" style={{ marginTop:"var(--space-6)" }}>
          <div style={{ marginBottom:"var(--space-4)" }}>
            <div style={{ fontSize:"var(--text-sm)", color:"var(--color-text-muted)", marginBottom:"var(--space-1)" }}>Prediction</div>
            <div style={{ fontFamily:"var(--font-heading)", fontWeight:800, fontSize:"var(--text-2xl)",
              color: isPositive ? "var(--color-success)" : "var(--color-danger)" }}>
              {isPositive ? "High ROI Campaign" : "Low ROI Campaign"}
            </div>
            <span style={{
              display:"inline-block", marginTop:"var(--space-1)",
              background: isPositive ? "var(--color-success)" : "var(--color-danger)",
              color:"#fff", borderRadius:"var(--radius-pill)", padding:"2px 12px",
              fontSize:"var(--text-xs)", fontWeight:700,
            }}>
              {result.prediction} — {isPositive ? "POSITIVE" : "NEGATIVE"}
            </span>
          </div>
          <div style={{ marginBottom:"var(--space-4)" }}>
            <span style={{ color:"var(--color-text-muted)", fontSize:"var(--text-sm)" }}>Confidence: </span>
            <strong>{result.probability != null ? `${(result.probability * 100).toFixed(1)}%` : "—"}</strong>
            {result.risk_level && (
              <span style={{ marginLeft:"var(--space-4)", color:"var(--color-text-muted)", fontSize:"var(--text-sm)" }}>Risk: <strong>{result.risk_level}</strong></span>
            )}
          </div>
          <div className="action-box">
            <strong style={{ fontSize:"var(--text-xs)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Recommendation</strong>
            <p style={{ margin:"var(--space-1) 0 0", fontSize:"var(--text-sm)", lineHeight:1.6 }}>
              {getRecommendation(result.prediction, result.probability ?? 0.5)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}