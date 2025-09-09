import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
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
  Search, Plus, Edit, Trash2, MessageSquare, X, Users, Calendar, Phone, IndianRupee, CheckCircle, Clock, XCircle, Loader2, MessageCircle
} from 'lucide-react';
import UpdateMemberModalFixed from '../../components/admin/UpdateMemberModalFixed';
import '../../styles/admin/MembersPage.css';

const MembersPage = () => {
  const openWhatsAppChat = (mobile) => {
    // Remove any non-numeric characters from the mobile number
    const phoneNumber = mobile.replace(/\D/g, '');
    // Open WhatsApp chat with the member's number
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };
  const dispatch = useDispatch();
  const { selectedMembers = [], filters, showAddModal, showEditModal, editingMember } = useSelector(state => state.members);
  
  const { data: membersData, isLoading, error, refetch } = useGetMembersQuery(filters);
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
    status: 'pending' 
  });

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
        status: 'pending' 
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
          <button  className="add-member-btn">
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
                <option value="approved">Approved</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
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
                  <th>Membership</th>
                  <th>Status</th>
                  <th>Fees</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
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
                        <div className="member-avatar">{member.name.charAt(0).toUpperCase()}</div>
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
                          className="icon-btn whatsapp-btn" 
                          title="Message on WhatsApp"
                        >
                          <MessageCircle size={16} />
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
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination.total > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">Showing {((pagination.current - 1) * filters.limit) + 1} to {Math.min(pagination.current * filters.limit, pagination.totalMembers)} of {pagination.totalMembers} results</div>
              <div className="pagination-controls">
                <button onClick={() => dispatch(setFilters({ page: pagination.current - 1 }))} disabled={pagination.current === 1} className="page-btn">Previous</button>
                <span className="page-indicator">Page {pagination.current} of {pagination.total}</span>
                <button onClick={() => dispatch(setFilters({ page: pagination.current + 1 }))} disabled={pagination.current === pagination.total} className="page-btn">Next</button>
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
    </div>
  );
};

export default MembersPage;
