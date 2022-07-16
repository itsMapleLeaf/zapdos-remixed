import { TwitchStrategy } from "@03gibbss/remix-auth-twitch"
import type { Streamer } from "@prisma/client"
import { Authenticator } from "remix-auth"
import { db } from "../db.server"
import { env } from "../env.server"
import { sessionStorage } from "./session.server"

export const authenticator = new Authenticator<Streamer>(sessionStorage)

authenticator.use(
  new TwitchStrategy(
    {
      clientID: env.TWITCH_CLIENT_ID,
      clientSecret: env.TWITCH_CLIENT_SECRET,
      callbackURL: env.TWITCH_CALLBACK_URL,
    },
    async ({ accessToken, extraParams, profile }) => {
      return (
        (await db.streamer.findUnique({
          where: { twitchId: profile.id },
        })) ||
        (await db.streamer.create({
          data: { twitchId: profile.id, displayName: profile.display_name },
        }))
      )
    },
  ),
)
