import React, { useState } from 'react';
import { useGetMembersQuery } from '../../features/members/membersApiSlice';
import MembersTable from '../../components/admin/MembersTable';
import AddMemberModal from '../../components/admin/AddMemberModal';
import '../../styles/admin/MembersPage.css';

const Members = () => {
  const { data: members, isLoading, isError, error } = useGetMembersQuery();
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  if (isLoading) return <div className="loading-spinner">Loading members...</div>;
  if (isError) return <div className="error-message">Error: {error.data?.message || 'Failed to load members.'}</div>;

  return (
    <div className="members-page-container">
      <div className="page-header">
        <h1>Member Management</h1>
        <button onClick={() => setAddModalOpen(true)} className="add-member-btn">+ Add Member</button>
      </div>
      <MembersTable members={members?.members} />
      {isAddModalOpen && (
        <AddMemberModal closeModal={() => setAddModalOpen(false)} />
      )}
    </div>
  );
};

export default Members;