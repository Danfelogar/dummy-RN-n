// Single entry-point for the NitroSQLite database.
// Call `getDb()` everywhere — it returns the already-open connection
// (singleton pattern, safe to call from multiple files).
//
// Schema v1:
//   transactions — flat snapshot of a PayIn, cached from the API or written
//                  immediately after a successful POST.

import { open, type NitroSQLiteConnection } from 'react-native-nitro-sqlite';

const DB_NAME = 'tumipay.db';

let _db: NitroSQLiteConnection | null = null;

export function getDb(): NitroSQLiteConnection {
  if (_db) return _db;
  _db = open({ name: DB_NAME });
  runMigrations(_db);
  return _db;
}

function runMigrations(db: NitroSQLiteConnection): void {
  // Create the version tracker table first
  db.execute(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    );
  `);

  const result = db.execute('SELECT version FROM schema_version LIMIT 1;');
  const currentVersion: number =
    (result.rows?._array?.[0]?.version as number | undefined) ?? 0;

  if (currentVersion < 1) {
    applyMigration1(db);
    if (currentVersion === 0) {
      db.execute('INSERT INTO schema_version (version) VALUES (1);');
    } else {
      db.execute('UPDATE schema_version SET version = 1;');
    }
  }
}

function applyMigration1(db: NitroSQLiteConnection): void {
  db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id                TEXT    PRIMARY KEY NOT NULL,
      idempotency_key   TEXT    NOT NULL,
      customer_id       TEXT    NOT NULL,
      amount            REAL    NOT NULL,
      currency          TEXT    NOT NULL DEFAULT 'USD',
      payment_method    TEXT    NOT NULL,
      status            TEXT    NOT NULL,
      description       TEXT    NOT NULL DEFAULT '',
      failure_reason    TEXT,
      encrypted_payload TEXT,
      created_at        TEXT    NOT NULL,
      updated_at        TEXT    NOT NULL,
      cached_at         INTEGER NOT NULL
    );
  `);

  db.execute(
    'CREATE INDEX IF NOT EXISTS idx_transactions_cached_at ON transactions (cached_at DESC);',
  );

  db.execute(
    'CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status);',
  );
}
