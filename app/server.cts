// @ts-check
/* eslint-disable unicorn/prefer-module */
import * as serverBuild from "@remix-run/dev/server-build"
import { createRequestHandler } from "@remix-run/express"
import type { ServerBuild } from "@remix-run/server-runtime"
import compression from "compression"
import express from "express"
import morgan from "morgan"
import type { LoadContext } from "./modules/core/load-context"
import { createSocketServer } from "./modules/socket/socket-server"

const app = express()

app.use(compression())

app.use(
  "/fonts/fonts.css",
  express.static("public/fonts/fonts.css", {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-store")
    },
  }),
)

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by")

app.use(
  "/fonts",
  express.static("public/fonts", { immutable: true, maxAge: "1y" }),
)

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
  createRequestHandler({
    build: serverBuild as ServerBuild,
    mode: process.env.NODE_ENV,
    getLoadContext: (): LoadContext => ({ socketServer }),
  }),
)
const port = process.env.PORT || 3000

const server = app.listen(port, () => {
  console.info(`Express server listening on http://localhost:${port}`)
})

const socketServer = createSocketServer(server)
