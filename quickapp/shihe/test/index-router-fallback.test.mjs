import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/pages/index/index.ux', import.meta.url), 'utf8')
const guard = source.indexOf('if (!hasRouterReplace(router))')
const load = source.indexOf('loadState(validateStoredState')
const firstReplace = source.indexOf('router.replace(')

assert.match(source, /const hasRouterReplace = candidate => !!candidate && typeof candidate\.replace === 'function'/)
assert.ok(guard >= 0, '入口必须判断 router.replace 能力')
assert.ok(load > guard, '缺路由时必须在读取和导航前进入验证模式')
assert.ok(firstReplace > guard, '缺路由守卫前不得调用 router.replace')
assert.match(source.slice(guard, load), /this\.verificationMode = true\s*\n\s*return/)
assert.equal((source.match(/askVelaclaw\(/g) || []).length, 1, 'AI 只能由确认处理器调用一次')
assert.match(source, /confirmAiAdvice\(\)[\s\S]*this\.aiCancel = askVelaclaw\(this\.aiPreview/)

console.log('index 路由降级契约测试通过：能力判断先于读取，缺路由不调用 replace。')
