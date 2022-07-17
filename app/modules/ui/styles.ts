import clsx from "clsx"

export const buttonClass = clsx(
  clsx`shadow inline-flex gap-3 py-2.5 px-4 text-sm items-center font-bold leading-none transition rounded-md bg-base-600 hover:bg-base-700 active:translate-y-[2px] active:transition-none`,
  "ring-2 ring-transparent focus:outline-none focus-visible:ring-base-500",
)

export const buttonIconClass = clsx("w-5 -mx-1 flex-shrink-0")

export const containerClass = clsx("mx-auto max-w-screen-lg px-4")
