import { minorUnitExponent, toDecimal, type Money } from './money';

export interface FormatMoneyOptions {
  /** BCP 47 locale. Defaults to 'en-US', matching the legacy web app. */
  readonly locale?: string;
  /** Drops the minor units when they are zero, so "$1,200" instead of "$1,200.00". */
  readonly compactZeroFraction?: boolean;
  /** Renders the sign explicitly, for transaction rows where direction matters. */
  readonly signDisplay?: 'auto' | 'always' | 'never' | 'exceptZero';
}

/**
 * Ported from the legacy `formatCurrency` in frontend/src/utils/helpers.js.
 * Output is asserted against the legacy behaviour in format.test.ts.
 */
export function formatMoney(value: Money, options: FormatMoneyOptions = {}): string {
  const { locale = 'en-US', compactZeroFraction = false, signDisplay = 'auto' } = options;
  const exponent = minorUnitExponent(value.currency);
  const hideFraction = compactZeroFraction && value.amount % 10 ** exponent === 0;
  const fractionDigits = hideFraction ? 0 : exponent;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    signDisplay,
  }).format(toDecimal(value));
}

/** The bare number without a currency symbol, for spreadsheet cells and inputs. */
export function formatMoneyAmount(value: Money, locale = 'en-US'): string {
  const exponent = minorUnitExponent(value.currency);
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  }).format(toDecimal(value));
}

/**
 * Spoken form for the assistant's text-to-speech reply. Symbols read poorly:
 * "$1,200.50" is voiced by most engines as "one two zero zero point five zero".
 */
export function formatMoneyForSpeech(value: Money, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
    currencyDisplay: 'name',
  }).format(toDecimal(value));
}
