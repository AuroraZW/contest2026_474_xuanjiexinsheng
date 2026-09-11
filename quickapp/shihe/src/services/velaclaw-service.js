import velaclaw from '@system.velaclaw'
import { requestAiAdvice } from '../common/ai-advice'

export function askVelaclaw(query, onResult) {
  return requestAiAdvice(velaclaw, query, onResult)
}
