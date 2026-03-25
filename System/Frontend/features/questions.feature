Feature: Question CSV import parsing

  Scenario: Parse a valid CSV with two alternatives
    Given a CSV with the content:
      """
      statement,alt_1,alt_2,correct
      What is 2+2?,Three,Four,2
      """
    When I parse the CSV
    Then I should get 1 question with no errors
    And the question statement should be "What is 2+2?"
    And alternative 2 should be marked as correct

  Scenario: Reject a CSV missing the statement column
    Given a CSV with the content:
      """
      alt_1,alt_2,correct
      Three,Four,2
      """
    When I parse the CSV
    Then I should get 0 questions
    And there should be a parse error mentioning "statement"

  Scenario: Reject a row with fewer than 2 alternatives
    Given a CSV with the content:
      """
      statement,alt_1,alt_2,correct
      Only one alt?,Only,,1
      """
    When I parse the CSV
    Then I should get 0 questions
    And there should be a row error on row 2
