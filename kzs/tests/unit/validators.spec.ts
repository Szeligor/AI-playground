import { test, expect } from '@playwright/test';
import { Validators } from '../../helpers/Validators';
import { FinancialCalculator } from '../../helpers/FinancialCalculator';

/**
 * Validációs és Készletkezelési Unit Tesztek (validators.spec.ts)
 *
 * Lefedett Unit Tesztesetek (UNIT_TEST_CASES.md alapján):
 * - UTC-VAT-01 (Key 19): Német EU VAT Szintaxis (DE)
 * - UTC-VAT-02 (Key 20): Magyar EU VAT Szintaxis (HU)
 * - UTC-VAT-03 (Key 21): Hibás EU VAT Formátum Elutasítás
 * - UTC-VAT-04 (Key 22): EU VAT Adómentesség (0%) Törvény
 * - UTC-CPN-05 (Key 23): Lejárt Kupon Érvénytelenítés
 * - UTC-CPN-06 (Key 24): Ismeretlen Kuponkód Kezelés
 * - UTC-VAL-01 (Key 25): Szabványos E-mail Formátum
 * - UTC-VAL-02 (Key 26): Hibás E-mail Formátum Elutasítás
 * - UTC-VAL-03 (Key 27): Jelszó Házirend Komplexitás
 * - UTC-VAL-04 (Key 28): Egyszerű Jelszó Elutasítás
 * - UTC-VAL-05 (Key 29): PO Szám Hossz & Szintaxis
 * - UTC-VAL-06 (Key 30): Üres vagy Rövid PO Szám Hiba
 * - UTC-INV-01 (Key 31): Raktárkészlet Határvizsgálat
 * - UTC-INV-02 (Key 32): Készlethiány Detektálás
 * - UTC-INV-03 (Key 33): Mennyiség Alsó és Felső Korlát
 * - UTC-UPL-01 (Key 34): Engedélyezett Fájlkiterjesztések
 * - UTC-UPL-02 (Key 35): Tiltott Fájlkiterjesztések
 * - UTC-UPL-03 (Key 36): Fájl Mérethatár Korlát (2 MB)
 */

test.describe('Bemenet Validációs Unit Tesztek (AAA Minta)', () => {

  test('UTC-VAT-01 & 02: Német (DE 9 jegy) és magyar (HU 8 jegy) adószám minta', () => {
    expect(Validators.validateEuVat('DE987654321', 'DE')).toBeTruthy();
    expect(Validators.validateEuVat('HU12345678', 'HU')).toBeTruthy();
  });

  test('UTC-VAT-03: Hibás formátumú vagy hiányzó országkódú adószám elutasítása', () => {
    expect(Validators.validateEuVat('12345678', 'HU')).toBeFalsy();
    expect(Validators.validateEuVat('DE12345', 'DE')).toBeFalsy(); // Túl rövid
    expect(Validators.validateEuVat('', 'DE')).toBeFalsy();
  });

  test('UTC-VAT-04: Érvényes EU adószám esetén az ÁFA kulcs 0%-ra módosul', () => {
    expect(FinancialCalculator.getTaxRate('DE', true)).toBe(0.0);
    expect(FinancialCalculator.getTaxRate('HU', true)).toBe(0.0);
  });

  test('UTC-CPN-05 & 06: Lejárt és ismeretlen kuponkódok elutasítása', () => {
    expect(FinancialCalculator.calculateCouponDiscount(200, 'EXPIRED2025')).toBe(0);
    expect(FinancialCalculator.calculateCouponDiscount(200, 'UNKNOWN99')).toBe(0);
  });

  test('UTC-VAL-01 & 02: Szabványos és hibás formátumú e-mail címek vizsgálata', () => {
    expect(Validators.validateEmail('dan.tester@enterprise.io')).toBeTruthy();
    expect(Validators.validateEmail('tamas.admin@astron.hu')).toBeTruthy();

    expect(Validators.validateEmail('hibas_email_kukac_nelkul')).toBeFalsy();
    expect(Validators.validateEmail('felhasznalo@domain')).toBeFalsy();
    expect(Validators.validateEmail('')).toBeFalsy();
  });

  test('UTC-VAL-03 & 04: Jelszó házirend megfelelőség (kis/nagybetű, szám, speciális)', () => {
    // Érvényes komplex jelszó
    expect(Validators.validatePassword('Titkos123#Secure')).toBeTruthy();

    // Elutasított jelszavak
    expect(Validators.validatePassword('rovid1!')).toBeFalsy(); // < 8 karakter
    expect(Validators.validatePassword('CSAKNAGYBETUK123!')).toBeFalsy(); // nincs kisbetű
    expect(Validators.validatePassword('csak_kisbetuk_123!')).toBeFalsy(); // nincs nagybetű
    expect(Validators.validatePassword('NincsSpecialis123')).toBeFalsy(); // nincs speciális
  });

  test('UTC-VAL-05 & 06: Vállalati PO azonosító hossz és validáció', () => {
    expect(Validators.validatePoNumber('PO-12345')).toBeTruthy();
    expect(Validators.validatePoNumber('PO')).toBeFalsy(); // túl rövid
    expect(Validators.validatePoNumber('')).toBeFalsy();
  });

  test('UTC-INV-01, 02 & 03: Raktárkészlet határellenőrzés', () => {
    const stock = 15;
    expect(Validators.validateInventory(1, stock)).toBeTruthy();
    expect(Validators.validateInventory(15, stock)).toBeTruthy();
    expect(Validators.validateInventory(16, stock)).toBeFalsy(); // Készlethiány
    expect(Validators.validateInventory(0, stock)).toBeFalsy(); // 0 mennyiség tiltott
    expect(Validators.validateInventory(-5, stock)).toBeFalsy(); // Negatív tiltott
  });

  test('UTC-UPL-01, 02 & 03: Fájlfeltöltési kiterjesztés és mérethatár (2 MB)', () => {
    // Engedélyezett formátumok 2 MB alatt
    expect(Validators.validateUploadFile('szerzodes.pdf', 1024 * 1024).valid).toBeTruthy();
    expect(Validators.validateUploadFile('kep.png', 500 * 1024).valid).toBeTruthy();

    // Tiltott kiterjesztések
    expect(Validators.validateUploadFile('program.exe', 1000).valid).toBeFalsy();
    expect(Validators.validateUploadFile('script.bat', 500).valid).toBeFalsy();

    // Mérethatár túllépés (> 2 MB)
    const over2MB = 2 * 1024 * 1024 + 1;
    expect(Validators.validateUploadFile('nagy_dokumentum.pdf', over2MB).valid).toBeFalsy();
  });

});
