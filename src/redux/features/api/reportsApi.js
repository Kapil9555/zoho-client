import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const reportsApi = createApi({
  reducerPath: "reportsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Reports"],
  endpoints: (builder) => ({
    // Add new daily report
    addDailyReport: builder.mutation({
      query: (data) => ({
        url: "/daily-reports",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Reports"],
    }),

    // Update existing report
    updateDailyReport: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/daily-reports/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Reports"],
    }),

    // Get logged-in user's reports
    getMyReports: builder.query({
      query: (params) => ({
        url:"/daily-reports/my-reports",
        params,
      }),
      providesTags: ["Reports"],
    }),
    // Get all reports (Admin)
    getAllReports: builder.query({
      query: (params) => ({
        url: "/daily-reports/admin",
        params,
      }),
      providesTags: ["Reports"],
    }),

    deleteDailyReport: builder.mutation({
      query: (id) => ({
        url: `/daily-reports/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reports"],
    }),
  }),
});

export const {
  useAddDailyReportMutation,
  useUpdateDailyReportMutation,
  useGetMyReportsQuery,
  useGetAllReportsQuery,
  useDeleteDailyReportMutation
} = reportsApi;
