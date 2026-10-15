import { test, expect } from '@playwright/test';
import { OrderStateMachine } from '../../helpers/OrderStateMachine';
import { Validators } from '../../helpers/Validators';

/**
 * Állapotgép és Jogosultságkezelési Unit Tesztek (state-machine.spec.ts)
 *
 * Lefedett Unit Tesztesetek (UNIT_TEST_CASES.md alapján):
 * - UTC-STM-01 (Key 13): PENDING -> PAID Állapotátmenet
 * - UTC-STM-02 (Key 14): PENDING -> CANCELLED Állapotátmenet
 * - UTC-STM-03 (Key 15): PAID -> PROVISIONING -> COMPLETED életciklus
 * - UTC-STM-04 (Key 16): CANCELLED Illegális Fizetés Tiltása
 * - UTC-STM-05 (Key 17): REFUNDED Végállapot Zárolás
 * - UTC-RBAC-01 (Key 18): Szerepkör Jogosultsági Mátrix
 *
 * Módszertan: AAA (Arrange - Act - Assert)
 */

test.describe('Állapotgép és RBAC Unit Tesztek (AAA Minta)', () => {

  test('UTC-STM-01: PENDING -> PAID érvényes állapotátmenet', () => {
    // Act & Assert
    expect(OrderStateMachine.canTransition('PENDING', 'PAID')).toBeTruthy();
    const transition = OrderStateMachine.transition('PENDING', 'PAID', 'USER');
    expect(transition.success).toBeTruthy();
    expect(transition.newStatus).toBe('PAID');
  });

  test('UTC-STM-02: PENDING -> CANCELLED érvényes lemondási átmenet', () => {
    expect(OrderStateMachine.canTransition('PENDING', 'CANCELLED')).toBeTruthy();
    const transition = OrderStateMachine.transition('PENDING', 'CANCELLED', 'USER');
    expect(transition.success).toBeTruthy();
    expect(transition.newStatus).toBe('CANCELLED');
  });

  test('UTC-STM-03: Szekvenciális teljes életciklus (PAID -> PROVISIONING -> COMPLETED)', () => {
    // 1. PAID -> PROVISIONING (Admin joggal)
    const step1 = OrderStateMachine.transition('PAID', 'PROVISIONING', 'ADMIN');
    expect(step1.success).toBeTruthy();
    expect(step1.newStatus).toBe('PROVISIONING');

    // 2. PROVISIONING -> COMPLETED
    const step2 = OrderStateMachine.transition('PROVISIONING', 'COMPLETED', 'ADMIN');
    expect(step2.success).toBeTruthy();
    expect(step2.newStatus).toBe('COMPLETED');
  });

  test('UTC-STM-04: CANCELLED státuszból tilos fizetni (illegális átmenet)', () => {
    // Act & Assert
    expect(OrderStateMachine.canTransition('CANCELLED', 'PAID')).toBeFalsy();
    const transition = OrderStateMachine.transition('CANCELLED', 'PAID', 'USER');
    expect(transition.success).toBeFalsy();
    expect(transition.error).toContain('Illegális állapotátmenet');
  });

  test('UTC-STM-05: REFUNDED végállapot zárolt, semmilyen átmenet nem engedélyezett', () => {
    expect(OrderStateMachine.isFinalState('REFUNDED')).toBeTruthy();
    expect(OrderStateMachine.canTransition('REFUNDED', 'PAID')).toBeFalsy();
    expect(OrderStateMachine.canTransition('REFUNDED', 'PENDING')).toBeFalsy();
  });

  test('UTC-RBAC-01: Szerepkör jogosultsági mátrix vizsgálata', () => {
    // Admin mindenhez hozzáfér
    expect(Validators.hasPermission('ADMIN', 'delete')).toBeTruthy();
    expect(Validators.hasPermission('ADMIN', 'refund')).toBeTruthy();

    // User nem törölhet és nem téríthet vissza
    expect(Validators.hasPermission('USER', 'order')).toBeTruthy();
    expect(Validators.hasPermission('USER', 'delete')).toBeFalsy();
    expect(Validators.hasPermission('USER', 'refund')).toBeFalsy();

    // Junior QA nem törölhet, de provision-t végezhet
    expect(Validators.hasPermission('JUNIOR_QA', 'provision')).toBeTruthy();
    expect(Validators.hasPermission('JUNIOR_QA', 'delete')).toBeFalsy();

    // Blocked semmit nem tehet
    expect(Validators.hasPermission('BLOCKED', 'order')).toBeFalsy();
    expect(Validators.hasPermission('BLOCKED', 'cancel')).toBeFalsy();
  });

});
