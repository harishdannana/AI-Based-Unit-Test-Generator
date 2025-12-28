import React, { useState } from 'react';
import MonacoEditor from 'react-monaco-editor'; // Using the requested library
import axios from 'axios';
import './App.css';

function App() {
  const [userCode, setUserCode] = useState(`// Write your code here
function sum(a, b) {
  return a + b;
}
`);
  const [testCode, setTestCode] = useState(`// Generated tests will appear here`);
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);

  // Editor options
  const options = {
    selectOnLineNumbers: true,
    minimap: { enabled: false },
    automaticLayout: true,
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/generate', { code: userCode });
      setTestCode(res.data.testCode);
    } catch (err) {
      console.error(err);
      const serverError = err.response?.data?.error || err.message;
      alert(`Failed to generate tests: ${serverError}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/run', { code: userCode, tests: testCode });
      setOutput(res.data.results); // Expecting array of { name, status, error }
    } catch (err) {
      console.error(err);
      alert('Failed to run tests');
      setOutput([{ name: 'System Error', status: 'failed', error: err.response?.data?.error || err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>AI Unit Test Generator</h1>
        <div className="actions">
          <button onClick={handleGenerate} disabled={loading} className="btn generate-btn">
            {loading ? 'Processing...' : 'Generate Tests'}
          </button>
          <button onClick={handleRun} disabled={loading} className="btn run-btn">
            {loading ? 'Processing...' : 'Run Tests'}
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="editor-pane">
          <h3>Source Code</h3>
          <div className="editor-wrapper">
            <MonacoEditor
              width="100%"
              height="100%"
              language="javascript"
              theme="vs-dark"
              value={userCode}
              options={options}
              onChange={(newValue) => setUserCode(newValue)}
            />
          </div>
        </div>
        <div className="editor-pane">
          <h3>Unit Tests (Jest)</h3>
          <div className="editor-wrapper">
            <MonacoEditor
              width="100%"
              height="100%"
              language="javascript"
              theme="vs-dark"
              value={testCode}
              options={options}
              onChange={(newValue) => setTestCode(newValue)}
            />
          </div>
        </div>
      </main>

      <footer className="footer-console">
        <h3>Console / Results</h3>
        <div className="console-output">
          {output.length === 0 && <span className="no-output">Run tests to see results...</span>}
          {output.map((res, index) => (
            <div key={index} className={`result-item ${res.status}`}>
              <span className="status-icon">{res.status === 'passed' ? '✅' : '❌'}</span>
              <span className="test-name">{res.name}</span>
              {res.error && <span className="error-msg"> - {res.error}</span>}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default App;
