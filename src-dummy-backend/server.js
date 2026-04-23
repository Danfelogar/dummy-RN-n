// server.js  — TumiPay Dummy Backend
// Runs on http://localhost:3001
//
// Endpoints:
//   POST   /pay-ins           → create a PayIn (idempotent via header)
//   GET    /pay-ins           → list all PayIns (supports ?status=&customer_id=)
//   GET    /pay-ins/:id       → get single PayIn by ID
//
// Start:  node server.js
// Or add to package.json scripts: "backend": "node dummy-backend/server.js"
require('dotenv').config();
const path = require('path');

const jsonServer = require('json-server');

const { simulatePipeline } = require('./statusSimulator');
const { generateTxnId, now } = require('./utils');
const { validateCreatePayIn } = require('./validators');

const DB_PATH = path.join(__dirname, 'db.json');

// Bootstrap json-server
const server = jsonServer.create();
const router = jsonServer.router(DB_PATH);
const middlewares = jsonServer.defaults({ noCors: false });

server.use(middlewares);
server.use(jsonServer.bodyParser);

// CORS headers (React Native metro bundler runs on a different port)
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// POST /pay-ins
server.post('/pay-ins', (req, res) => {
  const db = router.db; // lowdb instance

  // 1. Idempotency check — header: Idempotency-Key: <uuid>
  const idempotencyKey = req.headers['idempotency-key'];
  if (idempotencyKey) {
    const existing = db
      .get('payins')
      .find({ idempotency_key: idempotencyKey })
      .value();
    if (existing) {
      // Return the exact same response — safe to retry on network failure
      return res.status(200).json({
        data: existing,
        meta: { idempotent_hit: true },
      });
    }
  }

  // 2. Validate input
  const { valid, errors } = validateCreatePayIn(req.body);
  if (!valid) {
    return res.status(422).json({
      error: 'VALIDATION_ERROR',
      message: 'One or more fields are invalid',
      details: errors,
    });
  }

  // 3. Build the new PayIn record (currency is always USD per spec)
  const txnId = generateTxnId();
  const timestamp = now();

  const newPayIn = {
    id: txnId,
    idempotency_key: idempotencyKey ?? null,
    customer_id: req.body.customer_id.trim(),
    amount: parseFloat(parseFloat(req.body.amount).toFixed(2)),
    currency: 'USD',
    payment_method: req.body.payment_method,
    status: 'CREATED',
    description: req.body.description?.trim() ?? null,
    failure_reason: null,
    // AES-GCM blob from the mobile client — stored as opaque string, never read
    encrypted_payload: req.body.encrypted_payload ?? null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  // 4. Persist to db.json
  db.get('payins').push(newPayIn).write();

  // 5. Fire the async state machine (non-blocking)
  simulatePipeline(db, txnId);

  // 6. Respond 201
  return res.status(201).json({
    data: newPayIn,
    meta: { idempotent_hit: false },
  });
});

// GET /pay-ins
// Supports query params: ?status=PROCESSED  ?customer_id=cust_xxx
server.get('/pay-ins', (req, res) => {
  const db = router.db;
  let query = db.get('payins');

  if (req.query.status) {
    query = query.filter({ status: req.query.status });
  }
  if (req.query.customer_id) {
    query = query.filter({ customer_id: req.query.customer_id });
  }

  const results = query
    .orderBy(['created_at'], ['desc']) // newest first
    .value();

  return res.status(200).json({
    data: results,
    meta: { total: results.length },
  });
});

// GET /pay-ins/:id
server.get('/pay-ins/:id', (req, res) => {
  const db = router.db;
  const record = db.get('payins').find({ id: req.params.id }).value();

  if (!record) {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: `PayIn with id "${req.params.id}" does not exist`,
    });
  }

  return res.status(200).json({ data: record });
});

// Mount json-server router (handles everything else, e.g. /idempotency_keys)
server.use(router);

// Start
server.listen(process.env.PORT_FOR_BACKEND || 3001, () => {
  console.log(
    `\n🚀  TumiPay dummy backend running at http://localhost:${
      process.env.PORT_FOR_BACKEND || 3001
    }`,
  );
  console.log('   POST  /pay-ins');
  console.log('   GET   /pay-ins');
  console.log('   GET   /pay-ins/:id\n');
});
