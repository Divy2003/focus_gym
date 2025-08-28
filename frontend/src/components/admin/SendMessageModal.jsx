
import React, { useState } from 'react';
import { useSendMessageMutation } from '../../features/members/membersApiSlice';
import '../../styles/admin/Modal.css';

const SendMessageModal = ({ memberIds, closeModal }) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [sendMessage, { isLoading }] = useSendMessageMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await sendMessage({ memberIds, message }).unwrap();
      closeModal();
    } catch (err) {
      setError(err.data?.message || 'Failed to send message');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Send Message</h2>
          <button onClick={closeModal} className="close-button">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <p className="error-message">{error}</p>}
            <p>You are sending a message to {memberIds.length} selected member(s).</p>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={closeModal} className="btn-cancel">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-confirm">
              {isLoading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendMessageModal;
