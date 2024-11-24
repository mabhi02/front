import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ShieldCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsRegistering(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsRegistering(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegistrationSuccess(true);
        // Reset form
        setFormData({
          username: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full mt-4 border-gray-700 hover:bg-gray-800 text-gray-400"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Create Defense Account
          </DialogTitle>
        </DialogHeader>

        {registrationSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-green-500 mb-2">Registration Successful</h3>
            <p className="text-gray-400 mb-4">Your account has been created successfully.</p>
            <Button 
              onClick={() => document.querySelector("[data-dialog-close]").click()}
              className="bg-green-600 hover:bg-green-700"
            >
              Continue to Login
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {error && (
              <div className="bg-red-500/20 text-red-400 p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Operator ID</label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="bg-gray-700/50 border-gray-600 text-white"
                placeholder="Enter desired ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="bg-gray-700/50 border-gray-600 text-white"
                placeholder="Enter password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="bg-gray-700/50 border-gray-600 text-white"
                placeholder="Confirm password"
                required
              />
            </div>

            <Button
              type="submit"
              className={`w-full ${
                isRegistering ? 'bg-blue-600/50' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={isRegistering}
            >
              {isRegistering ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RegisterPage;