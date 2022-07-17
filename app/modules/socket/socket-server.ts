import type * as http from "node:http"
import { Server } from "socket.io"
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./socket-events"

export type SocketServer = Server<ClientToServerEvents, ServerToClientEvents>

export function createSocketServer(httpServer: http.Server): SocketServer {
  const server: SocketServer = new Server(httpServer)

  server.on("connection", (client) => {
    client.on("joinAskRoom", (twitchUsername) => {
      void client.join(`ask:${twitchUsername}`)
    })

    client.on("initStreamer", (twitchUsername) => {
      void client.join(`streamer:ask:${twitchUsername}`)
    })

    // it's very weird that socket.io doesn't remove clients from rooms on disconnect,
    // but we'll deal
    client.on("disconnect", () => {
      for (const room of client.rooms) {
        void client.leave(room)
      }
    })
  })

  const handlePresence = async (roomId: string) => {
    if (roomId.startsWith("ask:")) {
      const room = server.in(roomId)
      const sockets = await room.allSockets()
      room.emit("memberCountChanged", sockets.size)
      server.in(`streamer:${roomId}`).emit("memberCountChanged", sockets.size)
    }
  }

  const { adapter } = server.of("/")
  adapter.on("join-room", handlePresence).on("leave-room", handlePresence)

  return server
}
