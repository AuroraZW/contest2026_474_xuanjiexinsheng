import health from '@service.health'
import { normalizeHealthSample, healthFailureStatus } from '../common/health-advice'
import { createNoResponseWatchdogs } from '../common/no-response-watchdog'

const subscriptions = { heartRate: false, spo2: false, stress: false }
const responseWatchdogs = createNoResponseWatchdogs()

function entries() {
  return [
    { kind: 'heartRate', dataType: health.DATA_TYPES.HEART_RATE },
    { kind: 'spo2', dataType: health.DATA_TYPES.SPO2 },
    { kind: 'stress', dataType: health.DATA_TYPES.STRESS }
  ]
}

export function unsubscribeAllHealth() {
  responseWatchdogs.clearAll()
  entries().forEach(entry => {
    if (!subscriptions[entry.kind]) return
    subscriptions[entry.kind] = false
    try { health.unsubscribeSample({ dataType: entry.dataType }) } catch (error) {}
  })
}

export function subscribeAllHealth(onSample, onState) {
  unsubscribeAllHealth()
  entries().forEach(entry => {
    responseWatchdogs.start(entry.kind, () => {
      onState(entry.kind, { status: 'read-error', reason: 'no-response' })
    })
    try {
      health.subscribeSample({
        dataType: entry.dataType,
        callback: sample => {
          responseWatchdogs.clear(entry.kind)
          const normalized = normalizeHealthSample(entry.kind, sample)
          if (normalized) onSample(entry.kind, normalized)
          else onState(entry.kind, { status: 'invalid-sample' })
        },
        fail: (data, code) => {
          responseWatchdogs.clear(entry.kind)
          onState(entry.kind, { status: healthFailureStatus(code), code })
        }
      })
      subscriptions[entry.kind] = true
    } catch (error) {
      responseWatchdogs.clear(entry.kind)
      subscriptions[entry.kind] = false
      onState(entry.kind, { status: 'read-error', reason: 'subscribe-error' })
    }
  })
}
