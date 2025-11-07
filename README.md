# WikiQuiz

A full-stack app that turns an unstructured Wikipedia article into a structured, engaging quiz using an LLM (via LangChain + Gemini or another LLM).
Two main tabs: Generate Quiz and Past Quizzes (History). Back end scrapes the article, generates a quiz (5–10 Qs) and summary, stores everything in PostgreSQL/MySQL, and returns JSON. Frontend (React) shows cards, history, and a modal for details — “Take Quiz” mode.

<img width="1919" height="912" alt="Screenshot 2025-11-07 223018" src="https://github.com/user-attachments/assets/fbd2b679-a0f5-4084-a44e-a23e27163623" />
 

## Features

● Accepts a Wikipedia URL and scrapes article text (main content & headings).

<img width="1895" height="906" alt="Screenshot 2025-11-07 224911" src="https://github.com/user-attachments/assets/cca08b96-2f34-4e8d-9d26-68cabae18dd4" />


● Uses LangChain (or direct LLM API) to generate a quiz with 5–10 questions.

● Each question contains: 

<img width="553" height="913" alt="Screenshot 2025-11-07 224948" src="https://github.com/user-attachments/assets/c56c3eba-5717-441b-935d-21ffeedae740" />

- question text 

- four options (A–D)

- correct answer

- short explanation

- difficulty level (easy/medium/hard)

- suggested related Wikipedia topics

● Stores original URL, scraped content, generated quiz JSON, timestamps in Postgres/MySQL.

● Frontend with two tabs:

● Generate Quiz — submit URL and view card-based quiz + summary.

● Past Quizzes — table of saved quizzes; “Details” modal shows full quiz and “Take Quiz” mode.
<img width="1825" height="788" alt="Screenshot 2025-11-07 225011" src="https://github.com/user-attachments/assets/e61a6ed1-b79b-4e20-857f-02e98399a20e" />

● Take Qiuz contain -
<img width="1908" height="907" alt="Screenshot 2025-11-07 225049" src="https://github.com/user-attachments/assets/26c284ba-1321-4db7-9400-b07b4eef19e3" />

● API returns structured JSON for frontend consumption and integrations.
