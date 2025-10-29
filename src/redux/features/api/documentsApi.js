import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const documentsApi = createApi({
  reducerPath: 'documentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['PiDocs'],
  endpoints: (builder) => ({
    getPiDocs: builder.query({
      query: (piId) => `/documents/${encodeURIComponent(piId)}`,
      providesTags: (_res, _err, piId) => [{ type: 'PiDocs', id: piId }],
    }),
    upsertPiDocs: builder.mutation({
      query: ({ piId, documents }) => ({
        url: `/documents/${encodeURIComponent(piId)}`,
        method: 'PUT',
        body: { documents },    // piId comes from URL
      }),
      invalidatesTags: (_r, _e, { piId }) => [{ type: 'PiDocs', id: piId }],
    }),
    deletePiDocs: builder.mutation({
      query: (piId) => ({
        url: `/documents/${encodeURIComponent(piId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, piId) => [{ type: 'PiDocs', id: piId }],
    }),
  }),
});

export const {
  useGetPiDocsQuery,
  useUpsertPiDocsMutation,
  useDeletePiDocsMutation,
} = documentsApi;
