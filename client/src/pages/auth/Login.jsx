import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import API from '../../services/api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import Alert from '../../components/ui/Alert.jsx';
import Navbar from '../../components/layout/Navbar.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');
    setLoading(true);

    try {
      // Validation
      if (!email) {
        setEmailError('Email is required');
        setLoading(false);
        return;
      }
      if (!password) {
        setPasswordError('Password is required');
        setLoading(false);
        return;
      }

      // API Call
      const response = await API.post('/auth/login', {
        email: email.trim(),
        password: password.trim(),
      });

      const { token, user } = response.data;

      if (token && user) {
        // Store in context and localStorage
        authLogin(user, token);
        
        // Redirect based on role - match the routes in App.jsx
        let redirectPath = '/login';
        const role = user.role?.toUpperCase().trim();
        
        console.log('User role from API:', user.role, 'Uppercase:', role); // Debug log
        
        // Check if it's a TRANSPORT_MANAGER (driver stored as FACULTY)
        if (role === 'FACULTY' && user.facultyType?.includes('TRANSPORT_MANAGER')) {
          redirectPath = '/driver';
        } else if (role === 'SUPER_ADMIN') {
          redirectPath = '/super-admin/dashboard';
        } else if (role === 'ADMIN' || role === 'SUB_ADMIN') {
          redirectPath = '/admin';
        } else if (role === 'STUDENT') {
          redirectPath = '/student';
        } else if (role === 'FACULTY') {
          redirectPath = '/faculty';
        } else if (role === 'DRIVER') {
          redirectPath = '/driver';
        } else {
          console.warn('Unknown role:', role);
        }
        
        console.log('Redirecting to:', redirectPath); // Debug log
        navigate(redirectPath);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-8">
        <Card shadow="lg" padding="lg" className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {error && (
            <Alert 
              variant="error" 
              icon={AlertCircle}
              className="mb-6"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              error={emailError}
              disabled={loading}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={Lock}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              error={passwordError}
              disabled={loading}
              required
            />

            <Button 
              fullWidth 
              size="lg" 
              variant="solid"
              type="submit"
              isLoading={loading}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Sign up
            </button>
          </p>
        </Card>
      </div>
    </>
  );
}