import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { useState } from "react"
import { authenticator } from "~/auth.server"
import { db } from "~/db.server"
import { useEventStream } from "~/helpers/event-stream"
import type { questionLoader } from "./streamer.$streamerId/questions"

export async function loader({ request }: LoaderArgs) {
  const origin = new URL(request.url).origin

  const streamer = await authenticator.isAuthenticated(request)
  if (!streamer) {
    return json({
      streamer: undefined,
      questions: undefined,
      origin,
    })
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
    origin,
  })
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

  if (!("streamer" in data)) {
    return (
      <header>
        <h1>zapdos remixed</h1>
        <Form method="post" action="/auth/twitch/login">
          <button type="submit">Sign in with Twitch</button>
        </Form>
      </header>
    )
  }

  return (
    <>
      <header>
        <h1>zapdos remixed</h1>
        <p>hi there, {data.streamer.displayName}!</p>
        <nav>
          <CopyButton
            text={`${data.origin}/streamer/${data.streamer.id}/ask`}
            label="Copy ask URL"
          />
          <Form method="post" action="/auth/logout">
            <button type="submit">Sign out</button>
          </Form>
        </nav>
      </header>
      <main>
        <LiveQuestionList
          initialQuestions={data.questions}
          streamerId={data.streamer.id}
        />
      </main>
    </>
  )
}

function CopyButton(props: { text: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(props.text).catch((error) => {
          alert("Copy to clipboard failed")
          console.error(error)
        })
      }}
    >
      {props.label}
    </button>
  )
}

function LiveQuestionList(props: {
  streamerId: string
  initialQuestions: Array<{ id: string; text: string }>
}) {
  const [questions, setQuestions] = useState(props.initialQuestions)

  useEventStream<typeof questionLoader>(
    `/streamer/${props.streamerId}/questions`,
    (message) => {
      if (message.eventType === "INSERT") {
        setQuestions((questions) => [...questions, message.new])
      }
    },
  )

  return (
    <ul>
      {questions.map((question) => (
        <li key={question.id}>
          <p>{question.text}</p>
        </li>
      ))}
    </ul>
  )
}
