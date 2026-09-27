import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
const assetManifest = JSON.parse(manifestJSON);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: CORS });
    }

    if (url.pathname === '/api' && request.method === 'POST') {
      try {
        const inputs = await request.json();
        const required = (env.INPUT_FIELDS ?? '').split(',').filter(Boolean);
        for (const field of required) {
          if (inputs[field] === undefined || inputs[field] === null) {
            return new Response(
              JSON.stringify({ error: `Missing field: ${field}` }),
              { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
            );
          }
        }

        const lookup = JSON.parse(env.FORECAST_LOOKUP ?? '[]');
        const result = findNearest(lookup, inputs);
        return new Response(JSON.stringify(result), { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Invalid forecast request', details: err.message }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
      }
    }

    try {
      return await getAssetFromKV({
        request,
        waitUntil: ctx.waitUntil.bind(ctx),
        ASSET_MANIFEST: assetManifest,
      });
    } catch (err) {
      return new Response('Not found', { status: 404 });
    }
  }
};

function toNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function findNearest(lookup, inputs) {
  let best = null;
  let bestScore = Infinity;

  for (const item of lookup) {
    const score = scoreCandidate(item, inputs);
    if (score < bestScore) {
      bestScore = score;
      best = item;
    }
  }

  if (!best) {
    return { prediction: 0, probability: 0.5, score: 0, reason: 'No training data available' };
  }

  const normalized = Math.max(0.05, Math.min(0.95, 1 - (bestScore / 1000)));
  return {
    prediction: best.label ?? 1,
    probability: normalized,
    score: bestScore,
    matched_profile: best
  };
}

function scoreCandidate(candidate, inputs) {
  let score = 0;
  for (const [key, value] of Object.entries(inputs)) {
    const candidateValue = toNum(candidate[key]);
    const inputValue = toNum(value);
    score += Math.abs(candidateValue - inputValue);
  }
  return score;
}