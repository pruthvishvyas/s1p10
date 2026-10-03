import { useState } from 'react'

/**
 * Pure JavaScript ROI prediction engine.
 * Works 100% in the browser — no worker, no pkl, no network call needed.
 *
 * Algorithm: weighted scoring across 6 validated ROI signals.
 * Each signal contributes independently so different inputs produce different results.
 *
 * Signals (derived from typical influencer marketing research):
 *  1. Engagement rate          — strongest predictor of conversion
 *  2. Follower count           — micro-influencers outperform mega on ROI
 *  3. Discount code uses       — direct conversion evidence
 *  4. Past brand collaborations— experience reduces campaign friction
 *  5. Platform                 — TikTok/YouTube highest ROI historically
 *  6. Campaign cost efficiency — lower cost with decent engagement = better ROI
 */

function scoreEngagement(rate) {
  // Engagement rate is the #1 predictor
  // <1% = weak, 1-3% = average, 3-6% = strong, >6% = exceptional
  if (rate >= 8)  return 1.00
  if (rate >= 6)  return 0.88
  if (rate >= 4)  return 0.74
  if (rate >= 2.5)return 0.60
  if (rate >= 1.5)return 0.44
  if (rate >= 0.8)return 0.28
  return 0.12
}

function scoreFollowers(count) {
  // Micro (10k-100k) and mid-tier (100k-500k) beat mega-influencers on ROI
  if (count >= 10000  && count < 50000)  return 0.82
  if (count >= 50000  && count < 150000) return 0.90
  if (count >= 150000 && count < 500000) return 0.78
  if (count >= 500000 && count < 1500000)return 0.55
  if (count >= 1500000)                  return 0.35
  return 0.40  // nano-influencer (<10k)
}

function scoreDiscountUses(uses) {
  // Discount code uses = direct attribution evidence
  if (uses >= 500)  return 0.95
  if (uses >= 200)  return 0.82
  if (uses >= 50)   return 0.65
  if (uses >= 10)   return 0.48
  if (uses >= 1)    return 0.35
  return 0.20
}

function scoreCollabs(collabs) {
  // 3-15 past collaborations is the sweet spot (experienced but not oversaturated)
  if (collabs >= 3  && collabs <= 15) return 0.80
  if (collabs >= 16 && collabs <= 30) return 0.65
  if (collabs >= 31)                  return 0.50
  if (collabs === 2)                  return 0.60
  if (collabs === 1)                  return 0.48
  return 0.30  // no prior experience
}

function scorePlatform(platform) {
  const scores = {
    TikTok:    0.85,
    YouTube:   0.80,
    Instagram: 0.70,
    Facebook:  0.50,
    Twitter:   0.45,
  }
  return scores[platform] ?? 0.55
}

function scoreCostEfficiency(cost, engagementRate, followers) {
  // Cost per engaged follower: lower is better
  const engagedFollowers = (followers * engagementRate) / 100
  if (engagedFollowers <= 0) return 0.30
  const cpe = cost / engagedFollowers  // cost per engaged follower
  if (cpe < 0.50)  return 0.92
  if (cpe < 1.00)  return 0.78
  if (cpe < 2.50)  return 0.60
  if (cpe < 5.00)  return 0.42
  if (cpe < 10.00) return 0.28
  return 0.15
}

function scoreNiche(niche) {
  const scores = {
    Finance:  0.82,
    Tech:     0.78,
    Fitness:  0.75,
    Beauty:   0.72,
    Gaming:   0.68,
    Fashion:  0.65,
    Food:     0.60,
    Travel:   0.55,
  }
  return scores[niche] ?? 0.60
}

export function computeROI(inputs) {
  const {
    Follower_Count = 0,
    Engagement_Rate_Pct = 0,
    Avg_Comments_Per_Post = 0,
    Past_Brand_Collaborations = 0,
    Campaign_Cost_USD = 1,
    Discount_Code_Uses = 0,
    Platform = "Instagram",
    Audience_Niche = "Fashion",
  } = inputs

  // Weighted signal scoring
  const weights = {
    engagement:   0.30,
    followers:    0.15,
    discountUses: 0.20,
    collabs:      0.10,
    platform:     0.12,
    costEff:      0.08,
    niche:        0.05,
  }

  const scores = {
    engagement:   scoreEngagement(Engagement_Rate_Pct),
    followers:    scoreFollowers(Follower_Count),
    discountUses: scoreDiscountUses(Discount_Code_Uses),
    collabs:      scoreCollabs(Past_Brand_Collaborations),
    platform:     scorePlatform(Platform),
    costEff:      scoreCostEfficiency(Campaign_Cost_USD, Engagement_Rate_Pct, Follower_Count),
    niche:        scoreNiche(Audience_Niche),
  }

  // Comment activity bonus: high comments signal real audience
  const commentBonus = Avg_Comments_Per_Post >= 100 ? 0.04 :
                       Avg_Comments_Per_Post >= 30  ? 0.02 :
                       Avg_Comments_Per_Post >= 5   ? 0.01 : 0

  let probability = Object.keys(weights).reduce(
    (sum, k) => sum + weights[k] * scores[k], 0
  ) + commentBonus

  // Clamp to [0.03, 0.97] — never be falsely certain
  probability = Math.max(0.03, Math.min(0.97, probability))

  const prediction = probability >= 0.50 ? 1 : 0
  const risk_level = probability >= 0.68 ? "LOW" :
                     probability >= 0.45 ? "MEDIUM" : "HIGH"

  return {
    prediction,
    probability: Math.round(probability * 1000) / 1000,
    risk_level,
    // Breakdown for transparency
    signal_breakdown: {
      "Engagement Rate":    Math.round(scores.engagement   * 100),
      "Audience Size":      Math.round(scores.followers    * 100),
      "Conversion Signal":  Math.round(scores.discountUses * 100),
      "Brand Experience":   Math.round(scores.collabs      * 100),
      "Platform Fit":       Math.round(scores.platform     * 100),
      "Cost Efficiency":    Math.round(scores.costEff      * 100),
      "Niche Fit":          Math.round(scores.niche        * 100),
    }
  }
}

export function useForecast() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // predict() is synchronous — pure JS, no network, no worker needed.
  // Uses the computeROI engine above. Always resolves instantly.
  function predict(inputs) {
    setLoading(true)
    setError(null)
    try {
      // Validate all numeric fields are actual numbers
      const validated = {}
      for (const [k, v] of Object.entries(inputs)) {
        if (typeof v === "number" && isNaN(v)) {
          throw new Error(`"${k}" is not a valid number`)
        }
        validated[k] = v
      }
      const res = computeROI(validated)
      setResult(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)  // ALWAYS clears loading — no infinite spinner
    }
  }

  return { predict, result, loading, error }
}