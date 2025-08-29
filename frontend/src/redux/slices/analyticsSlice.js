// src/store/slices/analyticsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dashboardData: {
    totalMembers: 0,
    approvedMembers: 0,
    pendingMembers: 0,
    expiredMembers: 0,
    newMembersThisMonth: 0,
    totalRevenue: 0,
    totalDietPlans: 0,
    expiringMembersCount: 0,
    monthlyStats: [],
    statusDistribution: {},
  },
  expiringMembers: [],
  loading: false,
  error: null,
  selectedDateRange: '6months',
  refreshInterval: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setDashboardData: (state, action) => {
      state.dashboardData = action.payload;
      state.loading = false;
    },
    setExpiringMembers: (state, action) => {
      state.expiringMembers = action.payload;
    },
    setSelectedDateRange: (state, action) => {
      state.selectedDateRange = action.payload;
    },
    updateAnalyticsField: (state, action) => {
      const { field, value } = action.payload;
      state.dashboardData[field] = value;
    },
    incrementCounter: (state, action) => {
      const field = action.payload;
      if (state.dashboardData[field] !== undefined) {
        state.dashboardData[field] += 1;
      }
    },
    decrementCounter: (state, action) => {
      const field = action.payload;
      if (state.dashboardData[field] !== undefined && state.dashboardData[field] > 0) {
        state.dashboardData[field] -= 1;
      }
    },
    addRevenue: (state, action) => {
      state.dashboardData.totalRevenue += action.payload;
    },
    subtractRevenue: (state, action) => {
      const amount = action.payload;
      if (state.dashboardData.totalRevenue >= amount) {
        state.dashboardData.totalRevenue -= amount;
      }
    },
    updateStatusDistribution: (state, action) => {
      const { oldStatus, newStatus } = action.payload;
      
      if (oldStatus && state.dashboardData.statusDistribution[oldStatus]) {
        state.dashboardData.statusDistribution[oldStatus] -= 1;
        if (state.dashboardData.statusDistribution[oldStatus] === 0) {
          delete state.dashboardData.statusDistribution[oldStatus];
        }
      }
      
      if (newStatus) {
        state.dashboardData.statusDistribution[newStatus] = 
          (state.dashboardData.statusDistribution[newStatus] || 0) + 1;
      }
    },
    setRefreshInterval: (state, action) => {
      state.refreshInterval = action.payload;
    },
    resetAnalytics: (state) => {
      state.dashboardData = initialState.dashboardData;
      state.expiringMembers = [];
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setDashboardData,
  setExpiringMembers,
  setSelectedDateRange,
  updateAnalyticsField,
  incrementCounter,
  decrementCounter,
  addRevenue,
  subtractRevenue,
  updateStatusDistribution,
  setRefreshInterval,
  resetAnalytics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;