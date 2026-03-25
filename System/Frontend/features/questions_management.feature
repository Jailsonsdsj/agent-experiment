Feature: Question management

  Background:
    Given the question store is empty

  # ── Create ──────────────────────────────────────────────────

  Scenario: Create a question with valid data
    Given I have a question with statement "What is 2+2?"
    And the question has alternatives "Three" and "Four"
    And alternative "Four" is marked as correct
    When I save the question
    Then the question store should contain 1 question
    And the saved question statement should be "What is 2+2?"
    And the alternative "Four" should be stored as correct

  Scenario: Reject creation when the statement is missing
    Given I have a question with statement ""
    And the question has alternatives "Option A" and "Option B"
    And alternative "Option A" is marked as correct
    When I validate the question
    Then the question should be invalid

  Scenario: Reject creation when no alternative is marked as correct
    Given I have a question with statement "What is the capital of France?"
    And the question has alternatives "London" and "Paris"
    And no alternative is marked as correct
    When I validate the question
    Then the question should be invalid

  # ── Edit ────────────────────────────────────────────────────

  Scenario: Edit the statement of an existing question
    Given a saved question with statement "Original statement"
    When I update the question statement to "Updated statement"
    Then the question store should contain 1 question
    And the saved question statement should be "Updated statement"

  Scenario: Edit which alternative is marked as correct
    Given a saved question with statement "Pick the right one" with alternatives "Wrong" and "Right"
    And the alternative "Wrong" is initially marked as correct
    When I mark alternative "Right" as correct instead
    Then the alternative "Right" should be stored as correct
    And the alternative "Wrong" should not be stored as correct

  # ── Delete ──────────────────────────────────────────────────

  Scenario: Delete a question
    Given a saved question with statement "Question to delete"
    When I delete the question
    Then the question store should be empty

  Scenario: Attempting to delete a non-existent question throws an error
    When I delete a question with a random id
    Then an error should be thrown
