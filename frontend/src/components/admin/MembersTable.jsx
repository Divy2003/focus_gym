
import React, { useState } from 'react';
import UpdateMemberModal from './UpdateMemberModal';
import ConfirmationModal from './ConfirmationModal';
import SendMessageModal from './SendMessageModal';
import { useDeleteMemberMutation, useBulkDeleteMembersMutation } from '../../features/members/membersApiSlice';
import '../../styles/admin/MembersTable.css';

const MembersTable = ({ members }) => {
  if (!members) {
    return <p>No members found.</p>;
  }
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [isSendMessageModalOpen, setSendMessageModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [deleteMember] = useDeleteMemberMutation();
  const [bulkDeleteMembers] = useBulkDeleteMembersMutation();

  const handleSelectMember = (id) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(memberId => memberId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedMembers(members.map(m => m._id));
    } else {
      setSelectedMembers([]);
    }
  };

  const openUpdateModal = (member) => {
    setSelectedMember(member);
    setUpdateModalOpen(true);
  };

  const openDeleteModal = (member) => {
    setSelectedMember(member);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    await deleteMember(selectedMember._id);
    setDeleteModalOpen(false);
  };

  const handleBulkDelete = async () => {
    await bulkDeleteMembers(selectedMembers);
    setBulkDeleteModalOpen(false);
    setSelectedMembers([]);
  };

  return (
    <div className="members-table-container">
      <div className="bulk-actions">
        <button onClick={() => setBulkDeleteModalOpen(true)} disabled={selectedMembers.length === 0}>Delete Selected</button>
        <button onClick={() => setSendMessageModalOpen(true)} disabled={selectedMembers.length === 0}>Send Message</button>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" onChange={handleSelectAll} /></th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Expiry Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member._id}>
                <td><input type="checkbox" checked={selectedMembers.includes(member._id)} onChange={() => handleSelectMember(member._id)} /></td>
                <td>{member.name}</td>
                <td>{member.mobile}</td>
                <td><span className={`status-badge status-${member.status}`}>{member.status}</span></td>
                <td>{new Date(member.expiryDate).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => openUpdateModal(member)} className="action-btn update-btn">Edit</button>
                  <button onClick={() => openDeleteModal(member)} className="action-btn delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isUpdateModalOpen && <UpdateMemberModal member={selectedMember} closeModal={() => setUpdateModalOpen(false)} />}
      {isDeleteModalOpen && <ConfirmationModal title="Delete Member" message={`Are you sure you want to delete ${selectedMember?.name}?`} onConfirm={handleDelete} onCancel={() => setDeleteModalOpen(false)} />}
      {isBulkDeleteModalOpen && <ConfirmationModal title="Bulk Delete Members" message={`Are you sure you want to delete ${selectedMembers.length} members?`} onConfirm={handleBulkDelete} onCancel={() => setBulkDeleteModalOpen(false)} />}
      {isSendMessageModalOpen && <SendMessageModal memberIds={selectedMembers} closeModal={() => setSendMessageModalOpen(false)} />}
    </div>
  );
};

export default MembersTable;
