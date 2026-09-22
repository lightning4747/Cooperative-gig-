import type { DemandForecast } from '@/types/forecast'
import { delay } from '@/lib/delay'
import { mockDemandForecasts } from '../data/forecasts'

export async function getDemandForecasts(): Promise<DemandForecast[]> {
  await delay(300)
  return [...mockDemandForecasts]
}
