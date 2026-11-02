/** Straight-line distance in km, rounded to one decimal. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

/** Bangalore traffic is slow; these keep commute numbers believable. */
export function bikeMinutes(km: number): number {
  return Math.max(5, Math.round(km * 3.2))
}

export function busMinutes(km: number): number {
  return Math.max(10, Math.round(km * 5.5))
}

export function walkMinutes(km: number): number {
  return Math.max(2, Math.round(km * 13))
}
