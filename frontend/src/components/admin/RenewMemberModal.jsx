import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, IndianRupee, Clock } from 'lucide-react';
import '../../styles/admin/Modal.css';

const RenewMemberModal = ({ member, isOpen, onClose, onRenew, isLoading }) => {
  const [formData, setFormData] = useState({
    joiningDate: '',
    month: 1,
    fees: 0,
    description: ''
  });

  useEffect(() => {
    if (member && isOpen) {
      // Default new joining date to either today or after current endingDate (if it's in the future)
      let defaultDate = new Date();
      if (member.status === 'approved' && member.endingDate) {
        const endDate = new Date(member.endingDate);
        if (endDate > defaultDate) {
          defaultDate = new Date(endDate);
          defaultDate.setDate(defaultDate.getDate() + 1); // Day after expiry
        }
      }

      setFormData({
        joiningDate: defaultDate.toISOString().split('T')[0],
        month: 1,
        fees: 0,
        description: ''
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
      onRenew(member._id, formData);
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
        <div className="modal-header">
          <h2>Renew Subscription & History</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>

          <div style={{ backgroundColor: member.status === 'approved' ? '#e8f5e9' : '#ffebee', padding: '15px', borderRadius: '8px', borderLeft: `4px solid ${member.status === 'approved' ? '#4caf50' : '#f44336'}` }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              {member.name}
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666', marginLeft: '10px' }}>
                (Current Status: <strong>{member.status === 'approved' ? 'Active' : 'Expired'}</strong>)
              </span>
            </h3>
            {member.status === 'approved' && (
              <p style={{ margin: 0, color: '#2e7d32', fontSize: '14px' }}>
                This member's current subscription is active until <strong>{new Date(member.endingDate).toLocaleDateString()}</strong>.
                Renewing now will archive the current subscription to history and start a new one.
              </p>
            )}
            {member.status === 'expired' && (
              <p style={{ margin: 0, color: '#c62828', fontSize: '14px' }}>
                This member's subscription has expired. Fill the form below to start a new subscription.
              </p>
            )}
            {member.status === 'pending' && (
              <p style={{ margin: 0, color: '#e65100', fontSize: '14px' }}>
                This member is pending. Renewing will start a new subscription and archive the pending entry.
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Form Section */}
            <div>
              <h4 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>New Subscription Details</h4>
              <form onSubmit={handleSubmit} id="renew-form">
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label htmlFor="joiningDate" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Start Date</label>
                  <input
                    type="date"
                    id="joiningDate"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label htmlFor="month" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Duration (Months)</label>
                  <input
                    type="number"
                    id="month"
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    min="1"
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label htmlFor="fees" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Fees</label>
                  <input
                    type="number"
                    id="fees"
                    name="fees"
                    value={formData.fees}
                    onChange={handleInputChange}
                    min="0"
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Description (Optional)</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="2"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </form>
            </div>

            {/* History Section */}
            <div>
              <h4 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Subscription History</h4>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {member.subscriptionHistory && member.subscriptionHistory.length > 0 ? (
                  member.subscriptionHistory.sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt)).map((history, idx) => (
                    <div key={idx} style={{ backgroundColor: '#f9f9f9', border: '1px solid #eaeaea', padding: '12px', color: '#666', borderRadius: '6px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#666' }}>
                        <span><strong>{new Date(history.joiningDate).toLocaleDateString()}</strong> - <strong>{new Date(history.endingDate).toLocaleDateString()}</strong></span>
                        <span title="Archived Date"><Clock size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {new Date(history.archivedAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '15px', fontSize: '14px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {history.month} Months</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IndianRupee size={14} /> {history.fees}</span>
                      </div>
                      {history.description && (
                        <div style={{ marginTop: '5px', fontSize: '12px', color: '#777', fontStyle: 'italic' }}>
                          "{history.description}"
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: '#888', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
                    No previous subscription history found.
                  </div>
                )}
              </div>
            </div>
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
            form="renew-form"
            className="btn-confirm"
            disabled={isLoading}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? 'Processing...' : 'Process Renewal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewMemberModal;
