// statusSimulator.js
// Simulates the backend payment pipeline advancing a PayIn through states.
// Uses setTimeout to mimic async processing (validation → processing).
//
//  Timeline (approximate):
//   t+0s   → CREATED   (just persisted)
//   t+5s   → VALIDATED (fraud / format check passed)
//   t+12s  → PROCESSED or FAILED (processor response)

const { now, isTerminal } = require('./utils');
require('dotenv').config();

// 20 % chance a transaction ends up FAILED — realistic for a payment gateway
const FAILURE_RATE = process.env.FAILURE_RATE_BACKEND || 0.2;

/**
 * Kicks off an async pipeline that mutates the transaction record in the
 * low-level JSON-Server router's db object directly.
 *
 * @param {object} db      — the live json-server `router.db` lowdb instance
 * @param {string} txnId   — ID of the freshly created PayIn
 */
function simulatePipeline(db, txnId) {
  // ── Step 1: CREATED → VALIDATED (after ~5 s) ─────────────────────────────
  setTimeout(() => {
    const record = db.get('payins').find({ id: txnId }).value();
    if (!record || isTerminal(record.status)) return;

    db.get('payins')
      .find({ id: txnId })
      .assign({ status: 'VALIDATED', updated_at: now() })
      .write();

    console.log(`[simulator] ${txnId} → VALIDATED`);

    // ── Step 2: VALIDATED → PROCESSED | FAILED (after ~7 s more) ─────────
    setTimeout(() => {
      const current = db.get('payins').find({ id: txnId }).value();
      if (!current || isTerminal(current.status)) return;

      const willFail = Math.random() < FAILURE_RATE;

      if (willFail) {
        const reasons = [
          'Card declined by issuing bank',
          'Velocity limit exceeded',
          'AVS mismatch — billing address',
          'Suspected fraudulent activity',
        ];
        const failure_reason =
          reasons[Math.floor(Math.random() * reasons.length)];

        db.get('payins')
          .find({ id: txnId })
          .assign({ status: 'FAILED', failure_reason, updated_at: now() })
          .write();

        console.log(`[simulator] ${txnId} → FAILED (${failure_reason})`);
      } else {
        db.get('payins')
          .find({ id: txnId })
          .assign({ status: 'PROCESSED', updated_at: now() })
          .write();

        console.log(`[simulator] ${txnId} → PROCESSED`);
      }
    }, 7_000); // 7 s after VALIDATED
  }, 5_000); // 5 s after creation
}

module.exports = { simulatePipeline };
