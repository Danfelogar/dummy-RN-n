import {
  userInformationStorage,
  INIT_USER_INFORMATION_STATE,
} from '../userInformationStorage';

jest.mock('../../mmkvStorage', () => ({
  mmkvAdapter: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

describe('userInformationStorage', () => {
  beforeEach(() => {
    // Reset the store to its initial state before every test to guarantee isolation
    userInformationStorage.setState({
      ...INIT_USER_INFORMATION_STATE,
    });
  });

  describe('initial state', () => {
    it('should have the correct initial state', () => {
      const state = userInformationStorage.getState();
      expect(state.userDetails).toEqual(
        INIT_USER_INFORMATION_STATE.userDetails,
      );
    });

    it('should have available_balance of 99.5 by default', () => {
      const { userDetails } = userInformationStorage.getState();
      expect(userDetails.available_balance).toBe(99.5);
    });
  });

  describe('setAvailableBalance', () => {
    it('should update available_balance without mutating the rest of userDetails', () => {
      const { setAvailableBalance } = userInformationStorage.getState();
      setAvailableBalance(250.75);

      const { userDetails } = userInformationStorage.getState();
      expect(userDetails.available_balance).toBe(250.75);
      expect(userDetails.name).toBe('John Doe');
      expect(userDetails.email).toBe('****oe@example.com');
    });

    it('should accept a balance of 0', () => {
      const { setAvailableBalance } = userInformationStorage.getState();
      setAvailableBalance(0);
      expect(
        userInformationStorage.getState().userDetails.available_balance,
      ).toBe(0);
    });

    it('should accept a negative balance', () => {
      const { setAvailableBalance } = userInformationStorage.getState();
      setAvailableBalance(-50);
      expect(
        userInformationStorage.getState().userDetails.available_balance,
      ).toBe(-50);
    });
  });

  describe('getAllUserInformation', () => {
    it('should return the complete userDetails object', () => {
      const { getAllUserInformation } = userInformationStorage.getState();
      const result = getAllUserInformation();
      expect(result).toEqual(INIT_USER_INFORMATION_STATE.userDetails);
    });

    it('should reflect changes made by setAvailableBalance', () => {
      const { setAvailableBalance, getAllUserInformation } =
        userInformationStorage.getState();

      setAvailableBalance(500);
      const result = getAllUserInformation();
      expect(result.available_balance).toBe(500);
    });
  });

  describe('cleanState', () => {
    it('should restore the initial state after modifications', () => {
      const { setAvailableBalance, cleanState } =
        userInformationStorage.getState();

      setAvailableBalance(9999);
      expect(
        userInformationStorage.getState().userDetails.available_balance,
      ).toBe(9999);

      cleanState();

      const { userDetails } = userInformationStorage.getState();
      expect(userDetails).toEqual(INIT_USER_INFORMATION_STATE.userDetails);
    });

    it('should not affect store action references after clean', () => {
      const { cleanState } = userInformationStorage.getState();
      cleanState();

      const state = userInformationStorage.getState();
      expect(typeof state.setAvailableBalance).toBe('function');
      expect(typeof state.getAllUserInformation).toBe('function');
      expect(typeof state.cleanState).toBe('function');
    });
  });
});
