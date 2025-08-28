
import React, { useState } from 'react';
import { useAddMemberMutation } from '../../features/members/membersApiSlice';
import '../../styles/admin/Modal.css';

const AddMemberModal = ({ closeModal }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    month: 1,
    fees: 0,
  });
  const [error, setError] = useState('');

  const [addMember, { isLoading }] = useAddMemberMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await addMember(formData).unwrap();
      closeModal();
    } catch (err) {
      setError(err.data?.message || 'Failed to add member');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Member</h2>
          <button onClick={closeModal} className="close-button">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="mobile">Mobile</label>
              <input type="text" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="month">Subscription (Months)</label>
              <input type="number" id="month" name="month" min="1" value={formData.month} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="fees">Fees</label>
              <input type="number" id="fees" name="fees" min="0" value={formData.fees} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={closeModal} className="btn-cancel">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-confirm">{isLoading ? 'Adding...' : 'Add Member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
