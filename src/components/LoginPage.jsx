import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Lock, Unlock, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RegisterPage from './RegisterPage';

const LoginPage = ({ onLogin }) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUnlocking(true);

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Start unlock animation sequence
        await new Promise(resolve => setTimeout(resolve, 2000));
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        onLogin(data);
      } else {
        throw new Error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setError(error.message);
      setIsUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="pt-8">
            <div className="text-center mb-8">
              <motion.div
                animate={isUnlocking ? { rotateY: 180 } : { rotateY: 0 }}
                transition={{ duration: 1 }}
                className="inline-block"
              >
                {isUnlocking ? (
                  <Unlock className="w-16 h-16 text-green-500 mx-auto" />
                ) : (
                  <Shield className="w-16 h-16 text-blue-500 mx-auto" />
                )}
              </motion.div>
              <h2 className="mt-4 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">
                Defense Command Center
              </h2>
              <p className="mt-2 text-gray-400">Enter your credentials to access the system</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-md flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Operator ID</label>
                <Input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                  placeholder="Enter your ID"
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Access Code</label>
                <Input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                  placeholder="Enter your access code"
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={isUnlocking}
                className={`w-full py-2 ${
                  isUnlocking 
                    ? 'bg-green-600 animate-pulse' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors duration-300`}
              >
                {isUnlocking ? 'Authenticating...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <RegisterPage />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Unlock Animation Overlay */}
      {isUnlocking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 0] }}
            transition={{ duration: 2, times: [0, 0.8, 1] }}
            className="relative"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                opacity: [1, 0.8, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -inset-4 bg-green-500/20 rounded-full blur-md"
            />
            <Key className="w-24 h-24 text-green-500 relative" />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LoginPage;