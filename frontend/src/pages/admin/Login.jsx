import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../redux/api/authApi';
import { setCredentials } from '../../redux/slices/authSlice';
import '../../styles/admin/Login.css';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const [login, { isLoading }] = useLoginMutation();

  // Clear any previous errors when component mounts
  useEffect(() => {
    setError('');
  }, [location.state]);

  const handleMobileChange = (e) => {
    // Allow only numbers and limit to 10 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (!password) {
      setError('Please enter your password');
      return;
    }
    
    try {
      const response = await login({ mobile, password }).unwrap();
      
      if (response.success) {
        // Store the token and admin data in localStorage and Redux store
        localStorage.setItem('token', response.token);
        localStorage.setItem('admin', JSON.stringify(response.admin));
        
        dispatch(setCredentials({ 
          token: response.token,
          admin: response.admin 
        }));
        
        // Navigate to the intended location or dashboard
        setMobile('');
        setPassword('');
        console.log('Login successful, navigating to:', from);
        navigate(from, { replace: true });
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Admin Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="text"
              id="mobile"
              value={mobile}
              onChange={handleMobileChange}
              placeholder="Enter 10-digit mobile number"
              inputMode="numeric"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type='text'
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
             
            </div>
          </div>
          
          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ marginRight: 8 }} /> 
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
