import { describe, it, expect, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/store/userStore';
import { refreshToken } from '@/api/user';

vi.mock('@/api/user', () => ({
  refreshToken: vi.fn(),
}));

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('logs in a user', async () => {
    const userStore = useUserStore();
    userStore.login({ username: 'test', password: '123' });
    expect(userStore.token).toBeTruthy();
  });

  it('handles token refresh', async () => {
    const userStore = useUserStore();
    refreshToken.mockResolvedValueOnce({ token: 'new-token' });
    await userStore.handleTokenRefresh();
    expect(userStore.token).toBe('new-token');
  });

  it('shows session expired dialog if token refresh fails', async () => {
    const userStore = useUserStore();
    refreshToken.mockRejectedValueOnce(new Error('Refresh failed'));
    await userStore.handleTokenRefresh();
    expect(userStore.isSessionExpired).toBe(true);
  });
});
