/**
 * Pénzügyi és Adózási Domén Segédosztály (FinancialCalculator)
 *
 * Felelősségek:
 * - Valutaváltás (USD, EUR 0.92x, HUF 395x)
 * - Országspecifikus ÁFA számítás (US 0%, DE 19%, HU 27%)
 * - EU VAT Reverse Charge adómentesség (0%)
 * - Kuponkedvezmények számítása és sorrendisége (AIWS25 25%, SAVE50 $50)
 * - IEEE 754 lebegőpontos kerekítési hibák kizárása
 */

export type Currency = 'USD' | 'EUR' | 'HUF';
export type CountryCode = 'US' | 'DE' | 'HU';

export interface CartCalculationResult {
  baseAmount: number;
  discount: number;
  netTotal: number;
  taxRate: number;
  taxAmount: number;
  grossTotal: number;
  currency: Currency;
}

export class FinancialCalculator {
  // Árfolyamszorzók USD bázishoz képest
  private static readonly RATES: Record<Currency, number> = {
    USD: 1.0,
    EUR: 0.92,
    HUF: 395.0,
  };

  // Országos ÁFA kulcsok
  private static readonly TAX_RATES: Record<CountryCode, number> = {
    US: 0.0,
    DE: 0.19,
    HU: 0.27,
  };

  /**
   * Pénznem konverzió pontos kerekítéssel:
   * USD: 2 tizedesjegy
   * EUR: 2 tizedesjegy
   * HUF: egész forint
   */
  public static convertCurrency(amountInUSD: number, targetCurrency: Currency): number {
    const rate = this.RATES[targetCurrency];
    const converted = amountInUSD * rate;

    if (targetCurrency === 'HUF') {
      return Math.round(converted);
    }
    // Lebegőpontos kerekítés 2 tizedesre epsilon hozzáadásával
    return Math.round((converted + Number.EPSILON) * 100) / 100;
  }

  /**
   * Adókulcs lekérése az ország és EU VAT adómentesség alapján
   */
  public static getTaxRate(country: CountryCode, isVatExempt: boolean = false): number {
    if (isVatExempt) {
      return 0.0;
    }
    return this.TAX_RATES[country] ?? 0.0;
  }

  /**
   * Kupon kedvezmény kiszámítása a nettó alapból
   */
  public static calculateCouponDiscount(netAmount: number, couponCode?: string): number {
    if (!couponCode) return 0;
    const cleanCode = couponCode.trim().toUpperCase();

    if (cleanCode === 'AIWS25') {
      // 25% kedvezmény
      return Math.round((netAmount * 0.25 + Number.EPSILON) * 100) / 100;
    }

    if (cleanCode === 'SAVE50') {
      // $50 levonás csak $200 vagy afeletti kosárnál
      return netAmount >= 200 ? 50 : 0;
    }

    // Lejárt (EXPIRED2025) vagy ismeretlen kupon nem ad kedvezményt
    return 0;
  }

  /**
   * Teljes kosár kalkuláció pontos sorrendiséggel:
   * 1. Kedvezmény levonása a nettó alapból
   * 2. ÁFA számítása a kedvezményes nettó összegre
   * 3. Bruttó végösszeg = Kedvezményes nettó + ÁFA
   */
  public static calculateCart(
    itemPriceUSD: number,
    quantity: number,
    country: CountryCode,
    currency: Currency = 'USD',
    couponCode?: string,
    isVatExempt: boolean = false
  ): CartCalculationResult {
    const rawBaseUSD = itemPriceUSD * quantity;
    const baseInTarget = this.convertCurrency(rawBaseUSD, currency);

    // 1. Kupon levonása
    const discount = this.calculateCouponDiscount(baseInTarget, couponCode);
    const netTotal = Math.max(0, baseInTarget - discount);

    // 2. Adószámítás
    const taxRate = this.getTaxRate(country, isVatExempt);
    const taxAmount = currency === 'HUF'
      ? Math.round(netTotal * taxRate)
      : Math.round((netTotal * taxRate + Number.EPSILON) * 100) / 100;

    // 3. Bruttó végösszeg
    const grossTotal = netTotal + taxAmount;

    return {
      baseAmount: baseInTarget,
      discount,
      netTotal,
      taxRate,
      taxAmount,
      grossTotal,
      currency,
    };
  }
}
