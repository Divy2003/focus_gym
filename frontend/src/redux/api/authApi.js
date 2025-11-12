import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${baseUrl}/auth`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: {
          mobile: `+91${credentials.mobile.replace(/\D/g, '').slice(-10)}`,
          password: credentials.password
        },
      }),
      transformResponse: (response) => {
        console.log('Login successful:', response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error('Login error:', response);
        return response.data || { message: 'Login failed. Please check your credentials.' };
      },
      invalidatesTags: ['Auth'],
    }),
    changePassword: builder.mutation({
      query: (passwords) => ({
        url: '/change-password',
        method: 'POST',
        body: passwords,
      }),
      transformResponse: (response) => {
        console.log('Password changed successfully');
        return response;
      },
      transformErrorResponse: (response) => {
        console.error('Change password error:', response);
        return response.data || { message: 'Failed to change password' };
      },
    }),
    getMe: builder.query({
      query: () => '/me',
      providesTags: ['Auth'],
      transformResponse: (response) => {
        console.log('Current user:', response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error('Get user error:', response);
        return response.data || { message: 'Failed to fetch user data' };
      },
    }),
  }),
});

export const { 
  useLoginMutation, 
  useChangePasswordMutation,
  useGetMeQuery,
  useLazyGetMeQuery 
} = authApi;
