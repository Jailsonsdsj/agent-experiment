## Testing the grading feature

### Step 1 — Get the answer key

When you generate a PDF from any exam, the downloaded ZIP contains `answer_key.csv`. That file is ready to upload directly. It looks like:



```
exam_number,q1,q2,q3,q4
1,A,BC,D,A
2,B,A,C,D
3,C,BC,A,B
```

Each row is one randomized copy. The answers are the correct labels for that copy's shuffled question/alternative order.

------

### Step 2 — Create a student responses CSV

This simulates what a Google Forms export produces. The required columns are `student_name`, `exam_number`, then one column per question (`q1`, `q2`, …) in the same order as the answer key.



```
student_name,exam_number,q1,q2,q3,q4
Alice Souza,1,A,BC,D,A
Bob Lima,1,A,B,D,C
Carlos Melo,2,B,A,C,D
Diana Cruz,3,C,B,A,B
```

- **Alice** received copy 1 and answered everything correctly → total 4
- **Bob** received copy 1, got q2 wrong (wrote `B` instead of `BC`) and q4 wrong → total 2
- **Carlos** received copy 2 and answered perfectly → total 4
- **Diana** received copy 3, got q2 wrong (`B` instead of `BC`) → total 3

------

### Step 3 — Upload and grade

1. Navigate to **Exams** → click **Grade** on any exam
2. Upload `answer_key.csv` (from the ZIP) in the first field
3. Upload your student responses CSV in the second field
4. Select **Strict** mode
5. Click **Grade exams**

The results table will show each student's per-question scores and total.

------

### Important constraints

| Rule          | Detail                                                       |
| ------------- | ------------------------------------------------------------ |
| Column names  | Must be exactly `student_name`, `exam_number`, `q1`, `q2`, … |
| Answer format | Letters mode: write selected letters concatenated (`A`, `BC`). Powers-of-2 mode: write the sum (`5`) |
| Exam number   | Must match a number that exists in the answer key            |
| Strict mode   | Any deviation from the key (missing a letter, adding an extra one) scores 0 for that question |