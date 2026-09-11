import assert from 'node:assert/strict'
import { AI_ADVICE_TIMEOUT_MS, buildAiAdviceSummary, requestAiAdvice } from '../src/common/ai-advice.js'

function fakeTimers() {
  const pending = []
  return {
    pending,
    setTimeout(callback, delay) { const timer = { callback, delay, cleared: false }; pending.push(timer); return timer },
    clearTimeout(timer) { timer.cleared = true }
  }
}

const remaining = buildAiAdviceSummary({ intakeKcal: 1200, exerciseKcal: 180, netKcal: 1020, remainingKcal: 780, mealCount: 2 })
assert.match(remaining, /目标剩余 780 kcal/)
assert.match(buildAiAdviceSummary({ intakeKcal: 2200, exerciseKcal: 100, netKcal: 2100, remainingKcal: -300, mealCount: 3 }), /超出目标 300 kcal/)
for (const forbidden of ['心率', '血氧', '压力', '体重', '米饭', '用户', '历史']) assert.equal(remaining.includes(forbidden), false)
assert.throws(() => buildAiAdviceSummary({ intakeKcal: NaN, exerciseKcal: 0, netKcal: 0, remainingKcal: 0, mealCount: 0 }), TypeError)
assert.throws(() => buildAiAdviceSummary({ intakeKcal: 1.2, exerciseKcal: 0, netKcal: 0, remainingKcal: 0, mealCount: 0 }), TypeError)
assert.equal(AI_ADVICE_TIMEOUT_MS, 10000)

let callback
let results = []
let timers = fakeTimers()
requestAiAdvice({ ask(options) { callback = options } }, remaining, result => results.push(result), timers)
assert.equal(timers.pending[0].delay, 10000)
callback.success({ reply: '  今天慢慢来。  ' })
assert.deepEqual(results, [{ status: 'success', reply: '今天慢慢来。' }])

results = []; timers = fakeTimers()
requestAiAdvice({ ask(options) { options.success({ reply: '   ' }) } }, remaining, result => results.push(result), timers)
assert.equal(results[0].reason, 'invalid-reply')

results = []; timers = fakeTimers()
requestAiAdvice({ ask(options) { options.fail(null, 203) } }, remaining, result => results.push(result), timers)
assert.deepEqual(results, [{ status: 'unavailable', reason: 'code-203' }])

results = []; timers = fakeTimers()
requestAiAdvice({ ask(options) { callback = options } }, remaining, result => results.push(result), timers)
timers.pending[0].callback()
callback.success({ reply: '迟到回复' })
assert.deepEqual(results, [{ status: 'unavailable', reason: 'timeout' }])

results = []; timers = fakeTimers()
const cancel = requestAiAdvice({ ask(options) { callback = options } }, remaining, result => results.push(result), timers)
cancel()
callback.fail(null, 200)
callback.success({ reply: '取消后的迟到回复' })
assert.deepEqual(results, [])

for (const code of [200, 202, 203, 204, 1000, 1001]) {
  results = []; timers = fakeTimers()
  requestAiAdvice({ ask(options) { options.fail(null, code) } }, remaining, result => results.push(result), timers)
  assert.equal(results[0].reason, 'code-' + code)
}
assert.doesNotThrow(() => requestAiAdvice(undefined, remaining, () => {}, fakeTimers()))
assert.doesNotThrow(() => requestAiAdvice({}, remaining, () => {}, fakeTimers()))
assert.doesNotThrow(() => requestAiAdvice({ ask() { throw new Error('sync') } }, remaining, () => {}, fakeTimers()))
console.log('M4 VelaClaw 测试通过：脱敏汇总、目标措辞、10 秒阈值及成功/失败/超时/取消门禁均通过。')
