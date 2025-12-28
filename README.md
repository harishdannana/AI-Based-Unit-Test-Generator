# AI Unit Test Generator

Hey there! This is a project I built to help developers (and myself) generate unit tests quickly using AI. It uses Google Gemini to analyze JavaScript code and create Jest tests automatically. I also built a secure sandbox so you can run the generated tests right in the browser without worrying about safety.

I built this using the MERN stack (MongoDB, Express, React, Node.js).

**Live Demo**: [https://github.com/harishdannana/AI-Based-Unit-Test-Generator](https://github.com/harishdannana/AI-Based-Unit-Test-Generator)

![App Screenshot](screenshot.png)

## What it does

-   **Code Editor**: I used Monaco Editor (the same one VS Code uses) so it feels familiar including syntax highlighting.
-   **AI Generation**: You paste a function, click a button, and it hits the Google Gemini API to write the tests for you.
-   **Run Tests Safely**: The backend runs the tests in a sandboxed environment (`isolated-vm`). This took some time to get right, but it ensures user code can't mess up the server.
-   **Save Your Work**: You can create an account and log in. Every time you generate or run a test, I save it to your history so you can look back at it later.
-   **Responsive Design**: I spent some time adding a resizable layout so you can adjust the sidebar and editor widths to your liking.

## Tech Stack

-   **Frontend**: React, Vite
-   **Backend**: Node.js, Express
-   **Database**: MongoDB
-   **AI**: Google Gemini 1.5
-   **Tools**: Monaco Editor, isolated-vm, BCrypt (for auth)

## How to Run it Locally

If you want to try this out on your own machine:

1.  **Clone the repo**
    ```bash
    git clone https://github.com/harishdannana/AI-Based-Unit-Test-Generator.git
    cd AI-Based-Unit-Test-Generator
    ```

2.  **Install the libraries**
    You need to install packages for both the server and the client.
    ```bash
    cd server && npm install
    cd ../client && npm install
    ```

3.  **Setup Environment Variables**
    Go into the `server` folder and create a file named `.env`. You'll need a few keys:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/ai-test-generator
    GEMINI_API_KEY=your_google_gemini_key_here
    JWT_SECRET=some_random_secret_string
    ```

4.  **Start it up**
    Open two terminal windows.
    
    In the first one (server):
    ```bash
    cd server
    node index.js
    ```
    
    In the second one (client):
    ```bash
    cd client
    npm run dev
    ```

5.  Open your browser to `http://localhost:5173`.

## Contributing

Feel free to fork this and suggest improvements! I'm always looking to make the prompt engineering better or improve the UI.
