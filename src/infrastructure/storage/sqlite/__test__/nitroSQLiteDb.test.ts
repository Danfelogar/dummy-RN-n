// src/infrastructure/storage/sqlite/nitroSQLiteDb.test.ts

import { open } from 'react-native-nitro-sqlite';

//Mock react-native-nitro-sqlite
const mockExecute = jest.fn();
const mockConnection = { execute: mockExecute };

jest.mock('react-native-nitro-sqlite', () => ({
  open: jest.fn(),
}));

//Helpers
const mockOpen = open as jest.Mock;

/**
 * Re-imports getDb with a fresh module registry so the singleton `_db`
 * is reset between test groups.
 */
function freshGetDb() {
  jest.resetModules();
  // Re-apply the mock after resetModules wipes the registry
  jest.mock('react-native-nitro-sqlite', () => ({
    open: mockOpen,
  }));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('../nitroSQLiteDb').getDb as () => typeof mockConnection;
}

//Setup
beforeEach(() => {
  jest.clearAllMocks();
  mockOpen.mockReturnValue(mockConnection);
});

//Tests
describe('nitroSQLiteDb', () => {
  //  Singleton behaviour
  describe('getDb — singleton', () => {
    it('opens the database on the first call', () => {
      // Fresh version tracking table → no rows → version 0
      mockExecute
        .mockReturnValueOnce({}) // CREATE TABLE schema_version
        .mockReturnValueOnce({ rows: { _array: [] } }) // SELECT version
        .mockReturnValue({}); // remaining migration calls

      const getDb = freshGetDb();
      getDb();

      expect(mockOpen).toHaveBeenCalledTimes(1);
      expect(mockOpen).toHaveBeenCalledWith({ name: 'tumipay.db' });
    });

    it('returns the same connection on subsequent calls without re-opening', () => {
      mockExecute
        .mockReturnValueOnce({})
        .mockReturnValueOnce({ rows: { _array: [] } })
        .mockReturnValue({});

      const getDb = freshGetDb();
      const first = getDb();
      const second = getDb();

      expect(mockOpen).toHaveBeenCalledTimes(1);
      expect(first).toBe(second);
    });

    it('returns the mock connection object', () => {
      mockExecute
        .mockReturnValueOnce({})
        .mockReturnValueOnce({ rows: { _array: [] } })
        .mockReturnValue({});

      const getDb = freshGetDb();
      const db = getDb();

      expect(db).toBe(mockConnection);
    });
  });

  //  runMigrations — schema_version bootstrap ─
  describe('runMigrations — schema_version table', () => {
    it('creates the schema_version table on first open', () => {
      mockExecute
        .mockReturnValueOnce({}) // CREATE TABLE schema_version
        .mockReturnValueOnce({ rows: { _array: [] } }) // SELECT version → 0
        .mockReturnValue({});

      const getDb = freshGetDb();
      getDb();

      const firstSql: string = mockExecute.mock.calls[0][0];
      expect(firstSql).toContain('CREATE TABLE IF NOT EXISTS schema_version');
    });

    it('queries the current schema version after creating the tracker table', () => {
      mockExecute
        .mockReturnValueOnce({})
        .mockReturnValueOnce({ rows: { _array: [] } })
        .mockReturnValue({});

      const getDb = freshGetDb();
      getDb();

      const secondSql: string = mockExecute.mock.calls[1][0];
      expect(secondSql).toContain('SELECT version FROM schema_version');
    });
  });

  //  runMigrations — version 0 (fresh install) ─
  describe('runMigrations — fresh install (version 0, empty rows)', () => {
    beforeEach(() => {
      mockExecute
        .mockReturnValueOnce({}) // CREATE TABLE schema_version
        .mockReturnValueOnce({ rows: { _array: [] } }) // SELECT version → empty → 0
        .mockReturnValue({}); // migration + INSERT
    });

    it('applies migration 1 by creating the transactions table', () => {
      const getDb = freshGetDb();
      getDb();

      const sqls: string[] = mockExecute.mock.calls.map(c => c[0]);
      const hasTxnCreate = sqls.some(s =>
        s.includes('CREATE TABLE IF NOT EXISTS transactions'),
      );
      expect(hasTxnCreate).toBe(true);
    });

    it('creates the cached_at index as part of migration 1', () => {
      const getDb = freshGetDb();
      getDb();

      const sqls: string[] = mockExecute.mock.calls.map(c => c[0]);
      const hasIndex = sqls.some(s =>
        s.includes('CREATE INDEX IF NOT EXISTS idx_transactions_cached_at'),
      );
      expect(hasIndex).toBe(true);
    });

    it('creates the status index as part of migration 1', () => {
      const getDb = freshGetDb();
      getDb();

      const sqls: string[] = mockExecute.mock.calls.map(c => c[0]);
      const hasIndex = sqls.some(s =>
        s.includes('CREATE INDEX IF NOT EXISTS idx_transactions_status'),
      );
      expect(hasIndex).toBe(true);
    });

    it('inserts version 1 into schema_version when previous version was 0', () => {
      const getDb = freshGetDb();
      getDb();

      const sqls: string[] = mockExecute.mock.calls.map(c => c[0]);
      const hasInsert = sqls.some(
        s => s.includes('INSERT INTO schema_version') && s.includes('1'),
      );
      expect(hasInsert).toBe(true);
    });

    it('does not call UPDATE schema_version when version was 0', () => {
      const getDb = freshGetDb();
      getDb();

      const sqls: string[] = mockExecute.mock.calls.map(c => c[0]);
      const hasUpdate = sqls.some(s =>
        s.includes('UPDATE schema_version SET version = 1'),
      );
      expect(hasUpdate).toBe(false);
    });
  });

  //  runMigrations — version between 0 and 1 (partial state)
  describe('runMigrations — partial migration (version row exists but < 1)', () => {
    beforeEach(() => {
      mockExecute
        .mockReturnValueOnce({}) // CREATE TABLE schema_version
        .mockReturnValueOnce({ rows: { _array: [{ version: 0 }] } }) // SELECT version → 0 (row present)
        .mockReturnValue({});
    });

    it('still applies migration 1', () => {
      const getDb = freshGetDb();
      getDb();

      const sqls: string[] = mockExecute.mock.calls.map(c => c[0]);
      const hasTxnCreate = sqls.some(s =>
        s.includes('CREATE TABLE IF NOT EXISTS transactions'),
      );
      expect(hasTxnCreate).toBe(true);
    });
  });

  //  runMigrations — already up to date
  describe('runMigrations — database already at version 1', () => {
    beforeEach(() => {
      mockExecute
        .mockReturnValueOnce({}) // CREATE TABLE schema_version
        .mockReturnValueOnce({ rows: { _array: [{ version: 1 }] } }) // SELECT version → 1
        .mockReturnValue({});
    });

    it('skips migration 1 when schema is already at version 1', () => {
      const getDb = freshGetDb();
      getDb();

      const sqls: string[] = mockExecute.mock.calls.map(c => c[0]);
      const hasTxnCreate = sqls.some(s =>
        s.includes('CREATE TABLE IF NOT EXISTS transactions'),
      );
      expect(hasTxnCreate).toBe(false);
    });

    it('does not write to schema_version when already up to date', () => {
      const getDb = freshGetDb();
      getDb();

      const sqls: string[] = mockExecute.mock.calls.map(c => c[0]);
      const hasVersionWrite = sqls.some(
        s =>
          s.includes('INSERT INTO schema_version') ||
          s.includes('UPDATE schema_version'),
      );
      expect(hasVersionWrite).toBe(false);
    });

    it('only runs 2 execute calls (schema_version CREATE + SELECT)', () => {
      const getDb = freshGetDb();
      getDb();

      expect(mockExecute).toHaveBeenCalledTimes(2);
    });
  });

  //  applyMigration1 — SQL shape
  describe('applyMigration1 — transactions table schema', () => {
    beforeEach(() => {
      mockExecute
        .mockReturnValueOnce({})
        .mockReturnValueOnce({ rows: { _array: [] } })
        .mockReturnValue({});
    });

    it('defines id as PRIMARY KEY in the transactions DDL', () => {
      const getDb = freshGetDb();
      getDb();

      const txnSql = mockExecute.mock.calls
        .map(c => c[0] as string)
        .find(s => s.includes('CREATE TABLE IF NOT EXISTS transactions'));

      expect(txnSql).toContain('id');
      expect(txnSql).toContain('PRIMARY KEY');
    });

    it('includes all required columns in the transactions DDL', () => {
      const getDb = freshGetDb();
      getDb();

      const txnSql = mockExecute.mock.calls
        .map(c => c[0] as string)
        .find(s => s.includes('CREATE TABLE IF NOT EXISTS transactions'))!;

      const requiredColumns = [
        'id',
        'idempotency_key',
        'customer_id',
        'amount',
        'currency',
        'payment_method',
        'status',
        'description',
        'failure_reason',
        'encrypted_payload',
        'created_at',
        'updated_at',
        'cached_at',
      ];

      for (const col of requiredColumns) {
        expect(txnSql).toContain(col);
      }
    });

    it('sets cached_at as INTEGER in the transactions DDL', () => {
      const getDb = freshGetDb();
      getDb();

      const txnSql = mockExecute.mock.calls
        .map(c => c[0] as string)
        .find(s => s.includes('CREATE TABLE IF NOT EXISTS transactions'))!;

      expect(txnSql).toMatch(/cached_at\s+INTEGER/);
    });
  });
});
