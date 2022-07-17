import { useRef, useState } from "react"
import { useEvent } from "./use-event"

export function useTimer(duration: number) {
  const [running, setRunning] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const start = useEvent(() => {
    clearTimeout(timeoutRef.current)
    setRunning(true)
    timeoutRef.current = setTimeout(() => setRunning(false), duration)
  })

  const stop = useEvent(() => {
    clearTimeout(timeoutRef.current)
    setRunning(false)
  })

  return { running, start, stop }
}
