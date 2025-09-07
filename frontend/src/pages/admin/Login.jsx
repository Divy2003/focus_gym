
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSendOtpMutation, useVerifyOtpMutation } from '../../redux/api/authApi';
import { setCredentials } from '../../redux/slices/authSlice';
import '../../styles/admin/Login.css';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 for mobile, 2 for otp
  const [error, setError] = useState('');
  const [mobileForVerification, setMobileForVerification] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const from = location.state?.from?.pathname || '/admin/dashboard';

  // Debug: Log the navigation state
  useEffect(() => {
    console.log('Login page location state:', location.state);
    console.log('Redirecting after login to:', from);
  }, [location.state, from]);

  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    // Clean mobile number (remove non-digits and ensure it's 10 digits)
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    
    if (cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    try {
      const response = await sendOtp(cleanMobile).unwrap();
      console.log('OTP Response:', response);
      
      if (response.success) {
        setMobileForVerification(cleanMobile);
        // If the backend returns the OTP in development mode, store it to display
        if (response.otp) {
          setGeneratedOtp(response.otp);
        }
        setStep(2);
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('OTP Error:', err);
      setError(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }
    
    try {
      const response = await verifyOtp({ mobile: mobileForVerification, otp }).unwrap();
      console.log('Verify OTP Response:', response);
      
      if (response.success && response.token) {
        // Store the token in localStorage and update Redux store
        localStorage.setItem('token', response.token);
        localStorage.setItem('admin', JSON.stringify(response.admin));
        dispatch(setCredentials({ 
          token: response.token,
          admin: response.admin 
        }));
        
        // Clear form and navigate to the intended location or dashboard
        setOtp('');
        setMobile('');
        console.log('Login successful, navigating to:', from);
        navigate(from, { replace: true });
      } else {
        setError(response.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verify OTP Error:', err);
      setError(err.message || 'Invalid OTP');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Admin Login</h2>
        {error && <p className="error-message">{error}</p>}
        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="input-group">
              <label htmlFor="mobile">Mobile Number</label>
              <input
                type="text"
                id="mobile"
                value={mobile}
                onChange={(e) => {
                  // Only allow numbers and limit to 10 digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setMobile(value);
                }}
                placeholder="Enter 10-digit mobile number"
                inputMode="numeric"
                required
              />
            </div>
            <button type="submit" disabled={isSendingOtp}>
              {isSendingOtp ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="input-group">
              <label htmlFor="otp">Enter OTP</label>
              {generatedOtp && (
                <div className="otp-display">
                  <p>For testing purposes, use this OTP: <strong>{generatedOtp}</strong></p>
                </div>
              )}
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    setOtp(value);
                  }
                }}
                placeholder="6-digit OTP"
                maxLength={6}
                inputMode="numeric"
                required
              />
            </div>
            <button type="submit" disabled={isVerifyingOtp}>
              {isVerifyingOtp ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
