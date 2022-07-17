import type { Question } from "@prisma/client"
import { db } from "../core/db.server"

export type ClientQuestion = {
  id: string
  text: string
  createdAt: string
}

export function createClientQuestion(
  question: Pick<Question, "id" | "text" | "createdAt">,
): ClientQuestion {
  return {
    id: question.id,
    text: question.text,
    createdAt: new Date(question.createdAt).toISOString(),
  }
}

export async function loadClientQuestions(
  streamerId: string,
): Promise<ClientQuestion[]> {
  const questions = await db.question.findMany({
    where: { streamerId },
    select: {
      id: true,
      text: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })
  return questions.map(createClientQuestion)
}
