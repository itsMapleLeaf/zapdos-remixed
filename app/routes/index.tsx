import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { authenticator } from "~/auth.server"

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request)
  // eslint-disable-next-line unicorn/no-null
  return json({ user: user ? { name: user.displayName } : null })
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>()
  return (
    <main>
      <header>
        <h1>zapdos remixed</h1>
        {user ? (
          <>
            <p>hi there, {user.name}!</p>
            <Form method="post" action="/auth/logout">
              <button type="submit">Sign out</button>
            </Form>
          </>
        ) : (
          <Form method="post" action="/auth/twitch/login">
            <button type="submit">Sign in with Twitch</button>
          </Form>
        )}
      </header>
    </main>
  )
}
