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
      id: streamer.id,
      displayName: streamer.displayName,
    },
    questions: questions.map((question) => ({
      id: question.id,
      text: question.text,
    })),
  })
}

export default function Index() {
  const data = useLoaderData<typeof loader>()
  return "streamer" in data ? (
    <>
      <header>
        <h1>zapdos remixed</h1>
        <p>hi there, {data.streamer.displayName}!</p>
        <nav>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard
                .writeText(`${location.origin}/${data.streamer.id}/ask`)
                .catch((error) => {
                  alert("Copy to clipboard failed")
                  console.error(error)
                })
            }}
          >
            Copy ask link
          </button>

          <Form method="post" action="/auth/logout">
            <button type="submit">Sign out</button>
          </Form>
        </nav>
      </header>
      <main>
        <ul>
          {data.questions.map((question) => (
            <li key={question.id}>
              <p>{question.text}</p>
            </li>
          ))}
        </ul>
      </main>
    </>
  ) : (
    <header>
      <h1>zapdos remixed</h1>
      <Form method="post" action="/auth/twitch/login">
        <button type="submit">Sign in with Twitch</button>
      </Form>
    </header>
  )
}
