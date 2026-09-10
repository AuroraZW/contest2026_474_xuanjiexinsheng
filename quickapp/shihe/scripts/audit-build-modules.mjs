import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const pagesRoot = path.resolve('build/pages')
const sourcePagesRoot = path.resolve('src/pages')
const manifest = JSON.parse(await readFile(path.resolve('src/manifest.json'), 'utf8'))
const manifestPages = manifest.router && manifest.router.pages
assert.ok(manifestPages && typeof manifestPages === 'object', 'manifest router.pages 必须存在')
const routes = Object.entries(manifestPages)
const expectedPageCount = routes.length

async function waitForDirectory(directory, attempts = 30, intervalMs = 100) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await readdir(directory)
      return
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      if (attempt === attempts) {
        throw new Error(`等待构建目录超时（${attempts * intervalMs}ms）：${directory}`)
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
  }
}

async function javascriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await javascriptFiles(target))
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(target)
  }
  return files
}

await waitForDirectory(pagesRoot)
const files = await javascriptFiles(pagesRoot)
assert.equal(files.length, expectedPageCount, `应生成 ${expectedPageCount} 个页面 JavaScript 包`)

const sourcePageFiles = routes.map(([route, config]) => {
  assert.ok(config && typeof config.component === 'string' && config.component, `${route} 必须声明 component`)
  const lastSegment = route.split('/').filter(Boolean).pop()
  return path.join(sourcePagesRoot, lastSegment, config.component + '.ux')
})
for (const file of sourcePageFiles) {
  const source = await readFile(file, 'utf8')
  const hasData = /\bdata\s*:\s*\{/.test(source)
  const hasAccessFields = /\b(?:public|protected|private)\s*:\s*\{/.test(source)
  assert.ok(!(hasData && hasAccessFields), path.relative(process.cwd(), file) + ' 不得混用 data 与访问器字段')
  if (path.basename(file) === 'history.ux') {
    assert.match(source, /\bfor="\(index, day\) in days"/, 'history.ux 必须使用显式 day 循环变量')
  }
}

const failures = []
const relativeRequire = /\brequire\s*\(\s*(['"])\.\.?\//g
for (const file of files) {
  const source = await readFile(file, 'utf8')
  if (relativeRequire.test(source)) failures.push(path.relative(process.cwd(), file))
  relativeRequire.lastIndex = 0

  const requiredModules = [...source.matchAll(/__webpack_require__\((['"])(\.\/src\/[^'"]+\.js)\1\)/g)]
  for (const [, , moduleId] of requiredModules) {
    const escapedId = moduleId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const modulePattern = new RegExp(
      `['"]${escapedId}['"]\\s*\\([^,]+,\\s*exports(?:,|\\))[^\\{]*\\{` +
      `[\\s\\S]*?\\bexports\\.[A-Za-z_$][\\w$]*\\s*=`,
    )
    if (!modulePattern.test(source)) {
      failures.push(`${path.relative(process.cwd(), file)}: ${moduleId} 未写入 wrapper exports`)
    }
  }
}

assert.deepEqual(failures, [], '页面包模块审计失败: ' + failures.join(', '))
console.log(`页面审计通过：${expectedPageCount} 页均有 manifest 对应源文件且未混用 data/访问器字段，页面包数量一致、无项目相对 require，且本地模块均写入 wrapper exports。`)
