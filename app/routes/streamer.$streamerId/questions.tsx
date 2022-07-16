import type { Question } from "@prisma/client"
import type { LoaderArgs } from "@remix-run/node"
import type { SupabaseRealtimePayload } from "@supabase/supabase-js"
import { createClient } from "@supabase/supabase-js"
import { db } from "~/db.server"
import { env } from "~/env.server"
import { eventStream } from "~/helpers/event-stream"

type QuestionEvent = {
  eventType: SupabaseRealtimePayload<Question>["eventType"]
  old: Question
  new: Question
}

export async function loader({ request, params }: LoaderArgs) {
  const streamer = await db.streamer.findUnique({
    where: { id: params.streamerId },
  })
  if (!streamer) {
    throw new Response(undefined, {
      status: 404,
      statusText: "Couldn't find that streamer",
    })
  }

  return eventStream<QuestionEvent>(request, (send) => {
    const subscription = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
      .from<Question>(`Question:streamerId=eq.${streamer.id}`)
      .on("*", (event) => {
        send({
          eventType: event.eventType,
          old: event.old,
          new: event.new,
        })
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
