import { renderHook, act } from '@testing-library/react-native';

import { useInternetStatus } from '../useInternetStatus';

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(),
    addEventListener: jest.fn(),
  },
}));

// Helpers
const buildNetInfoState = (
  isConnected: boolean | null,
  isInternetReachable: boolean | null,
) => ({ isConnected, isInternetReachable });

// Utility: render the hook and wait for all async effects to settle
const renderAndSettle = async () => {
  const utils = renderHook(() => useInternetStatus());
  await act(async () => {});
  return utils;
};

describe('useInternetStatus', () => {
  let capturedListener:
    | ((state: ReturnType<typeof buildNetInfoState>) => void)
    | null;
  let mockUnsubscribe: jest.Mock;
  let NetInfo: { fetch: jest.Mock; addEventListener: jest.Mock };

  beforeEach(() => {
    NetInfo = require('@react-native-community/netinfo').default;

    capturedListener = null;
    mockUnsubscribe = jest.fn();

    NetInfo.fetch.mockResolvedValue(buildNetInfoState(true, true));

    NetInfo.addEventListener.mockImplementation(
      (listener: (state: ReturnType<typeof buildNetInfoState>) => void) => {
        capturedListener = listener;
        return mockUnsubscribe;
      },
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with isConnected and isInternetReachable as true', () => {
      const { result } = renderHook(() => useInternetStatus());

      expect(result.current.isConnected).toBe(true);
      expect(result.current.isInternetReachable).toBe(true);
    });

    it('should expose checkConnection as a function', () => {
      const { result } = renderHook(() => useInternetStatus());

      expect(typeof result.current.checkConnection).toBe('function');
    });
  });

  describe('NetInfo.fetch on mount', () => {
    it('should call NetInfo.fetch once when the hook mounts', async () => {
      const { result } = renderHook(() => useInternetStatus());
      await act(async () => {});

      expect(NetInfo.fetch).toHaveBeenCalledTimes(1);
      expect(result.current).toBeDefined();
    });

    it('should set isConnected to false when fetch returns disconnected', async () => {
      NetInfo.fetch.mockResolvedValue(buildNetInfoState(false, false));

      const { result } = await renderAndSettle();

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isInternetReachable).toBe(false);
    });

    it('should coerce null values to false', async () => {
      NetInfo.fetch.mockResolvedValue(buildNetInfoState(null, null));

      const { result } = await renderAndSettle();

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isInternetReachable).toBe(false);
    });
  });

  describe('NetInfo.addEventListener', () => {
    it('should register exactly one listener on mount', async () => {
      await renderAndSettle();

      expect(NetInfo.addEventListener).toHaveBeenCalledTimes(1);
    });

    it('should update state when the listener fires a disconnected event', async () => {
      const { result } = await renderAndSettle();

      await act(async () => {
        capturedListener!(buildNetInfoState(false, false));
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isInternetReachable).toBe(false);
    });

    it('should update state when the listener fires a reconnected event', async () => {
      NetInfo.fetch.mockResolvedValue(buildNetInfoState(false, false));

      const { result } = await renderAndSettle();

      await act(async () => {
        capturedListener!(buildNetInfoState(true, true));
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.isInternetReachable).toBe(true);
    });

    it('should reflect isInternetReachable false independently of isConnected', async () => {
      const { result } = await renderAndSettle();

      await act(async () => {
        capturedListener!(buildNetInfoState(true, false));
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.isInternetReachable).toBe(false);
    });
  });

  describe('checkConnection', () => {
    it('should call NetInfo.fetch when invoked manually', async () => {
      const { result } = await renderAndSettle();

      await act(async () => {
        await result.current.checkConnection();
      });

      expect(NetInfo.fetch).toHaveBeenCalledTimes(2);
    });

    it('should update state with the result of the manual fetch', async () => {
      NetInfo.fetch
        .mockResolvedValueOnce(buildNetInfoState(true, true))
        .mockResolvedValueOnce(buildNetInfoState(false, false));

      const { result } = await renderAndSettle();

      await act(async () => {
        await result.current.checkConnection();
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isInternetReachable).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should call unsubscribe when the hook unmounts', async () => {
      const { unmount } = await renderAndSettle();

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
