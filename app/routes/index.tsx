import {
  CheckCircleIcon,
  ClipboardCopyIcon,
  LogoutIcon,
} from "@heroicons/react/solid"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { formatDistance, parseISO } from "date-fns"
import { useState } from "react"
import { authenticator } from "~/modules/core/auth.server"
import type { ClientQuestion } from "~/modules/questions/client-questions.server"
import { loadClientQuestions } from "~/modules/questions/client-questions.server"
import { useTimer } from "~/modules/react/use-timer"
import { useSocketEvent } from "~/modules/socket/socket-client"
import { buttonClass, buttonIconClass } from "~/modules/ui/styles"

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

  return json({
    streamer,
    questions: await loadClientQuestions(streamer.id),
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
      <nav className="bg-base-800 shadow-md">
        <div className="mx-auto flex max-w-screen-lg flex-row flex-wrap items-center gap-4 p-4">
          <img
            className="aspect-square w-12 rounded-full"
            src={data.streamer.twitchAvatar}
            alt=""
          />
          <p className="text-xl font-light">
            hi, {data.streamer.twitchDisplayName}!
          </p>
          <div className="flex-1" />
          <div className="flex flex-wrap items-center justify-center gap-4">
            <CopyButton
              text={`${data.origin}/ask/${data.streamer.twitchUsername}`}
              label="Copy ask URL"
            />
            <Form method="post" action="/auth/logout">
              <button type="submit" className={buttonClass}>
                <LogoutIcon className={buttonIconClass} />
                Sign out
              </button>
            </Form>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-screen-lg py-8 px-4">
        <LiveQuestionList initialQuestions={data.questions} />
      </main>
    </>
  )
}

function CopyButton(props: { text: string; label: string }) {
  const timer = useTimer(2000)
  return (
    <button
      className={buttonClass}
      type="button"
      onClick={() => {
        timer.start()
        navigator.clipboard.writeText(props.text).catch((error) => {
          alert("Copy to clipboard failed")
          console.error(error)
        })
      }}
    >
      {timer.running ? (
        <CheckCircleIcon className={buttonIconClass} />
      ) : (
        <ClipboardCopyIcon className={buttonIconClass} />
      )}
      {timer.running ? "Copied!" : props.label}
    </button>
  )
}

function LiveQuestionList(props: { initialQuestions: ClientQuestion[] }) {
  const [questions, setQuestions] = useState(props.initialQuestions)

  useSocketEvent("questionAdded", (question) => {
    setQuestions((questions) => [question, ...questions])
  })

  return (
    <div className=" grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
      {questions.map((question) => (
        <div
          key={question.id}
          className="flex flex-col rounded-md bg-base-800 shadow-md"
        >
          <div className="bg-black/25 p-3 text-sm leading-none">
            <p className="opacity-75">
              {formatDistance(parseISO(question.createdAt), new Date(), {
                addSuffix: true,
              })}
            </p>
          </div>
          <p className="whitespace-pre-line p-3">{question.text}</p>
        </div>
      ))}
    </div>
  )
}
