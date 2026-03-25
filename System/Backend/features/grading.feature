Feature: Grading student responses

  Background:
    Given the grading service is available

  Scenario: Grade a student with a fully correct answer in strict mode
    Given an answer key with question 1 correct answer "A"
    And a student response with question 1 answer "A"
    When I grade using "strict" mode
    Then the student score for question 1 should be 1

  Scenario: Grade a student with a wrong answer in strict mode
    Given an answer key with question 1 correct answer "A"
    And a student response with question 1 answer "B"
    When I grade using "strict" mode
    Then the student score for question 1 should be 0

  Scenario: Grade a student with a partially correct answer in lenient mode
    Given an answer key with question 1 correct answer "AC"
    And a student response with question 1 answer "A"
    When I grade using "lenient" mode
    Then the student score for question 1 should be greater than 0
    And the student score for question 1 should be less than 1
