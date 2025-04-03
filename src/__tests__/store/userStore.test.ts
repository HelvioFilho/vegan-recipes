import { useUserStore } from '@/store/userStore';

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({ userId: null });
  });

  it('should initialize with userId as null', () => {
    const { userId } = useUserStore.getState();
    expect(userId).toBeNull();
  });

  it('should update userId to "123" when setUserId is called', () => {
    useUserStore.getState().setUserId('123');
    expect(useUserStore.getState().userId).toBe('123');
  });
});
