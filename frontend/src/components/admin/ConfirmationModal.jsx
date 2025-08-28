
import React from 'react';
import '../../styles/admin/Modal.css';

const ConfirmationModal = ({ title, message, onConfirm, onCancel, isLoading }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onCancel} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onCancel} className="btn-cancel">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="btn-confirm btn-danger">
            {isLoading ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
