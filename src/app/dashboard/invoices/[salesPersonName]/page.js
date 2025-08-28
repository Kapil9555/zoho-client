'use client';

import Loader from '@/components/custom/ui/Loader';
import PopoverDropdown from '@/components/custom/ui/PopoverDropdown';
import { useGetOnlyInvoicesQuery, useGetSalesMembersQuery, useGetSalesMeQuery } from '@/redux/features/api/zohoApi';
import { ExternalLink, Search, SortDesc } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import CustomTable from '../../components/custom/CustomTable';
import InvoiceViewDrawer from './InvoiceViewDrawer';

// simple debounce hook
function useDebouncedValue(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const statusColor = {
  draft: 'bg-gray-200 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  paid: 'bg-emerald-100 text-emerald-700',
};

const StatusPill = ({ status }) => {
  const cls = statusColor[(status || '').toLowerCase()] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${cls}`}>
      {status || '-'}
    </span>
  );
};

const fmtMoney = (n) =>
  Number.isFinite(Number(n))
    ? Number(n).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
    : '₹0';

const fmtDate = (d) => {
  const t = d ? new Date(d).getTime() : NaN;
  return Number.isNaN(t)
    ? '-'
    : new Date(t).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function InvoicesPage() {
  const params = useParams()

  const { data: me } = useGetSalesMeQuery();

  const isAdmin = !!me?.isAdmin || me?.role === "admin";

  const salesPersonParam = isAdmin ? decodeURIComponent(params?.salesPersonName).trim() : me?.name


  // month filter like dashboard -> send `${month}-01`
  const now = new Date();
  const initMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(initMonth);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest');
  const [viewInvoiceId, setViewInvoiceId] = useState(null);

  const debouncedSearch = useDebouncedValue(searchQuery, 400);

  /* ===== Sales team dropdown (same as Purchase Orders) ===== */
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

  // salesperson selection: store ID; compute name; "all" = no filter
  const [personId, setPersonId] = useState('all');

  // only apply URL param once (don’t override user changes later)
  const didApplyUrlPerson = useRef(false);
  useEffect(() => {
    if (didApplyUrlPerson.current) return;
    if (!teamRows?.length) return;
    if (!salesPersonParam) return;

    const match = teamRows.find(
      (m) => (m?.name || '').toLowerCase() === salesPersonParam.toLowerCase()
    );
    if (match?._id) {
      setPersonId(match._id);
      didApplyUrlPerson.current = true;
    } else {
      // no match -> keep "all" and do not try again
      didApplyUrlPerson.current = true;
    }
  }, [teamRows, salesPersonParam]);

  // keep personId valid if team changes (but don’t fight user)
  useEffect(() => {
    if (!teamRows.length || personId === 'all') return;
    if (!teamRows.some((m) => m._id === personId)) {
      setPersonId('all');
    }
  }, [teamRows, personId]);

  const personName = useMemo(() => {
    if (personId === 'all') return '';
    return teamRows.find((p) => p._id === personId)?.name ?? '';
  }, [personId, teamRows]);

  /* ===== Invoices query (include personName only when not "All") ===== */
  const { data, isLoading, isFetching, error } = useGetOnlyInvoicesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    date: `${month}-01`,
    personName: personName || undefined,
  });

  // map from API (primary: data.raw.*, fallback: top-level/items)
  const invoices = data?.raw?.data ?? data?.items ?? [];
  const totalKnown = data?.raw?.total ?? data?.total ?? invoices.length;
  const totalPages =
    data?.raw?.pages ?? data?.pages ?? Math.max(1, Math.ceil(totalKnown / itemsPerPage));

  // robust sorting
  const sortedRows = useMemo(() => {
    const arr = [...invoices];
    arr.sort((a, b) => {
      const da = a?.date ? new Date(a.date).getTime() : 0;
      const db = b?.date ? new Date(b.date).getTime() : 0;
      return sortOption === 'Newest' ? db - da : da - db;
    });
    return arr;
  }, [invoices, sortOption]);

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

    {
      key: 'invoice_number',
      label: 'Invoice #',
      className: 'whitespace-nowrap',
      render: (row) =>
        row.invoice_url ? (
          <a
            href={row.invoice_url}
            target="_blank"
            rel="noreferrer"
            className="text-[#3E57A7] hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {row.invoice_number || '-'}
          </a>
        ) : (
          <span className="font-medium text-gray-900">{row.invoice_number || '-'}</span>
        ),
    },
    { key: 'date', label: 'Date', render: (row) => <span className="text-gray-700">{fmtDate(row.date)}</span> },
    { key: 'customer_name', label: 'Customer', render: (row) => row.customer_name || '-' },
    { key: 'salesperson_name', label: 'Salesperson', render: (row) => row.salesperson_name || '-' },
    {
      key: 'total',
      label: 'Amount (₹)',
      headerClassName: 'text-right',
      className: 'text-right font-semibold text-gray-900 whitespace-nowrap',
      render: (row) => fmtMoney(row.total),
    },
    // { key: 'status', label: 'Status', render: (row) => <StatusPill status={row.status} /> },
  ];

  // reset to page 1 on search/month/person change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, month, personId]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-3 md:mb-0">
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            Invoices — {personName || (salesPersonParam || 'All')}
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-sm">
              {totalKnown}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Home &gt; <span className="text-blue-900 font-semibold">Invoices</span>
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white">
        <div className="flex flex-col p-3 md:flex-row border-b border-b-gray-300 justify-between items-center gap-3">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute top-3 left-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by invoice #, customer, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none"
            />
          </div>

          {/* Month filter like dashboard */}
          <input
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
          />

          {/* Salesperson dropdown */}
          {
            isAdmin &&
            <select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
            >
              <option value="all">All</option>
              {teamRows.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          }

          <PopoverDropdown
            button={
              <>
                <SortDesc size={16} /> Sort By
              </>
            }
            options={['Newest', 'Oldest']}
            selected={sortOption}
            onSelect={setSortOption}
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
        onLimitChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
        onRowClick={(row) => setViewInvoiceId(row._id || row.invoice_id)}
        onViewClick={(row) => setViewInvoiceId(row._id || row.invoice_id)}
        emptyMessage={error ? 'Failed to load invoices' : 'No invoices found for this selection.'}
      />

      {(isLoading || isFetching || teamLoading || teamFetching) && <Loader />}
      {error && (
        <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
          {error?.data?.message || 'Failed to load invoices'}
        </div>
      )}

      {/* Drawer */}
      {viewInvoiceId && (
        <InvoiceViewDrawer invoiceId={viewInvoiceId} onClose={() => setViewInvoiceId(null)} />
      )}
    </div>
  );
}
