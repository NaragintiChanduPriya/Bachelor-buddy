import { Helmet } from 'react-helmet-async'

/** Per-route page title and description. */
export function SeoTitle({ title, description }: { title: string; description?: string }) {
  return (
    <Helmet>
      <title>{title} · BachelorBuddy</title>
      {description ? <meta name="description" content={description} /> : null}
    </Helmet>
  )
}
