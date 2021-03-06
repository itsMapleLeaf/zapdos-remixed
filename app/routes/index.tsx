import {
  CheckCircleIcon,
  ClipboardCopyIcon,
  HeartIcon,
  LogoutIcon,
} from "@heroicons/react/solid"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { formatDistance, parseISO } from "date-fns"
import { useEffect, useState } from "react"
import { authenticator } from "~/modules/core/auth.server"
import type { ClientQuestion } from "~/modules/questions/client-questions.server"
import { loadClientQuestions } from "~/modules/questions/client-questions.server"
import { useTimer } from "~/modules/react/use-timer"
import { getSocketClient, useSocketEvent } from "~/modules/socket/socket-client"
import {
  buttonClass,
  buttonIconClass,
  containerClass,
} from "~/modules/ui/styles"

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
      <div className="flex h-full flex-col">
        <main className="mx-auto flex h-full max-w-screen-sm flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
          <h1 className="text-5xl font-light">zapdos</h1>
          <p className="text-xl">
            Zapdos is a tool for streamers to accept and display anonymous
            questions. Live.
          </p>
          <Form method="post" action="/auth/twitch/login">
            <button type="submit" className={buttonClass}>
              <svg viewBox="0 0 24 24" className={buttonIconClass}>
                <path
                  fill="currentColor"
                  d="M11.64 5.93H13.07V10.21H11.64M15.57 5.93H17V10.21H15.57M7 2L3.43 5.57V18.43H7.71V22L11.29 18.43H14.14L20.57 12V2M19.14 11.29L16.29 14.14H13.43L10.93 16.64V14.14H7.71V3.43H19.14Z"
                />
              </svg>
              Sign in with Twitch
            </button>
          </Form>
        </main>
        <Footer />
      </div>
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
          <div>
            <p className="text-xl font-light leading-tight">
              hi, {data.streamer.twitchDisplayName}!
            </p>
            <ViewerCount twitchUsername={data.streamer.twitchUsername} />
          </div>
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
      <Footer />
    </>
  )
}

function Footer() {
  return (
    <footer className={containerClass}>
      <div className="py-4 text-center opacity-70">
        original app by Theo <div className="mx-1 inline-block">&bull;</div>{" "}
        recreated with{" "}
        <HeartIcon
          className="inline-block w-5 align-text-top"
          aria-label="love"
        />{" "}
        by MapleLeaf <div className="mx-1 inline-block">&bull;</div>{" "}
        <a
          href="https://github.com/itsMapleLeaf/zapdos-remixed"
          target="_blank"
          rel="noreferrer"
          className="underline transition hover:text-base-300 hover:no-underline"
        >
          source
        </a>
      </div>
    </footer>
  )
}

function ViewerCount(props: { twitchUsername: string }) {
  useEffect(() => {
    getSocketClient().emit("initStreamer", props.twitchUsername)
  }, [props.twitchUsername])

  const [memberCount, setMemberCount] = useState(0)
  useSocketEvent("memberCountChanged", (count) => {
    setMemberCount(count)
  })

  return memberCount > 1 ? (
    <p className="text-sm">there are {memberCount} viewers online!</p>
  ) : (
    <></>
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
