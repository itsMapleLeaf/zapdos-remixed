import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { authenticator } from "~/auth.server"
import { db } from "~/db.server"

export async function loader({ request }: LoaderArgs) {
  const streamer = await authenticator.isAuthenticated(request)
  if (!streamer) {
    return json({ streamer: undefined, questions: undefined })
  }

  const questions = await db.question.findMany({
    where: {
      streamerId: streamer.id,
    },
  })

  return json({
    streamer: {
      name: streamer.displayName,
    },
    questions: questions.map((question) => ({
      id: question.id,
      text: question.text,
    })),
  })
}

export default function Index() {
  const data = useLoaderData<typeof loader>()
  return (
    <main>
      <header>
        <h1>zapdos remixed</h1>
        {"streamer" in data ? (
          <>
            <p>hi there, {data.streamer.name}!</p>
            <Form method="post" action="/auth/logout">
              <button type="submit">Sign out</button>
            </Form>
            <ul>
              {data.questions.map((question) => (
                <li key={question.id}>
                  <p>{question.text}</p>
                </li>
              ))}
            </ul>
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
