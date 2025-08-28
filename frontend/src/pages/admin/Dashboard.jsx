import React from 'react';
import { useGetDashboardAnalyticsQuery, useGetExpiringMembersQuery } from '../../features/analytics/analyticsApiSlice';
import DashboardCard from '../../components/admin/DashboardCard';
import ExpiringMembersTable from '../../components/admin/ExpiringMembersTable';
import '../../styles/admin/Dashboard.css';

const Dashboard = () => {
  const { data: analytics, isLoading: isLoadingAnalytics, isError: isErrorAnalytics, error: analyticsError } = useGetDashboardAnalyticsQuery();
  const { data: expiringMembers, isLoading: isLoadingMembers, isError: isErrorMembers, error: membersError } = useGetExpiringMembersQuery();

  if (isLoadingAnalytics || isLoadingMembers) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (isErrorAnalytics || isErrorMembers) {
    return <div className="error-message">Error: {analyticsError?.data?.message || membersError?.data?.message || 'Failed to load dashboard data.'}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-cards-grid">
        <DashboardCard title="Total Members" value={analytics?.totalMembers} />
        <DashboardCard title="Active Members" value={analytics?.activeMembers} />
        <DashboardCard title="Pending Approvals" value={analytics?.pendingApprovals} />
        <DashboardCard title="Total Revenue" value={`₹${analytics?.totalRevenue}`} />
      </div>
      <div className="expiring-members-section">
        <h2>Expiring Members</h2>
        <ExpiringMembersTable members={expiringMembers?.expiringMembers} />
      </div>
    </div>
  );
};

export default Dashboard;