import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = name => readFileSync(new URL('../src/pages/' + name + '/' + name + '.ux', import.meta.url), 'utf8')

const home = read('home')
assert.match(home, /今日已摄入/)
assert.match(home, /每日饮食目标 \{\{dailyTargetKcal\}\} kcal/)
assert.match(home, /手动补录运动/)
assert.match(home, /估算净摄入/)
assert.match(home, /系统健康数据/)
assert.doesNotMatch(home, /剩余目标/)

const onboarding = read('onboarding')
assert.match(onboarding, /每日饮食目标/)
assert.match(onboarding, /不是运动消耗目标/)
assert.match(onboarding, /默认参考值为 2000 kcal/)

const meal = read('meal')
assert.match(meal, /entryMode:'transcript'/)
assert.match(meal, /一句话记餐/)
assert.match(meal, /快捷选择/)
assert.match(meal, /识别这顿饭/)
const transcriptEntryIndex = meal.indexOf('value="一句话记餐"')
assert.ok(transcriptEntryIndex >= 0 && transcriptEntryIndex < meal.indexOf('最近食品</text>'), '一句话入口必须排在快捷目录前')
assert.doesNotMatch(meal, /麦克风|录音中|识别中/)

const exercise = read('exercise')
assert.match(exercise, /手动补录运动/)
assert.match(exercise, /暂不能读取系统步数或运动记录/)
assert.match(exercise, /运动类型、体重和时长进行 MET 估算/)

const history = read('history')
assert.match(history, /手动补录消耗/)
assert.match(history, /估算净摄入/)

console.log('食衡界面文案与默认记餐流程静态检查通过。')
