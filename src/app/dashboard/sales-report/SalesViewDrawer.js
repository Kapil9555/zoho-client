'use client';

import { ImageUploadInput } from '@/components/custom/ui/input';
import Loader from '@/components/custom/ui/Loader';
import { useAddCustomerPaymentDetailMutation, useGetCustomerPaymentDetailByIdQuery, useGetCustomerPaymentDetailsQuery, useUpdateCustomerPaymentDetailMutation } from '@/redux/features/api/customerPaymentApi';
import { useUpsertPiDocsMutation, useGetPiDocsQuery } from '@/redux/features/api/documentsApi';
import { useAddPoPaymentDetailMutation, useGetPoPaymentDetailByIdQuery, useUpdatePoPaymentDetailMutation } from '@/redux/features/api/poPaymentApi';
import { useGetSalesMembersQuery, useGetSalesMeQuery } from '@/redux/features/api/zohoApi';
import { showError, showSuccess } from '@/utils/customAlert';
import {
    X, ExternalLink, BadgePercent, File,
    FileText,
    FileArchive,
    FileSpreadsheet,
    FileAudio,
    FileVideo,
    FileCode,
    Wallet,
    IndianRupee,
    Plus,
    Trash2,
} from 'lucide-react';
import { set } from 'mongoose';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/* -------------------- constants -------------------- */


const DOC_TYPES = [
    { value: 'PO Receiving', label: 'PO Receiving' },
    { value: 'Courier Details', label: 'Courier Details' },
];

const PAYMENT_MODES = [
    'NEFT',
    'RTGS',
    'IMPS',
    'UPI',
    'Cash',
    'Cheque',
    // 'DD',
    // 'Card',
    // 'Bank Transfer',
];


const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'];



/* -------------------- helpers -------------------- */
// encoding-safe file name + extension helpers



const getExt = (url = '') => {
    try {
        const clean = url.split('?')[0];
        const parts = clean.split('.');
        return (parts.pop() || '').toLowerCase();
    } catch {
        return '';
    }
};


const isImageExt = (ext) => IMAGE_EXTS.includes(ext);


// array-of-buckets helpers: [{ docType, docs: [] }, ...]
const findDocTypeIndex = (arr = [], type) => (arr || []).findIndex((g) => g?.docType === type);



const ensureDocTypeBucket = (documents = [], type) => {
    const next = Array.isArray(documents) ? [...documents] : [];
    let idx = findDocTypeIndex(next, type);
    if (idx === -1) {
        next.push({ docType: type, docs: [] });
        idx = next.length - 1;
    }
    return { next, idx };
};


const addDocsToType = (documents = [], type, urls = []) => {

    // console.log("urls check",urls)
    const { next, idx } = ensureDocTypeBucket(documents, type);
    const existing = new Set(next[idx].docs || []);
    urls.forEach((u) => existing.add(u));
    next[idx] = { ...next[idx], docs: Array.from(existing) };

    // console.log("next check",next)
    return next;
};


const removeDocFromType = (documents = [], type, url) => {
    const next = Array.isArray(documents) ? [...documents] : [];
    const idx = findDocTypeIndex(next, type);
    if (idx === -1) return next;
    const filtered = (next[idx].docs || []).filter((d) => d !== url);
    if (filtered.length === 0) {
        // Remove empty bucket (preferred). If you want to keep it, replace with: next[idx] = { ...next[idx], docs: [] };
        next.splice(idx, 1);
    } else {
        next[idx] = { ...next[idx], docs: filtered };
    }
    return next;
};



const getDocsForType = (documents = [], type) => {
    const idx = findDocTypeIndex(documents, type);
    return idx === -1 ? [] : (documents[idx].docs || []);
};

const safeArr = (a) => (Array.isArray(a) ? a : []);


/* -------------------- component -------------------- */
export default function SalesViewDrawer({ viewPiDetails, onClose }) {


    const d = viewPiDetails || {};

    console.log("d details check", d)

    const [upsertPiDocs, { isLoading }] = useUpsertPiDocsMutation();

    const { data: getDocs, isLoading: isLoadingDocs } = useGetPiDocsQuery(d.pi);

    // console.log('getDocs:', getDocs);

    const uploadedDocs = getDocs?.documents || [];



    //new functionality of uploading docs
    // docs state (best practice)
    const [serverDocs, setServerDocs] = useState([]);
    const [draftDocs, setDraftDocs] = useState([]);
    const [docsDirty, setDocsDirty] = useState(false);



    const [docType, setDocType] = useState('PO Receiving');
    const [previews, setPreviews] = useState([]);
    const [saving, setSaving] = useState(false);


    const [salesPerEmails, setSalesPerEmails] = useState([])

    const [previewsByRow, setPreviewsByRow] = useState({})




    // numbers + formatting
    const fmtMoney = (n, currency = 'INR') =>
        Number.isFinite(Number(n))
            ? Number(n).toLocaleString('en-IN', { style: 'currency', currency })
            : '₹0';

    const fmtNum = (n) =>
        Number.isFinite(Number(n)) ? Number(n).toLocaleString('en-IN') : '0';

    const fmtPct = (n) =>
        Number.isFinite(Number(n)) ? `${Number(n).toFixed(2)}%` : '0.00%';

    const fmtDate = (v) => {
        if (!v) return '-';
        const t = new Date(v);
        return Number.isNaN(t.getTime())
            ? String(v)
            : t.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const invoices = safeArr(d.invoicesByPi);
    const pos = safeArr(d.poByPi);

    const profitPctOnPo =
        d.profitPercentOnPo ?? d.profitPercentOnPO ?? d.profit_percent_on_po;

    const misc = d.miscellaneous ?? d.miscellaneouss ?? 0;
    const currency = 'INR';





    const piId = d.pi


    const {
        data: paymentDetail,
        isLoading: isPaymentLoading,
        isError: isPaymentError,
        error: paymentError,
    } = useGetCustomerPaymentDetailByIdQuery(piId, { skip: !piId });


    const [addCustomerPaymentDetail, { isLoading: isSaving }] = useAddCustomerPaymentDetailMutation();
    const [updateCustomerPaymentDetail, { isLoading: isSavingUp }] = useUpdateCustomerPaymentDetailMutation();

    const { data: me } = useGetSalesMeQuery();
    const isAdmin = !!me?.isAdmin || me?.role === 'admin';


    const {
        data: teamData,
        isLoading: teamLoading,
        isFetching: teamFetching,
    } = useGetSalesMembersQuery(
        { page: 1, limit: 10000 },
        { refetchOnMountOrArgChange: true }
    );

    const allTeams = teamData?.items



    const toNumber = (val) => {
        if (val === '' || val == null) return NaN;
        const n = Number(String(val).replace(/,/g, '').trim());
        return Number.isFinite(n) ? n : NaN;
    };



    /* =======================
       PAYMENT DETAILS (FINAL v2)
       ======================= */

    const PAYMENT_METHODS = ['Yes Bank', 'Hero Fincap', 'HDFC'];

    const PAYMENT_STATUSES = ['Received', 'Due'];

    // status
    const [paymentStatus, setPaymentStatus] = useState('Received');

    const [receivedAmount, setReceivedAmount] = useState('');
    const [dueAmount, setDueAmount] = useState('');

    // Paid-only fields
    const [receivedDate, setReceivedDate] = useState('');
    const [paymentReceivedMode, setPaymentReceivedMode] = useState('');

    // Due-only fields
    const [dueReason, setDueReason] = useState('');
    const [dueDate, setDueDate] = useState('');
    ;

    const [workingDocs, setWorkingDocs] = useState([]);

    const [salesPersonName, setSalesPersonName] = useState('');
    const [salesPersonEmail, setSalesPersonEmail] = useState('');

    // Always-on notes


    const isDue = paymentStatus === 'Due';



    // legacy aggregate mirrors (kept)
    const [testMailBox, setTestMailBox] = useState([]);





    // editing flags
    const [isEditing, setIsEditing] = useState(false);
    const [payType, setPayType] = useState('pending');
    const [payments, setPayments] = useState([]);

    // Always-on notes
    const [notes, setNotes] = useState('');









    // helper: shallow equality for [{docType, docs: string[]}]
    const sameDocs = (a, b) => {
        if (a === b) return true;
        if (!Array.isArray(a) || !Array.isArray(b)) return false;
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            const ga = a[i], gb = b[i];
            if (ga?.docType !== gb?.docType) return false;
            const da = Array.isArray(ga?.docs) ? ga.docs : [];
            const db = Array.isArray(gb?.docs) ? gb.docs : [];
            if (da.length !== db.length) return false;
            for (let j = 0; j < da.length; j++) {
                if (da[j] !== db[j]) return false;
            }
        }
        return true;
    };

    useEffect(() => {
        if (!Array.isArray(uploadedDocs)) return;

        setServerDocs(prev => (sameDocs(prev, uploadedDocs) ? prev : uploadedDocs));

        if (!docsDirty) {
            setDraftDocs(prev => (sameDocs(prev, uploadedDocs) ? prev : uploadedDocs));
        }
    }, [uploadedDocs, docsDirty]);


    useEffect(() => {

        const spName = d?.salespersonName || '';
        setSalesPersonName(spName);

        // Find email from teamData
        const matched = allTeams?.find(
            (t) => t.name?.trim().toLowerCase() === spName?.trim().toLowerCase()
        );
        setSalesPersonEmail(matched?.email || '');
    }, [d, allTeams]);



    const totalAmount = (() => {
        // const raw = po?.total;
        const raw = 0;

        const n = Number(String(raw ?? '').toString().replace(/,/g, ''));
        return Number.isFinite(n) ? n : NaN;
    })();


    const numeric = (v) => {
        const n = Number(String(v ?? '').replace(/[,₹\s]/g, ''));
        return Number.isFinite(n) ? n : 0;
    };




    const totalPaid = payments.reduce((acc, p) => acc + numeric(p.amount), 0);
    const remaining = Number.isFinite(totalAmount) ? Math.max(0, totalAmount - totalPaid) : 0;





    const handleSaveUploadedDocs = async () => {
        try {
            setSaving(true);
            const payload = { piId: d.pi, documents: draftDocs };
            await upsertPiDocs(payload).unwrap();
            setServerDocs(draftDocs);   // commit locally
            setDocsDirty(false);
            setPreviews([]);            // clear picker previews
            showSuccess('Success', 'Documents updated successfully');
        } catch (e) {
            console.error(e);
            showError('Error', e?.data?.message || 'Failed to save documents');
        } finally {
            setSaving(false);
        }
    };



    const handleResetDocs = () => {
        setDraftDocs(serverDocs);
        setDocsDirty(false);
        setPreviews([]);
    };


    const getFileKind = (ext = '') => {
        const e = ext.toLowerCase();
        if (['xls', 'xlsx', 'csv'].includes(e)) return 'excel';
        if (['doc', 'docx', 'rtf', 'odt'].includes(e)) return 'word';
        if (e === 'pdf') return 'pdf';
        if (['ppt', 'pptx', 'odp'].includes(e)) return 'ppt';
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) return 'archive';
        if (['mp3', 'wav', 'm4a', 'flac', 'aac', 'ogg'].includes(e)) return 'audio';
        if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(e)) return 'video';
        if (['js', 'jsx', 'ts', 'tsx', 'json', 'xml', 'yml', 'yaml', 'html', 'css', 'py', 'java', 'go', 'rb', 'php', 'c', 'cpp'].includes(e)) return 'code';
        if (['txt', 'log', 'md'].includes(e)) return 'text';
        return 'other';
    };

    const FileIcon = ({ ext, className = 'h-8 w-8 text-gray-600' }) => {
        switch (getFileKind(ext)) {
            case 'excel': return <FileSpreadsheet className={className} />;
            case 'word': return <FileText className={className} />;
            case 'pdf': return <FileText className={className} />;
            case 'ppt': return <FileText className={className} />;
            case 'archive': return <FileArchive className={className} />;
            case 'audio': return <FileAudio className={className} />;
            case 'video': return <FileVideo className={className} />;
            case 'code': return <FileCode className={className} />;
            case 'text': return <FileText className={className} />;
            default: return <File className={className} />;
        }
    };



    // ----------------------------------------------



    // ===== ADD / REMOVE PAYMENT ROWS (init with attachments: []) =====
    const addPayment = () => {
        if (payType !== 'partial') return;
        if (!Number.isFinite(totalAmount)) return;
        setPayments((list) => [...list, { amount: '', date: '', mode: '', method: 'HDFC', attachments: [], invoiceNo: '' }]);
    };


    const removePayment = (idx) => {
        if (payType !== 'partial') return;
        setPayments((list) => list.filter((_, i) => i !== idx));
        setPreviewsByRow((prev) => {
            const next = { ...prev };
            delete next[idx];
            return next;
        });
    };



    const updatePayment = (idx, key, value) => {
        setPayments((list) => {
            const copy = list.map((p) => ({ ...p, attachments: p.attachments || [] }));
            if (key === 'amount' && Number.isFinite(totalAmount)) {
                const otherSum = copy.reduce((acc, p, i) => (i === idx ? acc : acc + numeric(p.amount)), 0);
                const maxAllowed = Math.max(0, totalAmount - otherSum);
                let next = numeric(value);
                // if (next > maxAllowed) next = maxAllowed;  // keep your relaxed rule
                copy[idx].amount = value === '' ? '' : String(next);
            } else {
                // @ts-ignore
                copy[idx][key] = value;
            }
            return copy;
        });
    };



    const handlePayTypeChange = (next) => {
        setPayType(next);
        if (next === 'pending') {
            setPayments([]);
            return;
        }
        if (next === 'full') {
            if (!(payments.length === 1 && numeric(payments[0].amount) === totalAmount)) {
                setPayments([{
                    amount: Number.isFinite(totalAmount) ? String(totalAmount) : '',
                    date: '',
                    mode: '',
                    method: 'HDFC',
                    attachments: [],
                }]);
            }
            return;
        }
        if (next === 'partial') {
            if (!Array.isArray(payments) || payments.length === 0) {
                setPayments([{ amount: '', date: '', mode: '', method: 'HDFC', attachments: [] }]);
            }
        }
    };


    // Build payload exactly like the controller expects
    // Build payload exactly like the controller expects
    const buildPayload = () => {
        // NEW: pending payload is empty payments + flag
        if (payType === 'pending') {
            return {
                payType: 'pending',
                payments: [],
                notes,
                salesPersonName,
                salesPersonEmail,
            };
        }

        // Clean numeric + trimmed values
        const normalizedPayments = payments.map((p) => ({
            amount: numeric(p.amount),
            date: p.date,
            mode: p.mode.trim(),
            method: p.method,
            invoiceNo: p.invoiceNo,
            attachments: Array.isArray(p.attachments) ? p.attachments : [],
        }));


        return {
            payType,
            payments: normalizedPayments,
            notes,
            salesPersonName,
            salesPersonEmail,

        };
    };


    const handleSavePayment = async () => {
        const { ok, errors } = validate();

        if (!ok) {
            showError('Validation Error', errors.join('\n'));
            return;
        }


        try {
            const payload = buildPayload();


            console.log("payload check", payload)

            // return

            let resp;
            if (!paymentDetail) {
                resp = await upsertPoPaymentDetail({
                    purchaseOrderId,
                    ...payload,
                    vendorName: po?.vendor_name,
                    poNumber: po?.purchaseorder_number,
                    poTotal: po?.total,
                    totalPaid,
                    salesPerEmails,

                }).unwrap();
            } else {
                resp = await updatePoPaymentDetail({
                    purchaseOrderId,
                    vendorName: po?.vendor_name,
                    ...payload,
                    poNumber: po?.purchaseorder_number,
                    poTotal: po?.total,
                    totalPaid,
                    salesPerEmails,

                }).unwrap();
            }
            // success
            showSuccess('Success', 'Updated successfully!');
            setNotes("")
            setIsEditing(false);


        } catch (e) {
            console.error('Save failed:', e);
            showError(
                'Error',
                e?.data?.errors?.join?.('\n') ||
                e?.data?.message ||
                e?.error ||
                'Failed to save payment details'
            );
        }
    };






    return (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={onClose}>
            <div
                className="absolute right-0 top-0 h-full w-full sm:w-[900px] bg-white shadow-xl overflow-y-auto animate-slideIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center bg-white justify-between px-6 py-4 border-b border-gray-300 sticky top-0 z-10">
                    <div>
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-700" />
                            <h3 className="text-lg font-semibold text-blue-900">
                                {d.pi ? `${d.pi}` : 'PI Details'}
                            </h3>
                        </div>
                        <div>
                            {d.customerName ? (
                                <div>
                                    <span className="text-gray-600 text-lg">Customer:</span>
                                    <span className="text-black text-lg">{" "}{d.customerName}</span>
                                </div>
                            ) : null}
                        </div>
                        <div>
                            {d.salespersonName ? (
                                <div>
                                    <span className="text-gray-600 text-lg">Salesperson:</span>
                                    <span className="text-black text-lg">{" "}{d.salespersonName}</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 cursor-pointer text-gray-600 hover:text-red-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>


                {/* Body */}
                <div className="space-y-8 py-6">
                    {/* Summary Cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
                        <Stat label="Invoice Total" value={fmtMoney(d.invoiceAmountTotal, currency)} />
                        <Stat label="PO Total" value={fmtMoney(d.poAmountTotal, currency)} />
                        <Stat
                            label="Profit"
                            value={fmtMoney(d.profit, currency)}
                            valueClass={
                                Number(d.profit) > 0
                                    ? 'text-emerald-700'
                                    : Number(d.profit) < 0
                                        ? 'text-red-600'
                                        : 'text-gray-900'
                            }
                        />
                        <Stat
                            label="Profit % on PO"
                            value={
                                <span className="inline-flex items-center gap-1">
                                    <BadgePercent className="w-4 h-4" />
                                    {fmtPct(profitPctOnPo)}
                                </span>
                            }
                        />
                    </section>

                    {/* Breakdown */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6">
                        <InfoBox
                            title="Base Totals"
                            items={[
                                ['Base Invoice Total', fmtMoney(d.baseInvoiceAmountTotal, currency)],
                                ['Base PO Total', fmtMoney(d.basePoAmountTotal, currency)],
                            ]}
                        />
                        <InfoBox
                            title="Adjustments"
                            items={[
                                ['Extra Expenses', fmtMoney(d.extraExpenses, currency)],
                                ['Transportation', fmtMoney(d.transportation, currency)],
                                ['Miscellaneous', fmtMoney(misc, currency)],
                            ]}
                        />
                        <InfoBox
                            title="Counts & Grand Total"
                            items={[
                                ['Invoice Count', fmtNum(d.invoiceCount)],
                                ['PO Count', fmtNum(d.poCount)],
                            ]}
                        />
                    </section>

                    {/* Invoices Table */}
                    <section className='px-6'>
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">
                            Invoices {d.pi ? `for ${d.pi}` : ''}
                        </h4>
                        {invoices.length === 0 ? (
                            <EmptyLine text="No invoices found for this PI." />
                        ) : (
                            <div className="overflow-x-auto rounded border border-gray-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <Th>Invoice #</Th>
                                            <Th>Date</Th>
                                            <Th className="text-right">Amount (₹)</Th>
                                            <Th>Status</Th>
                                            <Th className="text-right">Action</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map((r, i) => {
                                            const num =
                                                r.invoice_number ||
                                                r.invoiceNumber ||
                                                r.number ||
                                                r.invoice_no ||
                                                r.invoiceNo ||
                                                r.id ||
                                                `#${i + 1}`;

                                            const date = r.date || r.invoice_date || r.created_time;

                                            const amount =
                                                r.total ?? r.invoice_total ?? r.amount ?? r.base_total ?? r.sub_total;

                                            const status = r.status || r.current_sub_status || '-';

                                            const url =
                                                r.url ||
                                                r.invoice_url ||
                                                r.portal_url ||
                                                r.view_url ||
                                                r.permalink;

                                            return (
                                                <tr key={i} className="border-t border-gray-300">
                                                    <Td className="font-medium text-gray-900">{num}</Td>
                                                    <Td>{fmtDate(date)}</Td>
                                                    <Td className="text-right">{fmtMoney(amount, r.currency_code || currency)}</Td>
                                                    <Td>{status}</Td>
                                                    <Td className="text-right">
                                                        {url ? (
                                                            <a
                                                                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                                                href={url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <ExternalLink className="w-4 h-4" /> Open
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </Td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* POs Table */}
                    <section className='px-6'>
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">
                            Purchase Orders {d.pi ? `for ${d.pi}` : ''}
                        </h4>
                        {pos.length === 0 ? (
                            <EmptyLine text="No purchase orders found for this PI." />
                        ) : (
                            <div className="overflow-x-auto rounded border border-gray-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <Th>PO #</Th>
                                            <Th>Date</Th>
                                            <Th>Vendor</Th>
                                            <Th className="text-right">Amount (₹)</Th>
                                            <Th>Status</Th>
                                            <Th className="text-right">Action</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pos.map((r, i) => {
                                            const num =
                                                r.po_number ||
                                                r.purchaseorder_number ||
                                                r.purchase_order_number ||
                                                r.number ||
                                                r.reference_number ||
                                                r.id ||
                                                `#${i + 1}`;

                                            const date = r.date || r.purchaseorder_date || r.created_time;

                                            const vendor = r.vendor_name || r.vendor || r.customer_name || '-';

                                            const amount =
                                                r.total ?? r.amount ?? r.po_total ?? r.base_total ?? r.sub_total;

                                            const status = r.status || r.current_sub_status || '-';

                                            const url =
                                                r.url ||
                                                r.purchaseorder_url ||
                                                r.view_url ||
                                                r.permalink;

                                            return (
                                                <tr key={i} className="border-t border-gray-300">
                                                    <Td className="font-medium text-gray-900">{num}</Td>
                                                    <Td>{fmtDate(date)}</Td>
                                                    <Td>{vendor}</Td>
                                                    <Td className="text-right">{fmtMoney(amount, r.currency_code || currency)}</Td>
                                                    <Td>{status}</Td>
                                                    <Td className="text-right">
                                                        {url ? (
                                                            <a
                                                                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                                                href={url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <ExternalLink className="w-4 h-4" /> Open
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </Td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>



                    {/* ===== Documents ===== */}
                    <section className="px-6 mb-6" >
                        <div className="space-y-3">
                            <h2 className="w-full text-lg font-semibold text-blue-800 bg-blue-50 px-3 py-1.5 rounded inline-block">
                                {isAdmin ? "Upload Documents" : "Related Documents"}
                            </h2>

                            {/* Controls row: dropdown + uploader */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                {
                                    isAdmin &&
                                    <>
                                        {/* LEFT: Document type dropdown */}
                                        <div className="md:col-span-5 lg:col-span-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                                            <select
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none"
                                                value={docType}
                                                onChange={(e) => { setDocType(e.target.value) }}
                                            >
                                                {
                                                    DOC_TYPES.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>

                                        {/* RIGHT: Uploader (accept ANY) */}
                                        <div className="md:col-span-12 lg:col-span-12 min-w-0">
                                            <div className="text-sm font-medium text-gray-700 mb-1">Upload Files</div>
                                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/60 p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Upload any files (images, PDF, Word, Excel, CSV, TXT, ZIP, etc.).
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-3">


                                                    <ImageUploadInput
                                                        label=""
                                                        name="documents"
                                                        accept="*/*"
                                                        previews={previews}
                                                        setPreviews={setPreviews}
                                                        defaultFiles={[]}
                                                        onUploadComplete={(urlsFromInput) => {
                                                            // ImageUploadInput currently returns ALL (previews + new). Keep only truly new vs draftDocs.
                                                            const existing = new Set(getDocsForType(draftDocs, docType));
                                                            const newUrls = (urlsFromInput || []).filter((u) => !existing.has(u));
                                                            if (newUrls.length) {
                                                                setDraftDocs((prev) => addDocsToType(prev, docType, newUrls));
                                                                setDocsDirty(true);
                                                            }
                                                            // clear the visual previews so next upload starts fresh
                                                            setPreviews([]);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                }



                                {/* All documents (grouped by docType) */}
                                {Array.isArray(draftDocs) && draftDocs.filter(g => (g?.docs?.length || 0) > 0).length > 0 ? (
                                    <div className="md:col-span-12">
                                        {draftDocs
                                            .filter(g => (g?.docs?.length || 0) > 0)
                                            .map((group) => (
                                                <div key={group.docType} className="mb-4">
                                                    <div className="text-sm font-medium text-gray-700 mb-1 mt-4 capitalize">
                                                        {group.docType}
                                                    </div>

                                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                        {group.docs.map((url, idx) => {
                                                            const ext = getExt(url);
                                                            const isImg = isImageExt(ext);
                                                            const fname = decodeURIComponent(url.split('/').pop() || `file-${idx + 1}`);

                                                            return (
                                                                <div key={`${group.docType}-${url}-${idx}`} className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden">
                                                                    <div className="h-28 w-full bg-gray-50 flex items-center justify-center">
                                                                        {isImg ? (
                                                                            <Image src={url} alt={fname} width={256} height={112} className="h-28 w-full object-cover" />
                                                                        ) : (
                                                                            <div className="flex flex-col items-center justify-center">
                                                                                {/* <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{ext || 'file'}</div>
                                        <div className="mt-1 text-[10px] text-gray-500">No preview</div> */}
                                                                                <FileIcon ext={ext} />
                                                                                <div className="mt-1 text-[10px] text-gray-500 uppercase">{ext || 'file'}</div>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="px-3 py-2">
                                                                        <div className="truncate text-sm font-medium text-gray-900" title={fname}>{fname}</div>
                                                                        <div className="mt-2 flex items-center justify-between">
                                                                            <a href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                                                                                Open
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h6m0 0v6m0-6L10 16" />
                                                                                </svg>
                                                                            </a>
                                                                            {
                                                                                isAdmin &&
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setDraftDocs(prev => removeDocFromType(prev, group.docType, url));
                                                                                        setDocsDirty(true);
                                                                                    }}
                                                                                    className="text-xs text-red-600 hover:text-red-700"
                                                                                >
                                                                                    Remove
                                                                                </button>
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : !isAdmin ? <div className="md:col-span-12 text-gray-800 text-sm pl-4">
                                    No related documents uploaded yet!.
                                </div> : null}


                                {
                                    isAdmin &&

                                    <div className="md:col-span-12">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={handleResetDocs}
                                                disabled={!docsDirty || saving}
                                                className={`inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-medium
                      ${!docsDirty || saving ? 'bg-gray-100 text-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                                            >
                                                Reset
                                            </button>
                                            <button
                                                type="button"
                                                disabled={!docsDirty || saving}
                                                onClick={handleSaveUploadedDocs}
                                                className={`inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-medium
                      ${!docsDirty || saving ? 'bg-gray-300 text-gray-600' : 'bg-blue-900 text-white hover:bg-blue-900'}`}
                                            >
                                                {saving ? 'Saving…' : 'Save Documents'}
                                            </button>
                                        </div>
                                    </div>
                                }

                            </div>
                        </div>
                    </section>

                </div>

            </div>
            {
                (isLoading || isLoadingDocs) && <Loader />
            }
        </div>
    );
}

/* ---------- Tiny UI helpers ---------- */

function Stat({ label, value, valueClass }) {
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500">{label}</div>
            <div className={`text-lg font-semibold mt-1 ${valueClass || 'text-gray-900'}`}>
                {value}
            </div>
        </div>
    );
}

function LongText({ label, text }) {
    return (
        <div className="flex flex-col">
            <span className="text-md font-medium text-gray-500">{label}</span>
            <pre className="text-md text-gray-900 whitespace-pre-wrap break-words">{text}</pre>
        </div>
    );
}

function Info({ label, value }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="flex flex-col">
            <span className="text-md font-medium text-gray-500">{label}</span>
            <span className="text-sm text-gray-900 break-words">{value || '-'}</span>
        </div>
    );
}

function InfoBox({ title, items = [] }) {
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h5 className="text-sm font-semibold text-gray-800 mb-2">{title}</h5>
            <dl className="space-y-1">
                {items.map(([k, v], i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                        <dt className="text-gray-600">{k}</dt>
                        <dd className="text-gray-900">{v}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function EmptyLine({ text }) {
    return <p className="text-sm text-gray-500">{text}</p>;
}

function Th({ children, className = '' }) {
    return <th className={`text-left px-3 py-2 ${className}`}>{children}</th>;
}

function Td({ children, className = '' }) {
    return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
