'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Loader from '@/components/custom/ui/Loader';
import PopoverDropdown from '@/components/custom/ui/PopoverDropdown';
import { Search, SortDesc, ExternalLink } from 'lucide-react';
import { useGetCrmPurchaseOrdersQuery, useGetSalesMembersQuery, useGetSalesMeQuery } from '@/redux/features/api/zohoApi';
import CustomTable from '../../components/custom/CustomTable';
import PurchaseOrderViewDrawer from './PurchaseOrderViewDrawer';

const statusColor = {
  open: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-200 text-gray-700',
  billed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-600',
};

export default function PurchaseOrdersPage() {
  // default month = current month (YYYY-MM)
  const now = new Date();
  const initMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(initMonth);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest');

  // Drawer state
  const [viewPOId, setViewPOId] = useState(null);

  const { data: me } = useGetSalesMeQuery();
  const isAdmin = !!me?.isAdmin || me?.role === 'admin';

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

  // salesperson selection (id) + computed name (same as dashboard)
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

  // Controller-backed query (server paginated + month filter like dashboard)
  const poArgs = useMemo(() => {
    const q = {
      page: currentPage,
      limit: itemsPerPage,
      date: `${month}-01`,
    };
    if (personName) q.personName = personName; // only send when specific salesperson selected
    return q;
  }, [currentPage, itemsPerPage, month, personName]);

  const { data, isLoading, isFetching, error } = useGetCrmPurchaseOrdersQuery(poArgs);

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

  // Simple client search (vendor, PO #, reference)
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return purchaseOrders;
    return purchaseOrders.filter((po) => {
      const vendor = (po?.vendor_name || '').toLowerCase();
      const poNo = (po?.purchaseorder_number || '').toLowerCase();
      const ref = (po?.reference_number || cf(po, 'cf_proforma_invoice_number') || '').toLowerCase();
      return vendor.includes(q) || poNo.includes(q) || ref.includes(q);
    });
  }, [purchaseOrders, searchQuery]);

  const sortedRows = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return sortOption === 'Newest' ? db - da : da - db;
    });
    return arr;
  }, [filtered, sortOption]);

  const columns = [
    {
      key: 'sno',
      label: 'S.No.',
      className: 'w-16 text-center text-gray-700',
      render: (_row, idx) => {
        const page = Number(currentPage) || 1;
        const perPage = Number(itemsPerPage) || 0;

        // if idx isn't passed, fall back to finding it in the current data array
        const safeIdx =
          Number.isFinite(idx) ? idx : Math.max(0, sortedRows.indexOf(_row));

        return (page - 1) * perPage + safeIdx + 1;
      },
    },
    { key: 'purchaseorder_number', label: 'PO #', render: (row) => row.purchaseorder_number },
    { key: 'vendor_name', label: 'Vendor', render: (row) => row.vendor_name || '-' },
    { key: 'date', label: 'Date', render: (row) => fmtDate(row.date) },
    // {
    //   key: 'status',
    //   label: 'Status',
    //   className: 'whitespace-nowrap',
    //   render: (row) => (
    //     <div className="flex items-center gap-2">
    //       <span className={`px-2 py-0.5 rounded ${statusColor[(row.status || '').toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
    //         {row.status}
    //       </span>
    //     </div>
    //   ),
    // },
    { key: 'sales_person', label: 'Salesperson', render: (row) => cf(row, 'cf_sales_person') },
    // {
    //   key: 'reference',
    //   label: 'Reference',
    //   render: (row) =>
    //     cf(row, 'cf_proforma_invoice_number') !== '-'
    //       ? cf(row, 'cf_proforma_invoice_number')
    //       : (row.reference_number || '-'),
    // },
    { key: 'total', label: 'Total', className: 'text-right', render: (row) => fmtMoney(row.total) },
  ];

  // reset to page 1 when month/person changes
  useEffect(() => { setCurrentPage(1); }, [month, personId]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 md:mb-0">
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            Purchase Orders — {personName || 'All'}
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-sm">
              {totalKnown}
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

            {/* Salesperson (role-aware) */}
            {isAdmin && (
              <select
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
              >
                <option value="all">All</option>
                {teamRows.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            )}
          </div>

          <PopoverDropdown
            button={<><SortDesc size={16} /> Sort By</>}
            options={['Newest', 'Oldest']}
            selected={sortOption}
            onSelect={(v) => setSortOption(v)}
          />
        </div>
      </div>

      {/* Table */}
      <CustomTable
        title=""
        columns={columns}
        data={sortedRows}
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
        emptyMessage={error ? 'Failed to load purchase orders' : 'No purchase orders found for this selection.'}
      />

      {(isLoading || isFetching || teamLoading || teamFetching) && <Loader />}
      {error && (
        <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
          {error?.data?.message || 'Failed to load purchase orders'}
        </div>
      )}

      {/* Drawer */}
      {viewPOId && (
        <PurchaseOrderViewDrawer
          purchaseOrderId={viewPOId}
          onClose={() => setViewPOId(null)}
        />
      )}
    </div>
  );
}
