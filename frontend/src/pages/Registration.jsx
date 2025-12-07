import React, { useState } from 'react';
import '../styles/Registration.css';  // 👈 Import CSS file
import gymLogo from '../assets/logo.png';
import { Camera, User, X } from 'lucide-react';
import CameraCapture from './CameraCapture';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    month: '',
    fees: '',
    description: '',
    startDate: '',
    photo: null
  });

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPriceDisplay, setShowPriceDisplay] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

  const suggestedPrices = {
    1: 1500,
    2: 2800,
    3: 3500,
    6: 6000,
    12: 7000
  };

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

  const handlePhotoCapture = (imageData) => {
    setFormData(prev => ({ ...prev, photo: imageData }));
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setShowSuccess(false);

    // Define cleanMobile in outer scope for debugging
    const cleanMobile = formData.mobile.replace(/\s+/g, '');

    try {
      if (!formData.name.trim() || !formData.mobile.trim() || !formData.month || !formData.startDate) {
        throw new Error('Please fill in all required fields');
      }

      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(cleanMobile)) {
        throw new Error('Please enter a valid 10-digit Indian mobile number');
      }

      // Validate photo if provided
      if (formData.photo && !formData.photo.startsWith('data:image/')) {
        throw new Error('Invalid photo format');
      }

      const apiData = {
        name: formData.name.trim(),
        mobile: `+91${cleanMobile}`,
        month: parseInt(formData.month),
        fees: parseFloat(formData.fees) || 0,
        description: formData.description.trim(),
        joiningDate: new Date(formData.startDate).toISOString()
      };

      // Only include profileImage if a photo was captured
      if (formData.photo) {
        apiData.profileImage = formData.photo;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Registration failed:', result);
        throw new Error(result.message || result.errors?.[0]?.msg || 'Registration failed');
      }

      setShowSuccess(true);
      setFormData({ name: '', mobile: '', month: '', fees: '', description: '', startDate: '', photo: null });
      setShowPriceDisplay(false);

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Form data sent:', {
        name: formData.name,
        mobile: `+91${cleanMobile}`,
        month: formData.month,
        fees: formData.fees,
        description: formData.description,
        joiningDate: formData.startDate,
        photo: formData.photo ? 'Photo provided' : 'No photo'
      });
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

        <div className='form-body'>
          {/* Photo Section */}
          <div style={{
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Member Photo (Optional)
            </label>
            
            {formData.photo ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={formData.photo}
                  alt="Member"
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #e5e7eb'
                  }}
                />
                <button
                  onClick={handleRemovePhoto}
                  style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCamera(true)}
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  border: '2px dashed #d1d5db',
                  backgroundColor: '#f9fafb',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  gap: '0.5rem',
                  color: '#6b7280'
                }}
              >
                <Camera size={32} />
                <span style={{ fontSize: '0.875rem' }}>Take Photo</span>
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

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
          currentImage={formData.photo}
        />
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus, select:focus, textarea:focus {
          border-color: #059669 !important;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default RegistrationForm;