export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']
export const MEAL_SOURCES = ['catalog', 'recent', 'favorite', 'transcript-demo']

export function localDateOf(timestamp) {
  const date = new Date(timestamp)
  const pad = value => (value < 10 ? '0' : '') + value
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
}

export function inferMealType(profile, timestamp) {
  const date = new Date(timestamp)
  const pad = value => (value < 10 ? '0' : '') + value
  const time = pad(date.getHours()) + ':' + pad(date.getMinutes())
  const windows = profile && profile.mealWindows
  if (windows) {
    const order = ['breakfast', 'lunch', 'dinner']
    for (let i = 0; i < order.length; i += 1) {
      const window = windows[order[i]]
      if (window && time >= window.start && time <= window.end) return order[i]
    }
  }
  if (date.getHours() < 10) return 'breakfast'
  if (date.getHours() < 15) return 'lunch'
  if (date.getHours() < 21) return 'dinner'
  return 'snack'
}

export function foodById(foods, foodId) {
  return foods.find(food => food.id === foodId)
}

function stepFor(food) {
  // 确认页统一展示并调整换算后的 g/ml 数量。
  return 50
}

export function itemFromFood(calculateFoodKcal, food, basisAmount) {
  const amount = basisAmount === undefined
    ? food.defaultServing.amount * food.parseUnits[food.defaultServing.unit]
    : basisAmount
  return {
    foodId: food.id,
    name: food.name,
    basisAmount: amount,
    basisUnit: food.basisUnit,
    energyKcalPer100: food.energyKcalPer100,
    kcal: calculateFoodKcal(food, amount),
    step: stepFor(food)
  }
}

export function addFoodToItems(calculateFoodKcal, items, food, basisAmount) {
  const next = items.map(item => Object.assign({}, item))
  const added = itemFromFood(calculateFoodKcal, food, basisAmount)
  const existing = next.find(item => item.foodId === food.id)
  if (existing) {
    existing.basisAmount += added.basisAmount
    existing.kcal = calculateFoodKcal(food, existing.basisAmount)
  } else next.push(added)
  return next
}

export function adjustItem(foods, calculateFoodKcal, items, index, direction) {
  if (!Array.isArray(items) || index < 0 || index >= items.length) return items || []
  const next = items.map(item => Object.assign({}, item))
  const item = next[index]
  const food = foodById(foods, item.foodId)
  if (!food) return items
  const amount = item.basisAmount + (direction < 0 ? -item.step : item.step)
  item.basisAmount = Math.max(item.step, amount)
  item.kcal = calculateFoodKcal(food, item.basisAmount)
  return next
}

export function totalItemsKcal(items) {
  return (items || []).reduce((total, item) => total + item.kcal, 0)
}

export function serializeMealDraft(draft) {
  return JSON.stringify(draft)
}

export function parseMealDraft(draftJson, foods, calculateFoodKcal) {
  try {
    const draft = JSON.parse(draftJson)
    if (!draft || !MEAL_TYPES.includes(draft.mealType) || !MEAL_SOURCES.includes(draft.source) || !Array.isArray(draft.items) || !draft.items.length) return null
    const items = draft.items.map(item => {
      const food = item && foodById(foods, item.foodId)
      if (!food || typeof item.basisAmount !== 'number' || !isFinite(item.basisAmount) || item.basisAmount <= 0) throw new Error('invalid draft item')
      return itemFromFood(calculateFoodKcal, food, item.basisAmount)
    })
    const parsed = { mealType: draft.mealType, source: draft.source, items }
    if (draft.recordId !== undefined) {
      if (typeof draft.recordId !== 'string' || !draft.recordId) return null
      parsed.recordId = draft.recordId
    }
    if (draft.localDate !== undefined) {
      if (typeof draft.localDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(draft.localDate)) return null
      parsed.localDate = draft.localDate
    }
    if (draft.createdAt !== undefined) {
      if (typeof draft.createdAt !== 'number' || !isFinite(draft.createdAt) || draft.createdAt <= 0) return null
      parsed.createdAt = draft.createdAt
    }
    return parsed
  } catch (error) {
    return null
  }
}

export function makeMealRecord(foods, calculateFoodKcal, draft, now) {
  if (!draft || !MEAL_TYPES.includes(draft.mealType) || !MEAL_SOURCES.includes(draft.source) || !draft.items || !draft.items.length) return null
  const timestamp = now || Date.now()
  const items = []
  for (let i = 0; i < draft.items.length; i += 1) {
    const item = draft.items[i]
    const food = item && foodById(foods, item.foodId)
    if (!food || typeof item.basisAmount !== 'number' || !isFinite(item.basisAmount) || item.basisAmount <= 0) return null
    items.push({
      foodId: food.id,
      nameSnapshot: food.name,
      amount: item.basisAmount,
      basisUnit: food.basisUnit,
      energyKcalPer100Snapshot: food.energyKcalPer100,
      kcalSnapshot: calculateFoodKcal(food, item.basisAmount)
    })
  }
  return {
    schemaVersion: 1,
    id: draft.recordId || ('meal-' + timestamp + '-' + Math.floor(Math.random() * 1000000)),
    localDate: draft.localDate || localDateOf(timestamp),
    mealType: draft.mealType,
    source: draft.source,
    items,
    totalKcalSnapshot: items.reduce((sum, item) => sum + item.kcalSnapshot, 0),
    createdAt: draft.createdAt || timestamp,
    updatedAt: timestamp
  }
}

export function upsertMeal(meals, record) {
  const next = (meals || []).slice()
  const index = next.findIndex(item => item.id === record.id)
  if (index >= 0) next[index] = record
  else next.push(record)
  return next
}

export function deleteMeal(meals, id) {
  return (meals || []).filter(meal => meal.id !== id)
}

export function todaySummary(meals, localDate) {
  const records = (meals || []).filter(meal => meal.localDate === localDate)
  const status = { breakfast: 'pending', lunch: 'pending', dinner: 'pending' }
  records.forEach(meal => { if (status[meal.mealType]) status[meal.mealType] = 'completed' })
  return { records, totalKcal: records.reduce((sum, meal) => sum + meal.totalKcalSnapshot, 0), status }
}

export function syncMealPromptState(promptState, meals, localDate) {
  const summary = todaySummary(meals, localDate)
  const previous = promptState && promptState.localDate === localDate ? promptState : {}
  const next = { localDate }
  ;['breakfast', 'lunch', 'dinner'].forEach(type => {
    if (summary.status[type] === 'completed') next[type] = { status: 'completed' }
    else if (previous[type] && previous[type].status !== 'completed') next[type] = Object.assign({}, previous[type])
    else next[type] = { status: 'pending' }
  })
  return next
}

export function activeMealType(profile, timestamp) {
  const windows = profile && profile.mealWindows
  if (!windows) return null
  const date = new Date(timestamp)
  const pad = value => (value < 10 ? '0' : '') + value
  const time = pad(date.getHours()) + ':' + pad(date.getMinutes())
  const order = ['breakfast', 'lunch', 'dinner']
  for (let i = 0; i < order.length; i += 1) {
    const window = windows[order[i]]
    if (window && time >= window.start && time <= window.end) return order[i]
  }
  return null
}

export function mealCapsuleView(profile, meals, promptState, timestamp) {
  const mealType = activeMealType(profile, timestamp)
  if (!mealType) return { visibility: 'hidden', mealType: null }
  const localDate = localDateOf(timestamp)
  const synced = syncMealPromptState(promptState, meals, localDate)
  const records = (meals || []).filter(meal => meal.localDate === localDate && meal.mealType === mealType)
  if (records.length) {
    return {
      visibility: 'collapsed', status: 'completed', mealType,
      kcal: records.reduce((sum, meal) => sum + meal.totalKcalSnapshot, 0)
    }
  }
  const entry = synced[mealType]
  if (entry.status === 'later' && entry.remindAt > timestamp) return { visibility: 'collapsed', status: 'later', mealType, remindAt: entry.remindAt }
  if (entry.status === 'skipped') return { visibility: 'collapsed', status: 'skipped', mealType }
  return { visibility: 'expanded', status: 'pending', mealType, actions: ['record', 'later', 'skip'] }
}

function updateActivePrompt(profile, meals, promptState, timestamp, entry) {
  const mealType = activeMealType(profile, timestamp)
  if (!mealType) return { changed: false, mealType: null, promptState }
  const localDate = localDateOf(timestamp)
  const synced = syncMealPromptState(promptState, meals, localDate)
  if (synced[mealType].status === 'completed') return { changed: false, mealType, promptState: synced }
  const next = Object.assign({}, synced)
  next[mealType] = entry
  return { changed: true, mealType, promptState: next }
}

export function setActiveMealLater(profile, meals, promptState, timestamp) {
  return updateActivePrompt(profile, meals, promptState, timestamp, { status: 'later', remindAt: timestamp + 15 * 60 * 1000 })
}

export function skipActiveMeal(profile, meals, promptState, timestamp) {
  return updateActivePrompt(profile, meals, promptState, timestamp, { status: 'skipped' })
}

export function updateRecent(recentFoodIds, items) {
  const ids = (items || []).map(item => item.foodId).reverse()
  return ids.concat(recentFoodIds || []).filter((id, index, all) => all.indexOf(id) === index).slice(0, 12)
}

export function addFavorite(favorites, record, now) {
  const first = record.items[0]
  const names = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }
  const favorite = {
    id: 'favorite-' + record.id,
    name: names[record.mealType] + ' · ' + first.nameSnapshot,
    createdAt: now || record.updatedAt,
    updatedAt: now || record.updatedAt,
    items: record.items.map(item => ({ foodId: item.foodId, amount: item.amount, basisUnit: item.basisUnit }))
  }
  return [favorite].concat((favorites || []).filter(item => item.id !== favorite.id)).slice(0, 8)
}

export function draftFromRecord(foods, calculateFoodKcal, record) {
  return {
    recordId: record.id, createdAt: record.createdAt, localDate: record.localDate,
    mealType: record.mealType, source: record.source,
    items: record.items.map(item => itemFromFood(calculateFoodKcal, foodById(foods, item.foodId), item.amount))
  }
}
