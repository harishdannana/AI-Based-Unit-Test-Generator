require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");


const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Optional but requested part of stack)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-test-generator')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Google Gemini Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AI Unit Test Generator API' });
});

// Generate Tests with Gemini
app.post('/api/generate', async (req, res) => {
    const { code } = req.body || {};
    if (!code) {
        return res.status(400).json({ error: "Code is required" });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

        const prompt = `
        You are an expert Javascript/Jest unit tester.
        Given the following code, write a comprehensive set of Jest unit tests.
        Only output the valid Javascript code for the tests.
        Do not include markdown hacks (like \`\`\`js).
        Do not include imports/requires for the function (assume it's available in scope).
        
        Code:
        ${code}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let testCode = response.text();
        
        // Clean up markdown code blocks if present (Gemini loves markdown)
        testCode = testCode.replace(/```javascript/g, '').replace(/```js/g, '').replace(/```/g, '');

        res.json({ testCode });
    } 
     catch (error) {
        console.error("Gemini Error Full:", error);
        console.error("Gemini Error Message:", error.message); 
        // If it's a safety block, it looks different
        if (error.message && error.message.includes("SAFETY")) {
             return res.status(400).json({ error: "AI Generation blocked by Safety Filters. Try simpler code." });
        }
        res.status(500).json({ error: "Failed to generate tests: " + error.message });
    }
});

// Run Tests with isolated-vm
app.post('/api/run', async (req, res) => {
    const { code, tests } = req.body || {};
     if (!code || !tests) {
        return res.status(400).json({ error: "Code and Tests are required" });
    }

    try {
        const ivm = require('isolated-vm');
        const isolate = new ivm.Isolate({ memoryLimit: 128 });
        const context = isolate.createContextSync();
        const jail = context.global;
        jail.setSync('global', jail.derefInto());

        // Shim logic - Aligned to Frontend expectations (name, status: passed/failed)
        const shimCode = `
            global.results = []; 
            
            const describe = (name, fn) => fn();
            const it = (name, fn) => {
                try { 
                    fn(); 
                    global.results.push({ name: name, status: 'passed' });
                } catch (e) { 
                    global.results.push({ name: name, status: 'failed', error: e.message });
                }
            };
            const test = it;
            
            const expect = (actual) => ({
                toBe: (expected) => {
                    if (actual !== expected) throw new Error("Expected " + expected + " but got " + actual);
                },
                toEqual: (expected) => {
                    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("Expected " + JSON.stringify(expected) + " but got " + JSON.stringify(actual));
                },
                toBeTruthy: () => {
                    if (!actual) throw new Error("Expected " + actual + " to be truthy");
                },
                toBeFalsy: () => {
                    if (actual) throw new Error("Expected " + actual + " to be falsy");
                }
            });
        `;

        // Execution
        context.evalSync(shimCode);
        context.evalSync(code);
        context.evalSync(tests);

        // Extract Results
        const resultsRef = jail.getSync('results');
        const results = resultsRef.copySync(); 

        res.json({ results });

    } catch (error) {
        console.error("Sandbox Error:", error);
        res.status(500).json({ error: "Sandbox Execution Failed: " + error.message });
    }
});

// Deployment: Serve Static Files in Production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
