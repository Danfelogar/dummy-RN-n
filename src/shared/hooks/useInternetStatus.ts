import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useState, useEffect, useCallback } from 'react';

export const useInternetStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean>(true);

  const checkConnection = useCallback(async () => {
    const state = await NetInfo.fetch();
    setIsConnected(!!state.isConnected);
    setIsInternetReachable(!!state.isInternetReachable);
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(!!state.isConnected);
      setIsInternetReachable(!!state.isInternetReachable);
    });

    checkConnection();

    return () => unsubscribe();
  }, [checkConnection]);

  return {
    //states
    isConnected,
    isInternetReachable,
    //functions
    checkConnection,
  };
};
