Feature: Grading service rules

  Background:
    Given the grading service is available

  # ── Strict mode ──────────────────────────────────────────────

  Scenario: All questions answered correctly in strict mode
    Given an answer key for exam 1 with answers "A,B,C"
    And student "Ana Silva" answered exam 1 with "A,B,C"
    When I grade using "strict" mode
    Then the score for "Ana Silva" on question 1 should be 1
    And the score for "Ana Silva" on question 2 should be 1
    And the score for "Ana Silva" on question 3 should be 1
    And the total for "Ana Silva" should be 3

  Scenario: One question answered incorrectly in strict mode
    Given an answer key for exam 1 with answers "A,B,C"
    And student "João Costa" answered exam 1 with "A,D,C"
    When I grade using "strict" mode
    Then the score for "João Costa" on question 1 should be 1
    And the score for "João Costa" on question 2 should be 0
    And the score for "João Costa" on question 3 should be 1
    And the total for "João Costa" should be 2

  Scenario: Partial selection of multi-correct question scores zero in strict mode
    Given an answer key for exam 1 with answers "AC"
    And student "Maria Souza" answered exam 1 with "A"
    When I grade using "strict" mode
    Then the score for "Maria Souza" on question 1 should be 0
    And the total for "Maria Souza" should be 0

  Scenario: Exact multi-correct selection scores full marks in strict mode
    Given an answer key for exam 1 with answers "AC"
    And student "Pedro Lima" answered exam 1 with "AC"
    When I grade using "strict" mode
    Then the score for "Pedro Lima" on question 1 should be 1
    And the total for "Pedro Lima" should be 1

  # ── Lenient mode ─────────────────────────────────────────────

  Scenario: Partial selection of multi-correct question gives fractional score in lenient mode
    Given an answer key for exam 1 with answers "AC"
    And student "Rita Ferreira" answered exam 1 with "A"
    When I grade using "lenient" mode
    Then the score for "Rita Ferreira" on question 1 should be 0.67

  Scenario: All correct alternatives selected scores full marks in lenient mode
    Given an answer key for exam 1 with answers "AC"
    And student "Carlos Ramos" answered exam 1 with "AC"
    When I grade using "lenient" mode
    Then the score for "Carlos Ramos" on question 1 should be 1
    And the total for "Carlos Ramos" should be 1

  Scenario: Selecting wrong single-alternative answer scores zero in lenient mode
    Given an answer key for exam 1 with answers "A"
    And student "Lucia Neves" answered exam 1 with "B"
    When I grade using "lenient" mode
    Then the score for "Lucia Neves" on question 1 should be 0

  # ── Batch grading ─────────────────────────────────────────────

  Scenario: Multiple students are graded in the same batch
    Given an answer key for exam 1 with answers "A,B"
    And student "Ana Silva" answered exam 1 with "A,B"
    And student "João Costa" answered exam 1 with "A,D"
    When I grade using "strict" mode
    Then the total for "Ana Silva" should be 2
    And the total for "João Costa" should be 1

  Scenario: Student referencing an unknown exam number scores all zeros
    Given an answer key for exam 1 with answers "A,B"
    And student "Bruno Alves" answered exam 99 with "A,B"
    When I grade using "strict" mode
    Then the score for "Bruno Alves" on question 1 should be 0
    And the score for "Bruno Alves" on question 2 should be 0
    And the total for "Bruno Alves" should be 0
