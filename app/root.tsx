import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react"
import type {
  CatchBoundaryComponent,
  ErrorBoundaryComponent,
} from "@remix-run/server-runtime/dist/routeModules"

import tailwindStylesheetUrl from "./styles/tailwind.css"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }]
}

export const meta: MetaFunction = () => ({
  // eslint-disable-next-line unicorn/text-encoding-identifier-case
  charset: "utf-8",
  title: "zapdos (remixed)",
  viewport: "width=device-width,initial-scale=1",
})

export async function loader({ request }: LoaderArgs) {
  return json({})
}

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}

export const ErrorBoundary: ErrorBoundaryComponent = (props) => {
  if (typeof window === "undefined") {
    console.error(props.error)
  }

  return (
    <Document>
      <h1>oops! something went wrong</h1>
      <p>
        <a href="/">back to safety</a>
      </p>
    </Document>
  )
}

export const CatchBoundary: CatchBoundaryComponent = () => {
  const response = useCatch()

  if (typeof window === "undefined") {
    console.error(
      response.status,
      response.statusText,
      response.data?.message || response.data,
    )
  }

  return (
    <Document>
      <h1>oops! something went wrong</h1>
      <p>
        <a href="/">back to safety</a>
      </p>
    </Document>
  )
}
