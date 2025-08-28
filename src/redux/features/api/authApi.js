// src/redux/api/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl:  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api', 
    credentials: 'include', 
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.query({
      query: (id) => `users/logout`,
    }),
    
  }),
});

export const { useLoginMutation, useRegisterMutation,useLazyLogoutQuery } = authApi;
