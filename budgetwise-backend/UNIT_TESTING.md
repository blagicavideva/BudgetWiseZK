# Backend unit testing

## Selected units and expected behavior

1. **Transaction validation** (`src/validators/transaction.validator.ts`): selected because it has numeric, enum, date, optional-field, and pagination rules. It accepts valid income/expense input; rejects non-positive or over-limit amounts, unsupported currencies, invalid descriptions, malformed or impossible calendar dates, and malformed category IDs. Query parsing applies documented defaults and rejects invalid paging/sorting values. Updates accept partial objects but still validate supplied values.
2. **Authentication validation** (`src/validators/auth.validator.ts`): selected because registration combines several security and field-length conditions. Registration requires a valid email, an 8-character password with an uppercase letter and number, and first/last names of 1–50 characters. Login requires a valid email and non-empty password. Refresh requires a non-empty token.
3. **Report calculations** (`src/lib/reportCalculations.ts`): selected because money comparisons depend on rounding, zero-value handling, and calendar boundaries. Percentage change is rounded to one decimal and handles a zero previous value; month ranges include the first day through the last millisecond of the month; average daily expenses use the actual month length and round to cents.

## Test conventions

Tests live beside each unit under `__tests__`, end in `.test.ts`, and use names that describe the expected behavior (`accepts...`, `rejects...`, `returns...`). Fixtures contain independently chosen expected values. Validators and calculation helpers are pure functions, so they do not need mocks; the monthly report service test uses mocked Prisma methods so it can exercise the aggregation without a real database.

Run `npm test` for the unit suite or `npm run test:coverage` for the suite and text/HTML/LCOV coverage reports. GitHub Actions runs the coverage command on backend pushes and pull requests and uploads the report as a workflow artifact. A failed test makes the job fail.

## Deliberate fault check

To confirm the tests detect regressions, two temporary faults were introduced in each unit and then reverted: zero became an allowed transaction amount and the amount ceiling was raised; the password minimum was lowered and the uppercase requirement was replaced; the percentage denominator lost its absolute value and the report date range ended one millisecond early. The affected tests failed for each fault set. After restoring the implementation, all 43 tests pass.
