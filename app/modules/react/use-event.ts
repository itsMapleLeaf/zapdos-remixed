import { useCallback, useEffect, useRef } from "react"

export function useEvent<Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
) {
  const ref = useRef((...args: Args): Return => {
    throw new Error("Attempt to call event callback during render")
  })

  useEffect(() => {
    ref.current = callback
  })

  return useCallback((...args: Args) => ref.current(...args), [])
}
