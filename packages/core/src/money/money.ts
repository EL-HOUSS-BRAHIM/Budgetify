import { z } from 'zod';
import {
  InvalidAllocationError,
  InvalidAmountError,
  InvalidCurrencyError,
  MismatchedCurrencyError,
  UnparsableAmountError,
} from '../errors';

/**
 * Money is an integer count of minor units (cents, centimes, fils) plus a
 * currency. Never a float: the legacy app stored amounts as SQL FLOAT and the
 * error compounds across a month of transactions. See docs/REUSE-LEDGER.md.
 */
export interface Money {
  readonly amount: number;
  readonly currency: string;
}

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export const CurrencySchema = z
  .string()
  .transform((value) => value.trim().toUpperCase())
  .refine((value) => CURRENCY_PATTERN.test(value), {
    message: 'Expected a three-letter ISO 4217 currency code.',
  });

export const MoneySchema = z.object({
  amount: z.number().int().finite(),
  currency: CurrencySchema,
});

/**
 * ISO 4217 currencies whose minor unit is not 1/100. Anything absent uses 2.
 * Held explicitly rather than derived from Intl, because Intl data varies by
 * runtime and a currency that silently changes exponent corrupts stored amounts.
 */
const MINOR_UNIT_EXPONENTS: Readonly<Record<string, number>> = {
  BHD: 3,
  BIF: 0,
  CLP: 0,
  DJF: 0,
  GNF: 0,
  ISK: 0,
  IQD: 3,
  JOD: 3,
  JPY: 0,
  KMF: 0,
  KRW: 0,
  KWD: 3,
  LYD: 3,
  OMR: 3,
  PYG: 0,
  RWF: 0,
  TND: 3,
  UGX: 0,
  UYW: 4,
  VND: 0,
  VUV: 0,
  XAF: 0,
  XOF: 0,
  XPF: 0,
};

const DEFAULT_MINOR_UNIT_EXPONENT = 2;

export function normalizeCurrency(currency: string): string {
  const normalized = currency.trim().toUpperCase();
  if (!CURRENCY_PATTERN.test(normalized)) {
    throw new InvalidCurrencyError(currency);
  }
  return normalized;
}

export function minorUnitExponent(currency: string): number {
  return MINOR_UNIT_EXPONENTS[normalizeCurrency(currency)] ?? DEFAULT_MINOR_UNIT_EXPONENT;
}

export function money(amount: number, currency: string): Money {
  if (!Number.isFinite(amount)) {
    throw new InvalidAmountError(amount, 'must be finite');
  }
  if (!Number.isInteger(amount)) {
    throw new InvalidAmountError(amount, 'must be an integer count of minor units');
  }
  if (!Number.isSafeInteger(amount)) {
    throw new InvalidAmountError(amount, 'exceeds the safe integer range');
  }
  return { amount, currency: normalizeCurrency(currency) };
}

export function zeroMoney(currency: string): Money {
  return money(0, currency);
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new MismatchedCurrencyError(a.currency, b.currency);
  }
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount + b.amount, a.currency);
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount - b.amount, a.currency);
}

export function negateMoney(value: Money): Money {
  return money(-value.amount, value.currency);
}

export function absMoney(value: Money): Money {
  return money(Math.abs(value.amount), value.currency);
}

export function sumMoney(values: readonly Money[], currency: string): Money {
  return values.reduce<Money>((total, value) => addMoney(total, value), zeroMoney(currency));
}

/** Rounds half away from zero, so -0.5 becomes -1 rather than 0. */
function roundHalfAwayFromZero(value: number): number {
  return value < 0 ? -Math.round(-value) : Math.round(value);
}

export function multiplyMoney(value: Money, factor: number): Money {
  if (!Number.isFinite(factor)) {
    throw new InvalidAmountError(factor, 'multiplier must be finite');
  }
  return money(roundHalfAwayFromZero(value.amount * factor), value.currency);
}

export function compareMoney(a: Money, b: Money): number {
  assertSameCurrency(a, b);
  return a.amount === b.amount ? 0 : a.amount < b.amount ? -1 : 1;
}

export function isZeroMoney(value: Money): boolean {
  return value.amount === 0;
}

export function isNegativeMoney(value: Money): boolean {
  return value.amount < 0;
}

/**
 * Splits an amount across weighted shares so the parts always sum back to the
 * whole. Rounding remainder is handed out one minor unit at a time, largest
 * weight first, rather than dropped — splitting 10.00 three ways yields
 * 3.34 / 3.33 / 3.33, never 3.33 / 3.33 / 3.33 with a lost cent.
 */
export function allocateMoney(value: Money, weights: readonly number[]): Money[] {
  if (weights.length === 0) {
    throw new InvalidAllocationError('at least one weight is required');
  }
  if (weights.some((weight) => !Number.isFinite(weight) || weight < 0)) {
    throw new InvalidAllocationError('weights must be finite and non-negative');
  }

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) {
    throw new InvalidAllocationError('weights must not sum to zero');
  }

  const sign = value.amount < 0 ? -1 : 1;
  const magnitude = Math.abs(value.amount);

  const shares = weights.map((weight) => Math.floor((magnitude * weight) / totalWeight));
  let remainder = magnitude - shares.reduce((sum, share) => sum + share, 0);

  const order = weights
    .map((weight, index) => ({ weight, index }))
    .sort((a, b) => b.weight - a.weight || a.index - b.index);

  for (const { index } of order) {
    if (remainder <= 0) break;
    shares[index] = (shares[index] ?? 0) + 1;
    remainder -= 1;
  }

  return shares.map((share) => money(sign * share, value.currency));
}

/** Splits evenly into `parts`, distributing any remainder to the earliest parts. */
export function splitMoney(value: Money, parts: number): Money[] {
  if (!Number.isInteger(parts) || parts < 1) {
    throw new InvalidAllocationError('parts must be a positive integer');
  }
  return allocateMoney(value, new Array<number>(parts).fill(1));
}

/**
 * Reads a human-typed amount into minor units.
 *
 * Grouping and decimal separators are disambiguated by position: the rightmost
 * `.` or `,` is the decimal separator when the digits following it fit inside
 * the currency's minor unit, otherwise every separator is treated as grouping.
 * So "1.500" is 1.50 in USD but 1.500 in TND, which is what a user of each
 * currency means when they type it.
 */
export function parseMoney(input: string, currency: string): Money {
  const normalizedCurrency = normalizeCurrency(currency);
  const exponent = minorUnitExponent(normalizedCurrency);

  const stripped = input.replace(/[\s\u00a0\u202f]/g, '');
  if (stripped === '') {
    throw new UnparsableAmountError(input);
  }

  const signMatch = /^([+-])?(.*)$/.exec(stripped);
  const sign = signMatch?.[1] === '-' ? -1 : 1;
  const body = signMatch?.[2] ?? '';

  if (!/^[\d.,]+$/.test(body) || !/\d/.test(body)) {
    throw new UnparsableAmountError(input);
  }

  const lastSeparator = Math.max(body.lastIndexOf('.'), body.lastIndexOf(','));
  const fractionDigits = lastSeparator === -1 ? '' : body.slice(lastSeparator + 1);
  const treatAsDecimal =
    lastSeparator !== -1 && fractionDigits.length > 0 && fractionDigits.length <= exponent;

  const wholeDigits = (treatAsDecimal ? body.slice(0, lastSeparator) : body).replace(/[.,]/g, '');
  const fraction = treatAsDecimal ? fractionDigits : '';

  const minorUnits = `${wholeDigits || '0'}${fraction.padEnd(exponent, '0')}`;
  const amount = Number(minorUnits);
  if (!Number.isSafeInteger(amount)) {
    throw new InvalidAmountError(input, 'exceeds the safe integer range');
  }

  return money(sign * amount, normalizedCurrency);
}

/** Converts to a decimal number. For display and charting only — never for arithmetic. */
export function toDecimal(value: Money): number {
  return value.amount / 10 ** minorUnitExponent(value.currency);
}
