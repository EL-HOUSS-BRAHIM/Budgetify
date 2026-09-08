import { describe, expect, it } from 'vitest';
import {
  InvalidAllocationError,
  InvalidAmountError,
  InvalidCurrencyError,
  MismatchedCurrencyError,
  UnparsableAmountError,
} from '../errors';
import {
  absMoney,
  addMoney,
  allocateMoney,
  compareMoney,
  isNegativeMoney,
  isZeroMoney,
  minorUnitExponent,
  money,
  multiplyMoney,
  negateMoney,
  normalizeCurrency,
  parseMoney,
  splitMoney,
  subtractMoney,
  sumMoney,
  toDecimal,
  zeroMoney,
} from './money';

describe('currency handling', () => {
  it('normalizes case and surrounding whitespace', () => {
    expect(normalizeCurrency(' usd ')).toBe('USD');
  });

  it.each(['US', 'USDD', 'US1', ''])('rejects %s', (input) => {
    expect(() => normalizeCurrency(input)).toThrow(InvalidCurrencyError);
  });

  it('defaults to two minor digits', () => {
    expect(minorUnitExponent('USD')).toBe(2);
    expect(minorUnitExponent('MAD')).toBe(2);
  });

  it('knows currencies that are not hundredths', () => {
    expect(minorUnitExponent('JPY')).toBe(0);
    expect(minorUnitExponent('TND')).toBe(3);
    expect(minorUnitExponent('KWD')).toBe(3);
  });
});

describe('construction', () => {
  it('rejects non-integer amounts, because Money is minor units', () => {
    expect(() => money(12.5, 'USD')).toThrow(InvalidAmountError);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])('rejects %s', (value) => {
    expect(() => money(value, 'USD')).toThrow(InvalidAmountError);
  });

  it('rejects amounts beyond the safe integer range', () => {
    expect(() => money(Number.MAX_SAFE_INTEGER + 2, 'USD')).toThrow(InvalidAmountError);
  });

  it('builds a zero', () => {
    expect(zeroMoney('EUR')).toEqual({ amount: 0, currency: 'EUR' });
  });
});

describe('arithmetic', () => {
  it('adds and subtracts within one currency', () => {
    expect(addMoney(money(1050, 'USD'), money(275, 'USD')).amount).toBe(1325);
    expect(subtractMoney(money(1050, 'USD'), money(275, 'USD')).amount).toBe(775);
  });

  it('refuses to mix currencies rather than silently coercing', () => {
    expect(() => addMoney(money(100, 'USD'), money(100, 'EUR'))).toThrow(MismatchedCurrencyError);
    expect(() => subtractMoney(money(100, 'USD'), money(100, 'EUR'))).toThrow(
      MismatchedCurrencyError,
    );
    expect(() => compareMoney(money(1, 'USD'), money(1, 'MAD'))).toThrow(MismatchedCurrencyError);
  });

  it('negates and takes absolute value', () => {
    expect(negateMoney(money(-500, 'USD')).amount).toBe(500);
    expect(absMoney(money(-500, 'USD')).amount).toBe(500);
  });

  it('sums an empty list to zero in the stated currency', () => {
    expect(sumMoney([], 'MAD')).toEqual({ amount: 0, currency: 'MAD' });
  });

  it('sums a list', () => {
    const total = sumMoney([money(100, 'USD'), money(250, 'USD'), money(-50, 'USD')], 'USD');
    expect(total.amount).toBe(300);
  });

  it('rounds multiplication half away from zero, symmetrically about zero', () => {
    expect(multiplyMoney(money(101, 'USD'), 0.5).amount).toBe(51);
    expect(multiplyMoney(money(-101, 'USD'), 0.5).amount).toBe(-51);
  });

  it('rejects a non-finite multiplier', () => {
    expect(() => multiplyMoney(money(100, 'USD'), Number.NaN)).toThrow(InvalidAmountError);
  });

  it('compares and tests', () => {
    expect(compareMoney(money(1, 'USD'), money(2, 'USD'))).toBe(-1);
    expect(compareMoney(money(2, 'USD'), money(1, 'USD'))).toBe(1);
    expect(compareMoney(money(1, 'USD'), money(1, 'USD'))).toBe(0);
    expect(isZeroMoney(zeroMoney('USD'))).toBe(true);
    expect(isNegativeMoney(money(-1, 'USD'))).toBe(true);
    expect(isNegativeMoney(zeroMoney('USD'))).toBe(false);
  });
});

describe('allocation', () => {
  it('never loses or invents a minor unit', () => {
    const parts = splitMoney(money(1000, 'USD'), 3);
    expect(parts.map((part) => part.amount)).toEqual([334, 333, 333]);
    expect(sumMoney(parts, 'USD').amount).toBe(1000);
  });

  it('gives the remainder to the largest weight first', () => {
    const parts = allocateMoney(money(1000, 'USD'), [1, 8, 1]);
    expect(parts.map((part) => part.amount)).toEqual([100, 800, 100]);
    expect(sumMoney(parts, 'USD').amount).toBe(1000);
  });

  it('preserves the total for a negative amount', () => {
    const parts = splitMoney(money(-1000, 'USD'), 3);
    expect(parts.map((part) => part.amount)).toEqual([-334, -333, -333]);
    expect(sumMoney(parts, 'USD').amount).toBe(-1000);
  });

  it('handles a zero weight without dropping the total', () => {
    const parts = allocateMoney(money(999, 'USD'), [0, 1, 1]);
    expect(sumMoney(parts, 'USD').amount).toBe(999);
    expect(parts[0]?.amount).toBe(0);
  });

  it.each([
    [[], 'empty'],
    [[0, 0], 'all zero'],
    [[-1, 2], 'negative'],
    [[Number.NaN], 'not finite'],
  ])('rejects %j weights (%s)', (weights) => {
    expect(() => allocateMoney(money(100, 'USD'), weights)).toThrow(InvalidAllocationError);
  });

  it.each([0, -1, 1.5])('rejects %s parts', (parts) => {
    expect(() => splitMoney(money(100, 'USD'), parts)).toThrow(InvalidAllocationError);
  });

  it('survives a property check across many splits', () => {
    for (let amount = 0; amount < 500; amount += 7) {
      for (let parts = 1; parts <= 7; parts += 1) {
        const split = splitMoney(money(amount, 'USD'), parts);
        expect(sumMoney(split, 'USD').amount).toBe(amount);
      }
    }
  });
});

describe('parseMoney', () => {
  it.each([
    ['12.34', 'USD', 1234],
    ['12', 'USD', 1200],
    ['0.09', 'USD', 9],
    ['.5', 'USD', 50],
    ['-12.34', 'USD', -1234],
    ['+12.34', 'USD', 1234],
    ['  1 234.56 ', 'USD', 123456],
    ['1,234.56', 'USD', 123456],
    ['12,34', 'EUR', 1234],
  ])('reads %s as %i minor units', (input, currency, expected) => {
    expect(parseMoney(input, currency).amount).toBe(expected);
  });

  it('treats a three-digit group as grouping in a two-digit currency', () => {
    expect(parseMoney('1.500', 'USD').amount).toBe(150000);
  });

  it('treats the same input as a decimal in a three-digit currency', () => {
    expect(parseMoney('1.500', 'TND').amount).toBe(1500);
  });

  it('pads a short fraction out to the minor unit', () => {
    expect(parseMoney('12.3', 'USD').amount).toBe(1230);
  });

  it('ignores the fraction entirely for a zero-decimal currency', () => {
    expect(parseMoney('1.500', 'JPY').amount).toBe(1500);
  });

  it.each(['', '   ', 'abc', '$12', '--1', '.'])('rejects %j', (input) => {
    expect(() => parseMoney(input, 'USD')).toThrow(UnparsableAmountError);
  });

  it('rejects an amount too large to represent exactly', () => {
    expect(() => parseMoney('999999999999999999', 'USD')).toThrow(InvalidAmountError);
  });

  it('round-trips through toDecimal', () => {
    expect(toDecimal(parseMoney('1234.56', 'USD'))).toBeCloseTo(1234.56, 10);
    expect(toDecimal(parseMoney('1234', 'JPY'))).toBe(1234);
  });
});
