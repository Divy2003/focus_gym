import React, { useState } from 'react';
import '../styles/Registration.css';  // 👈 Import CSS file
import gymLogo from '../assets/logo.png';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Camera } from 'lucide-react';
const RegistrationForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    month: '',
    fees: '',
    description: '',
    startDate: '',
    profileImage: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPriceDisplay, setShowPriceDisplay] = useState(false);

  // Camera state
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [stream, setStream] = useState(null);

  // Determine if this page is opened by an admin (from admin dashboard)
  // Priority: location.state.isAdmin, fallback to URL param ?admin=true
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isAdmin = Boolean(location.state?.isAdmin) || searchParams.get('admin') === 'true';

  // Suggested prices for different durations
  const suggestedPrices = {
    1: 1500,
    2: 2800,
    3: 3500,
    6: 6000,
    12: 7000
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mobile') {
      let formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length <= 10) {
        if (formattedValue.length > 5) {
          formattedValue = formattedValue.replace(/(\d{5})(\d+)/, '$1 $2');
        }
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }

    if (name === 'month') {
      const selectedMonth = parseInt(value);
      if (selectedMonth && suggestedPrices[selectedMonth]) {
        // Only admins can set/see fees and price display
        if (isAdmin) {
          setFormData(prev => ({ 
            ...prev, 
            [name]: value,
            fees: suggestedPrices[selectedMonth].toString()
          }));
          setShowPriceDisplay(true);
        } else {
          setFormData(prev => ({ ...prev, [name]: value }));
          setShowPriceDisplay(false);
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
        setShowPriceDisplay(false);
      }
      return;
    }

    if (name === 'fees') {
      // Allow all users to modify fees
      setFormData(prev => ({ ...prev, [name]: value }));
      setShowPriceDisplay(value && parseInt(value) > 0);
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Camera functions
  const startCamera = async () => {
    try {
      // Enhanced constraints for better mobile compatibility
      const constraints = {
        video: {
          width: { ideal: 640, min: 320, max: 1280 },
          height: { ideal: 480, min: 240, max: 720 },
          facingMode: 'user',
          aspectRatio: { ideal: 1.33 }
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setShowCamera(true);
      
      // Set up video element after getting stream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Enhanced video setup with better error handling
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error("Error playing video:", err);
              alert("Error starting video playback. Please try again.");
            });
          }
        };
        
        // Additional event listeners for better mobile support
        videoRef.current.oncanplay = () => {
          console.log("Video can start playing");
        };
        
        videoRef.current.onerror = (err) => {
          console.error("Video error:", err);
          alert("Video playback error. Please try again.");
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      let errorMessage = "Could not access camera. ";
      
      if (err.name === 'NotAllowedError') {
        errorMessage += "Please allow camera access and try again.";
      } else if (err.name === 'NotFoundError') {
        errorMessage += "No camera found on this device.";
      } else if (err.name === 'NotReadableError') {
        errorMessage += "Camera is already in use by another application.";
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += "Camera doesn't support the required settings.";
      } else {
        errorMessage += "Please check your camera settings and try again.";
      }
      
      alert(errorMessage);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Enhanced video readiness checks
        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          // Set canvas dimensions to match video actual dimensions
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;
          
          // Ensure minimum dimensions for better quality
          const minSize = 300;
          let canvasWidth = Math.max(videoWidth, minSize);
          let canvasHeight = Math.max(videoHeight, minSize);
          
          // Maintain aspect ratio
          const aspectRatio = videoWidth / videoHeight;
          if (aspectRatio > 1) {
            canvasHeight = canvasWidth / aspectRatio;
          } else {
            canvasWidth = canvasHeight * aspectRatio;
          }
          
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          
          // Clear canvas before drawing
          context.clearRect(0, 0, canvasWidth, canvasHeight);
          
          // Draw the video frame to canvas with proper scaling
          context.drawImage(video, 0, 0, canvasWidth, canvasHeight);
          
          // Convert to base64 data URL with good quality
          const imageData = canvas.toDataURL('image/jpeg', 0.85);
          
          // Validate that we actually captured something
          if (imageData && imageData.length > 1000) {
            setFormData(prev => ({ ...prev, profileImage: imageData }));
            stopCamera();
          } else {
            throw new Error("Failed to capture image data");
          }
        } else {
          alert("Video not ready. Please wait for the camera to fully load and try again.");
        }
      } catch (err) {
        console.error("Error capturing photo:", err);
        alert("Error capturing photo. Please ensure the camera is working and try again.");
      }
    } else {
      alert("Camera not available. Please try starting the camera again.");
    }
  };

  const retakePhoto = () => {
    setFormData(prev => ({ ...prev, profileImage: '' }));
    startCamera();
  };

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Reset profile image when form is reset
  React.useEffect(() => {
    if (showSuccess) {
      setFormData({
        name: '',
        mobile: '',
        month: '',
        fees: '',
        description: '',
        startDate: '',
        profileImage: ''
      });
    }
  }, [showSuccess]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowSuccess(false);

    try {
      if (!formData.name.trim() || !formData.mobile.trim() || !formData.month || !formData.startDate) {
        throw new Error('Please fill in all required fields');
      }

      const cleanMobile = formData.mobile.replace(/\s+/g, '');
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(cleanMobile)) {
        throw new Error('Please enter a valid 10-digit Indian mobile number');
      }

      const apiData = {
        name: formData.name.trim(),
        mobile: `+91${cleanMobile}`,
        month: parseInt(formData.month),
        fees: parseFloat(formData.fees) || 0,
        description: formData.description.trim(),
        joiningDate: new Date(formData.startDate).toISOString(),
        profileImage: formData.profileImage
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Registration failed');

      setShowSuccess(true);
      setFormData({ name: '', mobile: '', month: '', fees: '', description: '', startDate: '', profileImage: '' });
      setShowPriceDisplay(false);
      
      // Clean up camera if it's open
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setShowCamera(false);
      }

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-responsive">
      <div className="registration-card-responsive">
        
        {/* Header */}
        <div className="form-header">
          <div className="gym-logo-responsive">
            <img src={gymLogo} alt="" style={{ width: '100%' }}/>
          </div>
          <h1 className="form-title-responsive">Join Our Gym</h1>
          <p>Start your fitness journey today</p>
        </div>

        {/* ✅ Success Alert */}
        {showSuccess && (
          <div className="alert-success">
            🎉 Registration successful! Welcome to our gym family.
          </div>
        )}

        {/* ❌ Error Alert */}
        {error && (
          <div className="alert-error">
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <div className="form-body">
          {/* Profile Photo Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
              Profile Photo (Optional)
            </label>
            {formData.profileImage ? (
              <div style={{ position: 'relative', width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #ddd', marginBottom: '1rem' }}>
                <img 
                  src={formData.profileImage} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <button
                  type="button"
                  onClick={retakePhoto}
                  style={{ 
                    position: 'absolute', 
                    bottom: '0', 
                    width: '100%', 
                    background: 'rgba(0,0,0,0.8)', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px', 
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Retake Photo
                </button>
              </div>
            ) : showCamera ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '300px', 
                  height: '300px', 
                  overflow: 'hidden', 
                  borderRadius: '8px', 
                  background: '#000',
                  border: '2px solid #ddd',
                  position: 'relative'
                }}>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    webkit-playsinline="true"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      display: 'block',
                      backgroundColor: '#000'
                    }} 
                  />
                  {/* Enhanced loading indicator */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontSize: '14px',
                    textAlign: 'center',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '10px',
                    borderRadius: '5px'
                  }}>
                    {!videoRef.current?.readyState || videoRef.current?.readyState < 2 ? 'Loading camera...' : 
                     videoRef.current?.videoWidth === 0 ? 'Initializing video...' : ''}
                  </div>
                </div>
                <canvas 
                  ref={canvasRef} 
                  style={{ display: 'none' }} 
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={capturePhoto} 
                    style={{ 
                      background: '#23994f', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 24px', 
                      borderRadius: '5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <Camera size={18} /> Capture Photo
                  </button>
                  <button 
                    type="button" 
                    onClick={stopCamera} 
                    style={{ 
                      background: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 24px', 
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={startCamera} 
                style={{ 
                  background: '#4a90e2', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 24px', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '1rem',
                  fontSize: '16px',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#3a7bc8';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#4a90e2';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <Camera size={18} /> Take Profile Photo
              </button>
            )}
          </div>
          {/* Name */}
          <div>
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Mobile */}
          <div>
            <label htmlFor="mobile">Mobile Number *</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="98765 43210"
              required
            />
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Membership */}
          <div className="form-row-responsive">
            <div>
              <label htmlFor="month">Membership Duration *</label>
              <select
                id="month"
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                required
              >
                <option value="">Select duration</option>
                <option value="1">1 Month</option>
                <option value="2">2 Months</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>

            
              <div>
                <label htmlFor="fees">Membership Fees </label>
                <input
                  type="number"
                  id="fees"
                  name="fees"
                  value={formData.fees}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  min="0"
                  step="100"
                />
              </div>
          
          </div>

          {/* Price Display */}
          {isAdmin && showPriceDisplay && (
            <div className="price-display">
              <div>Total Amount</div>
              <div>₹{parseInt(formData.fees || 0).toLocaleString('en-IN')}</div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="description">Additional Notes (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Any special requirements, health conditions, or fitness goals..."
            />
          </div>

          {/* Submit */}
          <button type="button" onClick={handleSubmit} disabled={loading} className="submit-button">
            {loading && <span className="spinner"></span>}
            <span>{loading ? 'Joining...' : 'Join Now'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="form-footer">
          <p>By joining, you agree to our terms and conditions</p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
