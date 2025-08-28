
import { apiSlice } from '../api/apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: builder.mutation({
      query: (credentials) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
    verifyOtp: builder.mutation({
      query: (credentials) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: { ...credentials },
      }),
    }),
  }),
});

export const { useSendOtpMutation, useVerifyOtpMutation } = authApiSlice;
