// // payinService.ts
// // ─────────────────────────────────────────────────────────────────────────────
// // Adapter layer: translates raw HTTP ↔ domain PayIn objects.
// // Lives in:  src/infrastructure/http/payinService.ts
// //
// // This is the ONLY file in the frontend that knows the backend URL.
// // Screens and hooks never import axios directly.
// // ─────────────────────────────────────────────────────────────────────────────

// import axios, { AxiosError } from 'axios';
// import { v4 as uuidv4 } from 'uuid'; // react-native-uuid or expo-crypto also works

// // ── Types (mirror the backend snake_case contract) ────────────────────────────

// export type PayInStatus = 'CREATED' | 'VALIDATED' | 'PROCESSED' | 'FAILED';
// export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'CASH';

// export interface PayIn {
//   id: string;
//   idempotency_key: string | null;
//   customer_id: string;
//   amount: number;
//   currency: 'USD';
//   payment_method: PaymentMethod;
//   status: PayInStatus;
//   description: string | null;
//   failure_reason: string | null;
//   encrypted_payload: string | null;
//   created_at: string;
//   updated_at: string;
// }

// export interface CreatePayInDTO {
//   customer_id: string;
//   amount: number;
//   payment_method: PaymentMethod;
//   description?: string;
//   /** AES-GCM blob from your crypto utility — optional but recommended */
//   encrypted_payload?: string;
// }

// // ── Axios instance ────────────────────────────────────────────────────────────

// // Android emulator: 10.0.2.2 maps to host machine localhost
// // iOS simulator / real device on same WiFi: use your machine's local IP
// const BASE_URL = __DEV__
//   ? 'http://10.0.2.2:3001' // Android emulator
//   : 'https://api.tumipay.co'; // production (swap when ready)

// const http = axios.create({
//   baseURL: BASE_URL,
//   timeout: 15_000,
//   headers: { 'Content-Type': 'application/json' },
// });

// // ── Error normalizer ──────────────────────────────────────────────────────────

// export interface ApiError {
//   code: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'SERVER_ERROR';
//   message: string;
//   details?: string[];
// }

// function normalizeError(err: unknown): ApiError {
//   if (axios.isAxiosError(err)) {
//     const e = err as AxiosError<{
//       error: string;
//       message: string;
//       details?: string[];
//     }>;

//     if (!e.response) {
//       return {
//         code: 'NETWORK_ERROR',
//         message: 'No internet connection. Your request has been queued.',
//       };
//     }

//     const { status, data } = e.response;

//     if (status === 422) {
//       return {
//         code: 'VALIDATION_ERROR',
//         message: data?.message ?? 'Validation failed',
//         details: data?.details,
//       };
//     }
//     if (status === 404) {
//       return {
//         code: 'NOT_FOUND',
//         message: data?.message ?? 'Resource not found',
//       };
//     }
//     return {
//       code: 'SERVER_ERROR',
//       message: data?.message ?? 'Unexpected server error',
//     };
//   }
//   return { code: 'SERVER_ERROR', message: 'Unknown error' };
// }

// // ── Service methods ───────────────────────────────────────────────────────────

// /**
//  * POST /pay-ins
//  *
//  * Generates an idempotency key automatically.
//  * Pass the SAME key when retrying a failed/queued request so the backend
//  * returns the original result instead of creating a duplicate.
//  *
//  * Usage:
//  *   const { data, error } = await createPayIn(dto);
//  *   // or with a pre-existing key (offline retry):
//  *   const { data, error } = await createPayIn(dto, savedIdempotencyKey);
//  */
// export async function createPayIn(
//   dto: CreatePayInDTO,
//   idempotencyKey: string = uuidv4(),
// ): Promise<{
//   data: PayIn | null;
//   idempotencyKey: string;
//   error: ApiError | null;
// }> {
//   try {
//     const response = await http.post<{ data: PayIn }>('/pay-ins', dto, {
//       headers: { 'Idempotency-Key': idempotencyKey },
//     });
//     return { data: response.data.data, idempotencyKey, error: null };
//   } catch (err) {
//     return { data: null, idempotencyKey, error: normalizeError(err) };
//   }
// }

// /**
//  * GET /pay-ins/:id
//  *
//  * Poll this endpoint to check current status.
//  * The dummy backend advances status automatically via setTimeout.
//  */
// export async function getPayIn(
//   id: string,
// ): Promise<{ data: PayIn | null; error: ApiError | null }> {
//   try {
//     const response = await http.get<{ data: PayIn }>(`/pay-ins/${id}`);
//     return { data: response.data.data, error: null };
//   } catch (err) {
//     return { data: null, error: normalizeError(err) };
//   }
// }

// /**
//  * GET /pay-ins
//  *
//  * Optional filters: status, customer_id
//  */
// export async function listPayIns(filters?: {
//   status?: PayInStatus;
//   customer_id?: string;
// }): Promise<{ data: PayIn[]; total: number; error: ApiError | null }> {
//   try {
//     const response = await http.get<{ data: PayIn[]; meta: { total: number } }>(
//       '/pay-ins',
//       {
//         params: filters,
//       },
//     );
//     return {
//       data: response.data.data,
//       total: response.data.meta.total,
//       error: null,
//     };
//   } catch (err) {
//     return { data: [], total: 0, error: normalizeError(err) };
//   }
// }

// // ── Quick usage examples (reference only, not executed) ──────────────────────
// //
// // // 1. Create a PayIn (normal flow)
// // const { data, idempotencyKey, error } = await createPayIn({
// //   customer_id: 'cust_john_doe',
// //   amount: 49.99,
// //   payment_method: 'CARD',
// //   description: 'Pro plan subscription',
// // });
// // if (error?.code === 'NETWORK_ERROR') {
// //   offlineQueueStore.enqueue({ dto, idempotencyKey }); // save key for retry
// // }
// //
// // // 2. Retry the same request (idempotent — returns original record)
// // const retry = await createPayIn(dto, idempotencyKey); // same key → no duplicate
// //
// // // 3. Poll for status
// // const { data: txn } = await getPayIn('txn_001a2b3c');
// // console.log(txn?.status); // 'PROCESSED' after ~12 s
// //
// // // 4. List with filter
// // const { data: processed } = await listPayIns({ status: 'PROCESSED' });
