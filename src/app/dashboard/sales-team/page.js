'use client';

import PopoverDropdown from '@/components/custom/ui/PopoverDropdown';
import Loader from '@/components/custom/ui/Loader';
import { showConfirm, showError, showSuccess } from '@/utils/customAlert';
import { Calendar, PlusCircle, Search, SortDesc } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import CustomTable from '../components/custom/CustomTable';
import SalesMemberFormDrawer from './SalesMemberFormDrawer';
import { useDeleteSalesMemberMutation, useGetSalesMembersQuery, useUpdateSalesMemberStatusMutation } from '@/redux/features/api/zohoApi';



export default function SalesTeamPage() {
  const router = useRouter();

  // ——— Local UI state ———
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [sortOption, setSortOption] = useState('Newest');
  const [showDrawer, setShowDrawer] = useState(false);
  const [editMemberId, setEditMemberId] = useState(null);
  const [viewMemberId, setViewMemberId] = useState(null);

  // ——— Date range → {from,to} (ISO) ———
  const { from, to } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now); endOfToday.setHours(23, 59, 59, 999);

    let start = null; let end = endOfToday;

    switch (dateRange) {
      case 'Today':
        start = startOfToday;
        break;
      case 'Yesterday':
        start = new Date(startOfToday); start.setDate(start.getDate() - 1);
        end = new Date(endOfToday); end.setDate(end.getDate() - 1);
        break;
      case 'Last 7 Days':
        start = new Date(endOfToday); start.setDate(start.getDate() - 6);
        break;
      case 'Last 30 Days':
        start = new Date(endOfToday); start.setDate(start.getDate() - 29);
        break;
      case 'This Month':
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        break;
      case 'Last Month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      default:
        start = null;
        end = null;
    }
    return {
      from: start ? start.toISOString() : undefined,
      to: end ? end.toISOString() : undefined,
    };
  }, [dateRange]);

  // ——— Query params for API ———
  const queryArgs = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery || undefined,
      from,
      to,
      sort: sortOption === 'Newest' ? '-createdAt' : 'createdAt',
    }),
    [currentPage, itemsPerPage, searchQuery, from, to, sortOption]
  );

  // ——— RTK Query: fetch list ———
  const { data, isFetching, refetch } = useGetSalesMembersQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });

  // Normalize various server shapes -> rows / total / pages
  const rows =
    data?.items ||
    data?.list ||
    data?.data ||
    data?.results ||
    data?.members ||
    [];

  const totalItems =
    data?.total ??
    data?.meta?.total ??
    data?.count ??
    rows.length;

  const totalPages =
    data?.pages ??
    data?.meta?.pages ??
    Math.max(1, Math.ceil((totalItems || 1) / (itemsPerPage || 1)));

  // ——— Mutations ———
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateSalesMemberStatusMutation();
  const [deleteMember, { isLoading: isDeleting }] = useDeleteSalesMemberMutation();

  // ——— Actions ———
  const handleStatusToggle = async (member) => {
    try {
      await updateStatus({ id: member._id, isActive: !member.isActive }).unwrap();
      showSuccess('Updated', `Status changed to ${!member.isActive ? 'Active' : 'Inactive'}`);
    } catch (err) {
      showError('Error', err?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteMember = async (member) => {
    const result = await showConfirm({
      title: `Delete "${member.name}"?`,
      text: 'This action cannot be undone.',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await deleteMember(member._id).unwrap();
        showSuccess('Deleted', 'Sales member deleted successfully');
      } catch (err) {
        showError('Error', err?.data?.message || 'Failed to delete sales member');
      }
    }
  };

  // ——— Table columns (ONLY required fields) ———
  const columns = [
    { key: 'name', label: 'Name', render: (row) => row.name },
    { key: 'email', label: 'Email', render: (row) => row.email },
    { key: 'phone', label: 'Phone', render: (row) => row.phone },
    {
      key: 'topLine',
      label: 'Top Line',
      className: 'whitespace-nowrap',
      render: (row) =>
        typeof row.topLine === 'number'
          ? `₹${Number(row.topLine).toLocaleString('en-IN')}`
          : '—',
    },
    {
      key: 'monthlyTarget',
      label: 'Bottom Line',
      className: 'whitespace-nowrap',
      render: (row) =>
        typeof row.monthlyTarget === 'number'
          ? `₹${Number(row.monthlyTarget).toLocaleString('en-IN')}`
          : '—',
    },
    // {
    //   key: 'monthlyTarget',
    //   label: 'Monthly Target',
    //   className: 'whitespace-nowrap',
    //   render: (row) =>
    //     typeof row.monthlyTarget === 'number'
    //       ? `₹${Number(row.monthlyTarget).toLocaleString('en-IN')}`
    //       : '—',
    // },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <div className="flex items-center gap-2">
          <ToggleSwitch enabled={!!row.isActive} onToggle={() => handleStatusToggle(row)} />
          <span className={`text-sm ${row.isActive ? 'text-green-700' : 'text-gray-600'}`}>
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-3 md:mb-0">
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            Sales Team{' '}
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-sm">
              {totalItems ?? 0}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Home &gt; <span className="text-blue-900 font-semibold">Manage Sales Team</span>
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white">
        <div className="flex  items-center gap-3 p-3 border-b border-b-gray-300 flex-wrap-reverse">
          {/* Search */}
          <div className="order-2 w-full md:order-1 md:w-auto md:max-w-xs relative">
            <Search className="absolute top-3 left-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => { setCurrentPage(1); setSearchQuery(e.target.value); }}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none"
            />
          </div>

          {/* Button */}
          <button
            onClick={() => { setEditMemberId(null); setShowDrawer(true); }}
            className="order-1 md:order-2 cursor-pointer ml-auto flex items-center gap-2 bg-[#3E57A7] text-white px-4 py-2 rounded text-sm sm:mb-2"
          >
            <PlusCircle size={18} /> Add Sales Member
          </button>
        </div>


        <div className="flex gap-2 justify-between p-3 flex-wrap">
          <PopoverDropdown
            button={
              <>
                <Calendar size={16} /> {dateRange}
              </>
            }
            options={['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month']}
            selected={dateRange}
            onSelect={(v) => {
              setCurrentPage(1);
              setDateRange(v);
            }}
          />

          <PopoverDropdown
            button={
              <>
                <SortDesc size={16} /> Sort By
              </>
            }
            options={['Newest', 'Oldest']}
            selected={sortOption}
            onSelect={(v) => {
              setCurrentPage(1);
              setSortOption(v);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <CustomTable
        title=""
        columns={columns}
        data={rows}
        actions={['edit', 'delete']}
        currentPage={currentPage}
        totalPages={totalPages || 1}
        totalItems={totalItems || 0}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onLimitChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
        onRowClick={(row) => console.log('Clicked row:', row)}
        onViewClick={(row) => setViewMemberId(row._id)}
        onEditClick={(row) => {
          setEditMemberId(row._id);
          setShowDrawer(true);
        }}
        onDeleteClick={handleDeleteMember}
      />

      {/* Drawer */}
      {showDrawer && (
        <SalesMemberFormDrawer
          memberId={editMemberId}
          onClose={() => {
            setShowDrawer(false);
            setEditMemberId(null);
            // ensure fresh list after create/update
            refetch();
          }}
        />
      )}

      {(isFetching || isUpdatingStatus || isDeleting) && <Loader />}
    </div>
  );
}

function ToggleSwitch({ enabled, onToggle }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${enabled ? 'bg-green-500' : 'bg-red-300'
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
      />
    </button>
  );
}
