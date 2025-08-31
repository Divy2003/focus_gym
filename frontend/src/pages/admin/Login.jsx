
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSendOtpMutation, useVerifyOtpMutation } from '../../features/auth/authApiSlice';
import { loginSuccess } from '../../redux/slices/authSlice';
import '../../styles/admin/Login.css';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 for mobile, 2 for otp
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await sendOtp({ mobile }).unwrap();
      setStep(2);
    } catch (err) {
      setError(err.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { token, admin } = await verifyOtp({ mobile, otp }).unwrap();
      dispatch(loginSuccess({ token, admin }));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.data?.message || 'Invalid OTP');
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
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+919876543210"
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
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
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
