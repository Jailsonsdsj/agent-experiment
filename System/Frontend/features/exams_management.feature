Feature: Exam management

  Background:
    Given the exam store is empty

  # ── Create ──────────────────────────────────────────────────

  Scenario: Create an exam with letter identification mode
    Given I have an exam titled "Math Test" by teacher "Prof. Silva"
    And the identification mode is "letters"
    And the exam includes 2 selected questions
    When I save the exam
    Then the exam store should contain 1 exam
    And the saved exam title should be "Math Test"
    And the saved exam identification mode should be "letters"

  Scenario: Create an exam with power-of-2 identification mode
    Given I have an exam titled "Physics Test" by teacher "Prof. Souza"
    And the identification mode is "powers-of-two"
    And the exam includes 3 selected questions
    When I save the exam
    Then the exam store should contain 1 exam
    And the saved exam identification mode should be "powers-of-two"

  Scenario: Reject an exam with no questions selected
    Given I have an exam titled "Empty Test" by teacher "Prof. Costa"
    And the identification mode is "letters"
    And no questions are selected
    When I validate the exam
    Then the exam should be invalid

  # ── Edit ────────────────────────────────────────────────────

  Scenario: Edit the title of an existing exam
    Given a saved exam titled "Old Title" by teacher "Prof. Silva"
    When I update the exam title to "New Title"
    Then the exam store should contain 1 exam
    And the saved exam title should be "New Title"

  Scenario: Edit the identification mode of an existing exam
    Given a saved exam titled "Config Test" by teacher "Prof. Lima" with "letters" mode
    When I update the identification mode to "powers-of-two"
    Then the saved exam identification mode should be "powers-of-two"

  # ── Delete ──────────────────────────────────────────────────

  Scenario: Delete an exam
    Given a saved exam titled "Exam to Delete" by teacher "Prof. Silva"
    When I delete the exam
    Then the exam store should be empty
