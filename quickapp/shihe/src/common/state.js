export const STATE_SCHEMA_VERSION = 1

export function defaultMealWindows() {
  return {
    breakfast: { start: '07:00', end: '09:30' },
    lunch: { start: '11:30', end: '14:00' },
    dinner: { start: '17:30', end: '20:30' }
  }
}

export function emptyState() {
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    profile: null,
    meals: [],
    exercises: [],
    recentFoodIds: [],
    favoriteMeals: [],
    mealPromptState: {
      localDate: '',
      breakfast: { status: 'pending' },
      lunch: { status: 'pending' },
      dinner: { status: 'pending' }
    },
    lastMaintenanceAt: 0
  }
}

function finiteNumber(value) {
  return typeof value === 'number' && isFinite(value)
}

function validTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

function validWindow(window) {
  return window && validTime(window.start) && validTime(window.end) && window.start < window.end
}

function validPromptEntry(entry) {
  if (!entry || typeof entry !== 'object' || !['pending', 'later', 'skipped', 'completed'].includes(entry.status)) return false
  const hasRemindAt = Object.prototype.hasOwnProperty.call(entry, 'remindAt')
  if (entry.status === 'later' && !hasRemindAt) return false
  return !hasRemindAt || (finiteNumber(entry.remindAt) && entry.remindAt > 0)
}

export function normalizeProfile(profile) {
  if (!profile || profile.schemaVersion !== STATE_SCHEMA_VERSION) return null
  if (!finiteNumber(profile.weightKg) || profile.weightKg < 25 || profile.weightKg > 250) return null
  if (!Number.isInteger(profile.dailyTargetKcal) || profile.dailyTargetKcal < 800 || profile.dailyTargetKcal > 5000) return null
  const windows = profile.mealWindows
  if (!windows || !validWindow(windows.breakfast) || !validWindow(windows.lunch) || !validWindow(windows.dinner)) return null
  if (!finiteNumber(profile.disclaimerAcceptedAt) || profile.disclaimerAcceptedAt <= 0) return null
  if (!finiteNumber(profile.updatedAt) || profile.updatedAt <= 0) return null
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    weightKg: Math.round(profile.weightKg * 10) / 10,
    dailyTargetKcal: profile.dailyTargetKcal,
    mealWindows: {
      breakfast: { start: windows.breakfast.start, end: windows.breakfast.end },
      lunch: { start: windows.lunch.start, end: windows.lunch.end },
      dinner: { start: windows.dinner.start, end: windows.dinner.end }
    },
    disclaimerAcceptedAt: profile.disclaimerAcceptedAt,
    updatedAt: profile.updatedAt
  }
}

export function validateProfile(profile) {
  return normalizeProfile(profile) !== null
}

export function validateState(state) {
  if (!state || state.schemaVersion !== STATE_SCHEMA_VERSION) return false
  if (state.profile !== null && !validateProfile(state.profile)) return false
  if (!Array.isArray(state.meals) || !Array.isArray(state.exercises) || !Array.isArray(state.recentFoodIds) || !Array.isArray(state.favoriteMeals)) return false
  const prompts = state.mealPromptState
  if (!prompts || typeof prompts !== 'object' || (prompts.localDate !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(prompts.localDate))) return false
  if (!validPromptEntry(prompts.breakfast) || !validPromptEntry(prompts.lunch) || !validPromptEntry(prompts.dinner)) return false
  if (!finiteNumber(state.lastMaintenanceAt) || state.lastMaintenanceAt < 0) return false
  return true
}

export function createOnboardedState(weightKg, dailyTargetKcal, mealWindows, now) {
  const timestamp = finiteNumber(now) && now > 0 ? now : Date.now()
  const profile = normalizeProfile({
    schemaVersion: STATE_SCHEMA_VERSION,
    weightKg: Number(weightKg),
    dailyTargetKcal: Number(dailyTargetKcal),
    mealWindows,
    disclaimerAcceptedAt: timestamp,
    updatedAt: timestamp
  })
  if (!profile) return null
  const state = emptyState()
  state.profile = profile
  state.lastMaintenanceAt = timestamp
  return state
}
