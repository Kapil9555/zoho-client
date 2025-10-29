'use client';
import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { TextInput } from '@/components/custom/ui/input';
import Loader from '@/components/custom/ui/Loader';
import { showError, showSuccess } from '@/utils/customAlert';
import { useAddSalesMemberMutation, useGetSalesMemberByIdQuery, useUpdateSalesMemberMutation } from '@/redux/features/api/zohoApi';



export default function SalesMemberFormDrawer({ memberId = null, onClose }) {
  const isEdit = Boolean(memberId);

  // RTK Query hooks
  const { data: memberResp, isLoading: isGetLoading } = useGetSalesMemberByIdQuery(memberId, {
    skip: !isEdit,
  });
  const [addMember, { isLoading: isAddLoading }] = useAddSalesMemberMutation();
  const [updateMember, { isLoading: isUpdateLoading }] = useUpdateSalesMemberMutation();

  const memberData = useMemo(() => memberResp?.member ?? null, [memberResp]);

  // console.log("memberData",memberData)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    monthlyTarget: '',
    isActive: true,
    topLine:""
  });


  useEffect(() => {
    if (memberData && isEdit) {
      setForm((prev) => ({
        ...prev,
        name: memberData.name || '',
        email: memberData.email || '',
        phone: memberData.phone || '',
        monthlyTarget: memberData.monthlyTarget ?? '',
        topLine: memberData.topLine ?? '',
        isActive: !!memberData.isActive,
        password: '',
      }));
    }
  }, [memberData, isEdit]);



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };


  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(String(phone || ''));


  const saving = isAddLoading || isUpdateLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return await showError('Validation Error', 'Name is required');
    if (!validateEmail(form.email)) return await showError('Validation Error', 'Enter a valid email');
    if (!validatePhone(form.phone)) return await showError('Validation Error', 'Enter a valid 10-digit phone number');

    // Password rules: required on create; optional on edit (min 6 if provided)
    if (!isEdit) {
      if (!form.password || form.password.length < 6) {
        return await showError('Validation Error', 'Password must be at least 6 characters for new members');
      }
    } else if (form.password && form.password.length < 6) {
      return await showError('Validation Error', 'If changing password, minimum 6 characters');
    }

    if (form.monthlyTarget !== '' && Number(form.monthlyTarget) < 0) {
      return await showError('Validation Error', 'Monthly Target must be ≥ 0');
    }


    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: String(form.phone).trim(),
        topLine: form.topLine === '' ? null : Number(form.topLine),
        monthlyTarget: form.monthlyTarget === '' ? null : Number(form.monthlyTarget),

        isActive: !!form.isActive,
      };

      // include password only when needed
      if (!isEdit || (isEdit && form.password)) {
        payload.password = form.password;
      }

      if (isEdit) {
        await updateMember({ id: memberId, ...payload }).unwrap();
        await showSuccess('Success', 'Sales member updated successfully!');
      } else {
        await addMember(payload).unwrap();
        await showSuccess('Success', 'Sales member added successfully!');
      }
      onClose?.();
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.error ||
        (typeof err === 'string' ? err : 'Failed to save sales member');
      await showError('Error', msg);
    }
  };

  if (isGetLoading || saving) return <Loader />;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full sm:w-[600px] bg-white shadow-xl overflow-y-auto animate-slideIn px-6 py-6">
        <div className="flex justify-between items-center mb-6 px-4 py-3 bg-blue-100 rounded-md">
          <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
            {isEdit ? 'Edit Sales Member' : 'Add New Sales Member'}
          </h2>
          <button onClick={onClose} className="text-gray-600 cursor-pointer hover:text-red-500">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <section className="grid grid-cols-2 gap-4">
            <TextInput
              type="text"
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={saving}
            />
            <TextInput
              type="email"
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={saving}
            />
            <TextInput
              type="tel"
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              inputMode="numeric"
              pattern="\d{10}"
              disabled={saving}
            />

            <TextInput
              type="number"
              label="Top Line (₹)"
              name="topLine"
              value={form.topLine}
              onChange={handleChange}
              min="0"
              step="1"
              disabled={saving}
            />

            <TextInput
              type="number"
              label="Bottom Line (₹)"
              name="monthlyTarget"
              value={form.monthlyTarget}
              onChange={handleChange}
              min="0"
              step="1"
              disabled={saving}
            />



            {/* Password: show on create; optional on edit */}
            <div className="col-span-2">
              <TextInput
                type="password"
                label={isEdit ? 'Password (leave blank to keep unchanged)' : 'Password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required={!isEdit}
                disabled={saving}
              />
            </div>


          </section>

          {/* Status */}
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-700 block mb-2">Status</label>
            <label className="inline-flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                disabled={saving}
              />
              <span>{form.isActive ? 'Active' : 'Inactive'}</span>
            </label>
          </div>

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
              type="submit"
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
