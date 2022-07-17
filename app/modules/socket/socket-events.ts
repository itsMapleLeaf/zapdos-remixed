import type { ClientQuestion } from "../questions/client-questions.server"

// https://socket.io/docs/v4/typescript

export type ServerToClientEvents = {
  questionAdded: (question: ClientQuestion) => void
}

export type ClientToServerEvents = {}
