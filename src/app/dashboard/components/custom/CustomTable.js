'use client';

import { useEffect, useState } from 'react';
import { Search, Eye, Pencil, Trash2, FileText } from 'lucide-react';
import Image from 'next/image';
import TablePagination from './TablePagination';

const statusStyles = {
  Active: 'text-green-700 bg-green-100',
  Pending: 'text-yellow-700 bg-yellow-100',
  Cancel: 'text-red-700 bg-red-100',
};

export default function CustomTable({
  title = 'Table',
  columns = [],
  data = [],
  showSearch = false,
  actions = [],
  onRowClick,
  onDeleteClick,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 5,
  onPageChange = () => {},
  onLimitChange = () => {},
  onSearchChange = () => {},
  selectable = false,
  showStatus = true,
  showImage = true,
  showCategoryFilter = false,
  categoryOptions = [],
  onCategoryChange = () => {},
  showSort = false,
  sortOptions = [],
  onSortChange = () => {},
  onEditClick = () => {},
  onViewClick = () => {},
  onBulkDelete = () => {},
  onInvoiceClick = () => {},
  emptyMessage = 'No records found',

  /* === NEW, optional & safe defaults (won't affect other pages) === */
  highlightZeroPO = false,
  zeroPOTextClass = '[&>td]:!text-gray-300 [&>td_*]:!text-gray-300',
  rowClassName,
  collapseForRowHighlight = false,
}) {
  const safeData = Array.isArray(data) ? data : [];
  const safeColumns = Array.isArray(columns) ? columns : [];
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('');

  const allSelected = safeData.length > 0 && selectedRows.length === safeData.length;

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSearchChange(search);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, onSearchChange]);

  const handleSelectAll = () => {
    setSelectedRows(allSelected ? [] : safeData.map((_, i) => i));
  };

  const handleSelectRow = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const colSpan =
    (selectable ? 1 : 0) + safeColumns.length + (actions.length > 0 ? 1 : 0) || 1;

  return (
    <div className="bg-white w-full overflow-hidden">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex justify-end w-full p-2 px-4">
          {showCategoryFilter && (
            <select
              className="text-sm rounded px-3 py-1 text-slate-700"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                onCategoryChange(e.target.value);
              }}
            >
              <option value="">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {showSort && (
            <select
              className="text-sm rounded px-3 py-1 text-slate-700"
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                onSortChange(e.target.value);
              }}
            >
              <option value="">Sort By</option>
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {showSearch && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm border rounded-md"
              />
            </div>
          )}

          {selectable && selectedRows.length > 0 && (
            <div>
              <button
                onClick={() => {
                  const rows = selectedRows.map((i) => safeData[i]);
                  onBulkDelete?.(rows);
                  setSelectedRows([]);
                }}
                className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <table
          className={[
            "min-w-full text-sm text-left text-slate-700 border-separate border-spacing-y-2", // 👈 add spacing between rows
            collapseForRowHighlight ? "" : "",
          ].join(" ")}
        >
          <thead className="bg-slate-100">
            <tr>
              {selectable && (
                <th className="px-5 py-3 font-semibold">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="accent-blue-600"
                    disabled={safeData.length === 0}
                    title={safeData.length === 0 ? 'No rows to select' : 'Select all'}
                  />
                </th>
              )}
              {safeColumns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-semibold whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {safeData.length > 0 ? (
              safeData.map((row, idx) => {
                const isZeroPO = highlightZeroPO && Number(row?.poTotal) === 0;

                return (
                  <tr
                    key={idx}
                    onClick={() => onRowClick?.(row)}
                    className={[
                      'cursor-pointer',
                      isZeroPO
                        ? [
                            '[&>td]:bg-red-600',
                            '[&>td:first-child]:rounded-l-[10px]',
                            '[&>td:last-child]:rounded-r-[10px]',
                            zeroPOTextClass,
                            'hover:bg-transparent',
                            '[&>td]:text-gray-300 [&>td_*]:text-inherit',
                          ].join(' ')
                        : 'hover:bg-gray-100',
                      rowClassName?.(row, idx) || '',
                    ].join(' ')}
                  >
                    {selectable && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(idx)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRow(idx);
                          }}
                          className="accent-blue-600"
                        />
                      </td>
                    )}

                    {safeColumns.map((col) => (
                      <td key={col.key} className="px-4 py-4 whitespace-nowrap">
                        {col.render ? (
                          col.render(row)
                        ) : col.key === 'user' ? (
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 relative">
                              <Image
                                src={row.user.image}
                                alt={row.user.name}
                                fill
                                className="rounded-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{row.user.name}</p>
                              <p className="text-xs text-slate-500">{row.user.role}</p>
                            </div>
                          </div>
                        ) : col.key === 'status' && showStatus ? (
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              statusStyles[row.status] || 'text-slate-700 bg-slate-100'
                            }`}
                          >
                            {row.status}
                          </span>
                        ) : col.key === 'image' && showImage ? (
                          <div className="w-12 h-12">
                            <Image
                              src={row[col.key]}
                              alt="Image"
                              width={48}
                              height={48}
                              className="rounded object-cover"
                            />
                          </div>
                        ) : (
                          row[col.key]
                        )}
                      </td>
                    ))}

                    {actions.length > 0 && (
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {actions.includes('view') && (
                            <button
                              className="text-blue-500 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onViewClick?.(row);
                              }}
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {actions.includes('edit') && (
                            <button
                              className="text-amber-500 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditClick?.(row);
                              }}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {actions.includes('delete') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick?.(row);
                              }}
                              className="text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 cursor-pointer" />
                            </button>
                          )}
                          {actions.includes('invoice') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onInvoiceClick?.(row);
                              }}
                              className="text-green-600 cursor-pointer"
                              title="Download Invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={colSpan} className="px-4 py-6 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        </div>
      )}
    </div>
  );
}
