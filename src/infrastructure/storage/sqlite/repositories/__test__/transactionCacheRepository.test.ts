import { getDb } from '../../nitroSQLiteDb';
import { TransactionRecord } from '../../../../../domain';
import { TransactionCacheRepository } from '..';

//  Mock getDb
jest.mock('../../nitroSQLiteDb', () => ({
  getDb: jest.fn(),
}));

//  Helpers
const mockExecute = jest.fn();

const mockDb = {
  execute: mockExecute,
};

const makeRecord = (
  overrides: Partial<TransactionRecord> = {},
): TransactionRecord => ({
  id: 'txn-001',
  idempotency_key: 'idem-001',
  customer_id: 'cust-001',
  amount: 100,
  currency: 'USD',
  payment_method: 'CARD',
  status: 'PROCESSED',
  description: 'Test transaction',
  failure_reason: null,
  encrypted_payload: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  cached_at: 1700000000000,
  ...overrides,
});

//  Setup
beforeEach(() => {
  jest.clearAllMocks();
  (getDb as jest.Mock).mockReturnValue(mockDb);
});

//  Tests
describe('TransactionCacheRepository', () => {
  let repo: TransactionCacheRepository;

  beforeEach(() => {
    repo = new TransactionCacheRepository();
  });

  // ── upsertMany
  describe('upsertMany', () => {
    it('does nothing when passed an empty array', async () => {
      await repo.upsertMany([]);

      expect(getDb).not.toHaveBeenCalled();
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it('calls db.execute once per record', async () => {
      const records = [
        makeRecord({ id: 'txn-001' }),
        makeRecord({ id: 'txn-002' }),
      ];

      await repo.upsertMany(records);

      expect(mockExecute).toHaveBeenCalledTimes(2);
    });

    it('passes the correct SQL and parameters for a record', async () => {
      const record = makeRecord();

      await repo.upsertMany([record]);

      const [sql, params] = mockExecute.mock.calls[0];

      expect(sql).toContain('INSERT INTO transactions');
      expect(sql).toContain('ON CONFLICT(id) DO UPDATE SET');
      expect(params).toEqual([
        record.id,
        record.idempotency_key,
        record.customer_id,
        record.amount,
        record.currency,
        record.payment_method,
        record.status,
        record.description,
        record.failure_reason,
        record.encrypted_payload,
        record.created_at,
        record.updated_at,
        record.cached_at,
      ]);
    });

    it('handles a record with optional null fields correctly', async () => {
      const record = makeRecord({
        failure_reason: null,
        encrypted_payload: null,
        description: '',
      });

      await repo.upsertMany([record]);

      const [, params] = mockExecute.mock.calls[0];
      expect(params[8]).toBeNull(); // failure_reason
      expect(params[9]).toBeNull(); // encrypted_payload
    });
  });

  // ── findAll
  describe('findAll', () => {
    it('returns an empty array when the table is empty', async () => {
      mockExecute.mockReturnValueOnce({ rows: { _array: [] } });

      const result = await repo.findAll();

      expect(result).toEqual([]);
    });

    it('returns mapped TransactionRecords ordered by cached_at DESC', async () => {
      const row = {
        id: 'txn-001',
        idempotency_key: 'idem-001',
        customer_id: 'cust-001',
        amount: 100,
        currency: 'USD',
        payment_method: 'card',
        status: 'completed',
        description: 'Test',
        failure_reason: null,
        encrypted_payload: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        cached_at: 1700000000000,
      };
      mockExecute.mockReturnValueOnce({ rows: { _array: [row] } });

      const result = await repo.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(row);
    });

    it('uses correct SELECT SQL with ORDER BY cached_at DESC', async () => {
      mockExecute.mockReturnValueOnce({ rows: { _array: [] } });

      await repo.findAll();

      const [sql] = mockExecute.mock.calls[0];
      expect(sql).toContain('SELECT * FROM transactions');
      expect(sql).toContain('ORDER BY cached_at DESC');
    });

    it('handles missing rows gracefully (rows undefined)', async () => {
      mockExecute.mockReturnValueOnce({});

      const result = await repo.findAll();

      expect(result).toEqual([]);
    });

    it('maps description fallback to empty string when null', async () => {
      const row = {
        id: 'txn-002',
        idempotency_key: 'idem-002',
        customer_id: 'cust-002',
        amount: 50,
        currency: 'EUR',
        payment_method: 'bank_transfer',
        status: 'pending',
        description: null,
        failure_reason: null,
        encrypted_payload: null,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        cached_at: 1700000001000,
      };
      mockExecute.mockReturnValueOnce({ rows: { _array: [row] } });

      const result = await repo.findAll();

      expect(result[0].description).toBe('');
    });
  });

  // ── findById──
  describe('findById', () => {
    it('returns null when no row matches the given id', async () => {
      mockExecute.mockReturnValueOnce({ rows: { _array: [] } });

      const result = await repo.findById('non-existent');

      expect(result).toBeNull();
    });

    it('returns the mapped record when a row is found', async () => {
      const row = {
        id: 'txn-001',
        idempotency_key: 'idem-001',
        customer_id: 'cust-001',
        amount: 200,
        currency: 'USD',
        payment_method: 'card',
        status: 'failed',
        description: 'Payment failed',
        failure_reason: 'Insufficient funds',
        encrypted_payload: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T01:00:00Z',
        cached_at: 1700000002000,
      };
      mockExecute.mockReturnValueOnce({ rows: { _array: [row] } });

      const result = await repo.findById('txn-001');

      expect(result).toEqual(row);
    });

    it('queries with the correct SQL and parameterised id', async () => {
      mockExecute.mockReturnValueOnce({ rows: { _array: [] } });

      await repo.findById('txn-abc');

      const [sql, params] = mockExecute.mock.calls[0];
      expect(sql).toContain('WHERE id = ?');
      expect(sql).toContain('LIMIT 1');
      expect(params).toEqual(['txn-abc']);
    });

    it('maps failure_reason correctly when present', async () => {
      const row = {
        ...makeRecord({
          id: 'txn-003',
          status: 'FAILED',
          failure_reason: 'Card declined',
        }),
      };
      mockExecute.mockReturnValueOnce({ rows: { _array: [row] } });

      const result = await repo.findById('txn-003');

      expect(result?.failure_reason).toBe('Card declined');
    });
  });

  // ── replaceAll
  describe('replaceAll', () => {
    it('executes DELETE before upserting new records', async () => {
      const record = makeRecord();

      await repo.replaceAll([record]);

      const firstCall = mockExecute.mock.calls[0][0];
      expect(firstCall).toContain('DELETE FROM transactions');
    });

    it('calls upsertMany with the provided records after DELETE', async () => {
      const records = [
        makeRecord({ id: 'txn-001' }),
        makeRecord({ id: 'txn-002' }),
      ];

      await repo.replaceAll(records);

      // 1 DELETE + 2 INSERT calls
      expect(mockExecute).toHaveBeenCalledTimes(3);
    });

    it('only deletes without inserting when called with an empty array', async () => {
      await repo.replaceAll([]);

      // Only the DELETE should run
      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockExecute.mock.calls[0][0]).toContain(
        'DELETE FROM transactions',
      );
    });
  });

  // ── count──
  describe('count', () => {
    it('returns the count from the database', async () => {
      mockExecute.mockReturnValueOnce({ rows: { _array: [{ total: 42 }] } });

      const result = await repo.count();

      expect(result).toBe(42);
    });

    it('returns 0 when the result row is missing', async () => {
      mockExecute.mockReturnValueOnce({ rows: { _array: [] } });

      const result = await repo.count();

      expect(result).toBe(0);
    });

    it('returns 0 when total field is undefined', async () => {
      mockExecute.mockReturnValueOnce({ rows: { _array: [{}] } });

      const result = await repo.count();

      expect(result).toBe(0);
    });

    it('uses the correct COUNT SQL', async () => {
      mockExecute.mockReturnValueOnce({ rows: { _array: [{ total: 0 }] } });

      await repo.count();

      const [sql] = mockExecute.mock.calls[0];
      expect(sql).toContain('SELECT COUNT(*) as total FROM transactions');
    });
  });

  // ── clear──
  describe('clear', () => {
    it('executes DELETE FROM transactions', async () => {
      await repo.clear();

      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockExecute.mock.calls[0][0]).toContain(
        'DELETE FROM transactions',
      );
    });

    it('calls getDb to obtain the connection', async () => {
      await repo.clear();

      expect(getDb).toHaveBeenCalledTimes(1);
    });
  });
});
