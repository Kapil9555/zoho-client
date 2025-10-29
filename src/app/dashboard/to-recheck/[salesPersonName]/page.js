'use client';

import Loader from '@/components/custom/ui/Loader';
import PopoverDropdown from '@/components/custom/ui/PopoverDropdown';
import {
  useGetCrmInvoicesQuery,
  useGetSalesMembersQuery,
  useGetSalesMeQuery,
} from '@/redux/features/api/zohoApi';
import { Search, SortDesc } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import CustomTable from '../../components/custom/CustomTable';
import SalesReportDrawer from '../../sales-report/[salesPersonName]/SalesReportDrawer';
// import SalesReportDrawer from './SalesReportDrawer'; // [NEW]

// ----- debounce -----
function useDebouncedValue(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const fmtMoney = (n) =>
  Number.isFinite(Number(n))
    ? Number(n).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
    : '₹0';

const norm = (s) => (s ?? '').toString().toLowerCase().trim();

export default function SalesReportPage() {
  const params = useParams();
  const { data: me } = useGetSalesMeQuery();
  const isAdmin = !!me?.isAdmin || me?.role === 'admin';

  const salesPersonParam = isAdmin
    ? decodeURIComponent(params?.salesPersonName || '').trim()
    : me?.name;

  // month filter -> send `${month}-01`
  const now = new Date();
  const initMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // ===== UI State (filters + paging) =====
  const [month, setMonth] = useState(initMonth);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('No Profit');
  const [personId, setPersonId] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const debouncedSearch = useDebouncedValue(searchQuery, 400);
  const sortOptionsAll = ['Newest', 'Oldest', 'No Profit', 'Manually Added'];
  const sortOptionsNonAdmin = ['Newest', 'Oldest'];
  const popoverOptions = isAdmin ? sortOptionsAll : sortOptionsNonAdmin;

  // [NEW] Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // [NEW]
  const [selectedRow, setSelectedRow] = useState(null);    // [NEW]

   const [invoicesByPiDate , setInvoicesByPiDate] = useState(null)

  // ===== Sales team (for person filter) =====
  const {
    data: teamData,
    isLoading: teamLoading,
    isFetching: teamFetching,
  } = useGetSalesMembersQuery(
    { page: 1, limit: 10000 },
    { refetchOnMountOrArgChange: true }
  );

  const teamRows =
    teamData?.items ||
    teamData?.list ||
    teamData?.data ||
    teamData?.results ||
    teamData?.members ||
    [];

  // apply URL person once
  const didApplyUrlPerson = useRef(false);
  useEffect(() => {
    if (didApplyUrlPerson.current) return;
    if (!teamRows?.length) return;
    if (!salesPersonParam) return;
    const match = teamRows.find(
      (m) => (m?.name || '').toLowerCase() === (salesPersonParam || '').toLowerCase()
    );
    if (match?._id) {
      setPersonId(match._id);
      didApplyUrlPerson.current = true;
    } else {
      didApplyUrlPerson.current = true;
    }
  }, [teamRows, salesPersonParam]);

  // keep personId valid if team changes
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


  //For drawer prop to mirror Sales page


  const selectedPersonDisplay = personName || (salesPersonParam || 'All');

  // ===== Data =====
  const { data, isLoading, isFetching, error } = useGetCrmInvoicesQuery(
    {
      page: 1,
      limit: 10000,
      search: debouncedSearch || undefined,
      date: `${month}-01`,
      personName: personName || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  const salesSummary = data?.raw?.piSummary ?? [];

  // ===== Processing =====
  const processedRows = useMemo(() => {
    const q = norm(debouncedSearch);
    let out = [...salesSummary];


    // search

    if (q) {
      out = out.filter(
        (row) =>
          norm(row.pi).includes(q) ||
          norm(row.customerName).includes(q) ||
          norm(row.salespersonName).includes(q)
      );
    }

    // Non-admin: hide zero-profit rows entirely
    if (!isAdmin) {
      out = out.filter((row) => Number(row.difference) !== 0);
    }

    // Filters
    if (sortOption === 'No Profit') {
      out = out.filter((row) => Number(row.difference) === 0);
      return out;
    }

    if (sortOption === 'Manually Added') {
      out = out.filter((row) => !!row.overrideApplied);
      return out;
    }



    // Sort by profit amount (label kept as Newest/Oldest to match current UI wording)

    out.sort((a, b) => {
      const pa = Number(a?.difference) || 0;
      const pb = Number(b?.difference) || 0;
      return sortOption === 'Newest' ? pb - pa : pa - pb;
    });

    return out;
  }, [salesSummary, debouncedSearch, sortOption, isAdmin]);

  const totalKnown = processedRows.length;

  // ===== Pagination =====
  const totalPages = Math.max(1, Math.ceil(totalKnown / itemsPerPage));

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return processedRows.slice(start, end);
  }, [processedRows, currentPage, itemsPerPage]);

  const pageStartIndex = useMemo(() => {
    const first = pagedRows?.[0];
    const i = first ? processedRows.indexOf(first) : 0;
    return Math.max(0, i);
  }, [processedRows, pagedRows]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, month, personId, sortOption]);

  // ===== Columns =====
  const columns = [
    {
      key: 'sno',
      label: 'S.No.',
      className: 'w-16 text-center text-gray-700',
      render: (_row, idx) => {
        const localIdx = Number.isFinite(idx) ? idx : Math.max(0, pagedRows.indexOf(_row));
        return pageStartIndex + localIdx + 1;
      },
    },
    {
      key: 'pi',
      label: 'PI Number',
      headerClassName: 'whitespace-nowrap',
      render: (row) => <span className="text-gray-700">{row.pi || '-'}</span>,
    },
    {
      key: 'customerName',
      label: 'Customer',
      headerClassName: 'whitespace-nowrap',
      render: (row) => <span className="text-gray-700">{row.customerName || '-'}</span>,
    },
    {
      key: 'salespersonName',
      label: 'Sales Person',
      headerClassName: 'whitespace-nowrap',
      render: (row) => <span className="text-gray-700">{row.salespersonName || '-'}</span>,
    },
    {
      key: 'invoiceTotal',
      label: 'Invoice Total (₹)',
      headerClassName: 'whitespace-nowrap text-right',
      className: 'text-right text-gray-700',
      render: (row) => (Number(row.invoiceTotal) || 0).toLocaleString('en-IN'),
    },
    {
      key: 'poTotal',
      label: 'PO Total (₹)',
      headerClassName: 'whitespace-nowrap text-right',
      className: 'text-right text-gray-700',
      render: (row) => (Number(row.poTotal) || 0).toLocaleString('en-IN'),
    },
    {
      key: 'difference',
      label: 'Profit (₹)',
      headerClassName: 'whitespace-nowrap text-right',
      className: 'text-right font-semibold whitespace-nowrap',
      render: (row) => {
        const n = Number(row.difference);
        return (
          <span className={n > 0 ? 'text-green-600' : n < 0 ? 'text-red-600' : 'text-red-600'}>
            {fmtMoney(n)}
          </span>
        );
      },
    },
  ];

  // Edit handlers
  // const onEdit = (row) => {               
  //   setSelectedRow(row);                 
  //   setIsDrawerOpen(true);               
  // };      

  const piRollup = data?.raw?.piRollup ?? [];

  const onEdit = (row) => {

    // console.log("row check data",row)

    const pi = row?.pi;
    const match = piRollup?.find((r) => {

      // console.log("r.pi === pi.trim()",r)

      return r.pi == pi.trim()
    });

    console.log("match check", match);

    setInvoicesByPiDate(match?.invoicesByPi?.[0] || null)

    setSelectedRow(row);
    setIsDrawerOpen(true);

  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRow(null);
  };

  return (
    <div className="p-4">

      {/* ------- FILTER BAR (only what's needed) ------- */}

      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute top-3 left-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by PI, customer, salesperson…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
            />

            {isAdmin && (
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
            )}

            {/* Kept popover hidden for recheck view */}
            {/* <PopoverDropdown
              button={
                <>
                  <SortDesc size={16} /> Sort / Filter
                </>
              }
              options={popoverOptions}
              selected={sortOption}
              onSelect={(v) => setSortOption(v)}
            /> */}
          </div>
        </div>
      </div>

      {/* ------- TABLE ------- */}

      <CustomTable
        title=""
        columns={columns}
        data={pagedRows}
        actions={isAdmin ? ['edit'] : []}
        onEditClick={onEdit}
        actionIcons={{}}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalKnown}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onLimitChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
        emptyMessage={error ? 'Failed to load sales summary' : 'No sales summary found.'}
        /* Row highlighting visible only to admins */
        collapseForRowHighlight
        highlightZeroPO={isAdmin}
        highlightManual={isAdmin}
        zeroPOTextClass='[&>td]:text-gray-300'
        manualTextClass=''
      />

      {/* [NEW] Drawer same as Sales page */}

      <SalesReportDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        row={selectedRow}
        month={month}
        salespersonName={selectedPersonDisplay}
        invoicesByPiDate={invoicesByPiDate}
      />

      {(isLoading || isFetching || teamLoading || teamFetching) && <Loader />}
      {error && (
        <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
          {error?.data?.message || 'Failed to load sales summary'}
        </div>
      )}
    </div>
  );
}
