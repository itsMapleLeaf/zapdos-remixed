import type { DataFunctionArgs, TypedResponse } from "@remix-run/server-runtime"
import { useEffect, useRef } from "react"

export type EventStreamCleanup = () => void

export type TypedEventStream<T> = { __streamType: T }

export type EventStreamFunction<T> = (
  args: DataFunctionArgs,
) => MaybePromise<TypedResponse<TypedEventStream<T>>>

export type EventStreamFunctionData<Fn> = Fn extends EventStreamFunction<
  infer Data
>
  ? Data
  : never

type MaybePromise<T> = T | PromiseLike<T>

export function eventStream<T>(
  request: Request,
  init: (send: (data: T) => void) => EventStreamCleanup | undefined | void,
) {
  const stream = new ReadableStream({
    start(controller) {
      if (request.signal.aborted) {
        controller.close()
        return
      }

      const encoder = new TextEncoder()

      const send = (data: T) => {
        controller.enqueue(encoder.encode(`event: data\n`))
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const cleanup = init(send)

      request.signal.addEventListener("abort", () => {
        cleanup?.()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  }) as TypedResponse<TypedEventStream<T>>
}

export function useEventStream<Fn extends EventStreamFunction<unknown>>(
  url: string,
  callback: (data: EventStreamFunctionData<Fn>) => void,
) {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    const source = new EventSource(url)

    source.addEventListener("data", (event) => {
      callbackRef.current(JSON.parse(event.data))
    })

    return () => {
      source.close()
    }
  }, [url])
}
