import type { LoaderFunction } from "@remix-run/node"
import { authenticator } from "~/auth.server"

export const loader: LoaderFunction = ({ request }) =>
  authenticator.authenticate("twitch", request, { successRedirect: "/" })

// even though this should technically never show,
// rendering a page will show the catch boundary if auth fails
export default function Page() {
  return <p>success!</p>
}
