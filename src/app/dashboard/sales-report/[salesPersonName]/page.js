'use client';

import Loader from '@/components/custom/ui/Loader';
import PopoverDropdown from '@/components/custom/ui/PopoverDropdown';
import {
  useGetCrmInvoicesQuery,
  useGetSalesMembersQuery,
  useGetSalesMeQuery,
} from '@/redux/features/api/zohoApi';
import { Search, SortDesc, Calendar, TrendingUp, DollarSign, Percent, IndianRupee } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import CustomTable from '../../components/custom/CustomTable';
import SalesReportDrawer from './SalesReportDrawer';
import SalesViewDrawer from '../SalesViewDrawer';

// debounce
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

// --- helpers to parse dates robustly ---
const parseRowDate = (row) => {
  const raw =
    row?.dateAsDate ??
    row?.date ??
    row?.invoiceDate ??
    row?.piDate ??
    null;
  const d = raw ? new Date(raw) : null;
  return d && !isNaN(d) ? d : null;
};

export default function SalesReportPage() {
  const params = useParams();
  const router = useRouter()

  const { data: me } = useGetSalesMeQuery();
  const isAdmin = !!me?.isAdmin || me?.role === 'admin';

  const salesPersonParam = isAdmin
    ? decodeURIComponent(params?.salesPersonName || '').trim()
    : me?.name;

  // month filter (default mode) -> send `${month}-01`
  const now = new Date();
  const initMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [month, setMonth] = useState(initMonth);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Sort/Filter options differ for admin vs non-admin
  const sortOptionsAll = ['Newest', 'Oldest', 'No Profit', 'Manually Added'];
  const sortOptionsNonAdmin = ['Newest', 'Oldest'];
  const [sortOption, setSortOption] = useState('Newest');


  const [viewPiId, setViewPiId] = useState(null);
  const [viewPiDetails, setViewPiDetails] = useState(null);

  const [invoicesByPiDate, setInvoicesByPiDate] = useState(null)

  const debouncedSearch = useDebouncedValue(searchQuery, 400);



  // ---- NEW: Date range states ----
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const rangeActive = !!fromDate && !!toDate;

  // sales team
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

  const [personId, setPersonId] = useState('all');

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



  // const personName = useMemo(() => {
  //   if (personId === 'all') return '';
  //   return teamRows.find((p) => p._id === personId)?.name ?? '';
  // }, [personId, teamRows]);

  const personName = useMemo(() => {
    // Non-admins: even if personId is still "all", use me.name to avoid the initial "All" fetch
    if (!isAdmin && personId === "all") return me?.name ?? "";
    if (personId === "all") return "";
    return teamRows.find((p) => p._id === personId)?.name ?? "";
  }, [isAdmin, personId, teamRows, me]);


  // --- query args (range takes precedence if both dates present) ---

  const baseQueryArgs = {
    page: 1,
    limit: 10000,
    search: debouncedSearch || undefined,
    personName: personName || undefined,
  };

  const queryArgs = rangeActive
    ? {
      ...baseQueryArgs,
      date: fromDate,
      start: fromDate,
      end: toDate,
    }
    : {
      ...baseQueryArgs,
      date: `${month}-01`,
    };



  const shouldSkipInvoices = !isAdmin && personId === "all";

  const { data, isLoading, isFetching, error } = useGetCrmInvoicesQuery(
    queryArgs,
    { refetchOnMountOrArgChange: true, skip: shouldSkipInvoices }
  );



  const salesSummary = data?.raw?.piSummary ?? [];

  const piRollup = data?.raw?.piRollup ?? [];



  // console.log('salesSummarysalesSummary:', salesSummary);


  // ===== Processing (includes client-side range filter fallback) =====



  const processedRows = useMemo(() => {
    const q = norm(debouncedSearch);
    let out = [...salesSummary];


    // console.log("out out",out)


    // client-side date range filter (safe even if server already filtered)

    if (rangeActive) {
      const start = new Date(`${fromDate}T00:00:00`);
      const end = new Date(`${toDate}T23:59:59.999`);
      out = out.filter((row) => {
        const d = parseRowDate(row);
        return d ? d >= start && d <= end : true;
      });
    }

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

    // Filter choices
    if (sortOption === 'No Profit') {
      out = out.filter((row) => Number(row.difference) === 0);
      return out;
    }

    if (sortOption === 'Manually Added') {
      out = out.filter((row) => !!row.overrideApplied);
      return out;
    }

    // Sort by profit amount (labels kept as Newest/Oldest for UI continuity)
    out.sort((a, b) => {
      const pa = Number(a?.difference) || 0;
      const pb = Number(b?.difference) || 0;
      return sortOption === 'Newest' ? pb - pa : pa - pb;
    });



    return out;
  }, [salesSummary, debouncedSearch, sortOption, isAdmin, rangeActive, fromDate, toDate]);



  const totalKnown = processedRows.length;

  // ======= KPIs (computed from processedRows) =======
  const totals = useMemo(() => {
    let totalInvoice = 0;
    let totalPO = 0;
    let totalProfit = 0;

    for (const r of processedRows) {
      totalInvoice += Number(r.invoiceTotal) || 0;
      totalPO += Number(r.poTotal) || 0;
      totalProfit += Number(r.difference) || 0;
    }

    // profit over PO (as you requested)
    const profitMargin = totalPO > 0 ? (totalProfit / totalPO) * 100 : 0;

    return { totalInvoice, totalPO, totalProfit, profitMargin };
  }, [processedRows]);

  // ======= Pagination for CustomTable =======
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


  // reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, month, personId, sortOption, fromDate, toDate]);


  /* ===== Columns ===== */

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
          <span className={n > 0 ? 'text-green-600' : n < 0 ? 'text-red-600' : 'text-gray-900'}>
            {fmtMoney(n)}
          </span>
        );
      },
    },
  ];


  const onEdit = (row) => {

    // console.log("row check data",row)

    const pi = row?.pi;
    const match = piRollup?.find((r) => {

      // console.log("r.pi === pi.trim()",r)

      return r.pi == pi.trim()
    });

    // console.log("match check", match);

    setInvoicesByPiDate(match?.invoicesByPi?.[0] || null)

    setSelectedRow(row);
    setIsDrawerOpen(true);

  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRow(null);
  };

  const popoverOptions = isAdmin ? sortOptionsAll : sortOptionsNonAdmin;

  // Helpers for display only
  const monthLabel = useMemo(() => {
    if (rangeActive) return ''; // shown as range below
    try {
      const d = new Date(`${month}-01T00:00:00`);
      return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    } catch {
      return month;
    }
  }, [month, rangeActive]);


  const selectedPersonDisplay = personName || (salesPersonParam || 'All');



  const filterByPi = async (pi) => {

    // console.log('filterByPi pi:',piRollup);

    setViewPiId(pi || null);

    const match = await piRollup?.find((r) => {

      // console.log("r.pi === pi.trim()",r)

      return r.pi == pi.trim()
    });

    // console.log("match check", match);

    setViewPiDetails(match || null);
    // console.log('filterByPi match:', match);
  }


  useEffect(() => {
    if (salesPersonParam && salesPersonParam !== "All") {
      // console.log('filterByPi pi: running check');
      filterByPi(salesPersonParam)
    }
  }, [salesPersonParam, piRollup])
  // below other hooks
  const clearRange = () => {
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };


  // console.log('viewPiId:', viewPiId);



  return (

    <div className="p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-3 md:mb-0">
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            Sales Summary — {selectedPersonDisplay}
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-sm">
              {totalKnown}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Home &gt; <span className="text-blue-900 font-semibold">Sales Summary</span>
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white">
        <div className="flex flex-col p-3 md:flex-row border-b border-b-gray-300 justify-between items-center gap-3">
          {/* Search */}
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


          {/* NEW: From / To date */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From</label>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
            />
            <label className="text-sm text-gray-600">To</label>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
            />

            {rangeActive && (
              <button
                type="button"
                onClick={clearRange}
                className="ml-2 cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                title="Clear date range and switch back to month filter"
              >
                Clear Range
              </button>
            )}

          </div>

          {/* Month (disabled when range active) */}
          <input
            type="month"
            value={month}
            disabled={rangeActive}
            onChange={(e) => {
              setMonth(e.target.value);
              setCurrentPage(1);
            }}
            className={`rounded-md border px-3 py-2 text-sm text-gray-700 ${rangeActive ? 'bg-gray-100 cursor-not-allowed border-gray-200' : 'border-gray-300'
              }`}
            title={rangeActive ? 'Disable the date range to change month' : ''}
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


          {/* Sort / Filter */}
          <PopoverDropdown
            button={
              <>
                <SortDesc size={16} /> Sort
              </>
            }
            options={popoverOptions}
            selected={sortOption}
            onSelect={(v) => setSortOption(v)}
          />
        </div>
      </div>

      {/* Legend (admin only) */}
      {isAdmin && (
        <div className="flex flex-wrap items-center justify-end gap-3 mt-3 pr-4">
          <span className="inline-flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded bg-red-500 inline-block" />
            Zero Profit
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded bg-purple-300 inline-block" />
            Manually Added
          </span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoice</p>
              <p className="text-2xl font-bold text-blue-800">
                {fmtMoney(totals.totalInvoice)}
              </p>
            </div>
            <IndianRupee className="text-blue-600 bg-blue-100 p-2 rounded-full" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total PO</p>
              <p className="text-2xl font-bold text-green-800">
                {fmtMoney(totals.totalPO)}
              </p>
            </div>
            <Calendar className="text-green-600 bg-green-100 p-2 rounded-full" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Profit</p>
              <p className="text-2xl font-bold text-purple-800">
                {fmtMoney(totals.totalProfit)}
              </p>
            </div>
            <TrendingUp className="text-purple-600 bg-purple-100 p-2 rounded-full" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Profit Margin</p>
              <p className="text-2xl font-bold text-orange-800">
                {Number.isFinite(totals.profitMargin) ? totals.profitMargin.toFixed(1) : '0.0'}%
              </p>
            </div>
            <Percent className="text-orange-600 bg-orange-100 p-2 rounded-full" size={40} />
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6 mb-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Reporting Period</h4>
            <p className="text-sm text-blue-800">
              <strong>Period:</strong>{' '}
              {rangeActive
                ? `${fromDate} to ${toDate}`
                : (() => {
                  try {
                    const d = new Date(`${month}-01T00:00:00`);
                    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
                  } catch {
                    return month;
                  }
                })()}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Sales Person:</strong> {selectedPersonDisplay}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="text-sm font-medium text-green-900 mb-2">Data Overview</h4>
            <p className="text-sm text-green-800">
              <strong>Total Records:</strong> {totalKnown} PI rows
            </p>
            <p className="text-sm text-green-800">
              <strong>Data Status:</strong> {!error ? 'Successfully loaded' : 'Error loading data'}
            </p>
          </div>
        </div>
      </div>


      {/* Table */}

      <CustomTable
        title=""
        columns={columns}
        data={pagedRows}
        actions={isAdmin ? ['view', 'edit'] : ['view']}

        onRowClick={(row) => filterByPi(row.pi || row.pi)}
        onViewClick={(row) => filterByPi(row.pi || row.pi)}

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

        /* Highlighting ONLY for admins */

        collapseForRowHighlight
        highlightZeroPO={isAdmin}
        highlightManual={isAdmin}
        zeroPOTextClass='[&>td]:text-gray-300'
        manualTextClass=''
      />

      {/* Drawer */}
      <SalesReportDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        row={selectedRow}
        month={month}
        salespersonName={selectedPersonDisplay}
        invoicesByPiDate={invoicesByPiDate}
      />

      {(viewPiId && viewPiDetails) && (
        <SalesViewDrawer viewPiDetails={viewPiDetails} viewPiId={viewPiId} onClose={() => { setViewPiId(null); router.push("/dashboard/sales-report/All") }} />
      )}

      {(isLoading || isFetching || teamLoading || teamFetching) && <Loader />}
      {error && (
        <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
          {error?.data?.message || 'Failed to load sales summary'}
        </div>
      )}

      {/* No data state */}
      {totalKnown === 0 && !error && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center mt-6">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sales Data</h3>
          <p className="text-gray-600">
            {rangeActive
              ? `No PI summary found from ${fromDate} to ${toDate}`
              : (() => {
                try {
                  const d = new Date(`${month}-01T00:00:00`);
                  const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
                  return `No PI summary found for ${label}${selectedPersonDisplay ? ` for ${selectedPersonDisplay}` : ''}.`;
                } catch {
                  return `No PI summary found for ${month}${selectedPersonDisplay ? ` for ${selectedPersonDisplay}` : ''}.`;
                }
              })()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try a different {rangeActive ? 'date range' : 'month'} or adjust filters.
          </p>
        </div>
      )}
    </div>
  );
}
