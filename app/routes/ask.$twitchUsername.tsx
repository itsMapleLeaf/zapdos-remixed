/* eslint-disable unicorn/filename-case */
import { ChatIcon } from "@heroicons/react/solid"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { ShouldReloadFunction } from "@remix-run/react"
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react"
import { useEffect, useRef, useState } from "react"
import { z } from "zod"
import { db } from "~/modules/core/db.server"
import type { CustomDataFunctionArgs } from "~/modules/core/load-context"
import { createClientQuestion } from "~/modules/questions/client-questions.server"
import { getSocketClient, useSocketEvent } from "~/modules/socket/socket-client"
import {
  buttonClass,
  buttonIconClass,
  containerClass,
} from "~/modules/ui/styles"

export async function loader({ params }: LoaderArgs) {
  const streamer = await db.streamer.findUnique({
    where: {
      twitchUsername: params.twitchUsername,
    },
    select: {
      id: true,
      twitchUsername: true,
      twitchAvatar: true,
      twitchDisplayName: true,
    },
  })
  return json({ streamer })
}

export const unstable_shouldReload: ShouldReloadFunction = () => false

export async function action({ request, context }: CustomDataFunctionArgs) {
  const bodySchema = z.object({
    text: z
      .string()
      .min(1, "question text is required")
      .max(1024, "no more than 1024 characters!"),
    streamerId: z.string(),
  })

  const result = bodySchema.safeParse(
    Object.fromEntries(await request.formData()),
  )
  if (!result.success) {
    return json(
      { errors: result.error.formErrors },
      {
        status: 400,
        statusText: "Invalid body",
      },
    )
  }

  const question = await db.question.create({
    data: result.data,
  })

  context.socketServer.emit("questionAdded", createClientQuestion(question))

  // eslint-disable-next-line unicorn/no-null
  return json({ errors: null }, { status: 200 })
}

export default function AskPage() {
  const { streamer } = useLoaderData<typeof loader>()
  const submitResult = useActionData<typeof action>()

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const transition = useTransition()
  useEffect(() => {
    if (transition.state === "idle" && inputRef.current) {
      inputRef.current.focus()
      if (!submitResult?.errors) {
        inputRef.current.value = ""
      }
    }
  }, [submitResult?.errors, transition.state])

  const username = streamer?.twitchUsername
  useEffect(() => {
    if (!username) return
    getSocketClient().emit("joinAskRoom", username)
  }, [username])

  const [memberCount, setMemberCount] = useState(0)
  useSocketEvent("memberCountChanged", (count) => {
    setMemberCount(count)
  })

  if (!streamer) {
    return (
      <main>
        <p>Streamer does not exist</p>
        <p>
          <a href="/">Go back</a>
        </p>
      </main>
    )
  }

  return (
    <div>
      <header className="bg-base-800 py-6">
        <div className={containerClass}>
          <div className="flex flex-row flex-wrap items-center justify-center gap-4">
            <img
              src={streamer.twitchAvatar}
              alt=""
              className="aspect-square w-16 rounded-full"
            />
            <div>
              <h1 className="text-center text-3xl font-light">
                ask {streamer.twitchDisplayName} a question!
              </h1>
              {memberCount > 1 && (
                <p>there are {memberCount - 1} other viewers connected!</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={containerClass}>
        <div className="py-8">
          <Form method="post" className="flex flex-col gap-6">
            <input type="hidden" name="streamerId" value={streamer.id} />

            {submitResult?.errors?.formErrors.map((message) => (
              <p key={message} className="text-red-500">
                {message}
              </p>
            ))}

            <div>
              <textarea
                name="text"
                rows={5}
                className="w-full rounded-md bg-black/25 p-4 text-inherit ring-2 ring-transparent transition focus:outline-none focus-visible:ring-base-500"
                // required
                // maxLength={1024}
                ref={inputRef}
              />
              {submitResult?.errors?.fieldErrors.text && (
                <p>{submitResult.errors.fieldErrors.text}</p>
              )}
            </div>

            <div className="self-center">
              <button
                type="submit"
                className={buttonClass}
                disabled={transition.state !== "idle"}
              >
                <ChatIcon className={buttonIconClass} />
                Send
              </button>
            </div>
          </Form>
        </div>
      </main>
    </div>
  )
}
