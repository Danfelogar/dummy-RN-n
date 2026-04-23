import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useCallback, useMemo } from 'react';
import { PaymentMethod } from '../../../domain/entities/payIn';
import { PAY_IN_STRINGS } from '../../screens';
import { userInformationStorage } from '../../../infrastructure/storage/mmkv';
import { FEE_RATE_FRONTEND, MIN_FEE_FRONTEND } from '@env';

export const feeCalculation = (amount: number): number => {
  const FEE_RATE = FEE_RATE_FRONTEND ?? 0.045;
  const MIN_FEE = MIN_FEE_FRONTEND ?? 0.45;
  return Math.max(amount * FEE_RATE, MIN_FEE);
};

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
  const { userDetails } = userInformationStorage();
  const availableBalance = userDetails.available_balance;

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

  const onSubmit = useCallback(async (values: PayInFormValues) => {
    try {
      setModalState({ visible: true, status: 'processing' });

      // Simulate async call — replace with real CreatePayInUseCase.execute()
      await new Promise<void>(resolve => setTimeout(resolve, 2000));

      const mockTransactionId = `TXN-${
        Math.floor(Math.random() * 90000000) + 10000000
      }`;

      setModalState({
        visible: true,
        status: 'success',
        transactionId: mockTransactionId,
        amount: Number(values.amount),
        date: new Date(),
      });
    } catch {
      setModalState({ visible: false });
    }
  }, []);

  const dismissModal = useCallback(() => {
    setModalState({ visible: false });
  }, []);

  return {
    //state
    form,
    feeEstimate,
    totalCharge,
    availableBalance,
    modalState,
    //actions
    onSubmit: form.handleSubmit(onSubmit),
    dismissModal,
  };
};
