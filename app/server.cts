/* eslint-disable unicorn/prefer-module */
import * as serverBuild from "@remix-run/dev/server-build"
import { createRequestHandler } from "@remix-run/express"
import type { ServerBuild } from "@remix-run/server-runtime"
import compression from "compression"
import express from "express"
import morgan from "morgan"

const app = express()

app.use(
  compression({
    filter: (_req, res) => {
      const contentTypeHeader = res.getHeader("Content-Type")
      let contentType = ""
      if (contentTypeHeader) {
        contentType = Array.isArray(contentTypeHeader)
          ? contentTypeHeader.join(" ")
          : String(contentTypeHeader)
      }

      if (
        contentType.includes("text/html") ||
        contentType.includes("text/event-stream")
      ) {
        return false
      }

      return true
    },
  }),
)

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by")

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" }),
)

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }))

app.use(morgan("tiny"))

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? (req, res, next) => {
        // purgeRequireCache()

        return createRequestHandler({
          build: serverBuild as ServerBuild,
          mode: process.env.NODE_ENV,
        })(req, res, next)
      }
    : createRequestHandler({
        build: serverBuild as ServerBuild,
        mode: process.env.NODE_ENV,
      }),
)
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.info(`Express server listening on http://localhost:${port}`)
})

// function purgeRequireCache() {
//   // purge require cache on requests for "server side HMR" this won't let
//   // you have in-memory objects between requests in development,
//   // alternatively you can set up nodemon/pm2-dev to restart the server on
//   // file changes, but then you'll have to reconnect to databases/etc on each
//   // change. We prefer the DX of this, so we've included it for you by default
//   for (const key in require.cache) {
//     if (key.startsWith(BUILD_DIR)) {
//       delete require.cache[key]
//     }
//   }
// }
