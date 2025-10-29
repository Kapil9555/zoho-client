'use client';

import { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { ExternalLink, Pencil, PlusCircle, Search, SortDesc } from 'lucide-react';
import Loader from '@/components/custom/ui/Loader';
import PopoverDropdown from '@/components/custom/ui/PopoverDropdown';
import DrawerForm from './DrawerForm';
import { useDeleteDailyReportMutation, useGetAllReportsQuery, useGetMyReportsQuery } from '@/redux/features/api/reportsApi';
import { useGetSalesMeQuery, useGetSalesMembersQuery } from '@/redux/features/api/zohoApi';
import CustomTable from '../../components/custom/CustomTable';
import ViewReportPage from '../ViewReportPage';
import { showConfirm, showSuccess } from '@/utils/customAlert';
import { ISADMIN } from '@/constant';



/* Debounce */
function useDebouncedValue(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}



const fmtDate = (d) => (d ? moment(d).format('DD MMM YYYY') : '—');



export default function ReportsPage() {

  /* Role */

  const { data: me, isLoading: isMeLoading } = useGetSalesMeQuery();

  // console.log("me my data",me)

  const isAdmin = me?.email?.toLowerCase()?.trim() == ISADMIN?.toLowerCase()?.trim();


  // console.log("isAdminisAdminisAdmin",ISADMIN)

  // console.log("me?.email?.toLowerCase()",me?.email?.toLowerCase()?.trim())


  /* Admin-only: team dropdown + name search */
  const TEAM_LIMIT = 10000;

  const { data: teamData, isLoading: teamLoading, isFetching: teamFetching } = useGetSalesMembersQuery(
    { page: 1, limit: TEAM_LIMIT },
    { skip: !isAdmin, refetchOnMountOrArgChange: true }
  );

  const teamRows =
    teamData?.items ||
    teamData?.list ||
    teamData?.data ||
    teamData?.results ||
    teamData?.members ||
    [];


  const [employeeSearch, setEmployeeSearch] = useState('');
  const debouncedEmpSearch = useDebouncedValue(employeeSearch, 400);
  const [employeeId, setEmployeeId] = useState('all');

  const [deleteReport, { isLoading: isDeleting }] = useDeleteDailyReportMutation();

  /* Dates */
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [singleDate, setSingleDate] = useState('');

  /* Sort & paging (server-driven) */
  const [sortOption, setSortOption] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  /* Drawers */
  const [showDrawer, setShowDrawer] = useState(false);
  const [editReport, setEditReport] = useState(null);
  const [showViewDrawer, setShowViewDrawer] = useState(false);
  const [viewReport, setViewReport] = useState(null);




  /* Admin default: show last day's records (yesterday) for all users */

  useEffect(() => {
    if (isAdmin) {

      // const lastDay = moment().subtract(1, 'day').format('YYYY-MM-DD');

      // setSingleDate((prev) => prev || lastDay);

      const currentDate = moment().format('YYYY-MM-DD');

      setSingleDate((prev) => prev || currentDate);

      setFrom('');
      setTo('');


    }
  }, [isAdmin]);



  /* Mutual exclusivity: if user picks single day, clear range; if picks range, clear single day */
  useEffect(() => {

    if (singleDate) {
      if (from) setFrom('');
      if (to) setTo('');
    }

  }, [singleDate]);



  useEffect(() => {
    if (from || to) {
      if (singleDate) setSingleDate('');
    }
  }, [from, to]);



  /* Build query params for API (server-side filtering) */
  const queryArgs = useMemo(() => {

    const sort = sortOption === 'Newest' ? 'date:desc' : 'date:asc';
    const args = {
      page: currentPage,
      limit: itemsPerPage,
      sort,
    };

    if (singleDate) {
      args.date = singleDate;
    } else {
      if (from) args.from = from;
      if (to) args.to = to;
    }

    if (isAdmin) {
      if (employeeId !== 'all') args.employeeId = employeeId;
      if (debouncedEmpSearch.trim()) args.employeeName = debouncedEmpSearch.trim();
    }

    return args;

  }, [currentPage, itemsPerPage, sortOption, singleDate, from, to, isAdmin, employeeId, debouncedEmpSearch]);

  // console.log("querry args check", queryArgs)

  /* Data — pass queryArgs to hooks */

  const {
    data: reportsData,
    refetch,
    isFetching,
    isLoading: isLoadingReports,
    error,
  } = isAdmin
      ? useGetAllReportsQuery(queryArgs, { skip: !me })
      : useGetMyReportsQuery(queryArgs, { skip: !me });

  // Normalize response
  const baseRows = reportsData?.data ?? reportsData?.items ?? reportsData?.list ?? [];
  const totalKnown = reportsData?.total ?? reportsData?.raw?.total ?? baseRows.length;
  const totalPages = reportsData?.pages ?? reportsData?.raw?.pages ?? Math.max(1, Math.ceil(totalKnown / itemsPerPage));



  // Stable S.No. for current page (works with server-side filters/sorts)
  const displayRows = useMemo(() => {
    const page = Number(currentPage) || 1;
    const perPage = Number(itemsPerPage) || 0;
    return baseRows.map((r, i) => ({
      ...r,
      __sno: (page - 1) * perPage + i + 1,
    }));
  }, [baseRows, currentPage, itemsPerPage]);


  /* Reset to first page when filters (except page/limit) change */

  useEffect(() => {
    setCurrentPage(1);
  }, [singleDate, from, to, employeeId, debouncedEmpSearch, sortOption]);


  /* Columns */
  const columns = useMemo(() => {
    const base = [
      {
        key: 'sno',
        label: 'S.No.',
        className: 'w-16 text-center text-gray-700',
        render: (row) => row.__sno,
      },
      { key: 'date', label: 'Date', render: (row) => <span className="text-gray-700">{fmtDate(row?.date)}</span> },
      {
        key: 'activitiesSummary',
        label: 'Activities',
        className: 'max-w-[420px]',
        render: (row) => {
          const text = row?.activitiesSummary || '—';
          const short = text.length > 25 ? `${text.slice(0, 25)}...` : text;
          return (
            <span className="text-gray-700 text-sm" title={text}>
              {short}
            </span>
          );
        },
      },
      {
        key: 'pendingTasks',
        label: 'Pending Tasks',
        className: 'max-w-[360px]',
        render: (row) => {
          const text = row?.pendingTasks || '—';
          const short = text.length > 25 ? `${text.slice(0, 25)}...` : text;
          return (
            <span className="text-gray-700 text-sm" title={text}>
              {short}
            </span>
          );
        },
      },
      {
        key: 'comments',
        label: 'Comments',
        className: 'max-w-[360px]',
        render: (row) => {
          const text = row?.comments || '—';
          const short = text.length > 25 ? `${text.slice(0, 25)}...` : text;
          return (
            <span className="text-gray-700 text-sm" title={text}>
              {short}
            </span>
          );
        },
      },
    ];


    if (isAdmin) {
      base.splice(1, 0, {
        key: 'userName',
        label: 'Name',
        render: (row) => <span className="text-gray-700">{row?.userName || '—'}</span>,
      });

      base.splice(2, 0, {
        key: 'userEmail',
        label: 'Email',
        render: (row) => <span className="text-gray-700">{row?.userEmail || '—'}</span>,
      });
    }


    return base;

  }, [isAdmin]);



  /* Handlers */
  const onRowEdit = (row) => {
    setEditReport(row);
    setShowDrawer(true);
  };



  const onRowView = (row) => {
    setViewReport(row);
    setShowViewDrawer(true);
  };




  useEffect(() => {
    if (isAdmin && (debouncedEmpSearch.trim() || employeeId !== 'all')) {
      // When searching by name or selecting a specific employee
      setSingleDate('');
      setFrom('');
      setTo('');
    }
  }, [debouncedEmpSearch, employeeId, isAdmin]);




  const onRowDelete = async (report) => {

    const titleName =
      report?.userName ||
      report?.userEmail ||
      fmtDate(report?.date) ||
      'this report';


    const result = await showConfirm({
      title: `Delete Report?`,
      text: 'This action cannot be undone.',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    });


    if (result.isConfirmed) {
      try {
        await deleteReport(report._id).unwrap();
        showSuccess('Deleted', 'Report deleted successfully');
        await refetch();
      } catch (err) {
        showError('Error', err?.data?.message || 'Failed to delete report');
      }
    }

  };



  const clearAllFilters = () => {

    // window.location.reload()

    const lastDay = moment().subtract(1, 'day').format('YYYY-MM-DD');
    // console.log(" the last day check",lastDay)
    setSingleDate((prev) => lastDay);
    setEmployeeSearch('');
    setEmployeeId('all');
    setFrom('');
    setTo('');
    setSortOption('Newest');
    setCurrentPage(1);
    setItemsPerPage(25);

  };



  // console.log("single date check",singleDate)
  /* Loading */
  if (isMeLoading || isLoadingReports || isDeleting) return <Loader />;
  // console.log("memememe", isAdmin)

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-3 md:mb-0">
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            Daily Work Reports
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-sm">
              {totalKnown}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Home &gt; <span className="text-blue-900 font-semibold">Reports</span>
          </p>
        </div>
      </div>



      <div className="bg-white">
        {/* Top bar */}
        <div className="flex items-center gap-3 p-3 border-b border-b-gray-300 flex-wrap">
          {/* Admin-only: text search by employee name */}
          {isAdmin && (
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Search by Name</label>
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute top-3 left-3 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Type employee name..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none text-sm"
                />
              </div>
            </div>
          )}


          {/* Hide Add Report button for specific user */}
          {!isAdmin && (
            <button
              onClick={() => {
                setEditReport(null);
                setShowDrawer(true);
              }}
              className="ml-auto flex items-center gap-2 bg-[#3E57A7] text-white px-4 py-2 rounded text-sm"
            >
              <PlusCircle size={18} /> Add Report
            </button>
          )}

        </div>

        {/* Filters row (labeled) */}
        <div className="flex flex-wrap gap-4 items-end px-3 py-4 border-b border-gray-200">
          {/* Admin-only: Employee dropdown */}
          {isAdmin && (
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Select Employee</label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 min-w-[180px]"
              >
                <option value="all">All Employees</option>
                {teamRows.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}


          {/* Date range (both roles) */}
          {
            !isAdmin && (

              <>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">From Date</label>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-600 mb-1">To Date</label>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
                  />
                </div>
              </>
            )
          }






          {/* Single-day selector (both roles) */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">Single Day</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
              />
              {
                !isAdmin && (
                  <button
                    onClick={clearAllFilters}
                    className="ml-2 bg-gray-200 cursor-pointer text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-300"
                  >
                    Clear All
                  </button>
                )
              }
            </div>
          </div>




          {/* Sort dropdown */}
          <div className="flex flex-col ml-auto">
            <label className="text-xs font-semibold text-gray-600 mb-1">Sort By</label>
            <PopoverDropdown
              button={
                <>
                  <SortDesc size={16} /> {sortOption}
                </>
              }
              options={['Newest', 'Oldest']}
              selected={sortOption}
              onSelect={(val) => setSortOption(val)}
            />
          </div>
        </div>
      </div>


      {/* Table (server-paginated) */}
      <CustomTable
        title=""
        columns={columns}
        data={displayRows}
        actions={['view', 'edit', 'delete']}
        actionIcons={{ view: <ExternalLink size={16} />, edit: <Pencil size={16} /> }}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalKnown}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onDeleteClick={onRowDelete}
        onLimitChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
        onRowClick={onRowView}
        onViewClick={onRowView}
        onEditClick={onRowEdit}
        emptyMessage={error ? 'Failed to load reports' : 'No reports found for this selection.'}
      />

      {(isFetching || teamLoading || teamFetching) && <Loader />}
      {
        error && (
        <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
          {error?.data?.message || 'Failed to load reports'}
        </div>
      )
      }

      {/* Drawer (Add/Edit) */}
      
      {showDrawer && (
        <DrawerForm
          user={me}
          row={editReport}
          onClose={() => setShowDrawer(false)}
          onSaved={() => refetch()}
        />
      )}

      {/* View Drawer (read-only) */}
      {showViewDrawer && (
        <ViewReportPage
          user={me}
          row={viewReport}
          onClose={() => setShowViewDrawer(false)}
        />
      )}
    </div>
  );
}
