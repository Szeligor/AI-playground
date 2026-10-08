import { Page, Locator } from '@playwright/test';

export class TrainerToolbar {
  readonly page: Page;
  readonly toolbarContainer: Locator;
  readonly v2BreakingChangesCheckbox: Locator;
  readonly flakyNetworkCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toolbarContainer = page.locator('.trainer-toolbar');
    this.v2BreakingChangesCheckbox = page.getByLabel(/Simulate UI Breaking Changes/i);
    this.flakyNetworkCheckbox = page.getByLabel(/Simulate Flaky Latency/i);
  }

  async toggleV2Mode(enable: boolean): Promise<void> {
    const isChecked = await this.v2BreakingChangesCheckbox.isChecked();
    if (isChecked !== enable) {
      await this.v2BreakingChangesCheckbox.setChecked(enable);
    }
  }

  async toggleFlakyMode(enable: boolean): Promise<void> {
    const isChecked = await this.flakyNetworkCheckbox.isChecked();
    if (isChecked !== enable) {
      await this.flakyNetworkCheckbox.setChecked(enable);
    }
  }
}
