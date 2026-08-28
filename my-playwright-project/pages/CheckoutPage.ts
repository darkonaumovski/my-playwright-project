import { expect, Page } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  readonly firstName = this.page.getByTestId('firstName');
  readonly lastName = this.page.getByTestId('lastName');
  readonly postalCode = this.page.getByTestId('postalCode');
  readonly continueButton = this.page.getByTestId('continue');
  readonly finishButton = this.page.getByTestId('finish');

  async fillInformation(firstName: string, lastName: string, postalCode: string) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.postalCode.fill(postalCode);
    await this.continueButton.click();
  }

  async finish() {
    await this.finishButton.click();
    await expect(this.page.getByText('Thank you for your order!')).toBeVisible();
  }
}
