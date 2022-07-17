import type { DataFunctionArgs } from "@remix-run/node"
import type { SocketServer } from "../socket/socket-server"

export type LoadContext = {
  socketServer: SocketServer
}

export type CustomDataFunctionArgs = Omit<DataFunctionArgs, "context"> & {
  context: LoadContext
}
