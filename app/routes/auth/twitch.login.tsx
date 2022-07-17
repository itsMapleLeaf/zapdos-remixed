import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { authenticator } from "~/modules/core/auth.server"

export const loader: LoaderFunction = () => redirect("/")

export const action: ActionFunction = ({ request }) =>
  authenticator.authenticate("twitch", request)
