// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { use } from 'react';

// export const adminApi = createApi({
//   reducerPath: 'adminApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
//     credentials: 'include',
//   }),
//   tagTypes: ['Product', 'User', 'Order', 'Categories', 'PaymentSettings', 'CompanyProfile', 'Inventory'],
//   endpoints: (builder) => ({
//     // Products
//     getProducts: builder.query({
//       query: ({ includeInactive = false }) => ({
//         url: `/products?includeInactive=${includeInactive}`,
//       }),
//       providesTags: ['Product'],
//     }),
//     getProductById: builder.query({
//       query: (id) => `/products/${id}`,
//       providesTags: ['Product'],
//     }),
//     addProduct: builder.mutation({
//       query: (product) => ({
//         url: '/products',
//         method: 'POST',
//         body: product,
//       }),
//       invalidatesTags: ['Product'],
//     }),
//     updateProduct: builder.mutation({
//       query: ({ id, ...body }) => ({
//         url: `/products/${id}`,
//         method: 'PUT',
//         body,
//       }),
//       invalidatesTags: ['Product'],
//     }),
//     deleteProduct: builder.mutation({
//       query: (id) => ({
//         url: `/products/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['Product'],
//     }),
//     bulkDeleteProducts: builder.mutation({
//       query: (ids) => ({
//         url: '/products/bulk',
//         method: 'DELETE',
//         body: { ids },
//       }),
//       invalidatesTags: ['Product'],
//     }),
//     updateProductStatus: builder.mutation({
//       query: ({ id, status }) => ({
//         url: `/products/${id}/status`,
//         method: 'PATCH',
//         body: { status },
//       }),
//       invalidatesTags: ['Product', 'Inventory'],
//     }),

//     // Categories
//     getCategories: builder.query({
//       query: () => '/categories',
//       transformResponse: (response) => ({
//         categories: response,
//       }),
//       providesTags: ['Categories'],
//     }),

//     getCategoryById: builder.query({
//       query: (id) => `/categories/${id}`,
//       providesTags: (result, error, id) => [{ type: 'Categories', id }],
//     }),

//     addCategory: builder.mutation({
//       query: (body) => ({
//         url: `/categories`,
//         method: 'POST',
//         body,
//       }),
//       invalidatesTags: ['Categories'],
//     }),

//     updateCategory: builder.mutation({
//       query: ({ id, ...body }) => ({
//         url: `/categories/${id}`,
//         method: 'PUT',
//         body,
//       }),
//       invalidatesTags: ['Categories'],
//     }),

//     deleteCategory: builder.mutation({
//       query: (id) => ({
//         url: `/categories/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['Categories'],
//     }),

//     bulkDeleteCategories: builder.mutation({
//       query: (ids) => ({
//         url: '/categories/bulk',
//         method: 'DELETE',
//         body: { ids },
//       }),
//       invalidatesTags: ['Categories'],
//     }),

//     updateCategoryStatus: builder.mutation({
//       query: ({ id, status }) => ({
//         url: `/categories/${id}/status`,
//         method: 'PATCH',
//         body: { status },
//       }),
//       invalidatesTags: ['Categories'],
//     }),

//     checkSlugExists: builder.query({
//       query: (slug) => `category/check-slug/${slug}`,
//     }),

//     // users 
//     getUsers: builder.query({
//       query: () => '/users',
//       providesTags: ['User'],
//     }),

//     deleteUser: builder.mutation({
//       query: (id) => ({
//         url: `/users/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: ['User'],
//     }),

//     updateUser: builder.mutation({
//       query: ({ id, ...data }) => ({
//         url: `/users/${id}`,
//         method: 'PUT',
//         body: data,
//       }),
//       invalidatesTags: ['User'],
//     }),

//     getAllUsers: builder.query({
//       query: () => `/users`,
//       providesTags: ['User'],
//     }),

//     updateKYCStatus: builder.mutation({
//       query: ({ id, body }) => ({
//         url: `/users/${id}/kyc`,
//         method: 'PATCH',
//         body,
//       }),
//       invalidatesTags: ['Users'],
//     }),

//     getUserById: builder.query({
//       query: (id) => `/users/${id}`,
//       providesTags: (result, error, id) => [{ type: 'User', id }],
//     }),

//     addUser: builder.mutation({
//       query: (data) => ({
//         url: `/users`,
//         method: 'POST',
//         body: data,
//       }),
//       invalidatesTags: ['User'],
//     }),

//     updateUserStatus: builder.mutation({
//       query: ({ id, isActive }) => ({
//         url: `/users/${id}/status`,
//         method: 'PATCH',
//         body: { isActive },
//       }),
//       invalidatesTags: ['User'],
//     }),
//     // Orders
//     getOrders: builder.query({
//       query: () => '/orders',
//       providesTags: ['Order'],
//     }),

//     getOrderById: builder.query({
//       query: (id) => `/orders/${id}`,
//       providesTags: (result, error, id) => [{ type: 'Order', id }],
//     }),

//     updateOrderStatus: builder.mutation({
//       query: ({ id, status }) => ({
//         url: `/orders/${id}/status`,
//         method: 'PUT',
//         body: { status },
//       }),
//       invalidatesTags: ['Order'],
//     }),

//     markOrderDelivered: builder.mutation({
//       query: (id) => ({
//         url: `/orders/${id}/deliver`,
//         method: 'PUT',
//       }),
//       invalidatesTags: ['Order'],
//     }),

//     updateOrderNotes: builder.mutation({
//       query: ({ id, internalNotes }) => ({
//         url: `/orders/${id}/notes`,
//         method: 'PUT',
//         body: { internalNotes },
//       }),
//       invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
//     }),

//     updateOrder: builder.mutation({
//       query: ({ id, ...body }) => ({
//         url: `/orders/${id}`,
//         method: 'PUT',
//         body,
//       }),
//       invalidatesTags: ['Order'],
//     }),
//     // Payment Settings
//     getPaymentSettings: builder.query({
//       query: () => '/payment-settings',
//       providesTags: ['PaymentSettings'],
//     }),

//     updatePaymentSettings: builder.mutation({
//       query: (data) => ({
//         url: '/payment-settings',
//         method: 'PUT',
//         body: data,
//       }),
//       invalidatesTags: ['PaymentSettings'],
//     }),

//     updatePaymentStatus: builder.mutation({
//       query: ({ id, paymentStatus }) => ({
//         url: `/orders/${id}/payment-status`,
//         method: 'PUT',
//         body: { paymentStatus },
//       }),
//       invalidatesTags: ['Order'],
//     }),
//     // Company Profile
//     getCompanyProfile: builder.query({
//       query: () => '/settings/company-profile',
//       providesTags: ['CompanyProfile'],
//     }),

//     updateCompanyProfile: builder.mutation({
//       query: (data) => ({
//         url: '/settings/company-profile',
//         method: 'PUT',
//         body: data,
//       }),
//       invalidatesTags: ['CompanyProfile'],
//     }),

//     // inventory section


//     // ---------------- INVENTORY ----------------
//     getInventory: builder.query({
//       query: () => '/inventory',
//       providesTags: (result) =>
//         result
//           ? [
//             { type: 'Inventory', id: 'LIST' },
//             ...result.map((p) => ({ type: 'Inventory', id: p._id })),
//           ]
//           : [{ type: 'Inventory', id: 'LIST' }],
//     }),

//     adjustStock: builder.mutation({
//       query: (body) => ({
//         url: '/inventory/adjust',   // use POST if your server route is POST
//         method: 'POST',
//         body,
//       }),
//       // optimistic update + targeted invalidation
//       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//         const { productId, quantity, action, direction, location } = arg || {};
//         const locKey = String(location || '').toLowerCase();
//         const qtyNum = Number(quantity) || 0;

//         // compute signed delta exactly like backend
//         const signedDelta =
//           action === 'Restock' || action === 'Return'
//             ? qtyNum
//             : action === 'Damaged'
//               ? -qtyNum
//               : action === 'Manual Adjustment'
//                 ? (String(direction || 'Increase').toLowerCase() === 'decrease' ? -qtyNum : qtyNum)
//                 : 0;

//         // patch the getInventory cache (arg for getInventory is `undefined` in your usage)
//         const patch = dispatch(
//           adminApi.util.updateQueryData('getInventory', undefined, (draft) => {
//             const item = draft?.find((p) => p._id === productId);
//             if (!item) return;

//             if (!Array.isArray(item.stockByLocation)) item.stockByLocation = [];
//             let row = item.stockByLocation.find((r) => String(r.location).toLowerCase() === locKey);

//             if (!row) {
//               if (signedDelta > 0) {
//                 item.stockByLocation.push({ location: locKey, qty: signedDelta });
//               }
//             } else {
//               row.qty = Math.max(0, (Number(row.qty) || 0) + signedDelta);
//             }

//             item.totalStock = (item.stockByLocation || []).reduce(
//               (s, r) => s + (Number(r.qty) || 0),
//               0
//             );
//           })
//         );

//         try {
//           await queryFulfilled;
//         } catch {
//           // rollback if the request fails
//           patch.undo();
//         }
//       },
//       // precise invalidation (refetches just the changed product + the list)
//       invalidatesTags: (result, error, { productId }) => [
//         { type: 'Inventory', id: productId },
//         { type: 'Inventory', id: 'LIST' },
//         { type: 'InventoryLogs', id: productId },
//       ],
//     }),

//     getInventoryLogs: builder.query({
//       query: (productId) => `/inventory/logs/${productId}`,
//       providesTags: (result, error, productId) => [{ type: 'InventoryLogs', id: productId }],
//     }),



//     // dashboard
//     getDashboardStats: builder.query({
//       query: () => '/admin/dashboard',
//       providesTags: ['Dashboard'],
//     }),


//     getProductsByCategory: builder.query({
//       query: ({ categoryId, excludeId, limit = 8 }) => {
//         const params = new URLSearchParams();
//         params.set('category', categoryId);
//         if (excludeId) params.set('exclude', excludeId);
//         params.set('limit', String(limit));
//         return `/products/category?${params.toString()}`;
//       },
//       providesTags: ['Products'],
//     }),

//   }),
// });

// export const {

//   useGetProductsByCategoryQuery,

//   // inventory querries
//   useAdjustStockMutation,
//   useGetInventoryLogsQuery,
//   useGetInventoryQuery,

//   // product querries
//   useGetProductsQuery,
//   useGetProductByIdQuery,
//   useAddProductMutation,
//   useUpdateProductMutation,
//   useDeleteProductMutation,
//   useUpdateProductStatusMutation,
//   useBulkDeleteProductsMutation,


//   // categories hooks
//   useGetCategoriesQuery,
//   useGetCategoryByIdQuery,
//   useAddCategoryMutation,
//   useUpdateCategoryMutation,
//   useDeleteCategoryMutation,
//   useBulkDeleteCategoriesMutation,
//   useUpdateCategoryStatusMutation,
//   useCheckSlugExistsQuery,

//   // users
//   useGetAllUsersQuery,
//   useUpdateKYCStatusMutation,
//   useGetUserByIdQuery,
//   useAddUserMutation,
//   useGetUsersQuery,
//   useDeleteUserMutation,
//   useUpdateUserMutation,
//   useUpdateUserStatusMutation,

//   // orders
//   useGetOrdersQuery,
//   useGetOrderByIdQuery,
//   useUpdateOrderStatusMutation,
//   useMarkOrderDeliveredMutation,
//   useUpdateOrderNotesMutation,
//   useUpdateOrderMutation,

//   //payments
//   useGetPaymentSettingsQuery,
//   useUpdatePaymentSettingsMutation,
//   useUpdatePaymentStatusMutation,

//   // company profile
//   useGetCompanyProfileQuery,
//   useUpdateCompanyProfileMutation,

//   // dashboard
//   useGetDashboardStatsQuery

// } = adminApi;
