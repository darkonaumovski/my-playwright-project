import { authenticatedTest as test } from '../fixtures';

test.describe('Inventory', () => {
  test('user can view inventory', async ({ inventory }) => {
    await inventory.expectLoaded();
  });
});
