import { Page } from '@playwright/test';

export interface NavigationOptions {
  pass?: string;
  version?: 'v2';
  flaky?: boolean;
  unlocked?: boolean;
}

export class BasePage {
  readonly page: Page;
  readonly baseUrl: string = 'https://testacademy.hu/qa-lab/e2e-app.html';

  constructor(page: Page) {
    this.page = page;
  }

  async goto(options: NavigationOptions = { pass: 'astron2026' }): Promise<void> {
    const params = new URLSearchParams();
    if (options.pass) params.set('pass', options.pass);
    if (options.version) params.set('version', options.version);
    if (options.flaky) params.set('flaky', 'true');
    if (options.unlocked) params.set('unlocked', 'true');

    const queryString = params.toString() ? `?${params.toString()}` : '';
    await this.page.goto(`${this.baseUrl}${queryString}`);
  }
}
