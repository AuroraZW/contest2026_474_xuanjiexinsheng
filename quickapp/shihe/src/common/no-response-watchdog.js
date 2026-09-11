export const HEALTH_RESPONSE_TIMEOUT_MS = 4000

export function createNoResponseWatchdogs(setTimer = setTimeout, clearTimer = clearTimeout) {
  const timers = {}
  let generation = 0

  function clear(kind) {
    if (!Object.prototype.hasOwnProperty.call(timers, kind)) return
    clearTimer(timers[kind])
    delete timers[kind]
  }

  return {
    start(kind, onTimeout) {
      clear(kind)
      const startedGeneration = generation
      const timer = setTimer(() => {
        if (generation !== startedGeneration || timers[kind] !== timer) return
        delete timers[kind]
        onTimeout()
      }, HEALTH_RESPONSE_TIMEOUT_MS)
      timers[kind] = timer
    },
    clear,
    clearAll() {
      generation += 1
      Object.keys(timers).forEach(clear)
    }
  }
}
