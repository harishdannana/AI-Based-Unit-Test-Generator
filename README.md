# AI Unit Test Generator (MERN Stack)

A powerful MERN stack application that leverages Google Gemini AI to generate unit tests for your JavaScript code and executes them securely in a server-side sandbox.

**Live Demo**: [https://github.com/harishdannana/AI-Based-Unit-Test-Generator](https://github.com/harishdannana/AI-Based-Unit-Test-Generator)

![Screenshot](screenshot.png)

## 🚀 Features

-   **Monaco Editor**: Premium, VS Code-like coding experience with syntax highlighting.
-   **AI-Powered Generation**: Uses **Google Gemini 1.5** to intelligently generate Jest unit tests.
-   **Secure Sandbox execution**: Runs tests safely on the backend using `isolated-vm`.
-   **User Authentication**: Secure Sign Up and Login with JWT and Bcrypt.
-   **History Tracking**: Saves every generation and test run to your personal history.
-   **Resizable Layout**: customizable IDE-like interface (Drag to resize Sidebar, Editors, Console).
-   **Premium Dark UI**: Modern, glassmorphism-inspired design.

## 🛠️ Tech Stack

-   **Frontend**: React (Vite), Monaco Editor, Axios, React Router.
-   **Backend**: Node.js, Express.js.
-   **Database**: MongoDB (Mongoose).
-   **AI**: Google Gemini API (`@google/generative-ai`).
-   **Security**: `isolated-vm` (Sandbox), `bcryptjs`, `jsonwebtoken`.

## 📦 Prerequisites

-   Node.js (v18+ recommended)
-   MongoDB (Running locally or MongoDB Atlas URI)
-   Google Gemini API Key

## 🔧 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/harishdannana/AI-Based-Unit-Test-Generator.git
    cd AI-Based-Unit-Test-Generator
    ```

2.  **Install Dependencies**
    *Server:*
    ```bash
    cd server
    npm install
    ```
    *Client:*
    ```bash
    cd ../client
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/ai-test-generator  # Or your Atlas URI
    GEMINI_API_KEY=your_google_gemini_api_key
    JWT_SECRET=your_super_secret_key
    ```

## 🏃‍♂️ Running the Application

1.  **Start the Backend** (Terminal 1)
    ```bash
    cd server
    node index.js
    ```
    *Server runs on port 5000.*

2.  **Start the Frontend** (Terminal 2)
    ```bash
    cd client
    npm run dev
    ```
    *Client runs on http://localhost:5173.*

## 📖 Usage Guide

1.  **Register/Login**: Create an account to save your work.
2.  **Write Code**: Paste your JavaScript function in the **Source Code** editor (left).
3.  **Generate Tests**: Click the **Generate Tests** button. The AI will populate the **Unit Tests** editor (right).
4.  **Run Tests**: Click **Run Tests**. The backend will execute the tests in a sandbox and display the results in the **Console** (bottom).
5.  **History**: Access your previous code and tests from the **History Sidebar**. Click the trash icon to delete items.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.
