'use client';
import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { TextInput } from '@/components/custom/ui/input';
import Loader from '@/components/custom/ui/Loader';
import { showError, showSuccess } from '@/utils/customAlert';
import {
  useGetVendorByIdQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
} from '@/redux/features/api/vendorApi';

const EMPTY_FORM = {
  companyName: '',
  email: '',
  phone: '',
  sourceOfSupply: '',
};

export default function VendorFormDrawer({ vendorId = null, onClose }) {
  const isEdit = Boolean(vendorId);

  // RTK Query hooks
  const { data: vendorResp, isLoading: isGetLoading } = useGetVendorByIdQuery(vendorId, {
    skip: !isEdit,
  });
  const [createVendor, { isLoading: isCreateLoading }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdateLoading }] = useUpdateVendorMutation();

  const vendorData = useMemo(() => vendorResp ?? null, [vendorResp]);

  const [form, setForm] = useState(EMPTY_FORM);

  // Populate form on edit, reset on create
  useEffect(() => {
    if (isEdit && vendorData) {
      setForm({
        companyName: vendorData.companyName || '',
        email: vendorData.email || '',
        phone: vendorData.phone || '',
        sourceOfSupply: vendorData.sourceOfSupply || '',
      });
    } else if (!isEdit) {
      setForm(EMPTY_FORM);
    }
  }, [isEdit, vendorData, vendorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => (!email ? true : /\S+@\S+\.\S+/.test(email));
  const validatePhone = (phone) => (!phone ? true : /^\d{7,15}$/.test(String(phone || '')));

  const saving = isCreateLoading || isUpdateLoading;

  const handleSubmit = async (e) => {
    e.preventDefault(); // IMPORTANT: avoid full page submit/navigation

    onClose?.();

    // validations
    if (!form.companyName.trim())
      return await showError('Validation Error', 'Company Name is required');
    if (!validateEmail(form.email))
      return await showError('Validation Error', 'Enter a valid email');
    if (!validatePhone(form.phone))
      return await showError('Validation Error', 'Enter a valid phone number');


    
    const payload = {
      companyName: form.companyName.trim(),
      email: form.email.trim().toLowerCase() || '',
      phone: String(form.phone).trim() || '',
      sourceOfSupply: form.sourceOfSupply.trim() || '',
    };



    try {
      if (isEdit) {
        await updateVendor({ id: vendorId, ...payload }).unwrap();
        await showSuccess('Success', 'Vendor updated successfully!');
      } else {
        await createVendor(payload).unwrap();
        await showSuccess('Success', 'Vendor added successfully!');
      }
      
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.error ||
        (typeof err === 'string' ? err : 'Failed to save vendor');
      await showError('Error', msg);
    }
  };

  if (isGetLoading || saving){
    // onClose?.(); 
    return <Loader />
  };



  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full sm:w-[600px] bg-white shadow-xl overflow-y-auto animate-slideIn px-6 py-6">
        <div className="flex justify-between items-center mb-6 px-4 py-3 bg-blue-100 rounded-md">
          <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
            {isEdit ? 'Edit Vendor' : 'Add New Vendor'}
          </h2>
          <button onClick={onClose} className="text-gray-600 cursor-pointer hover:text-red-500">
            <X size={22} />
          </button>
        </div>

        {/* Submit handler goes on the form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="grid grid-cols-2 gap-4">
            <TextInput
              type="text"
              label="Company Name *"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              required
              disabled={saving}
            />

            <TextInput
              type="text"
              label="Source of Supply"
              name="sourceOfSupply"
              value={form.sourceOfSupply}
              onChange={handleChange}
              disabled={saving}
            />

            <TextInput
              type="email"
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={saving}
            />

            <TextInput
              type="tel"
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              inputMode="numeric"
              disabled={saving}
            />
          </section>

          <div className="flex justify-end pt-4 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 cursor-pointer text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 disabled:opacity-60"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit" // IMPORTANT
              className="bg-[#3E57A7] cursor-pointer text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
              disabled={saving}
            >
              {isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
