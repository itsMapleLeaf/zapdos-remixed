import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime"
import { redirect } from "@remix-run/server-runtime"
import { authenticator } from "~/auth.server"

export const loader: LoaderFunction = () => redirect("/")

export const action: ActionFunction = ({ request }) =>
  authenticator.logout(request, { redirectTo: "/" })
