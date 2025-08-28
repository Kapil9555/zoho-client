// 'use client';

// import Loader from '@/components/custom/ui/Loader';
// import PopoverDropdown from '@/components/custom/ui/PopoverDropdown';
// import {
//   useGetCrmInvoicesQuery,
//   useGetSalesMembersQuery,
//   useGetSalesMeQuery,
// } from '@/redux/features/api/zohoApi';
// import { Search, SortDesc } from 'lucide-react';
// import { useParams } from 'next/navigation';
// import { useEffect, useMemo, useRef, useState } from 'react';
// import CustomTable from '../../components/custom/CustomTable';

// // debounce
// function useDebouncedValue(value, delay = 400) {
//   const [v, setV] = useState(value);
//   useEffect(() => {
//     const t = setTimeout(() => setV(value), delay);
//     return () => clearTimeout(t);
//   }, [value, delay]);
//   return v;
// }

// const fmtMoney = (n) =>
//   Number.isFinite(Number(n))
//     ? Number(n).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
//     : '₹0';

// const norm = (s) => (s ?? '').toString().toLowerCase().trim();

// export default function SalesReportPage() {
//   const params = useParams();
//   const { data: me } = useGetSalesMeQuery();
//   const isAdmin = !!me?.isAdmin || me?.role === 'admin';
//   const salesPersonParam = isAdmin
//     ? decodeURIComponent(params?.salesPersonName || '').trim()
//     : me?.name;

//   console.log("salesPersonParam", salesPersonParam)

//   // month filter -> send `${month}-01`
//   const now = new Date();
//   const initMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
//   const [month, setMonth] = useState(initMonth);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortOption, setSortOption] = useState('Newest');

//   const debouncedSearch = useDebouncedValue(searchQuery, 400);

//   /* ===== Team dropdown ===== */
//   const {
//     data: teamData,
//     isLoading: teamLoading,
//     isFetching: teamFetching,
//   } = useGetSalesMembersQuery(
//     { page: 1, limit: 10000 },
//     { refetchOnMountOrArgChange: true }
//   );

//   const teamRows =
//     teamData?.items ||
//     teamData?.list ||
//     teamData?.data ||
//     teamData?.results ||
//     teamData?.members ||
//     [];

//   const [personId, setPersonId] = useState('all');

//   // apply URL person once
//   const didApplyUrlPerson = useRef(false);
//   useEffect(() => {
//     if (didApplyUrlPerson.current) return;
//     if (!teamRows?.length) return;
//     if (!salesPersonParam) return;

//     const match = teamRows.find(
//       (m) => (m?.name || '').toLowerCase() === salesPersonParam.toLowerCase()
//     );
//     if (match?._id) {
//       setPersonId(match._id);
//       didApplyUrlPerson.current = true;
//     } else {
//       didApplyUrlPerson.current = true;
//     }
//   }, [teamRows, salesPersonParam]);

//   // keep personId valid
//   useEffect(() => {
//     if (!teamRows.length || personId === 'all') return;
//     if (!teamRows.some((m) => m._id === personId)) {
//       setPersonId('all');
//     }
//   }, [teamRows, personId]);

//   const personName = useMemo(() => {
//     if (personId === 'all') return '';
//     return teamRows.find((p) => p._id === personId)?.name ?? '';
//   }, [personId, teamRows]);

//   /* ===== Query from dashboard API ===== */
//   const { data, isLoading, isFetching, error } = useGetCrmInvoicesQuery(
//     {
//       page: 1,                 // server page not used for piSummary; we paginate client-side
//       limit: 10000,            // pull enough to page locally (adjust if needed)
//       search: debouncedSearch || undefined, // optional: in case backend later supports it
//       date: `${month}-01`,
//       personName: personName || undefined,
//     },
//     { refetchOnMountOrArgChange: true }
//   );

//   // rows from server
//   const salesSummary = data?.raw?.piSummary ?? [];

//   /* ===== Client-side search filter -> then sort -> then paginate ===== */
//   const filteredRows = useMemo(() => {
//     const q = norm(debouncedSearch);
//     if (!q) return salesSummary;
//     return salesSummary.filter((row) =>
//       norm(row.pi).includes(q) ||
//       norm(row.customerName).includes(q) ||
//       norm(row.salespersonName).includes(q)
//     );
//   }, [salesSummary, debouncedSearch]);

//   const sortedRows = useMemo(() => {
//     const arr = [...filteredRows];
//     if (sortOption === 'Newest') {
//       // sort by profit desc (fallback 0)
//       arr.sort((a, b) => (Number(b.difference) || 0) - (Number(a.difference) || 0));
//     } else {
//       // ascending
//       arr.sort((a, b) => (Number(a.difference) || 0) - (Number(b.difference) || 0));
//     }
//     return arr;
//   }, [filteredRows, sortOption]);

//   const totalKnown = filteredRows.length;
//   const totalPages = Math.max(1, Math.ceil(totalKnown / itemsPerPage));

//   const pagedRows = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     const end = start + itemsPerPage;
//     return sortedRows.slice(start, end);
//   }, [sortedRows, currentPage, itemsPerPage]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [debouncedSearch, month, personId]);

//   /* ===== Columns ===== */
//   const columns = [
//     {
//       key: 'sno',
//       label: 'S.No.',
//       className: 'w-16 text-center text-gray-700',
//       render: (_row, idx) => {
//         const page = Number(currentPage) || 1;
//         const perPage = Number(itemsPerPage) || 0;
//         const safeIdx = Number.isFinite(idx) ? idx : Math.max(0, sortedRows.indexOf(_row));
//         return (page - 1) * perPage + safeIdx + 1;
//       },
//     },
//     {
//       key: 'pi',
//       label: 'PI Number',
//       headerClassName: 'whitespace-nowrap',
//       render: (row) => <span className="text-gray-700">{row.pi || '-'}</span>,
//     },
//     {
//       key: 'customerName',
//       label: 'Customer',
//       headerClassName: 'whitespace-nowrap',
//       render: (row) => <span className="text-gray-700">{row.customerName || '-'}</span>,
//     },
//     {
//       key: 'salespersonName',
//       label: 'Sales Person',
//       headerClassName: 'whitespace-nowrap',
//       render: (row) => <span className="text-gray-700">{row.salespersonName || '-'}</span>,
//     },
//     {
//       key: 'invoiceTotal',
//       label: 'Invoice Total (₹)',
//       headerClassName: 'whitespace-nowrap text-right',
//       className: 'text-right text-gray-700',
//       render: (row) => (Number(row.invoiceTotal) || 0).toLocaleString('en-IN'),
//     },
//     {
//       key: 'poTotal',
//       label: 'PO Total (₹)',
//       headerClassName: 'whitespace-nowrap text-right',
//       className: 'text-right text-gray-700',
//       render: (row) => (Number(row.poTotal) || 0).toLocaleString('en-IN'),
//     },
//     {
//       key: 'difference',
//       label: 'Profit (₹)',
//       headerClassName: 'whitespace-nowrap text-right',
//       className: 'text-right font-semibold whitespace-nowrap',
//       render: (row) => (
//         <span
//           className={
//             Number(row.difference) > 0
//               ? 'text-green-600'
//               : Number(row.difference) < 0
//                 ? 'text-red-600'
//                 : 'text-gray-900'
//           }
//         >
//           {fmtMoney(Number(row.difference))}
//         </span>
//       ),
//     },
//   ];

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//         <div className="mb-3 md:mb-0">
//           <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
//             Sales Summary — {personName || (salesPersonParam || 'All')}
//             <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-sm">
//               {totalKnown}
//             </span>
//           </h1>
//           <p className="text-sm text-gray-500 mt-1">
//             Home &gt; <span className="text-blue-900 font-semibold">Sales Summary</span>
//           </p>
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="bg-white">
//         <div className="flex flex-col p-3 md:flex-row border-b border-b-gray-300 justify-between items-center gap-3">
//           <div className="relative w-full md:max-w-xs">
//             <Search className="absolute top-3 left-3 text-gray-400" size={16} />
//             <input
//               type="text"
//               placeholder="Search by PI, customer, salesperson…"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-9 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none"
//             />
//           </div>

//           <input
//             type="month"
//             value={month}
//             onChange={(e) => {
//               setMonth(e.target.value);
//               setCurrentPage(1);
//             }}
//             className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
//           />

//           {isAdmin && (
//             <select
//               value={personId}
//               onChange={(e) => setPersonId(e.target.value)}
//               className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
//             >
//               <option value="all">All</option>
//               {teamRows.map((m) => (
//                 <option key={m._id} value={m._id}>
//                   {m.name}
//                 </option>
//               ))}
//             </select>
//           )}

//           <PopoverDropdown
//             button={
//               <>
//                 <SortDesc size={16} /> Sort By
//               </>
//             }
//             options={['Newest', 'Oldest','Po not found']}
//             selected={sortOption}
//             onSelect={(v) => setSortOption(v)}
//           />
//         </div>
//       </div>

//       <CustomTable
//         title=""
//         columns={columns}
//         data={pagedRows}
//         actions={[]}
//         actionIcons={{}}
//         currentPage={currentPage}
//         totalPages={totalPages}
//         totalItems={totalKnown}
//         itemsPerPage={itemsPerPage}
//         onPageChange={setCurrentPage}
//         onLimitChange={(limit) => {
//           setItemsPerPage(limit);
//           setCurrentPage(1);
//         }}
//         emptyMessage={error ? 'Failed to load sales summary' : 'No sales summary found.'}

//         /* NEW flags — only here */
//         collapseForRowHighlight
//         highlightZeroPO
//         zeroPOTextClass='[&>td]:text-gray-300'
//         rowClassName={(row) =>
//           Number(row.poTotal) === 0 ? "[&>td]:font-medium" : ""
//         }
//       />


//       {(isLoading || isFetching || teamLoading || teamFetching) && <Loader />}
//       {error && (
//         <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
//           {error?.data?.message || 'Failed to load sales summary'}
//         </div>
//       )}
//     </div>
//   );
// }


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
  const [month, setMonth] = useState(initMonth);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Single dropdown: Newest, Oldest, PO not found
  const [sortOption, setSortOption] = useState('Newest');

  const debouncedSearch = useDebouncedValue(searchQuery, 400);

  /* ===== Team dropdown ===== */
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
      (m) => (m?.name || '').toLowerCase() === salesPersonParam.toLowerCase()
    );
    if (match?._id) {
      setPersonId(match._id);
      didApplyUrlPerson.current = true;
    } else {
      didApplyUrlPerson.current = true;
    }
  }, [teamRows, salesPersonParam]);

  // keep personId valid
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

  /* ===== Query from backend ===== */
  const { data, isLoading, isFetching, error } = useGetCrmInvoicesQuery(
    {
      page: 1,                 // server page not used for piSummary; we paginate client-side
      limit: 10000,            // pull enough to page locally
      search: debouncedSearch || undefined,
      date: `${month}-01`,
      personName: personName || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  // rows from server
  const salesSummary = data?.raw?.piSummary ?? [];

  /* ===== Client-side search -> then "sortOption" behavior (incl. PO filter) -> paginate ===== */
  const processedRows = useMemo(() => {
    const q = norm(debouncedSearch);
    let out = salesSummary;

    // search
    if (q) {
      out = out.filter((row) =>
        norm(row.pi).includes(q) ||
        norm(row.customerName).includes(q) ||
        norm(row.salespersonName).includes(q)
      );
    }

    // special option: filter only zero-PO rows
    if (sortOption === 'PO not found') {
      out = out.filter((row) => Number(row.poTotal) === 0);
      return out; // no sorting needed when purely filtering
    }

    // otherwise sort by profit
    out = [...out];
    if (sortOption === 'Newest') {
      // profit high -> low
      out.sort((a, b) => (Number(b.difference) || 0) - (Number(a.difference) || 0));
    } else if (sortOption === 'Oldest') {
      // profit low -> high
      out.sort((a, b) => (Number(a.difference) || 0) - (Number(b.difference) || 0));
    }

    return out;
  }, [salesSummary, debouncedSearch, sortOption]);

  const totalKnown = processedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalKnown / itemsPerPage));

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return processedRows.slice(start, end);
  }, [processedRows, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, month, personId, sortOption]);

  /* ===== Columns ===== */
  const columns = [
    {
      key: 'sno',
      label: 'S.No.',
      className: 'w-16 text-center text-gray-700',
      render: (_row, idx) => {
        const page = Number(currentPage) || 1;
        const perPage = Number(itemsPerPage) || 0;
        const safeIdx = Number.isFinite(idx) ? idx : Math.max(0, processedRows.indexOf(_row));
        return (page - 1) * perPage + safeIdx + 1;
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
      render: (row) => (
        <span
          className={
            Number(row.difference) > 0
              ? 'text-green-600'
              : Number(row.difference) < 0
                ? 'text-red-600'
                : 'text-gray-900'
          }
        >
          {fmtMoney(Number(row.difference))}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-3 md:mb-0">
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            Sales Summary — {personName || (salesPersonParam || 'All')}
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

          {/* Single Sort / Filter dropdown */}
          <PopoverDropdown
            button={
              <>
                <SortDesc size={16} /> Sort / Filter
              </>
            }
            options={['Newest', 'Oldest', 'PO not found']}
            selected={sortOption}
            onSelect={(v) => setSortOption(v)}
          />
        </div>
      </div>

      <CustomTable
        title=""
        columns={columns}
        data={pagedRows}
        actions={[]}
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

        /* Keep existing highlight flags */
        collapseForRowHighlight
        highlightZeroPO
        zeroPOTextClass='[&>td]:text-gray-300'
        rowClassName={(row) =>
          Number(row.poTotal) === 0 ? "[&>td]:font-medium" : ""
        }
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
