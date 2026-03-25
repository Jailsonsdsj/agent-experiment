## How to import questions via CSV

### File format

One row per question, with these columns:

| Column      | Required | Description                                                  |
| ----------- | -------- | ------------------------------------------------------------ |
| `statement` | Yes      | The question text                                            |
| `alt_1`     | Yes      | First alternative                                            |
| `alt_2`     | Yes      | Second alternative                                           |
| `alt_3`     | No       | Third alternative                                            |
| `alt_4`     | No       | Fourth alternative                                           |
| `alt_5`     | No       | Fifth alternative                                            |
| `correct`   | Yes      | Comma-separated 1-based index(es) of the correct alternative(s) |

### Example file



```csv
statement,alt_1,alt_2,alt_3,alt_4,alt_5,correct
"What is 2 + 2?","3","4","5","6",,"2"
"Which of the following are prime numbers?","2","3","4","5","6","1,2,4"
"What is the capital of France?","London","Paris","Berlin","Rome",,"2"
"Which sorting algorithm has O(n log n) average complexity?","Bubble Sort","Merge Sort","Insertion Sort",,,"2"
```

### Rules

- **`correct`** refers to the position of the alternative, not its text — `"2"` means `alt_2` is correct
- For **multiple correct answers**, separate indices with commas: `"1,3"` means `alt_1` and `alt_3` are correct
- Empty `alt_3`–`alt_5` cells are ignored — the question will only have the non-empty alternatives
- Rows with errors are skipped and shown in the UI; valid rows are still imported

### Steps

1. Go to **Admin** in the sidebar
2. Click **Choose file** and select your `.csv`
3. The page immediately shows a preview of valid questions and any row errors
4. Click **Import N questions** to save them to the question bank

After import the questions appear on the **Questions** page and are available to add to any exam.