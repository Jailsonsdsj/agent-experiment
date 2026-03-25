Feature: POST /grade endpoint

  # ── Success ───────────────────────────────────────────────────

  Scenario: Returns 200 with grading results for strict mode
    Given an answer key CSV with content:
      """
      exam_number,q1,q2
      1,A,B
      """
    And a responses CSV with content:
      """
      student_name,exam_number,q1,q2
      Ana Silva,1,A,B
      """
    When I POST to /grade with gradingMode "strict"
    Then the response status should be 200
    And the response should be a JSON array with 1 result
    And the result for "Ana Silva" should have total 2

  Scenario: Returns 200 with grading results for lenient mode
    Given an answer key CSV with content:
      """
      exam_number,q1
      1,AC
      """
    And a responses CSV with content:
      """
      student_name,exam_number,q1
      Rita Ferreira,1,A
      """
    When I POST to /grade with gradingMode "lenient"
    Then the response status should be 200
    And the result for "Rita Ferreira" should have total 0.67

  Scenario: Multiple students are returned in results array
    Given an answer key CSV with content:
      """
      exam_number,q1,q2
      1,A,B
      """
    And a responses CSV with content:
      """
      student_name,exam_number,q1,q2
      Ana Silva,1,A,B
      João Costa,1,A,D
      """
    When I POST to /grade with gradingMode "strict"
    Then the response status should be 200
    And the response should be a JSON array with 2 results

  # ── Validation – 400 responses ───────────────────────────────

  Scenario: Returns 400 when answerKey file is missing
    Given a responses CSV with content:
      """
      student_name,exam_number,q1
      Ana Silva,1,A
      """
    When I POST to /grade without the answerKey file
    Then the response status should be 400
    And the grading response body should contain an "error" field

  Scenario: Returns 400 when responses file is missing
    Given an answer key CSV with content:
      """
      exam_number,q1
      1,A
      """
    When I POST to /grade without the responses file
    Then the response status should be 400
    And the grading response body should contain an "error" field

  Scenario: Returns 400 when gradingMode is missing
    Given an answer key CSV with content:
      """
      exam_number,q1
      1,A
      """
    And a responses CSV with content:
      """
      student_name,exam_number,q1
      Ana Silva,1,A
      """
    When I POST to /grade without a gradingMode
    Then the response status should be 400
    And the grading response body should contain an "error" field

  Scenario: Returns 400 when gradingMode is invalid
    Given an answer key CSV with content:
      """
      exam_number,q1
      1,A
      """
    And a responses CSV with content:
      """
      student_name,exam_number,q1
      Ana Silva,1,A
      """
    When I POST to /grade with gradingMode "fuzzy"
    Then the response status should be 400
    And the grading response body should contain an "error" field

  # ── CSV structure errors – 500 responses ──────────────────────

  Scenario: Returns 500 when answer key CSV has no data rows
    Given an answer key CSV with content:
      """
      exam_number,q1
      """
    And a responses CSV with content:
      """
      student_name,exam_number,q1
      Ana Silva,1,A
      """
    When I POST to /grade with gradingMode "strict"
    Then the response status should be 500
    And the grading response body should contain an "error" field

  Scenario: Returns 500 when answer key CSV is missing the exam_number column
    Given an answer key CSV with content:
      """
      copy,q1
      1,A
      """
    And a responses CSV with content:
      """
      student_name,exam_number,q1
      Ana Silva,1,A
      """
    When I POST to /grade with gradingMode "strict"
    Then the response status should be 500
    And the grading response body should contain an "error" field

  Scenario: Returns 500 when responses CSV has no data rows
    Given an answer key CSV with content:
      """
      exam_number,q1
      1,A
      """
    And a responses CSV with content:
      """
      student_name,exam_number,q1
      """
    When I POST to /grade with gradingMode "strict"
    Then the response status should be 500
    And the grading response body should contain an "error" field
