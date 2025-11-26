import React, { useState, useEffect } from 'react';
import { X, Loader2, Camera } from 'lucide-react';
import '../../styles/admin/Modal.css';

const UpdateMemberModalFixed = ({ member, isOpen, onClose, onUpdate, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    month: 1,
    fees: 0,
    status: 'pending',
    joiningDate: '',
    description: '',
    profileImage: ''
  });

  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [stream, setStream] = useState(null);

  // Initialize form data only when member changes
  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        name: member.name || '',
        mobile: member.mobile || '',
        month: member.month || 1,
        fees: member.fees || 0,
        status: member.status || 'pending',
        joiningDate: member.joiningDate ? new Date(member.joiningDate).toISOString().split('T')[0] : '',
        description: member.description || '',
        profileImage: member.profileImage || ''
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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure you have granted permission.");
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
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 300, 300);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      setFormData(prev => ({ ...prev, profileImage: imageData }));
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setFormData(prev => ({ ...prev, profileImage: '' }));
    startCamera();
  };

  // Cleanup camera on unmount or modal close
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
            <div className="form-scroll-container">
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                <label>Profile Photo (Optional)</label>
                {formData.profileImage ? (
                  <div style={{ position: 'relative', width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #ddd' }}>
                    <img src={formData.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={retakePhoto}
                      style={{ position: 'absolute', bottom: '0', width: '100%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '5px', cursor: 'pointer' }}
                    >
                      Retake
                    </button>
                  </div>
                ) : showCamera ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '300px', height: '300px', overflow: 'hidden', borderRadius: '8px', background: '#000' }}>
                      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <canvas ref={canvasRef} width="300" height="300" style={{ display: 'none' }} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={capturePhoto} className="action-btn" style={{ background: '#23994f', color: 'white' }}>
                        <Camera size={16} /> Capture
                      </button>
                      <button type="button" onClick={stopCamera} className="action-btn" style={{ background: '#dc3545', color: 'white' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={startCamera} className="action-btn" style={{ background: '#4a90e2', color: 'white', padding: '8px 16px' }}>
                    <Camera size={16} /> Take Photo
                  </button>
                )}
              </div>

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
                <label htmlFor="joiningDate">Joining Date</label>
                <input
                  type="date"
                  id="joiningDate"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  required
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
