/* eslint-disable unicorn/filename-case */
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { db } from "~/db.server"

export async function loader({ params }: LoaderArgs) {
  const count = await db.streamer.count({
    where: {
      twitchUsername: params.twitchUsername,
    },
  })
  return json({ streamerExists: count > 0 })
}

export async function action({ params, request }: ActionArgs) {
  const streamer = await db.streamer.findUnique({
    where: {
      twitchUsername: params.twitchUsername,
    },
  })
  if (!streamer) {
    throw new Response(undefined, {
      status: 404,
      statusText: "Couldn't find that streamer",
    })
  }

  const data = Object.fromEntries(await request.formData())
  if (typeof data.text !== "string") {
    throw new Response(undefined, {
      status: 400,
      statusText: "Missing or invalid question text",
    })
  }

  await db.question.create({
    data: {
      streamerId: streamer.id,
      text: data.text,
    },
  })

  return new Response(undefined, { status: 200 })
}

export default function AskPage() {
  const { streamerExists } = useLoaderData<typeof loader>()
  return (
    <main>
      {streamerExists ? (
        <Form method="post" reloadDocument>
          <textarea
            name="text"
            rows={5}
            placeholder="Ask a question. Be nice!"
          />
          <button type="submit">Send</button>
        </Form>
      ) : (
        <>
          <p>Streamer does not exist</p>
          <p>
            <a href="/">Go back</a>
          </p>
        </>
      )}
    </main>
  )
}
