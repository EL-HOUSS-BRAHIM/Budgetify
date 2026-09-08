import { describe, expect, it } from 'vitest';
import { formatMoney, formatMoneyAmount, formatMoneyForSpeech } from './format';
import { money } from './money';

/**
 * The legacy web app formatted with:
 *   new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
 * These cases lock that behaviour in so the port cannot drift.
 */
const legacyFormat = (amount: number, currency: string): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

describe('formatMoney parity with the legacy formatCurrency', () => {
  it.each([
    [123456, 'USD', 1234.56],
    [0, 'USD', 0],
    [-99, 'USD', -0.99],
    [123456, 'EUR', 1234.56],
    [123456, 'MAD', 1234.56],
  ])('matches legacy output for %i %s', (minorUnits, currency, legacyAmount) => {
    expect(formatMoney(money(minorUnits, currency))).toBe(legacyFormat(legacyAmount, currency));
  });
});

describe('formatMoney', () => {
  it('respects the currency minor unit', () => {
    expect(formatMoney(money(1500, 'JPY'))).toContain('1,500');
    expect(formatMoney(money(1500, 'JPY'))).not.toContain('.');
  });

  it('drops a zero fraction when asked', () => {
    expect(formatMoney(money(120000, 'USD'), { compactZeroFraction: true })).toBe('$1,200');
  });

  it('keeps a non-zero fraction even when compacting', () => {
    expect(formatMoney(money(120050, 'USD'), { compactZeroFraction: true })).toBe('$1,200.50');
  });

  it('shows an explicit sign for transaction rows', () => {
    expect(formatMoney(money(500, 'USD'), { signDisplay: 'always' })).toBe('+$5.00');
  });

  it('honours a non-default locale', () => {
    expect(formatMoney(money(123456, 'EUR'), { locale: 'de-DE' })).toBe(
      new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(1234.56),
    );
  });
});

describe('formatMoneyAmount', () => {
  it('omits the currency symbol for spreadsheet cells', () => {
    expect(formatMoneyAmount(money(123456, 'USD'))).toBe('1,234.56');
  });
});

describe('formatMoneyForSpeech', () => {
  it('names the currency instead of using a symbol', () => {
    const spoken = formatMoneyForSpeech(money(120050, 'USD'));
    expect(spoken).toContain('dollars');
    expect(spoken).not.toContain('$');
  });
});
