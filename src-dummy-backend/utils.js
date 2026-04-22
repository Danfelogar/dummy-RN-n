/**
 * Generates a short transaction ID: "txn_" + 8 random hex chars
 * Collision-safe enough for a dummy / lab environment.
 */
function generateTxnId() {
  const hex = Math.random().toString(16).slice(2, 10).padEnd(8, '0');
  return `txn_${hex}`;
}

function now() {
  return new Date().toISOString();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * PayIn state machine — valid forward transitions only.
 * CREATED → VALIDATED → PROCESSED
 * CREATED → FAILED
 * VALIDATED → FAILED
 */
const TRANSITIONS = {
  CREATED: ['VALIDATED', 'FAILED'],
  VALIDATED: ['PROCESSED', 'FAILED'],
  PROCESSED: [],
  FAILED: [],
};

/**
 * Returns true when a status string is terminal (no further transitions).
 */
function isTerminal(status) {
  return TRANSITIONS[status]?.length === 0;
}

module.exports = { generateTxnId, now, delay, isTerminal, TRANSITIONS };
