import { expect, Page } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  get firstName() { return this.page.getByTestId('firstName'); }
  get lastName() { return this.page.getByTestId('lastName'); }
  get postalCode() { return this.page.getByTestId('postalCode'); }
  get continueButton() { return this.page.getByTestId('continue'); }
  get finishButton() { return this.page.getByTestId('finish'); }
  get cancelButton() { return this.page.getByTestId('cancel'); }
  get errorMessage() { return this.page.getByTestId('error'); }
  get itemTotal() { return this.page.getByTestId('subtotal-label'); }
  get taxTotal() { return this.page.getByTestId('tax-label'); }
  get orderTotal() { return this.page.getByTestId('total-label'); }

  get itemPrices() { return this.page.getByTestId('inventory-item-price'); }
  get confirmation() { return this.page.getByText('Thank you for your order!'); }
  get backButton() { return this.page.getByTestId('back-to-products'); }
  get downloadButton() { return this.page.getByTestId('generate-pdf-order'); }

  async enterInformation(firstName: string, lastName: string, postalCode: string) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.postalCode.fill(postalCode);
  }

  async fillInformation(firstName: string, lastName: string, postalCode: string) {
    await this.enterInformation(firstName, lastName, postalCode);
    await this.continueButton.click();
  }

  async finish() {
    await this.finishButton.click();
    await expect(this.confirmation).toBeVisible();
  }

  async backToProducts() { await this.backButton.click(); }

  async downloadOrder() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadButton.click()
    ]);
    return download;
  }

  async cancel() { await this.cancelButton.click(); }
}
