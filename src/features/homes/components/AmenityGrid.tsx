import { amenityIcon } from '../utils/amenityIcon'

export function AmenityGrid({ amenities }: { amenities: string[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {amenities.map((amenity) => {
        const Icon = amenityIcon(amenity)
        return (
          <li
            key={amenity}
            className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
          >
            <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="min-w-0 truncate">{amenity}</span>
          </li>
        )
      })}
    </ul>
  )
}
