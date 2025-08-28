
import React from 'react';
import '../../styles/admin/ExpiringMembersTable.css';

const ExpiringMembersTable = ({ members }) => {
  const memberList = Array.isArray(members) ? members : members?.expiringMembers;

  if (!memberList || memberList.length === 0) {
    return <p>No members are expiring soon.</p>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="table-container">
      <table className="expiring-members-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile</th>
            <th>Expiry Date</th>
            <th>Days Left</th>
          </tr>
        </thead>
        <tbody>
          {memberList.map((member) => (
            <tr key={member?._id || Math.random().toString(36).substr(2, 9)}>
              <td>{member?.name || 'N/A'}</td>
              <td>{member?.mobile || 'N/A'}</td>
              <td>{formatDate(member?.expiryDate)}</td>
              <td>{member?.daysLeft ?? 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpiringMembersTable;
