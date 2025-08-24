import React, { useState } from 'react';
import '../styles/Registration.css';  // 👈 Import CSS file

const RegistrationForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    month: '',
    fees: '',
    description: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPriceDisplay, setShowPriceDisplay] = useState(false);

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
      return;
    }

    if (name === 'fees') {
      setFormData(prev => ({ ...prev, [name]: value }));
      setShowPriceDisplay(value && parseInt(value) > 0);
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowSuccess(false);

    try {
      if (!formData.name.trim() || !formData.mobile.trim() || !formData.month) {
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
        description: formData.description.trim()
      };

      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Registration failed');

      setShowSuccess(true);
      setFormData({ name: '', mobile: '', month: '', fees: '', description: '' });
      setShowPriceDisplay(false);

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
          <div className="gym-logo-responsive">💪</div>
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
          {showPriceDisplay && (
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
