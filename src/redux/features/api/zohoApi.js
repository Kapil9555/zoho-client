// src/redux/api/zohoApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const zohoApi = createApi({
  reducerPath: 'zohoApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/`,
    credentials: 'include',
  }),
  // ⬇️ Add two tag types for controller-backed endpoints
  tagTypes: [
    'ZohoInvoices', 'ZohoInvoice',
    'ZohoPOs', 'ZohoPO',
    'ZohoBills', 'ZohoBill',
    'PurchaseOrders',
    'CRMInvoices', 'CRMPurchaseOrders',
    'OnlyInvoices',
    'SalesAuth',
    'SalesMembers'
  ],
  endpoints: (builder) => ({

    /* ===================== ZOHO (existing) ===================== */
    getInvoices: builder.query({
      query: ({ page = 1, per_page = 50, ...rest } = {}) => ({
        url: `/invoices`,
        params: { page, per_page, ...rest },
      }),
      transformResponse: (res) => ({
        list: res?.invoices || [],
        pageContext: res?.page_context || null,
        raw: res,
      }),
      providesTags: (result, error, args) => [
        { type: 'ZohoInvoices', id: JSON.stringify(args || {}) },
      ],
    }),

    getInvoiceById: builder.query({
      query: (id) => `/invoices/${id}`,
      transformResponse: (res) => res?.invoice || res,
      providesTags: (r, e, id) => [{ type: 'ZohoInvoice', id }],
    }),

    getPurchaseOrders: builder.query({
      query: ({ page = 1, per_page = 50, ...rest } = {}) => ({
        url: `/purchaseorders`,
        params: { page, per_page, ...rest },
      }),
      transformResponse: (res) => ({
        list: res?.purchaseorders || [],
        pageContext: res?.page_context || null,
        raw: res,
      }),
      providesTags: (result, error, args) => [
        { type: 'ZohoPOs', id: JSON.stringify(args || {}) },
      ],
    }),

    getPurchaseOrderById: builder.query({
      query: (id) => `/purchaseorders/${id}`,
      transformResponse: (res) => res?.purchaseorder || res,
      providesTags: (r, e, id) => [{ type: 'ZohoPO', id }],
    }),

    getBills: builder.query({
      query: ({ page = 1, per_page = 50, ...rest } = {}) => ({
        url: `/bills`,
        params: { page, per_page, ...rest },
      }),
      transformResponse: (res) => ({
        list: res?.bills || [],
        pageContext: res?.page_context || null,
        raw: res,
      }),
      providesTags: (result, error, args) => [
        { type: 'ZohoBills', id: JSON.stringify(args || {}) },
      ],
    }),

    getBillById: builder.query({
      query: (id) => `/bills/${id}`,
      transformResponse: (res) => res?.bill || res,
      providesTags: (r, e, id) => [{ type: 'ZohoBill', id }],
    }),

    getPurchaseOrdersByRef: builder.query({
      query: (params = {}) => ({
        url: 'purchaseorders/by-ref',
        params,
      }),
      providesTags: (result) =>
        result?.list
          ? [
            ...result.list.map((po) => ({ type: 'PurchaseOrders', id: po.purchaseorder_id })),
            { type: 'PurchaseOrders', id: 'LIST' },
          ]
          : [{ type: 'PurchaseOrders', id: 'LIST' }],
      keepUnusedDataFor: 30,
    }),

    getDashboard: builder.query({
      query: (params) => {
        const qs = new URLSearchParams(params || {}).toString();
        return `/dashboard${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Dashboard'],
    }),

    /* ===================== CRM (Node controllers) — NEW ===================== */
    // GET /api/invoices?search=&page=&limit=&personName=&from=&to=&month=
    getCrmInvoices: builder.query({
      query: ({ page = 1, limit = 25, ...rest } = {}) => ({
        url: `invoices`,
        params: { page, limit, ...rest },
      }),
      // Normalize to a predictable shape for components
      transformResponse: (res) => ({
        list: res?.items || [],
        meta: {
          page: res?.page ?? 1,
          limit: res?.limit ?? 25,
          total: res?.total ?? 0,
          pages: res?.pages ?? 0,
        },
        raw: res,
      }),
      providesTags: (result, error, args) => [
        { type: 'CRMInvoices', id: JSON.stringify(args || {}) },
      ],
      keepUnusedDataFor: 0,
      forceRefetch: () => true,
    }),


    getOnlyInvoices: builder.query({
      query: (params) => ({
        url: '/invoices-only',
        params,
      }),
      providesTags: ['OnlyInvoices'],
    }),
    getOnlyPiSummary: builder.query({
      query: (params) => ({
        url: '/pi-summary',
        params,
      }),
      providesTags: ['OnlyInvoices'],
    }),


    // GET /api/purchaseorders?search=&page=&limit=&personName=&from=&to=&month=
    getCrmPurchaseOrders: builder.query({
      query: ({ page = 1, limit = 25, ...rest } = {}) => ({
        url: `purchaseorders`,
        params: { page, limit, ...rest },
      }),
      transformResponse: (res) => ({
        list: res?.items || [],
        meta: {
          page: res?.page ?? 1,
          limit: res?.limit ?? 25,
          total: res?.total ?? 0,
          pages: res?.pages ?? 0,
        },
        raw: res,
      }),
      providesTags: (result, error, args) => [
        { type: 'CRMPurchaseOrders', id: JSON.stringify(args || {}) },
      ],
      keepUnusedDataFor: 60,
    }),


    getSalesMembers: builder.query({
      query: (params) => ({
        url: '/admin/sales-members',
        params,
      }),
      providesTags: ['SalesMembers'],
    }),
    getSalesMemberById: builder.query({
      query: (id) => `/admin/sales-members/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'SalesMembers', id }],
    }),
    addSalesMember: builder.mutation({
      query: (body) => ({
        url: '/admin/sales-members',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SalesMembers'],
    }),
    updateSalesMember: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/sales-members/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'SalesMembers', id }, 'SalesMembers'],
    }),
    updateSalesMemberStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/admin/sales-members/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'SalesMembers', id }, 'SalesMembers'],
    }),
    deleteSalesMember: builder.mutation({
      query: (id) => ({
        url: `/admin/sales-members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SalesMembers'],
    }),


    /* ===================== Sales Auth (cookie-based) ===================== */
    loginSales: builder.mutation({
      query: ({ identifier, email, phone, password }) => ({
        url: '/sales/auth/login',
        method: 'POST',
        body: { identifier, email, phone, password },
        // cookies already included via baseQuery.credentials = 'include'
      }),
      // After login, refetch auth-dependent UI
      invalidatesTags: ['SalesAuth'],
    }),

    logoutSales: builder.mutation({
      query: () => ({
        url: '/sales/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['SalesAuth'],
    }),

    getSalesMe: builder.query({
      query: () => '/sales/auth/me',
      transformResponse: (res) => res?.user || null,
      providesTags: ['SalesAuth'],
      // If you want it to re-check occasionally, you can add: keepUnusedDataFor: 0
    }),



  }),
});

export const {
  // existing exports...
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useGetBillsQuery,
  useGetBillByIdQuery,
  useGetPurchaseOrdersByRefQuery,
  useGetDashboardQuery,


  // NEW controller-backed hooks
  useGetOnlyInvoicesQuery,
  useGetCrmInvoicesQuery,
  useLazyGetCrmInvoicesQuery,
  useGetCrmPurchaseOrdersQuery,
  useLazyGetCrmPurchaseOrdersQuery,
  useGetOnlyPiSummaryQuery,



  useGetSalesMembersQuery,
  useGetSalesMemberByIdQuery,
  useAddSalesMemberMutation,
  useUpdateSalesMemberMutation,
  useUpdateSalesMemberStatusMutation,
  useDeleteSalesMemberMutation,


  useLoginSalesMutation,
  useLogoutSalesMutation,
  useGetSalesMeQuery,


} = zohoApi;
