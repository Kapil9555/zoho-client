'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Loader from '@/components/custom/ui/Loader';
import PopoverDropdown from '@/components/custom/ui/PopoverDropdown';
import { Search, SortDesc, ExternalLink } from 'lucide-react';
import { useGetCrmPaidPurchaseOrdersQuery, useGetSalesMembersQuery, useGetSalesMeQuery } from '@/redux/features/api/zohoApi';
import CustomTable from '../../components/custom/CustomTable';
import { useParams, useRouter } from 'next/navigation';
import PoPayDateRangeFilter from '../../components/PoPayDateRangeFilter';
import PurchaseOrderViewDrawer from '../../purchase-orders/PurchaseOrderViewDrawer';



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



export default function VendorPaymentsPage() {

  const router = useRouter();

  // default month = current month
  const now = new Date();
  const initMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(initMonth);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest');

  // Default date range: first day of month → today
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const format = (date) => date.toISOString().split('T')[0];
  const [monthN, setMonthN] = useState({ from: format(firstDay), to: format(now) });

  // NEW: debounced search
  const debouncedSearch = useDebounced(searchQuery, 400);

  // Drawer state
  const [viewPOId, setViewPOId] = useState(null);

  const { data: me } = useGetSalesMeQuery();
  const isAdmin = !!me?.isAdmin || me?.role === 'admin';

  const params = useParams();


  const salesPersonParam = isAdmin ? decodeURIComponent(params?.salesPersonName || '').trim() : me?.name;


  // Sales team
  const TEAM_LIMIT = 10000;


  const { data: teamData, isLoading: teamLoading, isFetching: teamFetching } = useGetSalesMembersQuery(
    { page: 1, limit: TEAM_LIMIT },
    { refetchOnMountOrArgChange: true }
  );


  const teamRows = teamData?.items || [];


  const [personId, setPersonId] = useState('all');


  // Find logged-in user in team
  const findMyTeamRow = useCallback(() => {
    if (!me || !teamRows?.length) return null;
    const candidates = [
      (row) => row._id && (row._id === me._id || row._id === me.id),
      (row) => row.email && me.email && row.email.toLowerCase() === me.email.toLowerCase(),
      (row) => row.name && me.name && row.name.trim().toLowerCase() === me.name.trim().toLowerCase(),
    ];
    return teamRows.find((r) => candidates.some((fn) => fn(r))) || null;
  }, [me, teamRows]);


  // Ensure valid personId
  useEffect(() => {
    if (!teamRows.length || personId === 'all' || !isAdmin) return;
    if (!teamRows.some((m) => m._id === personId)) setPersonId('all');
  }, [teamRows, personId, isAdmin]);


  // Lock sales to self if not admin
  useEffect(() => {
    if (!teamRows.length || isAdmin) return;
    const mine = findMyTeamRow();
    if (mine && personId !== mine._id) setPersonId(mine._id);
  }, [teamRows, isAdmin, findMyTeamRow, personId]);


  const personName = useMemo(() => {
    if (personId === 'all') return '';
    return teamRows.find((p) => p._id === personId)?.name ?? '';
  }, [personId, teamRows]);


  // Map UI sort to API sort
  const apiSort = useMemo(() => (sortOption === 'Oldest' ? 'date:asc' : 'date:desc'), [sortOption]);


  // Build query args
  const poArgs = useMemo(() => {
    const q = { page: currentPage, limit: itemsPerPage, sort: apiSort };

    if (monthN.from && monthN.to) {
      q.from = monthN.from;
      q.to = monthN.to;
    }

    if (personName) q.personName = personName;
    if (debouncedSearch) q.search = debouncedSearch;

    return q;
  }, [currentPage, itemsPerPage, monthN, personName, debouncedSearch, apiSort]);



  // Fetch paid POs
  const { data, isLoading, isFetching, error } = useGetCrmPaidPurchaseOrdersQuery(poArgs);


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


  const rows = purchaseOrders;



  const columns = [
    {
      key: 'sno',
      label: 'S.No.',
      className: 'w-16 text-center text-gray-700',
      render: (_row, idx) => {
        const page = Number(currentPage) || 1;
        const perPage = Number(itemsPerPage) || 0;
        const safeIdx =
          Number.isFinite(idx) ? idx : Math.max(0, rows.indexOf(_row));
        return (page - 1) * perPage + safeIdx + 1;
      },
    },
    { key: 'purchaseorder_number', label: 'PO #', render: (row) => row.purchaseorder_number },
    { key: 'vendor_name', label: 'Vendor', render: (row) => row.vendor_name || '-' },
    { key: 'date', label: 'PO Date', render: (row) => fmtDate(row.date) },
    { key: 'sales_person', label: 'Salesperson', render: (row) => cf(row, 'cf_sales_person') },
    { key: 'total', label: 'Total', className: 'text-right', render: (row) => fmtMoney(row.total) },
  ];


  // Reset to page 1 when month/person/search changes
  useEffect(() => setCurrentPage(1), [monthN, personId, debouncedSearch]);




  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
          Paid Purchase Orders — {personName || 'All'}
          <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-sm">{totalKnown}</span>
        </h1>

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

            {/* <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
            /> */}

            {isAdmin && (
              <PoPayDateRangeFilter
                value={monthN}
                onChange={({ from, to }) => setMonthN({ from, to })}
              />
            )}
          </div>

          <PopoverDropdown
            button={<><SortDesc size={16} /> Sort By</>}
            options={['Newest', 'Oldest']}
            selected={sortOption}
            onSelect={setSortOption}
          />
        </div>
      </div>

      {/* Table */}
      <CustomTable
        columns={columns}
        data={purchaseOrders}
        actions={['view']}
        actionIcons={{ view: <ExternalLink size={16} /> }}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalKnown}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onLimitChange={(limit) => { setItemsPerPage(limit); setCurrentPage(1); }}
        onRowClick={(row) => setViewPOId(row.purchaseorder_id)}
        onViewClick={(row) => setViewPOId(row.purchaseorder_id)}
        emptyMessage={error ? 'Failed to load purchase orders' : 'No paid purchase orders found for this selection.'}
      />

      {(isLoading || isFetching || teamLoading || teamFetching) && <Loader />}

      {/* Drawer */}
      {viewPOId && (
        <PurchaseOrderViewDrawer
          setViewPOId={setViewPOId}
          purchaseOrderId={viewPOId}
          onClose={() => { setViewPOId(null); router.replace("/dashboard/vendor-payments/All"); }}
        />
      )}
    </div>
  );
}
