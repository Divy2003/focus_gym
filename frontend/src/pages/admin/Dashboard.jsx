
import React, { useEffect } from 'react';
import { useGetDashboardAnalyticsQuery, useGetExpiringMembersQuery } from '../../redux/api/gymApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  IndianRupee, 
  BookOpen, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Activity,
  UserPlus,
  FilePlus,
  UserMinus
} from 'lucide-react';
import '../../styles/admin/Dashboard.css';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { data: analytics, isLoading, error, refetch } = useGetDashboardAnalyticsQuery();
  const { data: expiringData } = useGetExpiringMembersQuery(7);

  const dashboardData = analytics?.analytics || {};
  
  const expiringMembers = expiringData?.expiringMembers || [];

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 300000); // Auto-refresh every 5 minutes
    return () => clearInterval(interval);
  }, [refetch]);

  const statusChartData = Object.entries(dashboardData.statusDistribution || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: status === 'approved' ? 'var(--green)' : status === 'pending' ? 'var(--yellow)' : 'var(--primary-red)',
  }));

  const monthlyChartData = dashboardData.monthlyStats || [];

  const StatCard = ({ icon: Icon, title, value, subtext, color = 'blue', trend = null }) => (
    <div className="stat-card">
      <div className="stat-card-flex">
        <div className="stat-card-info">
          <p className="title">{title}</p>
          <p className="value">{value}</p>
          {subtext && <p className="subtext">{subtext}</p>}
        </div>
        <div className={`stat-card-icon ${color}`}>
          <Icon className="icon" />
        </div>
      </div>
      {trend && (
        <div className="stat-card-trend">
          <TrendingUp className="icon" />
          <span className="text">{trend}</span>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>Error loading dashboard data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-flex">
            <div className="header-title">
              <h1>Admin Dashboard</h1>
              <p>Welcome back! Here's a snapshot of your gym's performance.</p>
            </div>
            <div className="last-updated">
              <Activity className="icon" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <Link to="/admin/members" className="quick-action-btn">
            <UserPlus size={20} />
            <span>Add Member</span>
          </Link>
          <Link to="/admin/diets" className="quick-action-btn">
            <FilePlus size={20} />
            <span>Create Diet Plan</span>
          </Link>
        </div>

        <div className="stats-grid">
          <StatCard icon={Users} title="Total Members" value={dashboardData.totalMembers || 0} color="blue" />
          <StatCard icon={UserCheck} title="Active Members" value={dashboardData.approvedMembers || 0} subtext="Approved & Paying" color="green" />
          <StatCard icon={IndianRupee} title="Monthly Revenue" value={`₹${(dashboardData.totalRevenue || 0).toLocaleString()}`} color="emerald" trend="+12% from last month" />
          <StatCard icon={BookOpen} title="Diet Plans" value={dashboardData.totalDietPlans || 0} subtext="Available plans" color="purple" />
        </div>

        <div className="secondary-stats-grid">
          <StatCard icon={UserX} title="Pending Approvals" value={dashboardData.pendingMembers || 0} color="yellow" />
          <StatCard icon={Clock} title="Expiring Soon" value={dashboardData.expiringMembersCount || 0} subtext="Next 7 days" color="orange" />
          <StatCard icon={Calendar} title="New This Month" value={dashboardData.newMembersThisMonth || 0} color="indigo" />
          <StatCard icon={UserMinus} title="Expired Members" value={dashboardData.statusDistribution.expired || 0} color="red" />
        </div>

        <div className="charts-grid">
          <div className="chart-container">
            <h3>Monthly Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-700)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--gray-400)' }} />
                <YAxis tick={{ fill: 'var(--gray-400)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--gray-800)', borderColor: 'var(--gray-700)' }} />
                <Line type="monotone" dataKey="members" stroke="var(--primary-red)" strokeWidth={3} dot={{ fill: 'var(--primary-red)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Member Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderColor: 'var(--gray-700)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="revenue-chart-container">
          <h3>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-700)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--gray-400)' }} />
              <YAxis tick={{ fill: 'var(--gray-400)' }} />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} contentStyle={{ backgroundColor: 'var(--gray-800)', borderColor: 'var(--gray-700)' }} />
              <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {expiringMembers.length > 0 && (
          <div className="expiring-members-alert">
            <div className="expiring-members-header">
              <AlertTriangle className="icon" />
              <h3>Members Expiring Soon ({expiringMembers.length})</h3>
            </div>
            <div className="expiring-members-grid">
              {expiringMembers.slice(0, 6).map((member) => (
                <div key={member._id} className="expiring-member-card">
                  <h4>{member.name}</h4>
                  <p>{member.mobile}</p>
                  <p className="expires">Expires: {new Date(member.endingDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            {expiringMembers.length > 6 && (
              <p className="more-members-text">And {expiringMembers.length - 6} more members...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

