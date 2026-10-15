import { test, expect } from '@playwright/test';
import { Formatters } from '../../helpers/Formatters';

/**
 * Szöveg- és CSV Formázási Unit Tesztek (formatters.spec.ts)
 *
 * Lefedett Unit Tesztesetek (UNIT_TEST_CASES.md alapján):
 * - UTC-FMT-01 (Key 37): Pénznem Formázás - USD ($)
 * - UTC-FMT-02 (Key 38): Pénznem Formázás - EUR (€)
 * - UTC-FMT-03 (Key 39): Pénznem Formázás - HUF (Ft)
 * - UTC-CSV-01 (Key 40): CSV Sor Generálás & Idézőjel Escape
 *
 * Módszertan: AAA (Arrange - Act - Assert)
 */

test.describe('Formázó Unit Tesztek (AAA Minta)', () => {

  test('UTC-FMT-01: USD deviza formázása dollárjellel és 2 tizedesjeggyel', () => {
    const formatted = Formatters.formatCurrency(250, 'USD');
    expect(formatted).toBe('$250.00');
  });

  test('UTC-FMT-02: EUR deviza formázása euró jellel és 2 tizedesjeggyel', () => {
    const formatted = Formatters.formatCurrency(230, 'EUR');
    expect(formatted).toBe('230.00 €');
  });

  test('UTC-FMT-03: HUF deviza formázása ezres tagolással és Ft utótaggal', () => {
    const formatted = Formatters.formatCurrency(98750, 'HUF');
    expect(formatted).toBe('98 750 Ft');
  });

  test('UTC-CSV-01: CSV sor generálás vessző és idézőjel szabályos escape-elésével', () => {
    // Arrange: Vesszőt és idézőjelet tartalmazó mezők
    const fields = [101, 'QA Runner, License', 'Dan "The Tester"', 'PAID'];

    // Act: CSV sor előállítása
    const csvRow = Formatters.toCsvRow(fields);

    // Assert: A vesszős mező idézőjelek közé kerül, az idézőjel duplázódik
    expect(csvRow).toBe('101,"QA Runner, License","Dan ""The Tester""",PAID');
  });

});
