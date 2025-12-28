# AI Unit Test Generator

A MERN stack application that allows users to generate Jest unit tests for their Javascript code using OpenAI, and run them securely in a browser-based sandbox (vm2).

## Features
- **Monaco Editor**: VSCode-like editing experience for Source and Tests.
- **AI Generation**: Integrates with OpenAI to write tests for you.
- **Secure Sandbox**: Runs code + tests in a `vm2` sandbox on the server.
- **Jest Shim**: Simulates Jest environment (`describe`, `it`, `expect`) without requiring the full Jest CLI.

## Prerequisites
- Node.js (v14+ recommended)
- MongoDB (running locally on default port 27017)
- OpenAI API Key

## Setup

1.  **Install Dependencies**
    ```bash
    # Root (installs concurrently)
    npm install
    
    # Server
    cd server
    npm install
    
    # Client
    cd client
    npm install
    ```
    (Note: If you used the automated setup, these are likely done.)

2.  **Environment Variables**
    - Create `server/.env` (if not exists) and add your OpenAI Key:
      ```
      PORT=5000
      OPENAI_API_KEY=your_key_here
      MONGODB_URI=mongodb://127.0.0.1:27017/ai-test-generator
      ```

## Running the App

To run both Backend and Frontend concurrently:

```bash
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5000](http://localhost:5000)

## Usage
1.  Paste your JS function in the Left Editor.
2.  Click **Generate Tests**.
3.  Review the generated tests in the Right Editor.
4.  Click **Run Tests** to execute and see results in the console panel.
