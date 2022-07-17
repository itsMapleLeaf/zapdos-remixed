/**
 * @param {{ onOpen: () => void; } | undefined} [config]
 */
function remixLiveReloadConnect(config) {
  let protocol = location.protocol === "https:" ? "wss:" : "ws:"
  let host = location.hostname
  let socketPath = protocol + "//" + host + ":" + 8002 + "/socket"

  let ws = new WebSocket(socketPath)
  ws.onmessage = async (message) => {
    let event = JSON.parse(message.data)
    if (event.type === "LOG") {
      console.log(event.message)
    }
    if (event.type === "RELOAD") {
      console.log("💿 Waiting for server...")

      let serverReady = false
      do {
        await new Promise((resolve) => setTimeout(resolve, 10))
        const response = await fetch("/").catch(() => undefined)
        if (response) serverReady = true
      } while (!serverReady)

      console.log("💿 Reloading window...")
      window.location.reload()
    }
  }
  ws.onopen = () => {
    if (config && typeof config.onOpen === "function") {
      config.onOpen()
    }
  }
  ws.onclose = (error) => {
    console.log("Remix dev asset server web socket closed. Reconnecting...")
    setTimeout(
      () =>
        remixLiveReloadConnect({
          onOpen: () => window.location.reload(),
        }),
      1000,
    )
  }
  ws.onerror = (error) => {
    console.log("Remix dev asset server web socket error:")
    console.error(error)
  }
}
remixLiveReloadConnect()
