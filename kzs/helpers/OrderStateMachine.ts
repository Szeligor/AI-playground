/**
 * Megrendelési Állapotgép (OrderStateMachine)
 *
 * Felelősségek:
 * - ERP állapotátmenetek kezelése
 * - Érvényes életciklus biztosítása (PENDING -> PAID -> PROVISIONING -> COMPLETED)
 * - Illegális átmenetek megakadályozása (pl. CANCELLED -> PAID)
 * - Végállapotok zárolása (REFUNDED, COMPLETED)
 * - Szerepkörhöz kötött műveletvalidáció (Refund csak Adminnak)
 */

export type OrderStatus = 'PENDING' | 'PAID' | 'PROVISIONING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type UserRole = 'USER' | 'ADMIN' | 'JUNIOR_QA' | 'BLOCKED';

export class OrderStateMachine {
  // Megengedett állapotátmenetek mátrixa
  private static readonly ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['PAID', 'CANCELLED'],
    PAID: ['PROVISIONING', 'REFUNDED'],
    PROVISIONING: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
    REFUNDED: [],
  };

  /**
   * Ellenőrzi, hogy egy állapotátmenet formailag érvényes-e
   */
  public static canTransition(from: OrderStatus, to: OrderStatus): boolean {
    const allowed = this.ALLOWED_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  /**
   * Állapotátmenet végrehajtása szerepkör-ellenőrzéssel
   */
  public static transition(
    from: OrderStatus,
    to: OrderStatus,
    role: UserRole = 'USER'
  ): { success: boolean; newStatus?: OrderStatus; error?: string } {
    if (role === 'BLOCKED') {
      return { success: false, error: 'A zárolt fiók semmilyen műveletet nem végezhet (403).' };
    }

    if (!this.canTransition(from, to)) {
      return {
        success: false,
        error: `Illegális állapotátmenet: ${from} -> ${to} nem engedélyezett.`,
      };
    }

    // REFUND átmenethez kizárólag ADMIN jogosultság szükséges
    if (to === 'REFUNDED' && role !== 'ADMIN') {
      return {
        success: false,
        error: 'Visszatérítés indítására kizárólag Adminisztrátor jogosult (403 Forbidden).',
      };
    }

    // PROVISIONING átmenethez User nem jogosult, csak Admin vagy Junior QA
    if (to === 'PROVISIONING' && role === 'USER') {
      return {
        success: false,
        error: 'Provision művelethez belső technikai szerepkör szükséges.',
      };
    }

    return { success: true, newStatus: to };
  }

  /**
   * Vizsgálja, hogy az adott állapot zárolt végállapot-e
   */
  public static isFinalState(status: OrderStatus): boolean {
    return status === 'COMPLETED' || status === 'CANCELLED' || status === 'REFUNDED';
  }
}
