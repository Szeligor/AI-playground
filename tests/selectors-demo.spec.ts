import { test, expect } from '@playwright/test';

test.describe('Selector & DOM Lab: Törékeny vs. Web-First Szelektorok', () => {

  test.beforeEach(async ({ page }) => {
    // Megnyitjuk a tesztoldalt és átváltunk a Selector Lab fülre
    await page.goto('https://testacademy.hu/qa-lab/e2e-app.html?pass=astron2026');
    await page.getByRole('button', { name: /Selector & DOM Lab/i }).click();
  });

  test('DEMO-01: Törékeny Spagetti Szelektorok (Hogyan NE csináljuk)', async ({ page }) => {
    // 1. Törékeny: input placeholder vagy class alapján (nincs label)
    const fragileInput = page.locator('.inp_dynamic_build_x12');
    await fragileInput.fill('spagetti@astron.hu');

    // 2. Törékeny: nth-child indexelt gomb egy listában
    const secondButton = page.locator('.legacy-btn-row button').nth(1);
    await secondButton.click();

    // 3. Törékeny: dinamikus osztályra épülő gomb (.btn_v49_sub_2x)
    const submitBtn = page.locator('.btn_v49_sub_2x');
    await submitBtn.click();

    // Visszajelzés ellenőrzése
    await expect(page.locator('#fragile-feedback')).toBeVisible();
    await expect(page.locator('#fragile-feedback')).toContainText('Beküldve a törékeny gombbal');
  });

  test('DEMO-02: Golyóálló Web-First Szelektorok (Playwright Standard)', async ({ page }) => {
    // 1. Web-first: getByLabel (szabványos label kapcsolattal)
    await page.getByLabel(/Kapcsolattartó E-mail Cím/i).fill('profi.qa@astron.hu');

    // 2. Web-first: getByLabel select mezőhöz
    await page.getByLabel(/Kiválasztott Modul/i).selectOption('pom');

    // 3. Web-first: getByRole (az aria-label alapján) vagy getByTestId
    const cleanSubmitBtn = page.getByRole('button', { name: 'Rendelés Jóváhagyása' });
    // Vagy alternatíva: const cleanSubmitBtn = page.getByTestId('clean-submit-btn');
    await cleanSubmitBtn.click();

    // Visszajelzés ellenőrzése
    await expect(page.locator('#clean-feedback')).toBeVisible();
    await expect(page.locator('#clean-feedback')).toContainText('Sikeres Web-First beküldés');
  });

});
