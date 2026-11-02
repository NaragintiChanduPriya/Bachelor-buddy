import { Bike, Building2, Bus } from 'lucide-react'
import type { CommuteInfo } from '@/types/home'
import { Badge } from '@/components/ui/badge'
import { formatDistance } from '@/utils/distance'
import { cn } from '@/utils/cn'

export interface CommuteTableProps {
  homeName: string
  commutes: CommuteInfo[]
  /** The user's own tech park, highlighted and labelled. */
  userTechParkId: string | null
}

/** A table from the small breakpoint up; stacked rows on phones. */
export function CommuteTable({ homeName, commutes, userTechParkId }: CommuteTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border sm:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Commute from {homeName} to each tech park</caption>
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-2.5 text-left font-medium">
                Tech park
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                Distance
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                By bike
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                By bus
              </th>
            </tr>
          </thead>
          <tbody>
            {commutes.map((commute) => {
              const mine = commute.techParkId === userTechParkId
              return (
                <tr
                  key={commute.techParkId}
                  className={cn('border-t border-border', mine && 'bg-primary/5')}
                >
                  <th scope="row" className="px-4 py-3 text-left font-normal">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={cn('font-medium', mine && 'text-primary')}>
                        {commute.techParkName}
                      </span>
                      {mine ? <Badge>Your office</Badge> : null}
                    </span>
                    <span className="text-xs text-muted-foreground">{commute.techParkAreaName}</span>
                  </th>
                  <td className="px-4 py-3 text-right tabular">{formatDistance(commute.distanceKm)}</td>
                  <td className="px-4 py-3 text-right tabular">{commute.bikeMinutes} min</td>
                  <td className="px-4 py-3 text-right tabular">{commute.busMinutes} min</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-2 sm:hidden" aria-label={`Commute from ${homeName} to each tech park`}>
        {commutes.map((commute) => {
          const mine = commute.techParkId === userTechParkId
          return (
            <li
              key={commute.techParkId}
              className={cn(
                'space-y-2 rounded-lg border p-3',
                mine ? 'border-primary/40 bg-primary/5' : 'border-border',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={cn('flex items-center gap-1.5 font-medium', mine && 'text-primary')}>
                    <Building2 className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{commute.techParkName}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{commute.techParkAreaName}</p>
                </div>
                {mine ? <Badge>Your office</Badge> : null}
              </div>
              <dl className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Distance</dt>
                  <dd className="font-medium tabular">{formatDistance(commute.distanceKm)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-muted-foreground">
                    <Bike className="size-3" aria-hidden="true" />
                    Bike
                  </dt>
                  <dd className="font-medium tabular">{commute.bikeMinutes} min</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-muted-foreground">
                    <Bus className="size-3" aria-hidden="true" />
                    Bus
                  </dt>
                  <dd className="font-medium tabular">{commute.busMinutes} min</dd>
                </div>
              </dl>
            </li>
          )
        })}
      </ul>
    </>
  )
}
