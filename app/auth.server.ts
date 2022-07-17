import { TwitchStrategy } from "@03gibbss/remix-auth-twitch"
import type { Streamer } from "@prisma/client"
import { createCookieSessionStorage } from "@remix-run/node"
import { Authenticator } from "remix-auth"
import { db } from "./db.server"
import { env } from "./env.server"

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [env.COOKIE_SECRET],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  },
})

export const authenticator = new Authenticator<Streamer>(sessionStorage)

authenticator.use(
  new TwitchStrategy(
    {
      clientID: env.TWITCH_CLIENT_ID,
      clientSecret: env.TWITCH_CLIENT_SECRET,
      callbackURL: env.TWITCH_CALLBACK_URL,
    },
    async ({ accessToken, extraParams, profile }) => {
      const data: Partial<Streamer> = {
        twitchUsername: profile.login,
        twitchDisplayName: profile.display_name,
        twitchAvatar: profile.profile_image_url,
      }

      return db.streamer.upsert({
        where: { twitchId: profile.id },
        update: data,
        create: { ...data, twitchId: profile.id },
      })
    },
  ),
)
