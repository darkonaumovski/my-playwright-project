import type { Page } from "@playwright/test";

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  get firstName() {
    return this.page.getByPlaceholder("First Name");
  }

  get lastName() {
    return this.page.getByPlaceholder("Last Name");
  }

  get postalCode() {
    return this.page.getByPlaceholder("Zip/Postal Code");
  }

  get continueButton() {
    return this.page.getByRole("button", { name: "Continue" });
  }

  get finishButton() {
    return this.page.getByRole("button", { name: "Finish" });
  }

  get cancelButton() {
    return this.page.getByRole("button", { name: "Cancel" });
  }

  get errorMessage() {
    return this.page.getByTestId("error");
  }

  get itemTotal() {
    return this.page.getByTestId("subtotal-label");
  }

  get taxTotal() {
    return this.page.getByTestId("tax-label");
  }

  get orderTotal() {
    return this.page.getByTestId("total-label");
  }

  get itemPrices() {
    return this.page.getByTestId("inventory-item-price");
  }

  get confirmation() {
    return this.page.getByText("Thank you for your order!", { exact: true });
  }

  get backButton() {
    return this.page.getByRole("button", { name: "Back Home" });
  }

  get downloadButton() {
    return this.page.getByRole("button", { name: "Generate PDF order" });
  }

  async enterInformation(
    firstName: string,
    lastName: string,
    postalCode: string,
  ): Promise<void> {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.postalCode.fill(postalCode);
  }

  async submitInformation(
    firstName: string,
    lastName: string,
    postalCode: string,
  ): Promise<void> {
    await this.enterInformation(firstName, lastName, postalCode);
    await this.continueButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async backToProducts(): Promise<void> {
    await this.backButton.click();
  }

  async downloadOrder() {
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.downloadButton.click(),
    ]);
    return download;
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
