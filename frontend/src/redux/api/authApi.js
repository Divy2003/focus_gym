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
  endpoints: (builder) => ({
    sendOtp: builder.mutation({
      query: (mobile) => {
        // Remove any non-digit characters and ensure it's a 10-digit number
        const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
        return {
          url: '/send-otp',
          method: 'POST',
          body: { mobile: `+91${cleanMobile}` },
        };
      },
      transformResponse: (response, meta, arg) => {
        console.log('Raw sendOtp response:', response);
        return response;
      },
      transformErrorResponse: (response, meta, arg) => {
        console.error('Send OTP error:', response);
        return response.data || { message: 'Failed to send OTP' };
      },
    }),
    verifyOtp: builder.mutation({
      query: ({ mobile, otp }) => {
        // Remove any non-digit characters and ensure it's a 10-digit number
        const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
        return {
          url: '/verify-otp',
          method: 'POST',
          body: { mobile: `+91${cleanMobile}`, otp },
        };
      },
      transformResponse: (response, meta, arg) => {
        console.log('Raw verifyOtp response:', response);
        return response;
      },
      transformErrorResponse: (response, meta, arg) => {
        console.error('Verify OTP error:', response);
        return response.data || { message: 'Failed to verify OTP' };
      },
    }),
  }),
});

export const { useSendOtpMutation, useVerifyOtpMutation } = authApi;
