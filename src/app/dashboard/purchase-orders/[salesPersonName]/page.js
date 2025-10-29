'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Loader from '@/components/custom/ui/Loader';
import PopoverDropdown from '@/components/custom/ui/PopoverDropdown';
import { Search, SortDesc, ExternalLink, Filter } from 'lucide-react';
import { useGetCrmPurchaseOrdersQuery, useGetSalesMembersQuery, useGetSalesMeQuery } from '@/redux/features/api/zohoApi';
import CustomTable from '../../components/custom/CustomTable';
import { useParams, useRouter } from 'next/navigation';
import PurchaseOrderViewDrawer from '../PurchaseOrderViewDrawer';
import { useGetPoPaymentDetailsQuery } from '@/redux/features/api/poPaymentApi';
import PoPayDateRangeFilter from '../../components/PoPayDateRangeFilter';

const statusColor = {
  open: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-200 text-gray-700',
  billed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-600',
};

// small debounce helper
function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function PurchaseOrdersPage() {
  const router = useRouter();

  // default month = current month (YYYY-MM)
  const now = new Date();
  const initMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(initMonth);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest');
  const [monthN, setMonthN] = useState({ from: '', to: '' });

  // Payment filter: 'all' | 'unpaid' | 'overdue30'
  const [paymentFilter, setPaymentFilter] = useState('all');

  // debounced search
  const debouncedSearch = useDebounced(searchQuery, 400);

  // Drawer state
  const [viewPOId, setViewPOId] = useState(null);

  const { data: me } = useGetSalesMeQuery();
  const isAdmin = !!me?.isAdmin || me?.role === 'admin';

  const params = useParams();
  const salesPersonParam = isAdmin ? decodeURIComponent(params?.salesPersonName)?.trim() : me?.name;

  /* ===== Sales team (for dropdown) ===== */
  const TEAM_LIMIT = 10000;

  const { data: teamData, isLoading: teamLoading, isFetching: teamFetching } = useGetSalesMembersQuery(
    { page: 1, limit: TEAM_LIMIT },
    { refetchOnMountOrArgChange: true }
  );

  const teamRows =
    teamData?.items ||
    teamData?.list ||
    teamData?.data ||
    teamData?.results ||
    teamData?.members ||
    [];

  const [personId, setPersonId] = useState('all');

  // Helper: match logged-in user to a team row
  const findMyTeamRow = useCallback(() => {
    if (!me || !teamRows?.length) return null;
    const candidates = [
      (row) => row._id && (row._id === me._id || row._id === me.id),
      (row) => row.email && me.email && row.email.toLowerCase() === me.email.toLowerCase(),
      (row) => row.name && me.name && row.name.trim().toLowerCase() === me.name.trim().toLowerCase(),
    ];
    return teamRows.find((r) => candidates.some((fn) => fn(r))) || null;
  }, [me, teamRows]);

  // Keep personId valid if team changes (admin flow only)
  useEffect(() => {
    if (!teamRows.length || personId === 'all' || !isAdmin) return;
    if (!teamRows.some((m) => m._id === personId)) {
      setPersonId('all');
    }
  }, [teamRows, personId, isAdmin]);

  // Role-aware selection: admins free; sales locked to self
  useEffect(() => {
    if (!teamRows.length) return;
    if (isAdmin) return; // admins keep manual control (including "All")
    const mine = findMyTeamRow();
    if (mine && personId !== mine._id) {
      setPersonId(mine._id);
    }
  }, [teamRows, isAdmin, findMyTeamRow, personId]);

  const personName = useMemo(() => {
    if (personId === 'all') return '';
    return teamRows.find((p) => p._id === personId)?.name ?? '';
  }, [personId, teamRows]);

  // Map UI sort to API sort
  const apiSort = useMemo(() => {
    switch (sortOption) {
      case 'Oldest': return 'date:asc';
      case 'Newest':
      default: return 'date:desc';
    }
  }, [sortOption]);

  const poArgs = useMemo(() => {
    const q = {
      page: currentPage,
      limit: itemsPerPage,
      sort: apiSort,
    };

    // If user selected a custom range, use it
    if (monthN.from && monthN.to) {
      q.from = monthN.from;
      q.to = monthN.to;
    } else {
      // fallback to default month
      q.date = `${month}-01`;
    }

    if (personName) q.personName = personName;
    if (debouncedSearch) q.search = debouncedSearch;

    // Optional: forward payment filter to server if it ever supports it
    // if (paymentFilter !== 'all') q.payment = paymentFilter;

    return q;
  }, [currentPage, itemsPerPage, month, monthN, personName, debouncedSearch, apiSort]);


  const { data, isLoading, isFetching, error } = useGetCrmPurchaseOrdersQuery(poArgs);

  // ALL payment details
  const { data: payData, isLoading: payLoad, isFetching: payFetch, error: payError } = useGetPoPaymentDetailsQuery();

  // Normalized shape from transformResponse in zohoApi
  const purchaseOrders = data?.list ?? [];
  const totalKnown = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.pages ?? 1;

  const fmtMoney = (n) =>
    typeof n === 'number'
      ? n.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
      : (Number(n) || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  const fmtDate = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    return Number.isNaN(dt.getTime())
      ? d
      : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const cf = (row, key) => row?.custom_field_hash?.[key] ?? row?.[key] ?? '-';

  useEffect(() => {

    if (salesPersonParam && salesPersonParam !== 'All') {
      // setViewPOId(decodeURIComponent(salesPersonParam).trim());
    }

  }, [salesPersonParam]);

  // Reset custom date range whenever user changes month, person, or search
  useEffect(() => {
    setMonthN({ from: '', to: '' });
    setCurrentPage(1); // optional: reset page
  }, [month, personId, debouncedSearch]);

  // Use server rows directly
  const rows = purchaseOrders;

  // Build a map from payment details by purchaseOrderId for quick lookups
  // NOTE: per your note, payData contains ONLY paid POs => missing id => unpaid
  const payMap = useMemo(() => {
    const m = new Map();
    if (Array.isArray(payData)) {
      for (const d of payData) {
        if (d?.purchaseOrderId) m.set(String(d.purchaseOrderId), d);
      }
    }
    return m;
  }, [payData]);


  // console.log("pay map",payMap)



  // Utilities for payment-based filtering
  const isUnpaid = useCallback(
    (row) => !payMap.has(String(row.purchaseorder_id)),
    [payMap]
  );



  const isOlderThanDays = (row, days) => {
    const poDate = new Date(row.date);
    if (Number.isNaN(poDate.getTime())) return false;

    console.log("daysdays",days)
    console.log("poDate poDate",poDate)


    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    const ageDays = Math.floor((Date.now() - poDate.getTime()) / MS_PER_DAY);


    // console.log("ageDaysageDays",ageDays)
    // console.log("MS_PER_DAY",MS_PER_DAY)

    return ageDays >= days;

    
  };




  // Apply client-side payment filters
  const displayRows = useMemo(() => {
    switch (paymentFilter) {
      case 'unpaid':
        return rows.filter(isUnpaid);
      case 'overdue30':
        return rows.filter((r) => isUnpaid(r) && isOlderThanDays(r, 30));
      case 'all':
      default:
        return rows;
    }
  }, [rows, paymentFilter, isUnpaid]);



  const columns = [
    {
      key: 'sno',
      label: 'S.No.',
      className: 'w-16 text-center text-gray-700',
      render: (_row, idx) => {
        const page = Number(currentPage) || 1;
        const perPage = Number(itemsPerPage) || 0;
        const safeIdx = Number.isFinite(idx) ? idx : Math.max(0, rows.indexOf(_row));
        return (page - 1) * perPage + safeIdx + 1;
      },
    },
    { key: 'purchaseorder_number', label: 'PO #', render: (row) => row.purchaseorder_number },
    { key: 'vendor_name', label: 'Vendor', render: (row) => row.vendor_name || '-' },
    { key: 'date', label: 'Date', render: (row) => fmtDate(row.date) },
    { key: 'sales_person', label: 'Salesperson', render: (row) => cf(row, 'cf_sales_person') },
    { key: 'total', label: 'Total', className: 'text-right', render: (row) => fmtMoney(row.total) },
  ];

  // reset to page 1 when month/person/search changes
  useEffect(() => { setCurrentPage(1); }, [month, personId, debouncedSearch]);

  // Badge count: if a payment filter is active, show filtered count; otherwise server total
  const isPaymentFilterActive = paymentFilter !== 'all';


  const badgeCount = isPaymentFilterActive ? displayRows.length : totalKnown;


  const onPaymentFilterChange = (label) => {
    switch (label) {
      case 'Unpaid':
        setPaymentFilter('unpaid');
        break;
      case 'Unpaid 30+ days':
        setPaymentFilter('overdue30');
        break;
      default:
        setPaymentFilter('all');
    }
  };

  console.log("viewPOId",viewPOId)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 md:mb-0">
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            Purchase Orders — {personName || 'All'}
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-sm">
              {badgeCount}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Home &gt; <span className="text-blue-900 font-semibold">Purchase Orders</span>
          </p>
        </div>

        <div className="flex justify-between gap-3 mt-2">
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute top-3 left-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by PO #, vendor, reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-md w-full focus:outline-none"
              />
            </div>

            <input
              type="month"
              value={month}
              onChange={(e) => { setMonth(e.target.value); }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
            />

            {/* {isAdmin && (
              <PoPayDateRangeFilter
                value={{ from: '', to: '' }}
                onChange={({ from, to }) => {
                  setMonthN({ from, to });
                }}
              />
            )} */}


          </div>

          <div className="flex items-center gap-2">
            <PopoverDropdown
              button={<><Filter size={16} /> Payment</>}
              // options={['All', 'Unpaid', 'Unpaid 30+ days']}
              options={['All', 'Unpaid']}

              selected={
                paymentFilter === 'unpaid'
                  ? 'Unpaid'
                  : paymentFilter === 'overdue30'
                    ? 'Unpaid 30+ days'
                    : 'All'
              }
              onSelect={onPaymentFilterChange}
            />

            <PopoverDropdown
              button={<><SortDesc size={16} /> Sort By</>}
              options={['Newest', 'Oldest']}
              selected={sortOption}
              onSelect={(v) => setSortOption(v)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <CustomTable
        title=""
        columns={columns}
        data={displayRows}
        actions={['view']}
        actionIcons={{ view: <ExternalLink size={16} /> }}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={isPaymentFilterActive ? displayRows.length : totalKnown}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onLimitChange={(limit) => { setItemsPerPage(limit); setCurrentPage(1); }}
        onRowClick={(row) => setViewPOId(row.purchaseorder_id)}
        onViewClick={(row) => setViewPOId(row.purchaseorder_id)}
        emptyMessage={error ? 'Failed to load purchase orders' : 'No purchase orders found for this selection.'}
      />

      {(isLoading || isFetching || teamLoading || teamFetching || payLoad || payFetch) && <Loader />}
      {error && (
        <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
          {error?.data?.message || 'Failed to load purchase orders'}
        </div>
      )}
      {payError && (
        <div className="mt-4 p-3 rounded bg-yellow-50 text-yellow-800 text-sm border border-yellow-200">
          {payError?.data?.message || 'Failed to load payment details'}
        </div>
      )}

      {/* Drawer */}
      {viewPOId && (
        <PurchaseOrderViewDrawer
          setViewPOId={setViewPOId}
          purchaseOrderId={viewPOId}
          onClose={() => { setViewPOId(null); router.replace('/dashboard/purchase-orders/All'); }}
        />
      )}
    </div>
  );
}

