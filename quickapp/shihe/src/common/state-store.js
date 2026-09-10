import storage from '@system.storage'

export const STORAGE_KEY = 'shihe_state_v1'

export function loadState(validateState, done) {
  let completed = false
  const finish = result => {
    if (completed) return
    completed = true
    done(result)
  }
  try {
    storage.get({
      key: STORAGE_KEY,
      success(value) {
        if (value === undefined || value === null || value === '') {
          finish({ status: 'empty' })
          return
        }
        try {
          const state = typeof value === 'string' ? JSON.parse(value) : value
          finish(validateState(state) ? { status: 'ok', state } : { status: 'corrupt' })
        } catch (error) {
          finish({ status: 'corrupt' })
        }
      },
      fail() {
        finish({ status: 'unavailable' })
      }
    })
  } catch (error) {
    finish({ status: 'unavailable' })
  }
}

export function saveState(validateState, state, done) {
  let completed = false
  const finish = result => {
    if (completed) return
    completed = true
    done(result)
  }
  if (!validateState(state)) {
    finish({ status: 'invalid' })
    return
  }
  let serialized
  try {
    serialized = JSON.stringify(state)
  } catch (error) {
    finish({ status: 'invalid' })
    return
  }
  try {
    storage.set({
      key: STORAGE_KEY,
      value: serialized,
      success() {
        loadState(validateState, result => {
          if (result.status === 'ok' && JSON.stringify(result.state) === serialized) finish({ status: 'ok' })
          else finish({ status: 'verify-failed' })
        })
      },
      fail() {
        finish({ status: 'unavailable' })
      }
    })
  } catch (error) {
    finish({ status: 'unavailable' })
  }
}
