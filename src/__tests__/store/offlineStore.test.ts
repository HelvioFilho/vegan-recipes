import { useOfflineStore } from '@/store/offlineStore';

describe('useOfflineStore', () => {
  beforeEach(() => {
    useOfflineStore.setState({ isOffline: false });
  });

  it('has an initial state with isOffline = false', () => {
    const { isOffline } = useOfflineStore.getState();
    expect(isOffline).toBe(false);
  });

  it('setIsOffline(true) updates isOffline to true', () => {
    useOfflineStore.getState().setIsOffline(true);
    expect(useOfflineStore.getState().isOffline).toBe(true);
  });

  it('setIsOffline(false) updates isOffline to false', () => {
    useOfflineStore.getState().setIsOffline(true);
    expect(useOfflineStore.getState().isOffline).toBe(true);

    useOfflineStore.getState().setIsOffline(false);
    expect(useOfflineStore.getState().isOffline).toBe(false);
  });
});
