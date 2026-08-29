import { test } from '../fixtures';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Inventory', () => {
  let inventory: InventoryPage;

  test.beforeEach(async ({ page, loggedInPage }) => {
    void loggedInPage;
    inventory = new InventoryPage(page);
  });

  test('user can view inventory', async () => {
    await inventory.expectLoaded();
  });
});
