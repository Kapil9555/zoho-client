// src/redux/api/vendorApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const vendorApi = createApi({
    reducerPath: 'vendorApi',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
        credentials: 'include',
    }),
    tagTypes: ['Vendor'],
    endpoints: (builder) => ({

        // LIST vendors with filters/pagination/sort
        getVendors: builder.query({
            // args: { page, limit, search, sort, from, to, source, hasEmail, hasPhone }
            query: (params = {}) => {
                const q = new URLSearchParams();
                Object.entries(params).forEach(([k, v]) => {
                    if (v !== undefined && v !== null && String(v).length) q.set(k, String(v));
                });
                const qs = q.toString();
                return `/vendors${qs ? `?${qs}` : ''}`;
            },
            transformResponse: (resp) => {
                // Expecting { list, meta } from backend controller
                return {
                    list: resp?.list ?? resp?.items ?? [],
                    meta: resp?.meta ?? {
                        total: Array.isArray(resp?.list) ? resp.list.length : 0,
                        page: 1,
                        limit: resp?.list?.length ?? 0,
                        pages: 1,
                    },
                };
            },
            providesTags: (result) =>
                result?.list
                    ? [
                        ...result.list.map((v) => ({ type: 'Vendor', id: v._id })),
                        { type: 'Vendor', id: 'LIST' },
                    ]
                    : [{ type: 'Vendor', id: 'LIST' }],
        }),

        // GET one vendor
        getVendorById: builder.query({
            query: (id) => `/vendors/${id}`,
            providesTags: (_res, _err, id) => [{ type: 'Vendor', id }],
        }),

        // CREATE vendor
        createVendor: builder.mutation({
            query: (data) => ({
                url: '/vendors',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'Vendor', id: 'LIST' }],
        }),

        // UPDATE vendor
        updateVendor: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/vendors/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_res, _err, arg) => [
                { type: 'Vendor', id: arg.id },
                { type: 'Vendor', id: 'LIST' },
            ],
        }),

        // DELETE vendor
        deleteVendor: builder.mutation({
            query: (id) => ({
                url: `/vendors/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_res, _err, id) => [
                { type: 'Vendor', id },
                { type: 'Vendor', id: 'LIST' },
            ],
        }),


        importVendors: builder.mutation({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: '/vendors/import',
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: [{ type: 'Vendor', id: 'LIST' }],
        }),
        getVendorByName: builder.query({
            query: ({ name, exact = false }) => {
                const q = new URLSearchParams();
                q.set('name', String(name || ''));
                if (exact) q.set('exact', '1');
                return `/vendors/by-name?${q.toString()}`;
            },
            transformResponse: (resp) => resp?.matches ?? [],
            providesTags: (result) =>
                result?.length
                    ? [
                        ...result.map((v) => ({ type: 'Vendor', id: v._id })),
                        { type: 'Vendor', id: 'LIST' },
                    ]
                    : [{ type: 'Vendor', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetVendorsQuery,
    useLazyGetVendorsQuery,
    useGetVendorByIdQuery,
    useCreateVendorMutation,
    useUpdateVendorMutation,
    useDeleteVendorMutation,
    useImportVendorsMutation,
    useGetVendorByNameQuery,
} = vendorApi;
