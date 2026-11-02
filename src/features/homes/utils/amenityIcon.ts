import {
  AirVent,
  Armchair,
  ArrowUpDown,
  Bath,
  Cctv,
  CheckCircle2,
  CookingPot,
  Droplets,
  Dumbbell,
  Fan,
  Gamepad2,
  Laptop,
  Refrigerator,
  ShowerHead,
  Sofa,
  Sparkles,
  SquareParking,
  WashingMachine,
  Waves,
  Wifi,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** First match wins, so the more specific patterns come first. */
const rules: Array<[RegExp, LucideIcon]> = [
  [/wi-?fi/i, Wifi],
  [/housekeeping/i, Sparkles],
  [/laundry|washing/i, WashingMachine],
  [/power/i, Zap],
  [/hot water/i, ShowerHead],
  [/ro water|water/i, Droplets],
  [/cooler/i, Fan],
  [/^ac$|air con/i, AirVent],
  [/gym/i, Dumbbell],
  [/cctv/i, Cctv],
  [/parking/i, SquareParking],
  [/pool/i, Waves],
  [/gaming/i, Gamepad2],
  [/kitchen/i, CookingPot],
  [/refrigerator|fridge/i, Refrigerator],
  [/lift/i, ArrowUpDown],
  [/bathroom/i, Bath],
  [/furnished/i, Armchair],
  [/study|desk|co-working/i, Laptop],
  [/lounge|rooftop|balcony/i, Sofa],
]

export function amenityIcon(amenity: string): LucideIcon {
  return rules.find(([pattern]) => pattern.test(amenity))?.[1] ?? CheckCircle2
}
