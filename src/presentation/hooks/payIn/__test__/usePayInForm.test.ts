// src/presentation/hooks/payIn/__test__/usePayInForm.test.ts

import { renderHook, act } from '@testing-library/react-native';

//PAY_IN_STRINGS
jest.mock('../../../screens/payIn/payIn.string', () => ({
  PAY_IN_STRINGS: {
    VALIDATION_AMOUNT_REQUIRED: 'Amount is required',
    VALIDATION_AMOUNT_POSITIVE: 'Amount must be positive',
    VALIDATION_AMOUNT_INSUFFICIENT: 'Insufficient balance',
    VALIDATION_CUSTOMER_ID_REQUIRED: 'Customer ID is required',
    VALIDATION_PAYMENT_METHOD_REQUIRED: 'Payment method is required',
  },
}));

//screens barrel
jest.mock('../../../screens', () => ({
  PAY_IN_STRINGS: {
    VALIDATION_AMOUNT_REQUIRED: 'Amount is required',
    VALIDATION_AMOUNT_POSITIVE: 'Amount must be positive',
    VALIDATION_AMOUNT_INSUFFICIENT: 'Insufficient balance',
    VALIDATION_CUSTOMER_ID_REQUIRED: 'Customer ID is required',
    VALIDATION_PAYMENT_METHOD_REQUIRED: 'Payment method is required',
  },
}));

//shared
const mockShowToast = jest.fn();
const mockGenerateUuid = jest.fn(() => Promise.resolve('uuid-1234'));

jest.mock('../../../../shared', () => ({
  generateUuid: () => mockGenerateUuid(),
  showToast: (...args: any[]) => mockShowToast(...args),
  useInternetStatus: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
  })),
}));

//infrastructure
const mockExecute = jest.fn();
const mockEnqueue = jest.fn();
const mockHasPending = jest.fn(() => false);
const mockUserInfo = jest.fn((selector: (s: any) => any) =>
  selector({ userDetails: { available_balance: 10000 } }),
);

jest.mock('../../../../infrastructure', () => ({
  container: {
    createPayIn: { execute: (...args: any[]) => mockExecute(...args) },
  },
  useOfflineQueueStore: jest.fn(() => ({
    enqueue: mockEnqueue,
    hasPending: mockHasPending,
  })),
  userInformationStorage: (selector: (s: any) => any) => mockUserInfo(selector),
}));

//@react-navigation/native
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

//@react-navigation/bottom-tabs
jest.mock('@react-navigation/bottom-tabs', () => ({}));

//import hook under test
import { usePayInForm, feeCalculation } from '../usePayInForm';

//helpers
const fillValidForm = async (result: any) => {
  await act(async () => {
    result.current.form.setValue('amount', '100');
    result.current.form.setValue('customer_id', 'cust-001');
    result.current.form.setValue('payment_method', 'CARD');
  });
};

//Tests
describe('feeCalculation', () => {
  it('applies FEE_RATE when result exceeds MIN_FEE', () => {
    expect(feeCalculation(100)).toBeCloseTo(3.5);
  });

  it('returns MIN_FEE when amount * rate is below minimum', () => {
    expect(feeCalculation(1)).toBeCloseTo(0.35);
  });

  it('returns MIN_FEE for zero amount', () => {
    expect(feeCalculation(0)).toBeCloseTo(0.35);
  });

  it('scales correctly for large amounts', () => {
    expect(feeCalculation(1000)).toBeCloseTo(35);
  });
});

describe('usePayInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasPending.mockReturnValue(false);
    mockUserInfo.mockImplementation((selector: (s: any) => any) =>
      selector({ userDetails: { available_balance: 10000 } }),
    );
  });

  //  initial state
  describe('initial state', () => {
    it('initialises modalState as not visible', () => {
      const { result } = renderHook(() => usePayInForm());
      expect(result.current.modalState.visible).toBe(false);
    });

    it('initialises feeEstimate using MIN_FEE when amount is empty', () => {
      const { result } = renderHook(() => usePayInForm());
      expect(result.current.feeEstimate).toBeCloseTo(0.35);
    });

    it('initialises totalCharge equal to feeEstimate when amount is empty', () => {
      const { result } = renderHook(() => usePayInForm());
      expect(result.current.totalCharge).toBeCloseTo(
        result.current.feeEstimate,
      );
    });

    it('exposes availableBalance from storage', () => {
      const { result } = renderHook(() => usePayInForm());
      expect(result.current.availableBalance).toBe(10000);
    });

    it('reflects isOnline true when connected and reachable', () => {
      const { result } = renderHook(() => usePayInForm());
      expect(result.current.isOnline).toBe(true);
    });
  });

  //  feeEstimate reactivity
  describe('feeEstimate and totalCharge reactivity', () => {
    it('recalculates feeEstimate when amount changes', async () => {
      const { result } = renderHook(() => usePayInForm());
      await act(async () => {
        result.current.form.setValue('amount', '200');
      });
      expect(result.current.feeEstimate).toBeCloseTo(7.0);
    });

    it('recalculates totalCharge as amount + fee', async () => {
      const { result } = renderHook(() => usePayInForm());
      await act(async () => {
        result.current.form.setValue('amount', '200');
      });
      expect(result.current.totalCharge).toBeCloseTo(207);
    });

    it('uses MIN_FEE for small amounts', async () => {
      const { result } = renderHook(() => usePayInForm());
      await act(async () => {
        result.current.form.setValue('amount', '5');
      });
      expect(result.current.feeEstimate).toBeCloseTo(0.35);
    });

    it('treats non-numeric amount as 0', async () => {
      const { result } = renderHook(() => usePayInForm());
      await act(async () => {
        result.current.form.setValue('amount', 'abc');
      });
      expect(result.current.feeEstimate).toBeCloseTo(0.35);
    });
  });

  //  online submission
  describe('onSubmit — online path', () => {
    it('sets modalState to processing then success on happy path', async () => {
      mockExecute.mockResolvedValueOnce({
        payIn: {
          getId: () => 'txn-abc',
          getCreatedAt: () => new Date('2024-01-01'),
        },
      });

      const { result } = renderHook(() => usePayInForm());
      await fillValidForm(result);

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(result.current.modalState).toMatchObject({
        visible: true,
        status: 'success',
        transactionId: 'txn-abc',
        amount: 100,
      });
    });

    it('resets form after successful submission', async () => {
      mockExecute.mockResolvedValueOnce({
        payIn: {
          getId: () => 'txn-abc',
          getCreatedAt: () => new Date(),
        },
      });

      const { result } = renderHook(() => usePayInForm());
      await fillValidForm(result);

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(result.current.form.getValues('amount')).toBe('');
    });

    it('sets modalState to not visible and calls showToast on error', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => usePayInForm());
      await fillValidForm(result);

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(result.current.modalState.visible).toBe(false);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' }),
      );
    });

    it('passes error message to showToast when error is an Error instance', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Payment declined'));

      const { result } = renderHook(() => usePayInForm());
      await fillValidForm(result);

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ body: 'Payment declined' }),
      );
    });

    it('passes generic message to showToast when error is not an Error instance', async () => {
      mockExecute.mockRejectedValueOnce('unknown error');

      const { result } = renderHook(() => usePayInForm());
      await fillValidForm(result);

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'An unexpected error occurred. Please try again.',
        }),
      );
    });
  });

  //  offline submission
  describe('onSubmit — offline path', () => {
    beforeEach(() => {
      const { useInternetStatus } = require('../../../../shared');
      (useInternetStatus as jest.Mock).mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
      });
    });

    it('enqueues the payment when offline and no pending', async () => {
      const { result } = renderHook(() => usePayInForm());
      await fillValidForm(result);

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          dto: expect.objectContaining({
            customer_id: 'cust-001',
            amount: 100,
            payment_method: 'CARD',
          }),
        }),
      );
    });

    it('shows info toast after enqueuing', async () => {
      const { result } = renderHook(() => usePayInForm());
      await fillValidForm(result);

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'info' }),
      );
    });

    it('resets form after enqueuing', async () => {
      const { result } = renderHook(() => usePayInForm());
      await fillValidForm(result);

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(result.current.form.getValues('amount')).toBe('');
    });

    it('shows warning toast and skips enqueue when already has pending', async () => {
      mockHasPending.mockReturnValue(true);

      const { result } = renderHook(() => usePayInForm());
      await fillValidForm(result);

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockEnqueue).not.toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'warning' }),
      );
    });

    it('does not call container.createPayIn when offline', async () => {
      const { result } = renderHook(() => usePayInForm());
      await fillValidForm(result);

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockExecute).not.toHaveBeenCalled();
    });
  });

  //  dismissModal
  describe('dismissModal', () => {
    it('sets modalState visible to false', async () => {
      mockExecute.mockResolvedValueOnce({
        payIn: { getId: () => 'txn-1', getCreatedAt: () => new Date() },
      });

      const { result } = renderHook(() => usePayInForm());
      await fillValidForm(result);

      await act(async () => {
        await result.current.onSubmit();
      });

      act(() => {
        result.current.dismissModal();
      });

      expect(result.current.modalState.visible).toBe(false);
    });

    it('navigates to Home after dismissing', async () => {
      const { result } = renderHook(() => usePayInForm());

      act(() => {
        result.current.dismissModal();
      });

      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
  });

  //  form validation
  describe('form validation', () => {
    it('does not submit when amount is empty', async () => {
      const { result } = renderHook(() => usePayInForm());

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockExecute).not.toHaveBeenCalled();
    });

    it('does not submit when customer_id is missing', async () => {
      const { result } = renderHook(() => usePayInForm());

      await act(async () => {
        result.current.form.setValue('amount', '100');
        result.current.form.setValue('payment_method', 'CARD');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockExecute).not.toHaveBeenCalled();
    });

    it('does not submit when amount exceeds available balance + fee', async () => {
      mockUserInfo.mockImplementation((selector: (s: any) => any) =>
        selector({ userDetails: { available_balance: 50 } }),
      );

      const { result } = renderHook(() => usePayInForm());

      await act(async () => {
        result.current.form.setValue('amount', '100');
        result.current.form.setValue('customer_id', 'cust-001');
        result.current.form.setValue('payment_method', 'CARD');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(mockExecute).not.toHaveBeenCalled();
    });
  });
});
