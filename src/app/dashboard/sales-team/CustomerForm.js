'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Eye } from 'lucide-react';

import {
  useAddUserMutation,
  useUpdateUserMutation,
  useGetUserByIdQuery,
} from '@/redux/features/api/adminApi';

import Loader from '@/components/custom/ui/Loader';
import { H4 } from '@/components/custom/ui/text';
import { TextInput, TextareaInput, ImageUploadInput } from '@/components/custom/ui/input';

export default function CustomerForm() {
  const { id } = useParams();
  const router = useRouter();

  const isEdit = Boolean(id);
  const { data: userData, isLoading } = useGetUserByIdQuery(id, { skip: !isEdit });

  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    companyName: '',
    businessType: '',
    registrationNumber: '',
    country: { label: '', value: '' },
    address: { street: '', city: '', state: '', pinCode: '' },
    contactPerson: { name: '', email: '', phone: '', designation: '' },
    documents: {
      businessRegistration: [],
      taxIdProof: [],
      personalId: [],
      addressProof: [],
      taxIdNumber: '',
      personalIdNumber: '',
      personalIdType: '',
    },
    specialDiscount: 0,
    isActive: true,
  });

  useEffect(() => {
    if (userData && isEdit) {
      setForm({
        ...form,
        ...userData,
        address: userData.address || {},
        contactPerson: userData.contactPerson || {},
        documents: userData.documents || {},
        country: userData.country || { label: '', value: '' },
      });
    }
  }, [userData, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      // console.log("payload check",payload)
      // return
      if (!isEdit) delete payload.id;
      if (isEdit) {
        await updateUser({ id, ...payload }).unwrap();
        toast.success('Customer updated successfully!');
      } else {
        await addUser(payload).unwrap();
        toast.success('Customer added successfully!');
      }
      router.push('/dashboard/customers');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save customer');
    }
  };

  if (isEdit && isLoading) return <Loader />;

  const renderDocUpload = (label, field) => (
    <ImageUploadInput
      label={label}
      defaultImages={form.documents[field] || []}
      onUploadComplete={(urls) =>
        setForm((prev) => ({
          ...prev,
          documents: { ...prev.documents, [field]: urls },
        }))
      }
    />
  );

   const handleApproveKYC = async () => {
    try {
      await updateKYCStatus({ id, body: { kycStatus: 'approved' } }).unwrap();
      toast.success('KYC approved');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to approve KYC');
    }
  };

  const handleRejectKYC = async () => {
    try {
      await updateKYCStatus({ id, body: { kycStatus: 'rejected', rejectionReason: form.rejectionReason } }).unwrap();
      toast.success('KYC rejected');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reject KYC');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <H4 className="text-2xl font-bold text-blue-900 mb-4">
          {isEdit ? 'Edit Customer' : 'Add New Customer'}
        </H4>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="grid grid-cols-2 gap-4">
            <TextInput label="Name" name="name" value={form.name} onChange={handleChange} required />
            <TextInput label="Email" name="email" value={form.email} onChange={handleChange} required />
            <TextInput type='number' label="Mobile" name="mobile" value={form.mobile} onChange={handleChange} required />
            {!isEdit && (
              <TextInput label="Password" name="password" value={form.password} onChange={handleChange} required />
            )}
            <TextInput label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} />
            <TextInput label="Business Type" name="businessType" value={form.businessType} onChange={handleChange} />
            <TextInput label="Registration Number" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} />
            <TextInput label="Special Discount (%)" name="specialDiscount" value={form.specialDiscount} onChange={handleChange} type="number" />
            <TextInput label="Country Name" name="country.label" value={form.country.label} onChange={(e) => handleNestedChange('country', 'label', e.target.value)} />
            <TextInput label="Country Code" name="country.value" value={form.country.value} onChange={(e) => handleNestedChange('country', 'value', e.target.value)} />
          </section>

          <h4 className="text-lg font-semibold text-gray-700 pt-4">Contact Person</h4>
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Name" value={form.contactPerson.name} onChange={(e) => handleNestedChange('contactPerson', 'name', e.target.value)} />
            <TextInput label="Email" value={form.contactPerson.email} onChange={(e) => handleNestedChange('contactPerson', 'email', e.target.value)} />
            <TextInput label="Phone" value={form.contactPerson.phone} onChange={(e) => handleNestedChange('contactPerson', 'phone', e.target.value)} />
            <TextInput label="Designation" value={form.contactPerson.designation} onChange={(e) => handleNestedChange('contactPerson', 'designation', e.target.value)} />
          </div>

          <h4 className="text-lg font-semibold text-gray-700 pt-4">Address</h4>
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Street" value={form.address.street} onChange={(e) => handleNestedChange('address', 'street', e.target.value)} />
            <TextInput label="City" value={form.address.city} onChange={(e) => handleNestedChange('address', 'city', e.target.value)} />
            <TextInput label="State" value={form.address.state} onChange={(e) => handleNestedChange('address', 'state', e.target.value)} />
            <TextInput label="Pincode" value={form.address.pinCode} onChange={(e) => handleNestedChange('address', 'pinCode', e.target.value)} />
          </div>

          <h4 className="text-lg font-semibold text-gray-700 pt-4">Documents</h4>
          <div className="space-y-4">
            {renderDocUpload('Business Registration', 'businessRegistration')}
            {renderDocUpload('Tax ID Proof', 'taxIdProof')}
            {renderDocUpload('Personal ID', 'personalId')}
            {renderDocUpload('Address Proof', 'addressProof')}
            <TextInput label="Tax ID Number" value={form.documents.taxIdNumber} onChange={(e) => handleNestedChange('documents', 'taxIdNumber', e.target.value)} />
            <TextInput label="Personal ID Number" value={form.documents.personalIdNumber} onChange={(e) => handleNestedChange('documents', 'personalIdNumber', e.target.value)} />
            <TextInput label="Personal ID Type" value={form.documents.personalIdType} onChange={(e) => handleNestedChange('documents', 'personalIdType', e.target.value)} />
          </div>


          {/* KYC Actions */}
          {isEdit && (
            <div className="space-y-4 pt-4">
              <TextareaInput
                label="Rejection Reason"
                value={form.rejectionReason || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, rejectionReason: e.target.value }))}
              />
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleApproveKYC}
                  className="bg-green-600 cursor-pointer text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Approve KYC
                </button>
                <button
                  type="button"
                  onClick={handleRejectKYC}
                  className="bg-red-600 text-white cursor-pointer px-6 py-2 rounded hover:bg-red-700"
                >
                  Reject KYC
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-blue-600 cursor-pointer text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              {isEdit ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
