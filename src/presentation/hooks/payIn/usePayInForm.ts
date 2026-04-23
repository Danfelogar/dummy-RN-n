import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PAY_IN_STRINGS } from '../../screens';
import { generateUuid, showToast, useInternetStatus } from '../../../shared';
import {
  container,
  useOfflineQueueStore,
  userInformationStorage,
} from '../../../infrastructure';
import { FEE_RATE_FRONTEND, MIN_FEE_FRONTEND } from '@env';

export const feeCalculation = (amount: number): number => {
  const FEE_RATE = FEE_RATE_FRONTEND ?? 0.045;
  const MIN_FEE = MIN_FEE_FRONTEND ?? 0.45;
  return Math.max(amount * FEE_RATE, MIN_FEE);
};
// zod-schema
const buildPayInSchema = (availableBalance: number) =>
  z.object({
    amount: z
      .string()
      .min(1, PAY_IN_STRINGS.VALIDATION_AMOUNT_REQUIRED)
      .refine(v => !isNaN(Number(v)) && Number(v) > 0, {
        message: PAY_IN_STRINGS.VALIDATION_AMOUNT_POSITIVE,
      })
      .refine(
        v => {
          const amount = Number(v);
          const fee = feeCalculation(amount);
          return amount + fee <= availableBalance;
        },
        { message: PAY_IN_STRINGS.VALIDATION_AMOUNT_INSUFFICIENT },
      ),
    customer_id: z
      .string()
      .min(1, PAY_IN_STRINGS.VALIDATION_CUSTOMER_ID_REQUIRED),
    payment_method: z
      .enum(['CARD', 'BANK_TRANSFER', 'CASH'])
      .refine(val => val !== undefined, {
        message: PAY_IN_STRINGS.VALIDATION_PAYMENT_METHOD_REQUIRED,
      }),
    description: z.string().optional(),
  });

export type PayInFormValues = z.infer<ReturnType<typeof buildPayInSchema>>;

export type PayInModalState =
  | { visible: false }
  | { visible: true; status: 'processing' }
  | {
      visible: true;
      status: 'success';
      transactionId: string;
      amount: number;
      date: Date;
    };

export const usePayInForm = () => {
  const availableBalance = userInformationStorage(
    state => state.userDetails.available_balance,
  );
  const { isConnected, isInternetReachable } = useInternetStatus();
  const { enqueue, hasPending } = useOfflineQueueStore();
  const isOnline = isConnected && isInternetReachable;

  const schema = useMemo(
    () => buildPayInSchema(availableBalance),
    [availableBalance],
  );

  const form = useForm<PayInFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: '',
      customer_id: '',
      payment_method: undefined,
      description: '',
    },
  });

  const [modalState, setModalState] = useState<PayInModalState>({
    visible: false,
  });

  const rawAmount = form.watch('amount');
  const parsedAmount = isNaN(Number(rawAmount)) ? 0 : Number(rawAmount);
  const feeEstimate = feeCalculation(parsedAmount);
  const totalCharge = parsedAmount + feeEstimate;

  const onSubmit = useCallback(
    async (values: PayInFormValues) => {
      const amount = Number(values.amount);

      //Offline path
      if (!isOnline) {
        if (hasPending()) {
          showToast({
            type: 'warning',
            title: 'Payment already queued',
            body: "A pending payment will be sent when you're back online.",
          });
          return;
        }

        enqueue({
          idempotencyKey: await generateUuid(),
          dto: {
            customer_id: values.customer_id,
            amount,
            payment_method: values.payment_method,
            description: values.description,
          },
          enqueuedAt: Date.now(),
        });

        showToast({
          type: 'info',
          title: 'Payment queued',
          body: "No internet connection — your payment will be sent automatically when you're back online.",
        });

        form.reset();
        return;
      }

      //Online path
      try {
        setModalState({ visible: true, status: 'processing' });

        const result = await container.createPayIn.execute({
          customer_id: values.customer_id,
          amount,
          payment_method: values.payment_method,
          description: values.description,
        });

        setModalState({
          visible: true,
          status: 'success',
          transactionId: result.payIn.getId(),
          amount,
          date: result.payIn.getCreatedAt(),
        });

        form.reset();
      } catch (err: unknown) {
        setModalState({ visible: false });

        const message =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred. Please try again.';

        showToast({
          type: 'error',
          title: 'Payment failed',
          body: message,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOnline, hasPending, enqueue, form],
  );

  const dismissModal = useCallback(() => {
    setModalState({ visible: false });
  }, []);

  return {
    // state
    form,
    feeEstimate,
    totalCharge,
    availableBalance,
    modalState,
    isOnline,
    // actions
    onSubmit: form.handleSubmit(onSubmit),
    dismissModal,
  };
};
