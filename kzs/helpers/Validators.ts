/**
 * Bemeneti és Üzleti Szabály Validátorok (Validators)
 *
 * Felelősségek:
 * - RFC formátumú e-mail cím validáció
 * - Jelszó házirend megfelelőség (Password Policy: 8+ karakter, kis/nagybetű, szám, speciális)
 * - Vállalati PO azonosító ellenőrzés (min. 5 karakter)
 * - EU B2B Adószám formátum vizsgálat (DE + 9 számjegy, HU + 8 számjegy)
 * - Raktárkészlet és kosármennyiség korlátok
 * - Fájlfeltöltési kiterjesztés és 2 MB mérethatár ellenőrzés
 * - Szerepkör alapú jogosultság mátrix (RBAC Permission Checker)
 */

export class Validators {
  /**
   * RFC 5322 szabványú e-mail cím validáció
   */
  public static validateEmail(email: string): boolean {
    if (!email || email.trim().length === 0) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Jelszó házirend validáció:
   * - Legalább 8 karakter
   * - Tartalmaz kis- és nagybetűt
   * - Tartalmaz számot
   * - Tartalmaz speciális karaktert (!@#$%^&* stb.)
   */
  public static validatePassword(password: string): boolean {
    if (!password || password.length < 8) return false;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return hasUpper && hasLower && hasNumber && hasSpecial;
  }

  /**
   * Vállalati PO azonosító: legalább 5 karakteres szöveg
   */
  public static validatePoNumber(poNumber: string): boolean {
    return !!poNumber && poNumber.trim().length >= 5;
  }

  /**
   * EU VAT B2B adószám formátum:
   * DE: DE + pontosan 9 számjegy
   * HU: HU + pontosan 8 számjegy
   */
  public static validateEuVat(vatNumber: string, country: 'DE' | 'HU'): boolean {
    if (!vatNumber) return false;
    const cleanVat = vatNumber.trim().toUpperCase();

    if (country === 'DE') {
      return /^DE\d{9}$/.test(cleanVat);
    }
    if (country === 'HU') {
      return /^HU\d{8}$/.test(cleanVat);
    }
    return false;
  }

  /**
   * Készlet és rendelési mennyiség ellenőrzése
   */
  public static validateInventory(quantity: number, currentStock: number): boolean {
    if (quantity <= 0 || !Number.isInteger(quantity)) return false;
    return quantity <= currentStock;
  }

  /**
   * Fájlfeltöltés validáció:
   * - Engedélyezett kiterjesztések: .pdf, .png
   * - Mérethatár: legfeljebb 2 MB (2 * 1024 * 1024 bájt)
   */
  public static validateUploadFile(fileName: string, sizeInBytes: number): { valid: boolean; error?: string } {
    const ext = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
    const allowedExtensions = ['pdf', 'png'];

    if (!allowedExtensions.includes(ext)) {
      return { valid: false, error: `Nem támogatott fájlformátum (.${ext}). Csak .pdf és .png engedélyezett.` };
    }

    const maxBytes = 2 * 1024 * 1024; // 2 MB
    if (sizeInBytes > maxBytes) {
      return { valid: false, error: 'A fájl mérete meghaladja a megengedett 2 MB-os korlátot.' };
    }

    return { valid: true };
  }

  /**
   * RBAC jogosultsági mátrix vizsgálata
   */
  public static hasPermission(
    role: 'USER' | 'ADMIN' | 'JUNIOR_QA' | 'BLOCKED',
    action: 'order' | 'cancel' | 'provision' | 'refund' | 'delete'
  ): boolean {
    if (role === 'BLOCKED') return false;

    switch (action) {
      case 'order':
      case 'cancel':
        return role === 'USER' || role === 'ADMIN' || role === 'JUNIOR_QA';
      case 'provision':
        return role === 'ADMIN' || role === 'JUNIOR_QA';
      case 'refund':
      case 'delete':
        return role === 'ADMIN';
      default:
        return false;
    }
  }
}
