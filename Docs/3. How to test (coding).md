## How to test

This project uses [Cucumber](https://cucumber.io/) with Gherkin for acceptance testing. Tests are split between the Frontend and Backend — each has its own feature files, step definitions, and `npm test` command.

---

### Running the tests

From the relevant project folder:

```bash
# Backend
cd System/Backend
npm test

# Frontend
cd System/Frontend
npm test
```

Cucumber prints a progress summary to the terminal. After each run an HTML report is written to `reports/cucumber-report.html`.

---

### Project structure

```
System/
├── Backend/
│   └── features/
│       ├── *.feature                  # Gherkin scenarios
│       ├── step_definitions/
│       │   └── *.steps.ts             # Step implementations
│       └── support/
│           ├── world.ts               # Shared world type
│           ├── hooks.ts               # Before/After hooks
│           └── ...                    # Test utilities
└── Frontend/
    └── features/
        ├── *.feature
        ├── step_definitions/
        │   └── *.steps.ts
        └── support/
            └── hooks.ts
```

---

### Writing a scenario

Scenarios live in `.feature` files inside `features/`. Each file groups related scenarios under a `Feature` block.

**Basic structure:**

```gherkin
Feature: Short description of the feature

  Background:
    Given <setup that runs before every scenario in this file>

  Scenario: Descriptive name of the expected behaviour
    Given <precondition>
    When  <action>
    Then  <expected outcome>
    And   <additional outcome>
```

**Example — Backend grading:**

```gherkin
Feature: Grading service rules

  Background:
    Given the grading service is available

  Scenario: All questions answered correctly in strict mode
    Given an answer key for exam 1 with answers "A,B,C"
    And student "Ana Silva" answered exam 1 with "A,B,C"
    When I grade using "strict" mode
    Then the total for "Ana Silva" should be 3
```

**Example — Frontend question management:**

```gherkin
Feature: Question management

  Scenario: Create a question with valid data
    Given no questions exist
    When I create a question with statement "What is 2+2?" and 1 correct alternative
    Then the question bank should contain 1 question
```

---

### Implementing step definitions

Each step in a `.feature` file must match exactly one step definition in `features/step_definitions/`. Step definitions are TypeScript files that import from `@cucumber/cucumber`.

**Step definition skeleton:**

```ts
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';

Given('some precondition', function () {
  // set up state on `this` (the Cucumber world)
});

When('some action happens', function () {
  // call the code under test
});

Then('the expected result should be {string}', function (expected: string) {
  assert.equal(this.actualResult, expected);
});
```

**Rules to follow:**

- **One file per feature area** — `grading.steps.ts` covers grading, `pdf_generation.steps.ts` covers PDF generation, etc.
- **Step text must be globally unique** — Cucumber loads all step definitions together. Duplicate step text across files causes an "ambiguous match" error at runtime.
- **Use `{string}`, `{int}`, `{float}` parameters** — these are Cucumber built-in parameter types and are preferred over inline regex captures.
- **Use regex (`/pattern/`) for steps that contain `/`** — the `/` character has special meaning in Cucumber Expressions (alternation operator). Wrap the step in a regex literal instead: `` When(/I POST to \/grade/, ...) ``.
- **Feature files never need to escape `/`** — only step definition strings do.
- **Keep step definitions thin** — they set up data, call service/HTTP functions, and assert results. No business logic lives here.

---

### Parameter types quick reference

| Type | Matches | Example step text |
|------|---------|-------------------|
| `{string}` | Quoted string | `"strict"` |
| `{int}` | Integer | `3` |
| `{float}` | Decimal or integer | `0.67` or `1` |
| `(s)` suffix | Optional plural | `{int} result(s)` |

---

### Backend-specific notes

- **Service-level tests** call TypeScript functions directly (e.g. `gradeExams`, `generateExamZip`) — no HTTP involved.
- **Endpoint tests** use `supertest` against the minimal Express app at `features/support/testApp.ts`. This app mounts only the routes under test and does not require environment variables.
- **File upload steps** use `supertest`'s `.attach()` to send CSV buffers as `multipart/form-data`.

### Frontend-specific notes

- Tests run in Node.js, not a browser — `localStorage` is replaced by an in-memory mock installed in `features/support/hooks.ts`.
- The mock is cleared before every scenario via a `Before` hook, so each scenario starts with an empty state.
