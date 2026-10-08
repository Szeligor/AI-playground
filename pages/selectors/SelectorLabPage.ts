import { Page, Locator } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { NavbarComponent } from '../common/NavbarComponent';

export type CleanModuleOption = 'pom' | 'api' | 'trace';

export class SelectorLabPage extends BasePage {
  readonly navbar: NavbarComponent;

  // DOM Újragenerálás gomb
  readonly regenerateDomButton: Locator;
  readonly fragileClassBadge: Locator;

  // Törékeny DOM vezérlők (Anti-patterns)
  readonly legacyEmailInput: Locator;
  readonly legacyActionButtons: Locator;
  readonly fragileSubmitButton: Locator;
  readonly fragileFeedback: Locator;

  // Modern Web-First DOM vezérlők (Playwright Standard)
  readonly cleanEmailInput: Locator;
  readonly cleanModuleSelect: Locator;
  readonly cleanSubmitButton: Locator;
  readonly cleanFeedback: Locator;

  constructor(page: Page) {
    super(page);
    this.navbar = new NavbarComponent(page);

    this.regenerateDomButton = page.getByRole('button', { name: /DOM Újragenerálás/i });
    this.fragileClassBadge = page.locator('#fragile-class-badge');

    // Törékeny szelektorok (demo és oktatási célra)
    this.legacyEmailInput = page.locator('#legacy_inp_8392');
    this.legacyActionButtons = page.locator('.legacy-btn-row button');
    this.fragileSubmitButton = page.locator('#fragile-dynamic-btn');
    this.fragileFeedback = page.locator('#fragile-feedback');

    // Web-First golyóálló szelektorok
    this.cleanEmailInput = page.getByLabel(/Kapcsolattartó E-mail Cím/i);
    this.cleanModuleSelect = page.getByLabel(/Kiválasztott Modul/i);
    this.cleanSubmitButton = page.getByRole('button', { name: 'Rendelés Jóváhagyása' });
    this.cleanFeedback = page.locator('#clean-feedback');
  }

  async openLab(): Promise<void> {
    await this.navbar.switchToSelectorLab();
  }

  async fillCleanForm(email: string, moduleValue: CleanModuleOption = 'pom'): Promise<void> {
    await this.cleanEmailInput.fill(email);
    await this.cleanModuleSelect.selectOption(moduleValue);
  }

  async submitCleanForm(): Promise<void> {
    await this.cleanSubmitButton.click();
  }

  async submitCleanOrder(email: string, moduleValue: CleanModuleOption = 'pom'): Promise<void> {
    await this.fillCleanForm(email, moduleValue);
    await this.submitCleanForm();
  }

  async clickLegacyAction(index: number = 0): Promise<void> {
    await this.legacyActionButtons.nth(index).click();
  }

  async submitFragileForm(email: string): Promise<void> {
    await this.legacyEmailInput.fill(email);
    await this.fragileSubmitButton.click();
  }

  async regenerateDom(): Promise<void> {
    await this.regenerateDomButton.click();
  }
}
