'use client';

import Loader from '@/components/custom/ui/Loader';
import { useGetUserByIdQuery } from '@/redux/features/api/adminApi';
import {
    Eye,
    User2
} from 'lucide-react';

export default function AdminUserViewDrawer({ onClose, userId }) {
    const { data: user, isLoading } = useGetUserByIdQuery(userId);
  

    if (isLoading || !user) return <Loader />;

    const noDocumentsUploaded =
        !user.documents?.businessRegistration?.length &&
        !user.documents?.taxIdProof?.length &&
        !user.documents?.personalId?.length &&
        !user.documents?.addressProof?.length;

    const renderRow = (label, value) => (
        <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-500">{label}</span>
            <span className="text-sm text-gray-800 font-medium break-words">{value || '-'}</span>
        </div>
    );

    const renderDocLinks = (label, files) =>
        files?.map((url, idx) => (
            <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                <Eye size={16} /> {label} {files.length > 1 ? idx + 1 : ''}
            </a>
        ));


    return (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
            <div className="absolute right-0 top-0 h-full w-full sm:w-[700px] bg-white shadow-xl overflow-y-auto animate-slideIn px-8 py-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                        <User2 className="w-5 h-5" /> Customer Profile
                    </h2>
                    <button onClick={onClose} className="text-gray-600 cursor-pointer hover:text-red-500 text-xl">✕</button>
                </div>

                {/* Customer Details */}
                <section className="space-y-4 mb-6">
                    <h4 className="w-full  bg-gray-100 px-3 py-1.5 rounded font-semibold text-sm text-blue-900 inline-block">Customer Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                        {renderRow('Name', user.name)}
                        {renderRow('Email', user.email)}
                        {renderRow('Mobile', user.mobile)}
                        {renderRow('Company Name', user.companyName)}
                        {renderRow('Business Type', user.businessType)}
                        {renderRow('Registration Number', user.registrationNumber)}
                        {renderRow('Country', user.country?.label)}
                        {renderRow('Special Discount (%)', user.specialDiscount)}
                        {renderRow('Account Active', user.isActive ? 'Yes' : 'No')}
                    </div>
                </section>

                {/* Contact Person */}
                <section className="space-y-4 mb-6">
                    <h4 className="w-full  bg-gray-100 px-3 py-1.5 rounded font-semibold text-sm text-blue-900 inline-block">Contact Person</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                        {renderRow('Name', user.contactPerson?.name)}
                        {renderRow('Email', user.contactPerson?.email)}
                        {renderRow('Phone', user.contactPerson?.phone)}
                        {renderRow('Designation', user.contactPerson?.designation)}
                    </div>
                </section>

                {/* Address */}
                <section className="space-y-4 mb-6">
                    <h4 className="w-full  bg-gray-100 px-3 py-1.5 rounded font-semibold text-sm text-blue-900 inline-block">Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                        {renderRow('Street', user.address?.street)}
                        {renderRow('City', user.address?.city)}
                        {renderRow('State', user.address?.state)}
                        {renderRow('Pincode', user.address?.pinCode)}
                        {renderRow('Country', user.country?.label)}
                    </div>
                </section>

                {/* Documents */}
                <section className="space-y-4 mb-6">
                    <h4 className="w-full  bg-gray-100 px-3 py-1.5 rounded font-semibold text-sm text-blue-900 inline-block">Uploaded Documents</h4>
                    {noDocumentsUploaded ? (
                        <p className="text-sm text-red-500 italic">No documents uploaded</p>
                    ) : (
                        <div className="space-y-2">
                            {renderDocLinks('Business Registration', user.documents?.businessRegistration)}
                            {renderDocLinks('Tax ID Proof', user.documents?.taxIdProof)}
                            {renderDocLinks('Personal ID', user.documents?.personalId)}
                            {renderDocLinks('Address Proof', user.documents?.addressProof)}
                        </div>
                    )}
                </section>

                {/* KYC */}
                <section className="border-t pt-4 text-sm text-gray-600">
                    <p>
                        <strong>KYC Status:</strong>{' '}
                        <span className={`capitalize font-medium px-2 py-1 rounded ${user.kycStatus === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : user.kycStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                            {user.kycStatus}
                        </span>
                    </p>
                    {user.kycStatus === 'rejected' && (
                        <p className="mt-2">Rejection Reason: <span className='text-red-600'>{user.rejectionReason}</span></p>
                    )}
                </section>

              

                {/* Footer */}
                <div className="mt-10 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
