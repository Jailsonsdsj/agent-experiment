Feature: PDF and answer key CSV generation

  Background:
    Given an exam titled "Final Exam" by teacher "Prof. Costa" with "letters" identification
    And the exam has 3 questions with 4 alternatives each and one correct alternative per question

  # ── ZIP structure ────────────────────────────────────────────

  Scenario: ZIP contains one PDF per copy plus an answer key CSV
    When I generate 3 exam copies
    Then the ZIP should contain 4 files
    And the ZIP should contain "exam_1.pdf"
    And the ZIP should contain "exam_2.pdf"
    And the ZIP should contain "exam_3.pdf"
    And the ZIP should contain "answer_key.csv"

  # ── PDF structure ─────────────────────────────────────────────

  Scenario: Each PDF contains the exam title in the header
    When I generate 2 exam copies
    Then PDF "exam_1.pdf" should contain the text "Final Exam"
    And PDF "exam_2.pdf" should contain the text "Final Exam"

  Scenario: Each PDF contains the teacher name in the header
    When I generate 1 exam copy
    Then PDF "exam_1.pdf" should contain the text "Prof. Costa"

  Scenario: Each PDF contains a footer with its exam number
    When I generate 2 exam copies
    Then PDF "exam_1.pdf" should contain the text "Exam #1"
    And PDF "exam_2.pdf" should contain the text "Exam #2"

  Scenario: Last page contains fields for student name and CPF
    When I generate 1 exam copy
    Then PDF "exam_1.pdf" should contain the text "Name:"
    And PDF "exam_1.pdf" should contain the text "CPF:"

  # ── Answer key CSV ───────────────────────────────────────────

  Scenario: Letter mode answer key contains valid letter labels
    When I generate 1 exam copy
    Then each answer in the answer key CSV should be a valid letter label

  Scenario: Power-of-2 mode answer key contains valid numeric labels
    Given an exam titled "Science Exam" by teacher "Prof. Rocha" with "powers-of-two" identification
    And the exam has 3 questions with 4 alternatives each and one correct alternative per question
    When I generate 1 exam copy
    Then each answer in the answer key CSV should be a valid power-of-2 label

  Scenario: Answer key CSV has correct column headers
    When I generate 3 exam copies
    Then the answer key CSV header row should be "exam_number,q1,q2,q3"

  Scenario: Answer key CSV has one data row per copy
    When I generate 4 exam copies
    Then the answer key CSV should have 4 data rows

  # ── Randomization ────────────────────────────────────────────

  Scenario: Multiple copies produce different answer key rows
    When I generate 5 exam copies
    Then not all answer key rows should be identical
