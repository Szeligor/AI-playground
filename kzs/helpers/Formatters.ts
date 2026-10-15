/**
 * Szöveg- és Pénznem Formázó Segédfüggvények (Formatters)
 *
 * Felelősségek:
 * - Valuták formázása helyes szimbólumokkal és tagolással
 * - CSV export sorok generálása és szabályos RFC 4180 escape-elés
 */

export class Formatters {
  /**
   * Pénznem formázása egységes megjelenítéssel
   */
  public static formatCurrency(amount: number, currency: 'USD' | 'EUR' | 'HUF'): string {
    switch (currency) {
      case 'USD':
        return `$${amount.toFixed(2)}`;
      case 'EUR':
        return `${amount.toFixed(2)} €`;
      case 'HUF':
        return `${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft`;
      default:
        return amount.toString();
    }
  }

  /**
   * CSV sor generálása: idézőjellel és idézőjel duplázással escape-eli
   * a vesszőt, sortörést vagy idézőjelet tartalmazó mezőket
   */
  public static toCsvRow(fields: (string | number)[]): string {
    return fields
      .map(field => {
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(',');
  }
}
