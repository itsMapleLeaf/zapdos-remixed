import type { ClientQuestion } from "../questions/client-questions.server"

// https://socket.io/docs/v4/typescript

export type ServerToClientEvents = {
  questionAdded: (question: ClientQuestion) => void
  memberCountChanged: (memberCount: number) => void
}

export type ClientToServerEvents = {
  joinAskRoom: (twitchUsername: string) => void
  initStreamer: (twitchUsername: string) => void
}
