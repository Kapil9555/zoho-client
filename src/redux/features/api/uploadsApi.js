import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const uploadsApi = createApi({
  reducerPath: 'uploadsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL_UPLOADS || 'http://localhost:5000/api/uploads',
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    // S3: still a query because it's GET
    getS3UploadUrl: builder.query({
      query: ({ fileName, fileType }) =>
        `/s3-url?fileName=${fileName}&fileType=${fileType}`,
    }),

    // Azure: use mutation because it's POST
    getAzureUploadUrl: builder.mutation({
      query: ({ fileName, fileType }) => ({
        url: '/azure-presign',
        method: 'POST',
        body: { fileName, fileType },
      }),
    }),

    
  }),
});

export const {
  useLazyGetS3UploadUrlQuery,
  useGetAzureUploadUrlMutation, 
} = uploadsApi;
