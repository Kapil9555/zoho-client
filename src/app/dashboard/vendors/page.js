'use client';

import PopoverDropdown from '@/components/custom/ui/PopoverDropdown';
import Loader from '@/components/custom/ui/Loader';
import { showConfirm, showError, showSuccess } from '@/utils/customAlert';
import { Calendar, PlusCircle, Search, SortDesc } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import CustomTable from '../components/custom/CustomTable';
import {
  useGetVendorsQuery,
  useDeleteVendorMutation,
} from '@/redux/features/api/vendorApi';
import VendorFormDrawer from './VendorFormDrawer';
import VendorImportDialog from './VendorImportDialog';
import useDebouncedValue from '@/components/custom/hooks/useDebouncedValue';

// NEW: debounce hook
// import useDebouncedValue from '@/hooks/useDebouncedValue';

export default function VendorsPage() {
  const router = useRouter();

  // ——— Local UI state ———
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [sortOption, setSortOption] = useState('Newest');
  const [showDrawer, setShowDrawer] = useState(false);
  const [editVendorId, setEditVendorId] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [emailFilter, setEmailFilter] = useState('All Vendors');

  // NEW: debounce the search string
  const MIN_CHARS = 2;            
        // tweak if you want
  const debouncedSearch = useDebouncedValue(searchQuery, 400); 

  // console.log("debouced check",debouncedSearch)

  // ——— Date range → {from,to} (YYYY-MM-DD) ———


  const { from, to } = useMemo(() => {

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);


    const toISODate = (d) => d.toISOString().slice(0, 10);
    let start = null;
    let end = endOfToday;


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
      from: start ? toISODate(start) : undefined,
      to: end ? toISODate(end) : undefined,
    };
  }, [dateRange]);


  // ——— Query params for API ———
  const queryArgs = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      // use debounced value + min length
      search:
        debouncedSearch && debouncedSearch.length >= MIN_CHARS
          ? debouncedSearch
          : undefined,
      from,
      to,
      sort: sortOption === 'Newest' ? 'createdAt:desc' : 'createdAt:asc',
      hasEmail:
        emailFilter === 'With Email Only'
          ? 1
          : emailFilter === 'Without Email Only'
            ? 0
            : undefined, // "All Vendors"
    }),
    [currentPage, itemsPerPage, debouncedSearch, from, to, sortOption, emailFilter]
  );



  // ——— RTK Query: fetch list ———
  const { data, isFetching, refetch, error } = useGetVendorsQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });

  // Normalize -> rows / total / pages
  const rows =
    data?.list ||
    data?.items ||
    data?.results ||
    data?.data ||
    [];

  const totalItems =
    data?.meta?.total ??
    data?.total ??
    data?.count ??
    rows.length;

  const totalPages =
    data?.meta?.pages ??
    data?.pages ??
    Math.max(1, Math.ceil((totalItems || 1) / (itemsPerPage || 1)));

  // ——— Mutations ———
  const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorMutation();

  // ——— Actions ———
  const handleDeleteVendor = async (vendor) => {
    const titleName =
      vendor?.companyName ||
      vendor?.displayName ||
      vendor?.contactName ||
      [vendor?.firstName, vendor?.lastName].filter(Boolean).join(' ') ||
      'this vendor';

    const result = await showConfirm({
      title: `Delete "${titleName}"?`,
      text: 'This action cannot be undone.',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await deleteVendor(vendor._id).unwrap();
        showSuccess('Deleted', 'Vendor deleted successfully');
      } catch (err) {
        showError('Error', err?.data?.message || 'Failed to delete vendor');
      }
    }
  };




  // ——— Table columns ———
  const pickName = (row) =>
    row.companyName ||
    row.displayName ||
    row.contactName ||
    [row.firstName, row.lastName].filter(Boolean).join(' ') ||
    '—';

  const columns = [
    { key: 'companyName', label: 'Name', render: (row) => pickName(row) },
    { key: 'email', label: 'Email', render: (row) => row.email || '—' },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
    { key: 'sourceOfSupply', label: 'Source', render: (row) => row.sourceOfSupply || '—' },
  ];

  const onClose = () => {
    setShowDrawer(false);
    setEditVendorId(null);
    refetch();
  };

  return (
    <div className="p-6">


      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-3 md:mb-0">
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            Vendors
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-sm">
              {totalItems ?? 0}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Home &gt; <span className="text-blue-900 font-semibold">Manage Vendors</span>
          </p>
        </div>
      </div>


      {/* Controls */}
      <div className="bg-white">
        <div className="flex items-center gap-3 p-3 border-b border-b-gray-300 flex-wrap-reverse">
          {/* Search */}
          <div className="order-2 w-full md:order-1 md:w-auto md:max-w-xs relative">
            <Search className="absolute top-3 left-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={`Search by name, email, phone...${MIN_CHARS > 1 ? ` (min ${MIN_CHARS})` : ''}`}
              value={searchQuery}
              onChange={(e) => { setCurrentPage(1); setSearchQuery(e.target.value); }}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none"
            />
          </div>

          {/* Add Vendor */}
          <button
            onClick={() => { setEditVendorId(null); setShowDrawer(true); }}
            className="order-1 md:order-2 cursor-pointer ml-auto flex items-center gap-2 bg-[#3E57A7] text-white px-4 py-2 rounded text-sm sm:mb-2"
          >
            <PlusCircle size={18} /> Add Vendor
          </button>

          <button
            onClick={() => setShowImport(true)}
            className="order-1 md:order-2 cursor-pointer flex items-center gap-2 bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded text-sm sm:mb-2"
          >
            Import
          </button>
        </div>

        <div className="flex gap-2 justify-between p-3 flex-wrap">
          {/* Sort By */}
          <PopoverDropdown
            button={<><SortDesc size={16} /> Sort By</>}
            options={['Newest', 'Oldest']}
            selected={sortOption}
            onSelect={(v) => { setCurrentPage(1); setSortOption(v); }}
          />

          {/* Email Filter */}
          <PopoverDropdown
            button={<><Calendar size={16} /> Email Filter</>}
            options={['All Vendors', 'With Email Only', 'Without Email Only']}
            selected={emailFilter}
            onSelect={(v) => {
              setCurrentPage(1);
              setEmailFilter(v);
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
        onLimitChange={(limit) => { setItemsPerPage(limit); setCurrentPage(1); }}
        onRowClick={(row) => console.log('Clicked vendor row:', row)}
        onEditClick={(row) => { setEditVendorId(row._id); setShowDrawer(true); }}
        onDeleteClick={handleDeleteVendor}
      />

      {/* Drawer */}
      {showDrawer && (
        <VendorFormDrawer
          vendorId={editVendorId}
          onClose={onClose}
        />
      )}

      {(isFetching || isDeleting) && <Loader />}

      {error && (
        <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
          {error?.data?.message || 'Failed to load vendors'}
        </div>
      )}

      {showImport && (
        <VendorImportDialog
          onClose={() => {
            setShowImport(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
