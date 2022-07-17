import type * as http from "node:http"
import { Server } from "socket.io"
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./socket-events"

export type SocketServer = Server<ClientToServerEvents, ServerToClientEvents>

export function createSocketServer(server: http.Server): SocketServer {
  return new Server(server)
}
