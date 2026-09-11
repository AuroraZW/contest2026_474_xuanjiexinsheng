import health from '@service.health'
import { normalizeHealthSample, healthFailureStatus } from '../common/health-advice'
import { createNoResponseWatchdogs } from '../common/no-response-watchdog'

const subscriptions = { heartRate: false, spo2: false, stress: false }
const responseWatchdogs = createNoResponseWatchdogs()
const healthKinds = ['heartRate', 'spo2', 'stress']

function healthApi() {
  if (!health || !health.DATA_TYPES) return null
  if (typeof health.subscribeSample !== 'function' || typeof health.unsubscribeSample !== 'function') return null
  const dataTypes = health.DATA_TYPES
  if (dataTypes.HEART_RATE == null || dataTypes.SPO2 == null || dataTypes.STRESS == null) return null
  return { service: health, dataTypes }
}

function entries(dataTypes) {
  return [
    { kind: 'heartRate', dataType: dataTypes.HEART_RATE },
    { kind: 'spo2', dataType: dataTypes.SPO2 },
    { kind: 'stress', dataType: dataTypes.STRESS }
  ]
}

export function unsubscribeAllHealth() {
  responseWatchdogs.clearAll()
  const api = healthApi()
  if (!api) {
    healthKinds.forEach(kind => { subscriptions[kind] = false })
    return
  }
  entries(api.dataTypes).forEach(entry => {
    if (!subscriptions[entry.kind]) return
    subscriptions[entry.kind] = false
    try { api.service.unsubscribeSample({ dataType: entry.dataType }) } catch (error) {}
  })
}

export function subscribeAllHealth(onSample, onState) {
  unsubscribeAllHealth()
  const api = healthApi()
  if (!api) {
    healthKinds.forEach(kind => {
      onState(kind, { status: 'unsupported', reason: 'feature-missing' })
    })
    return
  }
  entries(api.dataTypes).forEach(entry => {
    responseWatchdogs.start(entry.kind, () => {
      onState(entry.kind, { status: 'read-error', reason: 'no-response' })
    })
    try {
      api.service.subscribeSample({
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
