Feature: POST /generate-pdf endpoint

  Background:
    Given a valid exam payload titled "Test Exam" by teacher "Prof. Silva" with "letters" mode
    And the payload includes 2 questions with 3 alternatives each

  # ── Success – response metadata ──────────────────────────────

  Scenario: Returns 200 with application/zip content type
    When I POST the payload to /generate-pdf with 1 copy
    Then the response status should be 200
    And the response Content-Type should include "application/zip"

  Scenario: Content-Disposition header carries exam title as filename
    When I POST the payload to /generate-pdf with 1 copy
    Then the response Content-Disposition should include "attachment"
    And the response Content-Disposition should include "Test Exam"

  # ── Success – response body ───────────────────────────────────

  Scenario: ZIP contains one PDF per copy and one answer key CSV
    When I POST the payload to /generate-pdf with 3 copies
    Then the ZIP should contain 4 files
    And the ZIP should contain "exam_1.pdf"
    And the ZIP should contain "exam_2.pdf"
    And the ZIP should contain "exam_3.pdf"
    And the ZIP should contain "answer_key.csv"

  Scenario: Answer key CSV has one data row per copy
    When I POST the payload to /generate-pdf with 4 copies
    Then the answer key CSV should have 4 data rows

  Scenario: Answer key CSV uses letter labels for letter mode
    When I POST the payload to /generate-pdf with 1 copy
    Then each answer in the answer key CSV should be a valid letter label

  Scenario: Answer key CSV uses power-of-2 labels for power-of-2 mode
    Given a valid exam payload titled "Science Exam" by teacher "Prof. Costa" with "powers-of-two" mode
    And the payload includes 2 questions with 3 alternatives each
    When I POST the payload to /generate-pdf with 1 copy
    Then each answer in the answer key CSV should be a valid power-of-2 label

  # ── Validation – 400 responses ───────────────────────────────

  Scenario: Returns 400 when exam object is missing
    When I POST to /generate-pdf without an exam object
    Then the response status should be 400
    And the response body should contain an "error" field

  Scenario: Returns 400 when teacherName is blank
    When I POST to /generate-pdf with a blank teacherName
    Then the response status should be 400
    And the response body should contain an "error" field

  Scenario: Returns 400 when copies is zero
    When I POST to /generate-pdf with copies set to 0
    Then the response status should be 400
    And the response body should contain an "error" field

  Scenario: Returns 400 when copies is negative
    When I POST to /generate-pdf with copies set to -1
    Then the response status should be 400
    And the response body should contain an "error" field

  Scenario: Returns 400 when questions array is empty
    When I POST to /generate-pdf with an empty questions array
    Then the response status should be 400
    And the response body should contain an "error" field

  Scenario: Returns 400 when a question has no alternatives
    When I POST to /generate-pdf with a question that has no alternatives
    Then the response status should be 400
    And the response body should contain an "error" field
