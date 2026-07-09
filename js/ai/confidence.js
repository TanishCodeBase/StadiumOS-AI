/**
 * StadiumOS AI - Centralized Confidence Calculator
 * Deterministic calculation of confidence levels across all AI decision engines
 */

/**
 * Calculates a confidence score based on various operational inputs
 * @param {object} inputs
 * @param {number} inputs.dataQuality float 0.0 to 1.0 (sensor packet loss factor)
 * @param {number} inputs.environmentalUncertainty float 0.0 to 1.0 (storm/extreme heat anomalies)
 * @param {number} inputs.simulationStability float 0.0 to 1.0 (rate of ticks fluctuation)
 * @param {number} inputs.historicalAccuracy float 0.0 to 1.0 (past prediction accuracy benchmarks)
 * @param {number} inputs.predictionVariance float 0.0 to 1.0 (spread in predictive models)
 * @returns {number} float between 0.0 and 1.0
 */
export function calculateConfidence(inputs = {}) {
  const dataQuality = typeof inputs.dataQuality === 'number' ? inputs.dataQuality : 1.0;
  const environmentalUncertainty = typeof inputs.environmentalUncertainty === 'number' ? inputs.environmentalUncertainty : 0.0;
  const simulationStability = typeof inputs.simulationStability === 'number' ? inputs.simulationStability : 1.0;
  const historicalAccuracy = typeof inputs.historicalAccuracy === 'number' ? inputs.historicalAccuracy : 0.95;
  const predictionVariance = typeof inputs.predictionVariance === 'number' ? inputs.predictionVariance : 0.0;

  // Weighted formula to evaluate confidence levels deterministically
  const score = (
    dataQuality * 0.3 +
    (1.0 - environmentalUncertainty) * 0.2 +
    simulationStability * 0.2 +
    historicalAccuracy * 0.2 +
    (1.0 - predictionVariance) * 0.1
  );

  // Return value bound between 0.0 and 1.0, rounded to 2 decimal places
  return parseFloat(Math.max(0.0, Math.min(1.0, score)).toFixed(2));
}
export default calculateConfidence;
