
import React from 'react';
import '../../styles/admin/DashboardCard.css';

const DashboardCard = ({ title, value }) => {
  return (
    <div className="dashboard-card">
      <h3 className="card-title">{title}</h3>
      <p className="card-value">{value !== undefined && value !== null ? value : 'N/A'}</p>
    </div>
  );
};

export default DashboardCard;
