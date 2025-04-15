
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authAPI } from '@/services/api';
import { isDemoUser } from '@/lib/utils';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = (email, role) => {
    toast.success(`Logged in successfully as ${role} (Demo Mode)`);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userId', `demo-${role}`);
    localStorage.setItem('userName', `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`);
    localStorage.setItem('isDemo', 'true');
    navigate(`/${role}/dashboard`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Handle demo accounts first
    if (isDemoUser(email) && password === 'password') {
      if (email === 'admin@example.com') {
        handleDemoLogin(email, 'admin');
      } else if (email === 'manager@example.com') {
        handleDemoLogin(email, 'manager');
      } else if (email === 'employee@example.com') {
        handleDemoLogin(email, 'employee');
      }
      setIsLoading(false);
      return;
    }

    try {
      // Try the backend API login for real accounts
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      if (!user || !user.role) {
        throw new Error('Invalid user data in response');
      }
      
      // Store token and user info in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.fullName);
      localStorage.setItem('isDemo', 'false');
      
      toast.success(`Logged in successfully as ${user.role}`);
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // If demo credentials match, use demo login as fallback
      if (email === 'admin@example.com' && password === 'password') {
        handleDemoLogin(email, 'admin');
      } else if (email === 'manager@example.com' && password === 'password') {
        handleDemoLogin(email, 'manager');
      } else if (email === 'employee@example.com' && password === 'password') {
        handleDemoLogin(email, 'employee');
      } else {
        toast.error('Invalid credentials. Try the demo accounts: admin@example.com, manager@example.com, or employee@example.com with password: password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50 to-brand-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-brand-600 hover:text-brand-800"
                >
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-brand-600 hover:bg-brand-700" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>Demo accounts:</p>
            <ul className="mt-2 space-y-1">
              <li>Admin: admin@example.com / password</li>
              <li>Manager: manager@example.com / password</li>
              <li>Employee: employee@example.com / password</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-600 hover:text-brand-800 font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
