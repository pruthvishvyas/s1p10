import React, { useState } from 'react';
import { useForecast } from '../hooks/useForecast';
import { EmptyState } from './EmptyState';

export default function Forecaster({ contract }) {
  const inputSchema = contract?.forecaster?.input_schema;
  const { predict, result, loading, error } = useForecast();
  const [form, setForm] = useState({});

  if (!inputSchema || inputSchema.length === 0) return <EmptyState message='No input schema found in contract.' />;

  const handleChange = (name, val) => setForm(p => ({ ...p, [name]: val }));
  const handleSubmit = (e) => {
    e.preventDefault();
    predict(form);
  };

  const getRecommendation = (pred, prob) => {
    if (pred === 1 && prob > 0.75) return 'Strong positive signal. This influencer profile aligns with your Gold Tier characteristics. Recommend proceeding with full campaign budget.';
    if (pred === 1 && prob <= 0.75) return 'Moderate positive signal. Consider a test budget at 50% of planned spend before full commitment.';
    if (pred === 0 && prob > 0.75) return 'High risk of low ROI. This profile does not match your historical high-performers. Recommend alternative influencer.';
    return 'Uncertain signal. Run a small test campaign before committing budget.';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)' }}>
      <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>ROI Prediction Engine</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Enter an influencer's profile to predict campaign ROI outcome before committing budget</p>
        </div>
        <form onSubmit={handleSubmit}>
          {inputSchema.map(field => (
            <div key={field.name} className='form-group'>
              <label style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                {field.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                {field.range && field.type !== 'str' && (
                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: 8 }}>( {field.range[0]} – {field.range[1]} )</span>
                )}
              </label>
              {field.type === 'str' ? (
                <select required onChange={e => handleChange(field.name, e.target.value)} defaultValue=''>
                  <option value='' disabled>Select {field.name}</option>
                  {field.range?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input required type='number' min={field.range?.[0]} max={field.range?.[1]} step={field.type === 'float' ? '0.01' : '1'} placeholder={`e.g. ${field.range?.[0] ?? ''}`} onChange={e => handleChange(field.name, Number(e.target.value))} />
              )}
            </div>
          ))}
          {error && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', fontStyle: 'italic', marginBottom: 'var(--space-4)' }}>Prediction unavailable — ensure pipeline has run and worker is deployed.</div>}
          <button type='submit' className='btn-primary' disabled={loading}>
            {loading ? 'Predicting…' : 'Predict ROI Outcome'}
          </button>
        </form>
      </div>
      
      <div>
        {result && (
          <div className='forecast-result' style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-raised)', borderTop: `4px solid ${result.prediction === 1 ? 'var(--color-success)' : 'var(--color-danger)'}` }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: result.prediction === 1 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              Prediction: {result.prediction === 1 ? 'High ROI Campaign' : 'Low ROI Campaign'}
            </h3>
            <div style={{ marginBottom: 'var(--space-2)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
              [{result.prediction} — {result.prediction === 1 ? 'POSITIVE' : 'NEGATIVE'}]
            </div>
            <div style={{ marginBottom: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
              Confidence: {(result.probability * 100).toFixed(1)}%
            </div>
            <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: 'var(--space-3)' }}>
              <strong style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Recommendation</strong>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {getRecommendation(result.prediction, result.probability)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}