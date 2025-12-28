import React, { useState, useEffect, useCallback } from 'react';
import MonacoEditor from 'react-monaco-editor';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

// SVG Icons
const Icons = {
  Delete: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  ),
  Code: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"></polyline>
      <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
  ),
  LogOut: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  )
};

function MainApp() {
  const [userCode, setUserCode] = useState(`// Write your code here
function sum(a, b) {
  return a + b;
}
`);
  const [testCode, setTestCode] = useState(`// Generated tests will appear here`);
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);
  const { logout, user } = useAuth();

  // History State
  const [history, setHistory] = useState([]);

  // Fetch history
  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/history');
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Layout State
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [editorRatio, setEditorRatio] = useState(0.5); // 50% split between JS and Test code
  const [consoleHeight, setConsoleHeight] = useState(200);
  const [resizeMode, setResizeMode] = useState(null); // 'SIDEBAR', 'EDITOR', 'CONSOLE', null

  // Resize Logic
  const startResizingSidebar = useCallback(() => setResizeMode('SIDEBAR'), []);
  const startResizingEditor = useCallback(() => setResizeMode('EDITOR'), []);
  const startResizingConsole = useCallback(() => setResizeMode('CONSOLE'), []);
  const stopResizing = useCallback(() => setResizeMode(null), []);

  const resize = useCallback((e) => {
    if (!resizeMode) return;
    e.preventDefault();

    if (resizeMode === 'SIDEBAR') {
      const newWidth = e.clientX;
      if (newWidth > 150 && newWidth < 600) setSidebarWidth(newWidth);
    } else if (resizeMode === 'EDITOR') {
      const editorAreaStart = sidebarWidth; // approximate start X of editor area
      const editorAreaWidth = window.innerWidth - sidebarWidth;
      const relativeX = e.clientX - editorAreaStart;
      const newRatio = relativeX / editorAreaWidth;
      if (newRatio > 0.2 && newRatio < 0.8) setEditorRatio(newRatio);
    } else if (resizeMode === 'CONSOLE') {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 50 && newHeight < 600) setConsoleHeight(newHeight);
    }
  }, [resizeMode, sidebarWidth]);

  useEffect(() => {
    if (resizeMode) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resizeMode, resize, stopResizing]);


  // Delete History Item
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent loading item when clicking delete
    if (!window.confirm("Are you sure you want to delete this history item?")) return;

    try {
      await axios.delete(`/api/history/${id}`);
      const newHistory = history.filter(item => item._id !== id);
      setHistory(newHistory);
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  const loadHistoryItem = (item) => {
    setUserCode(item.code);
    if (item.tests) setTestCode(item.tests);
    if (item.results) setOutput(item.results);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/generate', { code: userCode });
      setTestCode(res.data.testCode);
      fetchHistory();
    } catch (err) {
      const serverError = err.response?.data?.error || err.message;
      alert(`Failed: ${serverError}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/run', { code: userCode, tests: testCode });
      setOutput(res.data.results);
      fetchHistory();
    } catch (err) {
      alert('Failed to run tests');
      setOutput([{ name: 'System Error', status: 'failed', error: err.response?.data?.error || err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const editorOptions = {
    selectOnLineNumbers: true,
    minimap: { enabled: false },
    automaticLayout: true,
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    wrappingIndent: "indent",
    wordWrap: "on",
  };

  return (
    <div className="app-container">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}>
              <path d="M22 17.65l-10-8.6-6.8 5.4-3.4-3.2v11.5l3.4-2.8 2.2 2 4.6-3.8 10 9.2z" />
              <path d="M16.5 2.5l-4.5 4.5 4.5 4.5" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Monaco Editor</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="user-info">{user?.email}</div>
          <button onClick={logout} className="btn btn-danger" title="Logout">
            <Icons.LogOut /> Logout
          </button>
        </div>
      </header>

      <div className="main-layout">
        {/* Resizable Sidebar */}
        <aside className="history-sidebar" style={{ width: sidebarWidth }}>
          <div className="history-header">History</div>
          <div className="history-list">
            {history.length === 0 && <div style={{ padding: '1rem', color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>No history yet</div>}
            {history.map((item) => (
              <div key={item._id} className="history-item" onClick={() => loadHistoryItem(item)}>
                <div className="history-info">
                  <div className={`history-type type-${item.type}`}>{item.type}</div>
                  <span className="history-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <button className="delete-btn" onClick={(e) => handleDelete(e, item._id)} title="Delete">
                  <Icons.Delete />
                </button>
              </div>
            ))}
          </div>
          <div className="resizer-vertical" onMouseDown={startResizingSidebar} style={{ right: 0 }} />
        </aside>

        <div className="editor-area">
          <div className="editors-container" style={{ display: 'flex' }}>
            <div className="editor-pane" style={{ flex: editorRatio }}>
              <div className="pane-header">Source Code (JS)</div>
              <div className="editor-wrapper">
                <MonacoEditor
                  width="100%"
                  height="100%"
                  language="javascript"
                  theme="vs-dark"
                  value={userCode}
                  options={editorOptions}
                  onChange={setUserCode}
                />
              </div>
            </div>

            <div className="resizer-vertical" onMouseDown={startResizingEditor} style={{ position: 'relative', width: '5px', cursor: 'col-resize', background: '#2f3440' }} />

            <div className="editor-pane" style={{ flex: 1 - editorRatio }}>
              <div className="pane-header">Unit Tests (Jest)</div>
              <div className="editor-wrapper">
                <MonacoEditor
                  width="100%"
                  height="100%"
                  language="javascript"
                  theme="vs-dark"
                  value={testCode}
                  options={editorOptions}
                  onChange={setTestCode}
                />
              </div>
            </div>
          </div>

          <div className="resizer-horizontal" onMouseDown={startResizingConsole} />

          <div className="footer-console" style={{ height: consoleHeight }}>
            <div className="console-header">
              <div style={{ flex: 1 }}>Test Results</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleGenerate} disabled={loading} className="btn btn-primary" style={{ padding: '0.25rem 0.8rem', fontSize: '0.8rem' }}>
                  <Icons.Code /> {loading ? '...' : 'Generate tests'}
                </button>
                <button onClick={handleRun} disabled={loading} className="btn btn-primary" style={{ padding: '0.25rem 0.8rem', fontSize: '0.8rem', backgroundColor: '#10b981' }}>
                  <Icons.Play /> {loading ? '...' : 'Run Tests'}
                </button>
              </div>
            </div>
            <div className="console-output">
              {output.length === 0 && <span style={{ color: '#666', fontStyle: 'italic' }}>Run tests to see results...</span>}
              {output.map((res, index) => (
                <div key={index} className={`result-item ${res.status}`}>
                  <span className="status-icon">{res.status === 'passed' ? '✅' : '❌'}</span>
                  <span className="test-name" style={{ fontWeight: 600 }}>{res.name}</span>
                  {res.error && <span className="error-msg"> - {res.error}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
