export interface Area {
  id: string
  name: string
  lat: number
  lng: number
  popular: boolean
}

export interface TechPark {
  id: string
  name: string
  areaId: string
  areaName: string
  lat: number
  lng: number
}

export interface AreasResponse {
  areas: Area[]
  techParks: TechPark[]
}
