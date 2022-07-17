import type { Question } from "@prisma/client"
import type { LoaderArgs } from "@remix-run/node"
import { createClient } from "@supabase/supabase-js"
import { authenticator } from "~/auth.server"
import { env } from "~/env.server"
import { eventStream } from "~/helpers/event-stream"
import type { ClientQuestion } from "~/modules/questions/client-questions.server"
import { createClientQuestion } from "~/modules/questions/client-questions.server"

type QuestionEvent =
  | { eventType: "INSERT"; new: ClientQuestion }
  | { eventType: "UPDATE"; old: ClientQuestion; new: ClientQuestion }
  | { eventType: "DELETE"; old: ClientQuestion }

export async function loader({ request }: LoaderArgs) {
  const streamer = await authenticator.isAuthenticated(request)
  if (!streamer) {
    throw new Response(undefined, {
      status: 401,
      statusText: "Not logged in",
    })
  }

  return eventStream<QuestionEvent>(request, (send) => {
    const subscription = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
      .from<Question>(`Question:streamerId=eq.${streamer.id}`)
      .on("*", (event) => {
        if (event.eventType === "INSERT") {
          send({
            eventType: event.eventType,
            new: createClientQuestion(event.new),
          })
        }
        if (event.eventType === "UPDATE") {
          send({
            eventType: event.eventType,
            old: createClientQuestion(event.old),
            new: createClientQuestion(event.new),
          })
        }
        if (event.eventType === "DELETE") {
          send({
            eventType: event.eventType,
            old: createClientQuestion(event.old),
          })
        }
      })
      .subscribe()

    subscription.onError((error: unknown) => {
      console.error("subscription error", error)
    })

    return () => {
      subscription.unsubscribe()
    }
  })
}

export type { loader as questionLoader }
