import { raise } from "../../helpers/errors"

const getEnv = (key: string) =>
  process.env[key] ?? raise(`Missing environment variable ${key}`)

export const env = {
  COOKIE_SECRET: getEnv("COOKIE_SECRET"),
  TWITCH_CLIENT_ID: getEnv("TWITCH_CLIENT_ID"),
  TWITCH_CLIENT_SECRET: getEnv("TWITCH_CLIENT_SECRET"),
  TWITCH_CALLBACK_URL: getEnv("TWITCH_CALLBACK_URL"),
}
