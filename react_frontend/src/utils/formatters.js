export function formatValue(value, format, currency = "$") {
  if (value === null || value === undefined) return "—"
  switch (format) {
    case "currency": return `${currency}${Number(value).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`
    case "percent":  return `${Number(value).toFixed(1)}%`
    case "float":    return Number(value).toFixed(3)
    case "number":
    default:         return Number(value).toLocaleString()
  }
}

export function formatROI(ratio) {
  if (ratio === null || ratio === undefined) return "—"
  return `${Number(ratio).toFixed(2)}x`
}

export function formatUSD(value) {
  if (value === null || value === undefined) return "—"
  return `$${Number(value).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0})}`
}

export function roiClass(ratio) {
  if (ratio >= 3.0) return "high-roi"
  if (ratio >= 1.5) return "medium-roi"
  return "low-roi"
}