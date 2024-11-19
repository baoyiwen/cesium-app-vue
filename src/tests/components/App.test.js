import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import App from '@/App.vue';

describe('App.vue', () => {
  it('shows login dialog when session expires', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { user: { isSessionExpired: true } },
          }),
        ],
      },
    });

    expect(wrapper.find('el-dialog').exists()).toBe(true);
  });
});
