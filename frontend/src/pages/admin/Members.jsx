import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  useGetMembersQuery, 
  useAddMemberMutation, 
  useUpdateMemberMutation, 
  useDeleteMemberMutation,
  useBulkDeleteMembersMutation,
  useSendMessageMutation 
} from '../../redux/api/gymApi';
import {
  setFilters, 
  setSelectedMembers, 
  toggleMemberSelection, 
  selectAllMembers, 
  clearSelectedMembers,
  setShowAddModal,
  setShowEditModal,
  setShowMessageModal,
  setEditingMember
} from '../../redux/slices/membersSlice.js';
import { 
  Search, Plus, Edit, Trash2, MessageSquare, X, Users, Calendar, Phone, IndianRupee, CheckCircle, Clock, XCircle, Loader2
} from 'lucide-react';
import '../../styles/admin/MembersPage.css';

const MembersPage = () => {
  const dispatch = useDispatch();
  const { selectedMembers, filters, showAddModal, showEditModal, showMessageModal, editingMember } = useSelector(state => state.members);
  
  const { data: membersData, isLoading, error, refetch } = useGetMembersQuery(filters);
  const [addMember, { isLoading: isAdding }] = useAddMemberMutation();
  const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMutation();
  const [deleteMember] = useDeleteMemberMutation();
  const [bulkDeleteMembers] = useBulkDeleteMembersMutation();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const members = membersData?.members || [];
  const pagination = membersData?.pagination || {};

  const [memberForm, setMemberForm] = useState({ name: '', mobile: '', month: 1, fees: 0, description: '' });
  const [messageForm, setMessageForm] = useState({ message: '', includeLink: false });

  useEffect(() => {
    if (showEditModal && editingMember) {
      setMemberForm({
        name: editingMember.name,
        mobile: editingMember.mobile,
        month: editingMember.month,
        fees: editingMember.fees,
        description: editingMember.description || ''
      });
    } else {
      setMemberForm({ name: '', mobile: '', month: 1, fees: 0, description: '' });
    }
  }, [showEditModal, editingMember]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setMemberForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await addMember(memberForm).unwrap();
      dispatch(setShowAddModal(false));
      refetch();
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    try {
      await updateMember({ id: editingMember._id, ...memberForm }).unwrap();
      dispatch(setShowEditModal(false));
      refetch();
    } catch (err) {
      console.error('Failed to update member:', err);
    }
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await sendMessage({ memberIds: selectedMembers, ...messageForm }).unwrap();
      dispatch(setShowMessageModal(false));
      setMessageForm({ message: '', includeLink: false });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const getStatusBadge = (status, endingDate) => {
    const isExpired = new Date(endingDate) < new Date();
    const actualStatus = isExpired ? 'expired' : status;
    const statusConfig = {
      approved: { class: 'approved', icon: CheckCircle },
      pending: { class: 'pending', icon: Clock },
      expired: { class: 'expired', icon: XCircle }
    };
    const config = statusConfig[actualStatus];
    const StatusIcon = config.icon;
    return (
      <span className={`status-badge ${config.class}`}>
        <StatusIcon size={12} />
        <span>{actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}</span>
      </span>
    );
  };

  const MemberModal = ({ isOpen, onClose, onSubmit, title, isLoading, children }) => {
    if (!isOpen) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>{title}</h2>
            <button onClick={onClose} className="modal-close-btn"><X size={24} /></button>
          </div>
          <div className="modal-body">
            <form onSubmit={onSubmit}>{children}</form>
          </div>
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
          <button onClick={() => dispatch(setShowAddModal(true))} className="add-member-btn">
            <Plus size={20} />
            Add Member
          </button>
        </div>

        <div className="filters-container">
          <div className="filters-flex">
            <div className="filter-controls">
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
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            {selectedMembers.length > 0 && (
              <div className="bulk-actions">
                <button onClick={() => dispatch(setShowMessageModal(true))} className="action-btn message-btn">
                  <MessageSquare size={16} />
                  <span>Message ({selectedMembers.length})</span>
                </button>
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
                  <th><input type="checkbox" className="checkbox" checked={members.length > 0 && selectedMembers.length === members.length} onChange={(e) => dispatch(e.target.checked ? selectAllMembers(members.map(m => m._id)) : clearSelectedMembers())} /></th>
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
                    <td><input type="checkbox" className="checkbox" checked={selectedMembers.includes(member._id)} onChange={() => dispatch(toggleMemberSelection(member._id))} /></td>
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
                    <td>{getStatusBadge(member.status, member.endingDate)}</td>
                    <td><div className="fees"><IndianRupee size={16} />{member.fees.toLocaleString()}</div></td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => dispatch(setEditingMember(member))} className="icon-btn edit-btn" title="Edit member"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteMember(member._id)} className="icon-btn delete-btn" title="Delete member"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      <MemberModal isOpen={showAddModal || showEditModal} onClose={() => dispatch(showAddModal ? setShowAddModal(false) : setShowEditModal(false))} onSubmit={showAddModal ? handleAddMember : handleUpdateMember} title={showAddModal ? 'Add New Member' : 'Update Member'} isLoading={isAdding || isUpdating}>
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
        <div className="modal-footer">
          <button type="submit" className="submit-btn" disabled={isAdding || isUpdating}>
            {(isAdding || isUpdating) && <Loader2 size={16} className="animate-spin" />}
            <span>{showAddModal ? 'Add Member' : 'Save Changes'}</span>
          </button>
        </div>
      </MemberModal>

      <MemberModal isOpen={showMessageModal} onClose={() => dispatch(setShowMessageModal(false))} onSubmit={handleSendMessage} title={`Send Message to ${selectedMembers.length} Members`} isLoading={isSending}>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" value={messageForm.message} onChange={(e) => setMessageForm(p => ({...p, message: e.target.value}))} required></textarea>
        </div>
        <div className="checkbox-group">
          <input type="checkbox" id="includeLink" name="includeLink" checked={messageForm.includeLink} onChange={(e) => setMessageForm(p => ({...p, includeLink: e.target.checked}))} />
          <label htmlFor="includeLink">Include app link in message</label>
        </div>
        <div className="modal-footer">
          <button type="submit" className="submit-btn" disabled={isSending}>
            {isSending && <Loader2 size={16} className="animate-spin" />}
            <span>Send Message</span>
          </button>
        </div>
      </MemberModal>
    </div>
  );
};

export default MembersPage;
