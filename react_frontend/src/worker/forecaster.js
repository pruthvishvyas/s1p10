import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import manifestJSON from '__STATIC_CONTENT_MANIFEST'
const assetManifest = JSON.parse(manifestJSON)

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function jsonResp(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

function findNearest(lookup, inputs) {
  if (!lookup || !lookup.length) return { prediction: 0, probability: 0.5, risk_level: "MEDIUM" }
  let best = lookup[0], bestDist = Infinity
  for (const row of lookup) {
    let dist = 0
    for (const [k, v] of Object.entries(inputs)) {
      if (typeof v === "number" && typeof row[k] === "number") dist += Math.pow(v - row[k], 2)
      else if (v !== row[k]) dist += 100
    }
    if (dist < bestDist) { bestDist = dist; best = row }
  }
  return { prediction: best.prediction ?? 0, probability: best.probability ?? 0.5, risk_level: best.risk_level ?? "MEDIUM" }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (request.method === "OPTIONS") return new Response(null, { status: 200, headers: CORS })

    if (url.pathname === "/api" && request.method === "POST") {
      try {
        const inputs   = await request.json()
        const required = (env.INPUT_FIELDS ?? "").split(",").filter(Boolean)
        for (const field of required) {
          if (inputs[field] === undefined || inputs[field] === null)
            return jsonResp({ error: `Missing field: ${field}` }, 400)
        }
        const lookup = JSON.parse(env.FORECAST_LOOKUP ?? "[]")
        return jsonResp(findNearest(lookup, inputs))
      } catch (e) {
        return jsonResp({ error: "Worker error", detail: e.message }, 500)
      }
    }

    try {
      return await getAssetFromKV(
        { request, waitUntil: ctx.waitUntil.bind(ctx) },
        { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest }
      )
    } catch (e) {
      try {
        const indexReq = new Request(new URL("/index.html", url.origin).href, request)
        return await getAssetFromKV(
          { request: indexReq, waitUntil: ctx.waitUntil.bind(ctx) },
          { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest }
        )
      } catch (e2) {
        return new Response("Not Found", { status: 404, headers: CORS })
      }
    }
  }
}