// validators.js
// Input validation for the PayIn creation request.
// Returns { valid: true } or { valid: false, errors: string[] }

const ALLOWED_METHODS = ['CARD', 'BANK_TRANSFER', 'CASH'];

/**
 * Validates the body of POST /pay-ins
 * All fields use snake_case per the technical spec.
 *
 * Required fields:
 *  - customer_id   : non-empty string
 *  - amount        : positive number
 *  - payment_method: one of CARD | BANK_TRANSFER | CASH
 *
 * Optional:
 *  - description   : string
 *  - idempotency_key: string (enforced in middleware, not here)
 *  - encrypted_payload: string (AES-GCM blob from the mobile client)
 */
function validateCreatePayIn(body) {
  const errors = [];

  // customer_id
  if (
    !body.customer_id ||
    typeof body.customer_id !== 'string' ||
    body.customer_id.trim() === ''
  ) {
    errors.push('customer_id is required and must be a non-empty string');
  }

  // amount
  const amount = parseFloat(body.amount);
  if (
    body.amount === undefined ||
    body.amount === null ||
    isNaN(amount) ||
    amount <= 0
  ) {
    errors.push('amount is required and must be a positive number');
  }

  // payment_method
  if (!body.payment_method || !ALLOWED_METHODS.includes(body.payment_method)) {
    errors.push(
      `payment_method is required and must be one of: ${ALLOWED_METHODS.join(
        ', ',
      )}`,
    );
  }

  // description (optional but must be string if provided)
  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('description must be a string');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

module.exports = { validateCreatePayIn };
