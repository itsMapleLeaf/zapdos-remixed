import { useEffect } from "react"
import type { Socket } from "socket.io-client"
import { io } from "socket.io-client"
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./socket-events"

type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>

let client: SocketClient
export function getSocketClient(): SocketClient {
  return (client ??= io())
}

export function useSocketEvent<EventName extends keyof ServerToClientEvents>(
  eventName: EventName,
  callback: ServerToClientEvents[EventName],
) {
  useEffect(() => {
    const socket = getSocketClient()
    socket.on(eventName, callback as never)
    return () => {
      socket.off(eventName)
    }
  })
}
