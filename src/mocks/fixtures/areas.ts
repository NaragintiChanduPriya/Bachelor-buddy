import type { Area, TechPark } from '@/types/meta'

/** Real Bangalore geography so distances between areas come out plausible. */
export const areas: Area[] = [
  { id: 'area_hsr', name: 'HSR Layout', lat: 12.9121, lng: 77.6446, popular: true },
  { id: 'area_koramangala', name: 'Koramangala', lat: 12.9352, lng: 77.6245, popular: true },
  { id: 'area_btm', name: 'BTM Layout', lat: 12.9166, lng: 77.6101, popular: true },
  { id: 'area_bellandur', name: 'Bellandur', lat: 12.9304, lng: 77.6784, popular: true },
  { id: 'area_marathahalli', name: 'Marathahalli', lat: 12.9591, lng: 77.6974, popular: true },
  { id: 'area_whitefield', name: 'Whitefield', lat: 12.9698, lng: 77.7499, popular: true },
  { id: 'area_ecity', name: 'Electronic City', lat: 12.8452, lng: 77.6602, popular: true },
  { id: 'area_indiranagar', name: 'Indiranagar', lat: 12.9784, lng: 77.6408, popular: true },
  { id: 'area_jayanagar', name: 'Jayanagar', lat: 12.9299, lng: 77.5826, popular: false },
  { id: 'area_kadubeesanahalli', name: 'Kadubeesanahalli', lat: 12.9421, lng: 77.6975, popular: false },
  { id: 'area_sarjapur', name: 'Sarjapur Road', lat: 12.9009, lng: 77.6874, popular: true },
]

/** Invented tech park names in the real office corridors. */
export const techParks: TechPark[] = [
  {
    id: 'park_orbit',
    name: 'Orbit Tech Campus',
    areaId: 'area_bellandur',
    areaName: 'Bellandur',
    lat: 12.9256,
    lng: 77.6815,
  },
  {
    id: 'park_meridian',
    name: 'Meridian Business Hub',
    areaId: 'area_kadubeesanahalli',
    areaName: 'Kadubeesanahalli',
    lat: 12.9436,
    lng: 77.6964,
  },
  {
    id: 'park_lumina',
    name: 'Lumina IT Park',
    areaId: 'area_whitefield',
    areaName: 'Whitefield',
    lat: 12.9759,
    lng: 77.7363,
  },
  {
    id: 'park_southgate',
    name: 'Southgate Tech Zone',
    areaId: 'area_ecity',
    areaName: 'Electronic City',
    lat: 12.8399,
    lng: 77.6639,
  },
  {
    id: 'park_crestline',
    name: 'Crestline Corporate Park',
    areaId: 'area_marathahalli',
    areaName: 'Marathahalli',
    lat: 12.9552,
    lng: 77.7012,
  },
]

export function findArea(id: string): Area | undefined {
  return areas.find((a) => a.id === id)
}

export function findAreaByName(name: string): Area | undefined {
  const needle = name.trim().toLowerCase()
  return areas.find((a) => a.name.toLowerCase() === needle)
}

export function findTechPark(id: string): TechPark | undefined {
  return techParks.find((p) => p.id === id)
}
