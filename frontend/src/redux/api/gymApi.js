// src/store/api/gymApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const gymApi = createApi({
  reducerPath: 'gymApi',
  baseQuery,
  tagTypes: ['Auth', 'Member', 'DietPlan', 'Analytics'],
  endpoints: (builder) => ({
    // Auth endpoints
    sendOTP: builder.mutation({
      query: (mobile) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body: { mobile },
      }),
    }),
    verifyOTP: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Members endpoints
    getMembers: builder.query({
      query: (params = {}) => ({
        url: '/members',
        params,
      }),
      providesTags: ['Member'],
    }),
    addMember: builder.mutation({
      query: (memberData) => ({
        url: '/members',
        method: 'POST',
        body: memberData,
      }),
      invalidatesTags: ['Member', 'Analytics'],
    }),
    updateMember: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/members/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Member', 'Analytics'],
    }),
    deleteMember: builder.mutation({
      query: (id) => ({
        url: `/members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Member', 'Analytics'],
    }),
    bulkDeleteMembers: builder.mutation({
      query: (memberIds) => ({
        url: '/members/bulk-delete',
        method: 'POST',
        body: { memberIds },
      }),
      invalidatesTags: ['Member', 'Analytics'],
    }),
    sendMessage: builder.mutation({
      query: (data) => ({
        url: '/members/send-message',
        method: 'POST',
        body: data,
      }),
    }),

    // Diet Plans endpoints
    getDietPlans: builder.query({
      query: (params = {}) => ({
        url: '/diet',
        params,
      }),
      providesTags: ['DietPlan'],
    }),
    getDietPlan: builder.query({
      query: (id) => ({
        url: `/diet/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'DietPlan', id }],
    }),
    createDietPlan: builder.mutation({
      query: (dietPlanData) => ({
        url: '/diet',
        method: 'POST',
        body: dietPlanData,
      }),
      invalidatesTags: ['DietPlan', 'Analytics'],
    }),
    updateDietPlan: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/diet/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['DietPlan'],
    }),
    deleteDietPlan: builder.mutation({
      query: (id) => ({
        url: `/diet/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DietPlan', 'Analytics'],
    }),

    // Analytics endpoints
    getDashboardAnalytics: builder.query({
      query: () => '/analytics/dashboard',
      providesTags: ['Analytics'],
    }),
    getExpiringMembers: builder.query({
      query: (days = 7) => ({
        url: '/analytics/expiring-members',
        params: { days },
      }),
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useSendOTPMutation,
  useVerifyOTPMutation,
  useGetMembersQuery,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
  useBulkDeleteMembersMutation,
  useSendMessageMutation,
  useGetDietPlansQuery,
  useGetDietPlanQuery,
  useCreateDietPlanMutation,
  useUpdateDietPlanMutation,
  useDeleteDietPlanMutation,
  useGetDashboardAnalyticsQuery,
  useGetExpiringMembersQuery,
} = gymApi;