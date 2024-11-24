import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import MilitaryDetectionGUI from './components/MilitaryDetectionGUI';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check for existing token/session
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setIsAuthenticated(true);
      setUserData({ username });
    }
  }, []);

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setUserData(data);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUserData(null);
  };

  return (
    <Router>
      <Routes>
        {/* Your existing routes */}
        <Route 
          path="/" 
          element={
            !isAuthenticated ? (
              <motion.div
                key="login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoginPage onLogin={handleLogin} />
              </motion.div>
            ) : (
              <Navigate to="/dashboard" />
            )
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Dashboard userData={userData} onLogout={handleLogout} />
              </motion.div>
            ) : (
              <Navigate to="/" />
            )
          } 
        />

        {/* New detection route - accessible without authentication */}
        <Route 
          path="/detection" 
          element={
            <motion.div
              key="detection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MilitaryDetectionGUI />
            </motion.div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;