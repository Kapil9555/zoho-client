'use client';

import {
    BadgePercent,
    Briefcase,
    Building2,
    CircleCheck,
    Eye,
    FileText,
    Globe,
    Hash,
    Info,
    Mail,
    MapPin,
    Percent,
    Phone,
    ShieldCheck,
    User2
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Loader from '@/components/custom/ui/Loader';
import { useGetUserByIdQuery, useUpdateKYCStatusMutation } from '@/redux/features/api/adminApi';

export default function AdminUserViewModal({ onClose, userId }) {
    const { id } = useParams();
    const router = useRouter();

    const { data: user, isLoading } = useGetUserByIdQuery(userId);
    const [updateKYCStatus] = useUpdateKYCStatusMutation();
    const [reason, setReason] = useState('');

    if (isLoading || !user) return <Loader />;

    const noDocumentsUploaded =
        !user.documents?.businessRegistration &&
        !user.documents?.taxIdProof &&
        !user.documents?.personalId &&
        !user.documents?.addressProof;

    const renderInfoBlock = (label, value, icon) => (
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm flex items-start gap-3">
            {icon && <span className="text-blue-600 mt-1">{icon}</span>}
            <div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-medium text-gray-800 whitespace-pre-line">{value || '-'} </p>
            </div>
        </div>
    );

    const handleApprove = async () => {
        try {
            await updateKYCStatus({ userId, status: 'approved' });
            alert('KYC Approved');
            onClose();
        } catch (err) {
            alert('Error approving KYC');
        }
    };

    const handleReject = async () => {
        if (!reason.trim()) return alert('Rejection reason is required');
        try {
            await updateKYCStatus({ userId, status: 'rejected', reason });
            alert('KYC Rejected');
            onClose();
        } catch (err) {
            alert('Error rejecting KYC');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 animate-fadeIn">
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl border border-gray-200 animate-slideUp">
                <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-500 rounded-t-2xl shadow">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2 tracking-wide">
                        <User2 className="w-5 h-5" /> User Profile
                    </h2>
                    <button onClick={onClose} className="text-white hover:text-red-300 transition duration-200" aria-label="Close">✕</button>
                </div>

                <div className="px-6 py-6 text-gray-700 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderInfoBlock('Name', user.name, <User2 size={16} />)}
                        {renderInfoBlock('Email', user.email, <Mail size={16} />)}
                        {renderInfoBlock('Mobile', user.mobile, <Phone size={16} />)}
                        {renderInfoBlock('Company Name', user.companyName, <Building2 size={16} />)}
                        {renderInfoBlock('Business Type', user.businessType, <Briefcase size={16} />)}
                        {renderInfoBlock('Registration Number', user.registrationNumber, <Hash size={16} />)}
                        {renderInfoBlock('GST Number', user.gstNumber, <BadgePercent size={16} />)}
                        {renderInfoBlock('PAN Number', user.panNumber, <ShieldCheck size={16} />)}
                        {renderInfoBlock('Country', user.country?.label, <Globe size={16} />)}
                        {renderInfoBlock('Special Discount (%)', user.specialDiscount, <Percent size={16} />)}
                        {renderInfoBlock('Account Active', user.isActive ? 'Yes' : 'No', <CircleCheck size={16} />)}
                    </div>

                    <div>
                        <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" /> Contact Person
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {renderInfoBlock('Name', user.contactPerson?.name, <User2 size={16} />)}
                            {renderInfoBlock('Email', user.contactPerson?.email, <Mail size={16} />)}
                            {renderInfoBlock('Phone', user.contactPerson?.phone, <Phone size={16} />)}
                            {renderInfoBlock('Designation', user.contactPerson?.designation, <Briefcase size={16} />)}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" /> Address
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {renderInfoBlock('Street', user.address?.street, <MapPin size={16} />)}
                            {renderInfoBlock('City', user.address?.city, <MapPin size={16} />)}
                            {renderInfoBlock('State', user.address?.state, <MapPin size={16} />)}
                            {renderInfoBlock('Pincode', user.address?.pincode, <MapPin size={16} />)}
                            {renderInfoBlock('Country', user?.country?.label, <Globe size={16} />)}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" /> Documents
                        </h3>
                        {noDocumentsUploaded ? (
                            <p className="text-sm text-red-500 italic">No documents uploaded</p>
                        ) : (
                            <div className="space-y-2">
                                {user.documents?.businessRegistration && (
                                    <a href={user.documents.businessRegistration} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                                        <Eye size={16} className="mr-1" /> View Business Registration
                                    </a>
                                )}
                                {user.documents?.taxIdProof && (
                                    <a href={user.documents.taxIdProof} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                                        <Eye size={16} className="mr-1" /> View Tax ID Proof
                                    </a>
                                )}
                                {user.documents?.personalId && (
                                    <a href={user.documents.personalId} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                                        <Eye size={16} className="mr-1" /> View Personal ID
                                    </a>
                                )}
                                {user.documents?.addressProof && (
                                    <a href={user.documents.addressProof} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                                        <Eye size={16} className="mr-1" /> View Address Proof
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4 text-sm text-gray-600">
                        <p><strong>KYC Status:</strong> <span className={`capitalize font-medium px-2 py-1 rounded ${user.kycStatus === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : user.kycStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                            {user.kycStatus}
                        </span></p>
                        {user.kycStatus === 'rejected' && (
                            <p className="text-red-600">Rejection Reason: {user.rejectionReason}</p>
                        )}
                    </div>

                    {user.kycStatus === 'pending' && (
                        <div className="mt-6 flex flex-col gap-3">
                            <button onClick={handleApprove} className="bg-green-600 text-white px-4 py-2 rounded w-fit">Approve KYC</button>
                            <div>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Enter rejection reason..."
                                    className="w-full border p-2 rounded mb-2"
                                />
                                <button onClick={handleReject} className="bg-red-600 text-white px-4 py-2 rounded">Reject KYC</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className='m-3 flex justify-end'>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-300 text-gray-800 px-6 py-2 cursor-pointer rounded-md hover:bg-gray-400 transition"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
