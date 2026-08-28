import { test } from '../fixtures';
import { InventoryPage } from '../pages/InventoryPage';

test('user can view inventory', async ({ page, loggedInPage }) => {
  void loggedInPage;
  const inventory = new InventoryPage(page);
  await inventory.expectLoaded();
});
