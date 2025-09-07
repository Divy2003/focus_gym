import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import '../../styles/admin/Modal.css';

const UpdateMemberModalFixed = ({ member, isOpen, onClose, onUpdate, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    month: 1,
    fees: 0,
    status: 'pending',
    description: ''
  });

  // Initialize form data only when member changes
  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        name: member.name || '',
        mobile: member.mobile || '',
        month: member.month || 1,
        fees: member.fees || 0,
        status: member.status || 'pending',
        description: member.description || ''
      });
    }
  }, [member, isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (member) {
      onUpdate(member._id, formData);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Update Member</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mobile">Mobile Number</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="month">Membership Duration (Months)</label>
              <input
                type="number"
                id="month"
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fees">Fees</label>
              <input
                type="number"
                id="fees"
                name="fees"
                value={formData.fees}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
               
                <option value="approved">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-cancel"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-confirm"
              disabled={isLoading}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? 'Updating...' : 'Update Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateMemberModalFixed;
