let currentDraft = null

export function setMealDraft(draft) { currentDraft = draft }
export function getMealDraft() { return currentDraft }
export function clearMealDraft() { currentDraft = null }
