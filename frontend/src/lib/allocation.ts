/**
 * Deterministic allocation heuristic per Blueprint & Spec.
 * Score = (W1 * ProximityScore) + (W2 * RatingScore) - (W3 * DailyLoadPenalty)
 * Weights: W1 = 0.5, W2 = 0.3, W3 = 0.2
 *
 * Hard filters:
 * 1. Has verified required skill
 * 2. Status = ACTIVE
 * 3. Availability = AVAILABLE
 * 4. Within configured radius (default: 15km)
 */

export interface AllocationFactors {
  distanceKm: number
  rating: number // 1 to 5
  dailyJobCount: number
  maxRadiusKm?: number
}

export interface AllocationResult {
  proximityScore: number
  ratingScore: number
  dailyLoadPenalty: number
  totalScore: number
  explanation: string
}

export function computeAllocationScore(factors: AllocationFactors): AllocationResult {
  const maxRadius = factors.maxRadiusKm ?? 15

  // 1. Proximity: closer = higher score (0 to 1)
  const proximityScore = Math.max(0, Math.min(1, (maxRadius - factors.distanceKm) / maxRadius))

  // 2. Rating: normalized 0 to 1
  const ratingScore = Math.max(0, Math.min(1, (factors.rating - 1) / 4))

  // 3. Daily load penalty: increases with completed jobs today (0 to 1, capped at 5 jobs)
  const dailyLoadPenalty = Math.min(1, factors.dailyJobCount / 5)

  // Default Blueprint weights
  const W1 = 0.5
  const W2 = 0.3
  const W3 = 0.2

  const totalScore = Number(
    ((W1 * proximityScore) + (W2 * ratingScore) - (W3 * dailyLoadPenalty)).toFixed(3)
  )

  const explanation = `Selected because the worker holds the verified required skill, is currently available, is within ${factors.distanceKm} km (score: ${(proximityScore * 100).toFixed(0)}%), maintains a high customer rating of ${factors.rating.toFixed(1)}/5, and maintains optimal workload balance with ${factors.dailyJobCount} jobs handled today.`

  return {
    proximityScore: Number(proximityScore.toFixed(3)),
    ratingScore: Number(ratingScore.toFixed(3)),
    dailyLoadPenalty: Number(dailyLoadPenalty.toFixed(3)),
    totalScore,
    explanation,
  }
}
