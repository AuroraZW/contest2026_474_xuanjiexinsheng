export const AI_ADVICE_TIMEOUT_MS = 10000

const KNOWN_FAILURE_CODES = [200, 202, 203, 204, 1000, 1001]

function requireFiniteInteger(value, name, minimum) {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < minimum) {
    throw new TypeError(name + ' 必须是有限整数')
  }
  return value
}

export function buildAiAdviceSummary(input) {
  if (!input || typeof input !== 'object') throw new TypeError('当天汇总不能为空')
  const intakeKcal = requireFiniteInteger(input.intakeKcal, '摄入 kcal', 0)
  const exerciseKcal = requireFiniteInteger(input.exerciseKcal, '运动消耗 kcal', 0)
  const netKcal = requireFiniteInteger(input.netKcal, '净摄入 kcal', -Number.MAX_SAFE_INTEGER)
  const remainingKcal = requireFiniteInteger(input.remainingKcal, '目标差值 kcal', -Number.MAX_SAFE_INTEGER)
  const mealCount = requireFiniteInteger(input.mealCount, '已记录餐次数', 0)
  const targetText = remainingKcal < 0 ? '超出目标 ' + Math.abs(remainingKcal) : '目标剩余 ' + remainingKcal
  return '今日脱敏汇总：摄入 ' + intakeKcal + ' kcal；手动补录运动消耗 ' + exerciseKcal + ' kcal；净摄入 ' + netKcal + ' kcal；' + targetText + ' kcal；已记录餐次数 ' + mealCount + '。请给一句简短温和的生活管理建议，不作诊断。'
}

export function normalizeAiReply(reply) {
  if (typeof reply !== 'string') return null
  const normalized = reply.trim()
  if (!normalized || normalized.length > 2000 || normalized.indexOf('\u0000') >= 0) return null
  return normalized
}

export function aiFailureReason(code) {
  return KNOWN_FAILURE_CODES.indexOf(code) >= 0 ? 'code-' + code : 'unknown'
}

export function requestAiAdvice(api, query, onResult, timers) {
  const clock = timers || { setTimeout, clearTimeout }
  let active = true
  let timeoutId = null
  const finish = result => {
    if (!active) return
    active = false
    if (timeoutId !== null) clock.clearTimeout(timeoutId)
    onResult(result)
  }
  const cancel = () => {
    if (!active) return
    active = false
    if (timeoutId !== null) clock.clearTimeout(timeoutId)
  }
  if (!api || typeof api.ask !== 'function') {
    finish({ status: 'unavailable', reason: 'capability-missing' })
    return cancel
  }
  timeoutId = clock.setTimeout(() => finish({ status: 'unavailable', reason: 'timeout' }), AI_ADVICE_TIMEOUT_MS)
  try {
    api.ask({
      query,
      success(res) {
        const reply = normalizeAiReply(res && res.reply)
        finish(reply ? { status: 'success', reply } : { status: 'unavailable', reason: 'invalid-reply' })
      },
      fail(data, code) {
        finish({ status: 'unavailable', reason: aiFailureReason(code) })
      },
      complete() {}
    })
  } catch (error) {
    finish({ status: 'unavailable', reason: 'sync-error' })
  }
  return cancel
}
