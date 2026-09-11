import assert from 'node:assert/strict'
import { createNoResponseWatchdogs, HEALTH_RESPONSE_TIMEOUT_MS } from '../src/common/no-response-watchdog.js'

let nextTimer = 0
const scheduled = new Map()
const cleared = []
const watchdogs = createNoResponseWatchdogs((callback, delay) => {
  const timer = ++nextTimer
  scheduled.set(timer, { callback, delay })
  return timer
}, timer => {
  cleared.push(timer)
  scheduled.delete(timer)
})

const reports = []
watchdogs.start('heartRate', () => reports.push('heartRate'))
watchdogs.start('spo2', () => reports.push('spo2'))
assert.equal(scheduled.get(1).delay, HEALTH_RESPONSE_TIMEOUT_MS)
assert.equal(scheduled.get(2).delay, 4000)

watchdogs.clear('heartRate')
assert.deepEqual(cleared, [1], 'sample/fail 可清理单项看门狗')
scheduled.get(2).callback()
assert.deepEqual(reports, ['spo2'], '无响应时只上报对应项目')

watchdogs.start('stress', () => reports.push('late-stress'))
const lateCallback = scheduled.get(3).callback
watchdogs.clearAll()
lateCallback()
assert.deepEqual(reports, ['spo2'], '离页清理后晚到计时器不得更新状态')

console.log('健康订阅无响应看门狗测试通过')
