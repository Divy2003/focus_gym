
import { apiSlice } from '../api/apiSlice';

export const analyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardAnalytics: builder.query({
      query: () => '/analytics/dashboard',
      providesTags: ['Analytics'],
    }),
    getExpiringMembers: builder.query({
      query: () => '/analytics/expiring-members',
      providesTags: ['Member'],
    }),
  }),
});

export const {
  useGetDashboardAnalyticsQuery,
  useGetExpiringMembersQuery,
} = analyticsApiSlice;
