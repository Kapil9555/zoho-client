'use client';
import { useEffect, useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';
import Loader from '@/components/custom/ui/Loader';
import { showError, showSuccess } from '@/utils/customAlert';
import { useImportVendorsMutation } from '@/redux/features/api/vendorApi';

export default function VendorImportDialog({ onClose }) {
  const [file, setFile] = useState(null);
  const [importVendors, { isLoading }] = useImportVendorsMutation();
  const dialogRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Focus the dialog when opened (basic focus management)
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const onFileChange = (e) => setFile(e.target.files?.[0] || null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return showError('Validation', 'Please choose a .xlsx file');
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      return showError('Validation', 'Unsupported file type. Upload .xlsx or .xls');
    }
    try {
      const res = await importVendors(file).unwrap();
      await showSuccess(
        'Import complete',
        `Rows: ${res.totalRows || 0}\nUpserted: ${res.upsertedCount || 0}\nModified: ${res.modifiedCount || 0}\nMatched: ${res.matchedCount || 0}`
      );
      onClose?.();
    } catch (err) {
      const msg = err?.data?.message || err?.error || 'Failed to import vendors';
      showError('Error', msg);
    }
  };

  // Close when clicking outside the modal content
  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
      onClick={onBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="vendor-import-title"
    >
      {/* Modal card */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-lg rounded-xl bg-white shadow-2xl outline-none animate-[fadeIn_120ms_ease-out] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 id="vendor-import-title" className="text-lg font-semibold text-blue-900 flex items-center gap-2">
            <Upload size={18} /> Import Vendors (.xlsx)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="px-5 py-5 space-y-5">
          <div className="border border-dashed border-gray-300 rounded-md p-4">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={onFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="text-xs text-gray-500 mt-2">
                Selected: <span className="font-medium break-all">{file.name}</span>
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">Accepted: .xlsx, .xls (max 5MB)</p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="bg-[#3E57A7] cursor-pointer text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60 transition-colors"
              disabled={!file || isLoading}
            >
              Import
            </button>
          </div>
        </form>

        {isLoading && <Loader />}
      </div>
    </div>
  );
}
