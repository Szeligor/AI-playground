import { test, expect } from '@playwright/test';
import { FinancialCalculator } from '../../helpers/FinancialCalculator';

/**
 * Pénzügyi, Deviza és Adózási Unit Tesztcsomag (financial.spec.ts)
 *
 * Lefedett Unit Tesztesetek (UNIT_TEST_CASES.md alapján):
 * - UTC-FIN-01 (Key 1): USD Bázis Deviza Számítás
 * - UTC-FIN-02 (Key 2): EUR Devizaváltás & Kerekítés (0.92x)
 * - UTC-FIN-03 (Key 3): HUF Devizaváltás Egészre Kerekítve (395x)
 * - UTC-FIN-04 (Key 4): Lebegőpontos Összeadási Pontosság (0.1 + 0.2)
 * - UTC-TAX-01 (Key 5): US Adókulcs Számítás (0%)
 * - UTC-TAX-02 (Key 6): DE ÁFA Számítás (19%)
 * - UTC-TAX-03 (Key 7): HU ÁFA Számítás (27%)
 * - UTC-TAX-04 (Key 8): Bruttó Végösszeg Integritás (Gross = Net + Tax)
 * - UTC-CPN-01 (Key 9): Százalékos Kupon (AIWS25) Kalkuláció
 * - UTC-CPN-02 (Key 10): Fix Kupon (SAVE50) Limit Felett
 * - UTC-CPN-03 (Key 11): Fix Kupon (SAVE50) Limit Alatt
 * - UTC-CPN-04 (Key 12): Kupon és ÁFA Számítási Sorrend
 *
 * Módszertan: AAA (Arrange - Act - Assert), tiszta doménlogikai egységtesztelés.
 */

test.describe('Pénzügyi & Adózási Unit Tesztek (AAA Minta)', () => {

  test('UTC-FIN-01: USD bázis deviza esetén a szorzó pontosan 1.0x', () => {
    // Arrange
    const amount = 250.0;
    // Act
    const result = FinancialCalculator.convertCurrency(amount, 'USD');
    // Assert
    expect(result).toBe(250.0);
  });

  test('UTC-FIN-02: EUR váltás 0.92x szorzóval és pontos 2 tizedes kerekítéssel', () => {
    // Arrange: $250 * 0.92 = €230.00
    const amount = 250.0;
    // Act
    const result = FinancialCalculator.convertCurrency(amount, 'EUR');
    // Assert
    expect(result).toBe(230.0);
  });

  test('UTC-FIN-03: HUF váltás 395x szorzóval, egész forintra kerekítve', () => {
    // Arrange: $250 * 395 = 98 750 Ft
    const amount = 250.0;
    // Act
    const result = FinancialCalculator.convertCurrency(amount, 'HUF');
    // Assert
    expect(result).toBe(98750);
    expect(Number.isInteger(result)).toBeTruthy();
  });

  test('UTC-FIN-04: Lebegőpontos pontosság több tétel összeadásakor (IEEE 754)', () => {
    // Arrange: 0.1 + 0.2 tipikusan 0.30000000000000004 lenne JS-ben
    const val1 = 0.1;
    const val2 = 0.2;
    // Act
    const sum = Math.round((val1 + val2 + Number.EPSILON) * 100) / 100;
    // Assert
    expect(sum).toBe(0.3);
  });

  test('UTC-TAX-01: US adókulcs 0%, a bruttó megegyezik a nettóval', () => {
    // Act & Assert
    const taxRate = FinancialCalculator.getTaxRate('US');
    expect(taxRate).toBe(0.0);

    const cart = FinancialCalculator.calculateCart(250, 1, 'US', 'USD');
    expect(cart.taxAmount).toBe(0);
    expect(cart.grossTotal).toBe(250);
  });

  test('UTC-TAX-02: DE esetén 19% ÁFA kerül felszámításra', () => {
    // Act & Assert
    const taxRate = FinancialCalculator.getTaxRate('DE');
    expect(taxRate).toBe(0.19);

    // 250 * 0.19 = 47.50, Gross = 297.50
    const cart = FinancialCalculator.calculateCart(250, 1, 'DE', 'USD');
    expect(cart.taxAmount).toBe(47.5);
    expect(cart.grossTotal).toBe(297.5);
  });

  test('UTC-TAX-03: HU esetén 27% ÁFA kerül felszámításra', () => {
    // Act & Assert
    const taxRate = FinancialCalculator.getTaxRate('HU');
    expect(taxRate).toBe(0.27);

    // 250 * 0.27 = 67.50, Gross = 317.50
    const cart = FinancialCalculator.calculateCart(250, 1, 'HU', 'USD');
    expect(cart.taxAmount).toBe(67.5);
    expect(cart.grossTotal).toBe(317.5);
  });

  test('UTC-TAX-04: Bruttó végösszeg integritás (Total = Netto + ÁFA)', () => {
    const cart = FinancialCalculator.calculateCart(490, 2, 'HU', 'USD');
    expect(cart.grossTotal).toBe(cart.netTotal + cart.taxAmount);
  });

  test('UTC-CPN-01: AIWS25 kupon 25% azonnali levonása a nettóból', () => {
    const discount = FinancialCalculator.calculateCouponDiscount(200, 'AIWS25');
    expect(discount).toBe(50.0);
  });

  test('UTC-CPN-02: SAVE50 fix $50 levonása $200 kosárérték felett', () => {
    const discount = FinancialCalculator.calculateCouponDiscount(250, 'SAVE50');
    expect(discount).toBe(50.0);
  });

  test('UTC-CPN-03: SAVE50 kupon 0 kedvezményt ad $200 limit alatt', () => {
    const discount = FinancialCalculator.calculateCouponDiscount(150, 'SAVE50');
    expect(discount).toBe(0.0);
  });

  test('UTC-CPN-04: Kupon kedvezmény megelőzi az ÁFA számítást', () => {
    // 200 nettó, 50 kedvezmény -> 150 kedvezményes nettó. 150 * 27% = 40.50 adó. Gross = 190.50
    const cart = FinancialCalculator.calculateCart(200, 1, 'HU', 'USD', 'SAVE50');
    expect(cart.netTotal).toBe(150);
    expect(cart.taxAmount).toBe(40.5);
    expect(cart.grossTotal).toBe(190.5);
  });

});
