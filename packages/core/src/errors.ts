/**
 * Every failure in core carries a stable machine-readable `code`. The assistant
 * maps codes to spoken responses, so renaming one is a breaking change.
 */
export abstract class BudgetifyError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class MismatchedCurrencyError extends BudgetifyError {
  readonly code = 'MISMATCHED_CURRENCY';

  constructor(
    readonly left: string,
    readonly right: string,
  ) {
    super(`Cannot combine ${left} and ${right}. Convert to a single currency first.`);
  }
}

export class InvalidCurrencyError extends BudgetifyError {
  readonly code = 'INVALID_CURRENCY';

  constructor(readonly value: string) {
    super(`"${value}" is not a three-letter ISO 4217 currency code.`);
  }
}

export class InvalidAmountError extends BudgetifyError {
  readonly code = 'INVALID_AMOUNT';

  constructor(
    readonly value: unknown,
    reason: string,
  ) {
    super(`Invalid amount ${String(value)}: ${reason}`);
  }
}

export class UnparsableAmountError extends BudgetifyError {
  readonly code = 'UNPARSABLE_AMOUNT';

  constructor(readonly input: string) {
    super(`Could not read an amount from "${input}".`);
  }
}

export class InvalidAllocationError extends BudgetifyError {
  readonly code = 'INVALID_ALLOCATION';

  constructor(reason: string) {
    super(`Cannot allocate: ${reason}`);
  }
}
