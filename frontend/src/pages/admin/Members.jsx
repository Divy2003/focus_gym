import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { FaWhatsapp } from "react-icons/fa";

import {
  useGetMembersQuery,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
  useBulkDeleteMembersMutation
} from '../../redux/api/gymApi';
import {
  setFilters,
  setSelectedMembers,
  toggleMemberSelection,
  selectAllMembers,
  clearSelectedMembers,
  setShowAddModal,
  setShowEditModal,
  setEditingMember
} from '../../redux/slices/membersSlice.js';
import {
  Search, Plus, Edit, Trash2, MessageSquare, X, Users, Calendar, Phone, IndianRupee, CheckCircle, Clock, XCircle, Loader2, MessageCircle, Camera, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import UpdateMemberModalFixed from '../../components/admin/UpdateMemberModalFixed';
import '../../styles/admin/MembersPage.css';

const MembersPage = () => {
  const [searchParams] = useSearchParams();
   
  // Initialize filters from URL params on mount
  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      dispatch(setFilters({ status, page: 1 }));
    }
  }, []);
  const openWhatsAppChat = (mobile) => {
    // Remove any non-numeric characters from the mobile number
    const phoneNumber = mobile.replace(/\D/g, '');
    // Open WhatsApp chat with the member's number
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };
  const dispatch = useDispatch();
  const { selectedMembers = [], filters, showAddModal, showEditModal, editingMember } = useSelector(state => state.members);

  const { data: membersData, isLoading, isFetching, error, refetch } = useGetMembersQuery(filters);
  const [addMember, { isLoading: isAdding }] = useAddMemberMutation();
  const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMutation();
  const [deleteMember] = useDeleteMemberMutation();
  const [bulkDeleteMembers] = useBulkDeleteMembersMutation();

  const members = membersData?.members || [];
  const pagination = membersData?.pagination || {};

  const [memberForm, setMemberForm] = useState({
    name: '',
    mobile: '',
    month: 1,
    fees: 0,
    description: '',
    status: 'pending',
    profileImage: ''
  });

  const [showCamera, setShowCamera] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState('');
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [stream, setStream] = useState(null);

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
      setMemberForm(prev => ({ ...prev, profileImage: imageData }));
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setMemberForm(prev => ({ ...prev, profileImage: '' }));
    startCamera();
  };

  const handleImageClick = (imageSrc, memberName) => {
    setSelectedImage(imageSrc);
    setSelectedImageName(memberName);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    setSelectedImageName('');
  };

  // Cleanup camera on unmount or modal close
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Handle ESC key to close image modal
  useEffect(() => {
    if (!showImageModal) return;

    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        closeImageModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showImageModal]);

  useEffect(() => {
    if (showEditModal && editingMember) {
      setMemberForm({
        name: editingMember.name,
        mobile: editingMember.mobile,
        month: editingMember.month,
        fees: editingMember.fees,
        description: editingMember.description || '',
        status: editingMember.status || 'pending'
      });
    } else {
      setMemberForm({
        name: '',
        mobile: '',
        month: 1,
        fees: 0,
        description: '',
        status: 'pending',
        profileImage: ''
      });
    }
  }, [showEditModal, editingMember]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setMemberForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      // Set default status based on fees
      const memberData = {
        ...memberForm,
        status: memberForm.fees > 0 ? 'approved' : 'pending'
      };
      await addMember(memberData).unwrap();
      dispatch(setShowAddModal(false));
      refetch();
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    try {
      // Create update data without status if it's a fee update for a pending member
      const updateData = { ...memberForm };

      // If the member was pending and we're updating fees, don't include status in the update
      if (editingMember?.status === 'pending' && memberForm.fees > 0) {
        delete updateData.status; // Let the backend handle status update based on fees
      }

      await updateMember({
        id: editingMember._id,
        ...updateData
      }).unwrap();

      dispatch(setShowEditModal(false));
      refetch();
    } catch (err) {
      console.error('Failed to update member:', err);
    }
  };

  // Handler for the new fixed modal
  const handleFixedModalUpdate = async (memberId, formData) => {
    try {
      const updateData = { ...formData };

      // If the member was pending and we're updating fees, don't include status in the update
      if (editingMember?.status === 'pending' && formData.fees > 0) {
        delete updateData.status;
      }

      await updateMember({
        id: memberId,
        ...updateData
      }).unwrap();

      dispatch(setShowEditModal(false));
      refetch();
    } catch (err) {
      console.error('Failed to update member:', err);
    }
  };

  const handleCloseEditModal = () => {
    dispatch(setShowEditModal(false));
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteMember(memberId).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to delete member:', err);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMembers.length === 0 || !window.confirm(`Are you sure you want to delete ${selectedMembers.length} members?`)) return;
    try {
      await bulkDeleteMembers(selectedMembers).unwrap();
      dispatch(clearSelectedMembers());
      refetch();
    } catch (err) {
      console.error('Failed to bulk delete members:', err);
    }
  };


  const getStatusBadge = (status, member) => {
    const statusConfig = {
      approved: { class: 'approved', icon: CheckCircle, label: 'Active' },
      pending: { class: 'pending', icon: Clock, label: 'Pending' },
      expiring: { class: 'expiring', icon: Clock, label: `Expiring in ${member?.daysUntilExpiry || 'a few'} days` },
      expired: { class: 'expired', icon: XCircle, label: 'Expired' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <span className={`status-badge ${config.class}`} title={config.label}>
        <StatusIcon size={12} />
        <span>{config.label}</span>
      </span>
    );
  };

  const MemberModal = ({ isOpen, onClose, onSubmit, title, isLoading, children }) => {
    // Handle ESC key to close modal
    useEffect(() => {
      if (!isOpen) return;

      const handleEscKey = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
      // Only close if clicking directly on the overlay, not on the modal content
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{title}</h2>
            <button onClick={onClose} className="modal-close-btn"><X size={24} /></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body">
              {children}
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="members-page-container">
      <div className="members-page-content">
        <div className="members-header">
          <div className="header-title">
            <h1>Members</h1>
            <p>Manage your gym members and memberships</p>
          </div>
          <Link to="/Registration" state={{ isAdmin: true }} style={{ textDecoration: 'none' }}>
            <button className="add-member-btn">
              <Plus size={20} />
              Add Member
            </button>
          </Link>
        </div>

        <div className="filters-container">
          <div className="filters-flex">

            <div className="search-input-container">
              <Search size={20} className="icon" />
              <input
                type="text"
                placeholder="Search members..."
                value={filters.search}
                onChange={(e) => dispatch(setFilters({ search: e.target.value, page: 1 }))}
                className="search-input"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => dispatch(setFilters({ status: e.target.value, page: 1 }))}
              className="status-filter-select"
            >
              <option value="">All Status</option>
              <option value="approved">Active</option>
             
              <option value="expired">Expired</option>
             
              <option value="expiring">Expiring Soon</option>

            </select>

            {selectedMembers.length > 0 && (
              <div className="bulk-actions">
                <button onClick={handleBulkDelete} className="action-btn delete-btn">
                  <Trash2 size={16} />
                  <span>Delete ({selectedMembers.length})</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="members-table-container">
          <div className="table-wrapper">
            <table className="members-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={members.length > 0 && selectedMembers.length === members.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const allMemberIds = members.map(m => m._id);
                          dispatch(selectAllMembers(allMemberIds));
                        } else {
                          dispatch(clearSelectedMembers());
                        }
                      }}
                      disabled={members.length === 0}
                    />
                  </th>
                  <th>Member</th>
                  <th>Membership <br /><span style={{fontSize: '0.75em', fontWeight: 'normal'}}>(mm/dd/yy)</span></th>
                  <th>Status</th>
                  <th>Fees</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isFetching && !isLoading ? (
                  <>
                    {members.map((member) => (
                      <tr key={member._id} className="fade-out">
                        <td>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedMembers.includes(member._id)}
                            onChange={() => dispatch(toggleMemberSelection(member._id))}
                          />
                        </td>
                        <td>
                          <div className="member-info">
                            <div className="member-avatar">
                              {member.profileImage ? (
                                <img 
                                  src={member.profileImage} 
                                  alt={member.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', cursor: 'pointer' }}
                                  onClick={() => handleImageClick(member.profileImage, member.name)}
                                  title="Click to view full size"
                                />
                              ) : (
                                member.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="member-details">
                              <div className="name">{member.name}</div>
                              <div className="mobile"><Phone size={12} />{member.mobile}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="membership-info">
                            <div className="duration"><Calendar size={16} />{member.month} month{member.month > 1 ? 's' : ''}</div>
                            <div className="dates">{new Date(member.joiningDate).toLocaleDateString()} - {new Date(member.endingDate).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td>{getStatusBadge(member.status, member)}</td>
                        <td><div className="fees"><IndianRupee size={16} />{member.fees.toLocaleString()}</div></td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => openWhatsAppChat(member.mobile)}
                              className="icon-btn "
                              style={{ backgroundColor: 'rgb(35 153 79)' }}
                              title="Message on WhatsApp"
                            >
                              <FaWhatsapp size={18} />
                            </button>
                            <button
                              onClick={() => dispatch(setEditingMember(member))}
                              className="icon-btn edit-btn"
                              title="Edit member"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member._id)}
                              className="icon-btn delete-btn"
                              title="Delete member"
                              style={{ backgroundColor: 'var(--primary-red)' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}><Loader2 className="animate-spin inline-block" size={24} /><span style={{ marginLeft: '8px' }}>Loading more...</span></td></tr>
                  </>
                ) : isLoading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin inline-block" /></td></tr>
                ) : error ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary-red)' }}>Error loading members.</td></tr>
                ) : members.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedMembers.includes(member._id)}
                        onChange={() => dispatch(toggleMemberSelection(member._id))}
                      />
                    </td>
                    <td>
                      <div className="member-info">
                        <div className="member-avatar">
                          {member.profileImage ? (
                            <img 
                              src={member.profileImage} 
                              alt={member.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', cursor: 'pointer' }}
                              onClick={() => handleImageClick(member.profileImage, member.name)}
                              title="Click to view full size"
                            />
                          ) : (
                            member.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="member-details">
                          <div className="name">{member.name}</div>
                          <div className="mobile"><Phone size={12} />{member.mobile}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="membership-info">
                        <div className="duration"><Calendar size={16} />{member.month} month{member.month > 1 ? 's' : ''}</div>
                        <div className="dates">{new Date(member.joiningDate).toLocaleDateString()} - {new Date(member.endingDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td>{getStatusBadge(member.status, member)}</td>
                    <td><div className="fees"><IndianRupee size={16} />{member.fees.toLocaleString()}</div></td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => openWhatsAppChat(member.mobile)}
                          className="icon-btn "
                          style={{ backgroundColor: 'rgb(35 153 79)' }}
                          title="Message on WhatsApp"
                        >
                          <FaWhatsapp size={18} />
                        </button>
                        <button
                          onClick={() => dispatch(setEditingMember(member))}
                          className="icon-btn edit-btn"
                          title="Edit member"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member._id)}
                          className="icon-btn delete-btn"
                          title="Delete member"
                          style={{ backgroundColor: 'var(--primary-red)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination.total > 0 && (
              <div className="pagination-container">
                <div className="pagination-left">
                  <span className="pagination-info">
                    Showing <strong>{((pagination.current - 1) * filters.limit) + 1}</strong> to <strong>{Math.min(pagination.current * filters.limit, pagination.totalMembers)}</strong> of <strong>{pagination.totalMembers}</strong> data
                  </span>
                  <div className="limit-selector">
                    <label>Per page:</label>
                    <select
                      value={filters.limit}
                      onChange={(e) => dispatch(setFilters({ limit: parseInt(e.target.value), page: 1 }))}
                      className="limit-select"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={() => dispatch(setFilters({ page: pagination.current - 1 }))}
                    disabled={pagination.current === 1}
                    className="page-btn page-btn-nav"
                    title="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {pagination.total <= 7 ? (
                    [...Array(pagination.total)].map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => dispatch(setFilters({ page: pageNum }))}
                          className={`page-btn ${pagination.current === pageNum ? 'page-btn-active' : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })
                  ) : (
                    <>
                      {pagination.current > 2 && (
                        <>
                          <button
                            onClick={() => dispatch(setFilters({ page: 1 }))}
                            className="page-btn"
                          >
                            1
                          </button>
                          {pagination.current > 3 && <span className="page-ellipsis">...</span>}
                        </>
                      )}
                      
                      {[pagination.current - 1, pagination.current, pagination.current + 1].filter(p => p > 0 && p <= pagination.total).map(pageNum => (
                        <button
                          key={pageNum}
                          onClick={() => dispatch(setFilters({ page: pageNum }))}
                          className={`page-btn ${pagination.current === pageNum ? 'page-btn-active' : ''}`}
                        >
                          {pageNum}
                        </button>
                      ))}
                      
                      {pagination.current < pagination.total - 1 && (
                        <>
                          {pagination.current < pagination.total - 2 && <span className="page-ellipsis">...</span>}
                          <button
                            onClick={() => dispatch(setFilters({ page: pagination.total }))}
                            className="page-btn"
                          >
                            {pagination.total}
                          </button>
                        </>
                      )}
                    </>
                  )}
                  
                  <button
                    onClick={() => dispatch(setFilters({ page: parseInt(pagination.current) + 1 }))}
                    disabled={pagination.current === pagination.total}
                    className="page-btn page-btn-nav"
                    title="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add Member Modal */}
      <MemberModal
        isOpen={showAddModal}
        onClose={() => dispatch(setShowAddModal(false))}
        onSubmit={handleAddMember}
        title="Add New Member"
        isLoading={isAdding}
      >
        <div className="form-scroll-container">
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
            <label>Profile Photo (Optional)</label>
            {memberForm.profileImage ? (
              <div style={{ position: 'relative', width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #ddd' }}>
                <img src={memberForm.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            <input type="text" id="name" name="name" value={memberForm.name} onChange={handleFormChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input type="tel" id="mobile" name="mobile" value={memberForm.mobile} onChange={handleFormChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="month">Membership Duration (Months)</label>
            <input type="number" id="month" name="month" value={memberForm.month} onChange={handleFormChange} min="1" required />
          </div>
          <div className="form-group">
            <label htmlFor="fees">Fees</label>
            <input type="number" id="fees" name="fees" value={memberForm.fees} onChange={handleFormChange} min="0" required />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea id="description" name="description" value={memberForm.description} onChange={handleFormChange}></textarea>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" onClick={() => dispatch(setShowAddModal(false))} className="btn-cancel">Cancel</button>
          <button type="submit" className="submit-btn" disabled={isAdding}>
            {isAdding && <Loader2 size={16} className="animate-spin" />}
            <span>Add Member</span>
          </button>
        </div>
      </MemberModal>

      {/* Update Member Modal - Using the Fixed Component */}
      <UpdateMemberModalFixed
        member={editingMember}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onUpdate={handleFixedModalUpdate}
        isLoading={isUpdating}
      />

      {/* Image Preview Modal */}
      {showImageModal && (
        <div 
          className="image-modal-overlay"
          onClick={closeImageModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer'
          }}
        >
          <div 
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <button
              onClick={closeImageModal}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '30px',
                cursor: 'pointer',
                padding: '5px',
                zIndex: 10000
              }}
              title="Close"
            >
              <X size={30} />
            </button>
            
            <img
              src={selectedImage}
              alt={selectedImageName}
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
              }}
            />
            
            <div
              style={{
                marginTop: '15px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '500',
                textAlign: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '8px 16px',
                borderRadius: '20px'
              }}
            >
              {selectedImageName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;
