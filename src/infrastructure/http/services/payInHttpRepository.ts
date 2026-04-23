import { AxiosInstance, AxiosResponse } from 'axios';
import { CryptoService } from './CryptoService';
import { IPayInRepository, ListPayInsParams } from '../../../application';
import { CreatePayInDTO, PayIn, PayinDTO, PayInMapper } from '../../../domain';

interface BackendEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export class PayInHttpRepository implements IPayInRepository {
  private readonly cryptoService: CryptoService;

  constructor(private readonly client: AxiosInstance) {
    this.cryptoService = new CryptoService();
  }
  // POST /pay-ins
  async create(dto: CreatePayInDTO, idempotencyKey: string): Promise<PayIn> {
    // Encrypt the sensitive payload before sending
    const encryptedPayload = await this.cryptoService.encryptPayload({
      customer_id: dto.customer_id,
      amount: dto.amount,
      payment_method: dto.payment_method,
      description: dto.description,
    });

    const body = {
      ...dto,
      encrypted_payload: encryptedPayload,
    };

    const response: AxiosResponse<BackendEnvelope<PayinDTO>> =
      await this.client.post('/pay-ins', body, {
        headers: {
          'Idempotency-Key': idempotencyKey,
          'x-operation-name': 'CreatePayIn',
        },
      });

    return PayInMapper.toDomain(response.data.data);
  }
  // GET /pay-ins
  async findAll(params: ListPayInsParams = {}): Promise<PayIn[]> {
    const response: AxiosResponse<BackendEnvelope<PayinDTO[]>> =
      await this.client.get('/pay-ins', {
        params,
        headers: { 'x-operation-name': 'ListPayIns' },
      });

    return response.data.data.map(PayInMapper.toDomain);
  }
  // GET /pay-ins/:id
  async findById(id: string): Promise<PayIn | null> {
    try {
      const response: AxiosResponse<BackendEnvelope<PayinDTO>> =
        await this.client.get(`/pay-ins/${id}`, {
          headers: { 'x-operation-name': 'GetPayIn' },
        });

      return PayInMapper.toDomain(response.data.data);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
