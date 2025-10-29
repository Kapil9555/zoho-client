'use client';

import Loader from '@/components/custom/ui/Loader';
import { useGetInvoicesByPoPiLiteQuery, useGetPurchaseOrderByIdQuery, useGetSalesMembersQuery, useGetSalesMeQuery } from '@/redux/features/api/zohoApi';
import { FileIcon, FileText, IndianRupee, Plus, Trash2, Wallet, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// RTK Query for payment details (from the slice we set up)

import {
    useAddPoPaymentDetailMutation,
    useGetPoPaymentDetailByIdQuery,
    useGetPoPaymentDetailsQuery,
    useUpdatePoPaymentDetailMutation,
} from '@/redux/features/api/poPaymentApi';

import { showError, showSuccess } from '@/utils/customAlert';

import { vendors } from "../../../utils/allVendors";

import { ImageUploadInput } from '@/components/custom/ui/input';

import Image from 'next/image';

import { MultiInvoiceInput } from '@/components/custom/inputs';
import { useGetVendorByNameQuery } from '@/redux/features/api/vendorApi';

const DOC_TYPES = [
    { value: 'PO Receiving', label: 'PO Receiving' },
    { value: 'Courier Details', label: 'Courier Details' },
];

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'];

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

export default function PurchaseOrderViewDrawer({ purchaseOrderId, onClose }) {
    const { data, isLoading, error } = useGetPurchaseOrderByIdQuery(purchaseOrderId, {
        skip: !purchaseOrderId,
    });

    // Payment details fetch
    const { data: paymentDetail, isLoading: isPaymentLoading, isError: isPaymentError, error: paymentError } = useGetPoPaymentDetailByIdQuery(purchaseOrderId, { skip: !purchaseOrderId });

    // const { data: allPaymentDetail, isLoading: allIsPaymentLoading, isError: allIsPaymentError, error: allPaymentError } = useGetPoPaymentDetailsQuery()

    const [upsertPoPaymentDetail, { isLoading: isSaving }] = useAddPoPaymentDetailMutation();
    const [updatePoPaymentDetail, { isLoading: isSavingUp }] = useUpdatePoPaymentDetailMutation();

    const { data: me } = useGetSalesMeQuery();

    const [salesPersonName, setSalesPersonName] = useState('');
    const [salesPersonEmail, setSalesPersonEmail] = useState('');
    const [manInvoiceNo, setManInvoiceNo] = useState('');
    const [testManInvoice, setTestManInvoiceNo] = useState('');

    const [vendorEmails, setVendorEmails] = useState([]);
    const [previewsByRow, setPreviewsByRow] = useState({});


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


    const {
        data: teamData,
        isLoading: teamLoading,
        isFetching: teamFetching,
    } = useGetSalesMembersQuery(
        { page: 1, limit: 10000 },
        { refetchOnMountOrArgChange: true }
    );


    const allTeams = teamData?.items;
    const isAdmin = !!me?.isAdmin || me?.role === 'admin';



    // API may return { purchaseorder: {...} } or data directly depending on your hook wrapper.

    const normalizeEmails = (arr = []) => {
        const out = [];
        const seen = new Set();
        for (const raw of arr) {
            const e = String(raw || '').trim().toLowerCase();
            if (!e || !e.includes('@')) continue;
            if (!seen.has(e)) { seen.add(e); out.push(e); }
        }
        return out;
    };






    const po = data || {};
    const poId = po?.purchaseorder_number || '';
    const piId = po?.cf_proforma_invoice_number

    // console.log("po check records ....", po)


    const shouldFetch = !!(poId || piId);


    const { data: invoiceData, isLoading: invoiceLoading } = useGetInvoicesByPoPiLiteQuery(
        { poId, piId },
        { skip: !shouldFetch }
    );




    const { data: vendorMatches, isFetching } = useGetVendorByNameQuery({
        name: po?.company_name,
    }, { skip: !po?.company_name });



    // const { data: invoiceData, isLoading: invoiceLoading } = useGetInvoicesByPoPiLiteQuery({ poId, piId });

    const fmtMoney = (n, currency = 'INR') =>
        typeof n === 'number'
            ? n.toLocaleString('en-IN', { style: 'currency', currency })
            : (n ?? '-');

    const fmtDate = (d) => {
        if (!d) return '-';
        const dt = new Date(d);
        return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
    };

    const currency = po?.currency_code || 'INR';
    const lineItems = po?.line_items || po?.items || [];


    /* =======================
       PAYMENT DETAILS (FINAL v3 with 'pending')
       ======================= */


    const PAYMENT_METHODS = ['Yes Bank', 'Hero Fincap', 'HDFC'];

    // legacy aggregate mirrors (kept)

    const [testMailBox, setTestMailBox] = useState([]);

    // editing flags

    const [isEditing, setIsEditing] = useState(false);

    const [payType, setPayType] = useState('pending');

    const [payments, setPayments] = useState([]);

    // Always-on notes
    const [notes, setNotes] = useState('');

    // ===== Helpers for validation =====
    const toNumber = (val) => {
        if (val === '' || val == null) return NaN;
        const n = Number(String(val).replace(/,/g, '').trim());
        return Number.isFinite(n) ? n : NaN;
    };


    const totalAmount = (() => {
        const raw = po?.total;
        const n = Number(String(raw ?? '').toString().replace(/,/g, ''));
        return Number.isFinite(n) ? n : NaN;
    })();


    const numeric = (v) => {
        const n = Number(String(v ?? '').replace(/[,₹\s]/g, ''));
        return Number.isFinite(n) ? n : 0;
    };


    // ===== NEW: existing payments lock & totals helpers =====
    const hasExistingPayments =
        Array.isArray(paymentDetail?.payments) && paymentDetail.payments.length > 0;

    const existingPaid = hasExistingPayments
        ? paymentDetail.payments.reduce((acc, p) => acc + numeric(p.amount), 0)
        : 0;

    // Total paid from *new* rows being added in this session
    const newPaid = payments.reduce((acc, p) => acc + numeric(p.amount), 0);

    // What we display/send as "totalPaid" overall
    const totalPaidOverall = existingPaid + newPaid;

    const remainingOverall = Number.isFinite(totalAmount)
        ? Math.max(0, totalAmount - totalPaidOverall)
        : 0;



    // useEffect(() => {
    //     if (hasExistingPayments) {
    //         // setVendorEmails(paymentDetail?.vendorEmails || []);
    //         setVendorEmails(normalizeEmails(paymentDetail?.vendorEmails || []));
    //         console.log("paymentDetailpaymentDetail", paymentDetail)

    //     } else if (vendorMatches?.length) {
    //         const validEmails = [];

    //         for (const v of vendorMatches) {
    //             const email = v?.email?.trim().toLowerCase();
    //             console.log("emailemail", email)
    //             if (email) validEmails.push(email);
    //         }

    //         if (validEmails.length) setVendorEmails(validEmails);
    //     }
    // }, [vendorMatches, hasExistingPayments]);



    useEffect(() => {
        if (hasExistingPayments) {

            // setVendorEmails(paymentDetail?.vendorEmails || []);
            if (paymentDetail?.vendorEmails.length) {
                setVendorEmails(normalizeEmails(paymentDetail?.vendorEmails || []));
            } else if (vendorMatches?.length) {
                const validEmails = [];

                for (const v of vendorMatches) {
                    const email = v?.email?.trim().toLowerCase();
                    console.log("emailemail", email)
                    if (email) validEmails.push(email);
                }

                if (validEmails.length) setVendorEmails(validEmails);
            } else {
                setVendorEmails([])
            }

            console.log("paymentDetailpaymentDetail", paymentDetail)

        } else if (vendorMatches?.length) {
            const validEmails = [];

            for (const v of vendorMatches) {
                const email = v?.email?.trim().toLowerCase();
                console.log("emailemail", email)
                if (email) validEmails.push(email);
            }

            if (validEmails.length) setVendorEmails(validEmails);
        }
    }, [vendorMatches, hasExistingPayments]);




    useEffect(() => {
        if (!paymentDetail) return;

        const serverPayType = paymentDetail.payType || 'partial';

        // If there are existing payments, lock them and start with no editable rows.
        if (Array.isArray(paymentDetail.payments) && paymentDetail.payments.length > 0) {
            setPayType(serverPayType); // display only; overall will be forced to partial if new rows are added
            setPayments([]);           // user can only add NEW rows
        } else if (serverPayType === 'pending') {
            setPayType('pending');
            setPayments([]);
        } else if (Array.isArray(paymentDetail.payments)) {
            setPayType(serverPayType);
            setPayments([]);
        } else {
            // legacy single-payment fallback (optional)
            const legacyAmount = paymentDetail.paidAmount != null ? String(paymentDetail.paidAmount) : '';
            const legacyDate = paymentDetail.paymentDate ? String(paymentDetail.paymentDate).slice(0, 10) : '';
            const legacyMode = paymentDetail.paymentMode || '';
            const legacyMethod = paymentDetail.paymentMethod || 'HDFC';

            if (!legacyAmount) {
                setPayType('partial');
                setPayments([{ amount: '', date: '', mode: '', method: 'HDFC', attachments: [] }]);
            } else {
                setPayType(serverPayType || 'partial');
                setPayments([{ amount: legacyAmount, date: legacyDate, mode: legacyMode, method: legacyMethod, attachments: [] }]);
            }
        }

        const legacyRowInvoice =
            Array.isArray(paymentDetail.payments)
                ? (paymentDetail.payments.find(p => p?.invoiceNo)?.invoiceNo || '')
                : '';
        setManInvoiceNo(
            (paymentDetail.invoiceNo || legacyRowInvoice || '').trim()
        );

        setNotes(paymentDetail.notes || '');
    }, [paymentDetail, isEditing]);



    // When entering edit with existing payments, auto-prepare a new row and mark as partial
    useEffect(() => {
        if (isEditing && hasExistingPayments && payments.length === 0) {
            setPayType('partial');
            setPayments([{
                amount: '',
                date: getToday(),
                mode: getDefaultModeForAmount('0'),
                method: 'HDFC',
                attachments: [],
            }]);
        }
    }, [isEditing, hasExistingPayments]);




    useEffect(() => {

        const spName = po?.cf_sales_person || '';
        setSalesPersonName(spName);

        // Find email from teamData
        const matched = allTeams?.find(
            (t) => t.name?.trim().toLowerCase() === spName?.trim().toLowerCase()
        );

        setSalesPersonEmail(matched?.email || '');

    }, [po, allTeams]);




    const addPayment = () => {
        // adding new payments is allowed; if there are existing ones,
        // we're already in partial (via effect) or will be considered partial on save
        if (!Number.isFinite(totalAmount)) return;
        setPayments((list) => [...list, { amount: '', date: getToday(), mode: getDefaultModeForAmount(remainingOverall), method: 'HDFC', attachments: [] }]);
    };

    const removePayment = (idx) => {
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
                const maxAllowed = Math.max(0, totalAmount - existingPaid - otherSum); // respect existing paid too
                let next = numeric(value);
                // relaxed rule; do not hard-cap if you don't want to
                // if (next > maxAllowed) next = maxAllowed;
                copy[idx].amount = value === '' ? '' : String(next);
            } else {
                // @ts-ignore
                copy[idx][key] = value;
            }
            return copy;
        });
    };


    const getDefaultModeForAmount = (amt) => (numeric(amt) >= 200000 ? 'RTGS' : 'IMPS');

    const getToday = () => new Date().toISOString().slice(0, 10);


    const handlePayTypeChange = (next) => {
        // If there are existing payments, user cannot change type (radios hidden already).
        // For fresh/no existing payments, keep original behavior:
        setPayType(next);

        const defaultInoiceNos = invoiceData?.list?.map(inv => inv.invoice_number)?.join(",") || ""

        if (!manInvoiceNo?.trim() && defaultInoiceNos) {
            setManInvoiceNo(defaultInoiceNos);
        }

        if (next === 'pending') {
            setPayments([]);
            return;
        }

        if (next === 'full') {
            const defaultAmount = Number.isFinite(totalAmount) ? String(totalAmount) : '';
            const defaultMode = getDefaultModeForAmount(defaultAmount);
            const defaultDate = getToday();

            if (!(payments.length === 1 && numeric(payments[0].amount) === totalAmount)) {
                setPayments([{
                    amount: defaultAmount,
                    date: defaultDate,
                    mode: defaultMode,
                    method: 'HDFC',
                    attachments: [],
                }]);
            } else {
                const row = payments[0];
                const mode = PAYMENT_MODES.includes(row.mode) && row.mode ? row.mode : defaultMode;
                const date = row.date || defaultDate;
                setPayments([{ ...row, mode, date }]);
            }
            return;
        }

        if (next === 'partial') {
            if (!Array.isArray(payments) || payments.length === 0) {
                setPayments([{
                    amount: '',
                    date: getToday(),
                    mode: getDefaultModeForAmount('0'),
                    method: 'HDFC',
                    attachments: [],
                }]);
            } else {
                setPayments((rows) =>
                    rows.map((p) => {
                        const hasValidMode = PAYMENT_MODES.includes(p.mode || '');
                        const mode = hasValidMode ? p.mode : getDefaultModeForAmount(p.amount);
                        const date = p.date || getToday();
                        return { ...p, mode, date };
                    })
                );
            }
        }
    };


    // ===== PER-ROW DOC HELPERS =====
    const addAttachmentsToRow = (rowIdx, newUrls) => {
        if (!newUrls?.length) return;
        setPayments((list) => {
            const copy = list.map((p) => ({ ...p, attachments: p.attachments || [] }));
            const setUniq = new Set([...(copy[rowIdx]?.attachments || []), ...newUrls]);
            copy[rowIdx].attachments = Array.from(setUniq);
            return copy;
        });
    };


    const removeDocFromRow = (rowIdx, url) => {
        setPayments((list) => {
            const copy = list.map((p) => ({ ...p, attachments: p.attachments || [] }));
            copy[rowIdx].attachments = (copy[rowIdx].attachments || []).filter((u) => u !== url);
            return copy;
        });
    };


    const setRowPreviews = (rowIdx, urls) => {
        setPreviewsByRow((prev) => ({ ...prev, [rowIdx]: urls || [] }));
    };



    // ===== Validation =====
    // const validate = () => {

    //      const cleanedEmails = normalizeEmails(vendorEmails);
    //     const errs = [];

    //     if (!purchaseOrderId) errs.push('Missing purchase order ID.');
    //     if (!po?.vendor_name?.trim()) errs.push('Vendor Name is required.');
    //     if (payType !== 'pending' && !manInvoiceNo?.trim()) errs.push(`Invoice Number is required.`);

    //     if (payType !== 'pending' && vendorEmails?.length == 0) {
    //         errs.push('Vendor Email is required.');
    //     }

    //     // NEW rows validation (existing rows are read-only)
    //     if (payType === 'pending') {
    //         // nothing to validate for payments
    //     } else if (!Array.isArray(payments) || payments.length === 0) {
    //         // If no existing and no new rows, require at least one row
    //         if (!hasExistingPayments) {
    //             errs.push('Add at least one payment row.');
    //         }
    //     } else {
    //         payments.forEach((p, idx) => {
    //             const amt = numeric(p.amount);
    //             if (!Number.isFinite(amt) || amt <= 0) errs.push(`Row ${idx + 1}: Enter a valid Amount (> 0).`);
    //             if (!p.date) errs.push(`Row ${idx + 1}: Select a Date.`);
    //             if (!p.mode || !PAYMENT_MODES.includes(p.mode)) {
    //                 errs.push(`Row ${idx + 1}: Select a valid Payment Mode.`);
    //             }
    //             if (!PAYMENT_METHODS.includes(p.method)) errs.push(`Row ${idx + 1}: Select a valid Payment Method.`);
    //         });
    //     }

    //     if (notes && notes.length > 1000) errs.push('Notes must be 1000 characters or fewer.');

    //     return { ok: errs.length === 0, errors: errs };
    // };


    const validate = () => {
        const errs = [];
        const cleanedEmails = normalizeEmails(vendorEmails);

        if (!purchaseOrderId) errs.push('Missing purchase order ID.');
        if (!po?.vendor_name?.trim()) errs.push('Vendor Name is required.');
        if (payType !== 'pending' && !manInvoiceNo?.trim()) errs.push('Invoice Number is required.');
        if (payType !== 'pending' && cleanedEmails.length === 0) errs.push('Vendor Email is required.');

        if (payType !== 'pending') {
            if (!Array.isArray(payments) || payments.length === 0) {
                if (!hasExistingPayments) errs.push('Add at least one payment row.');
            } else {
                payments.forEach((p, idx) => {
                    const amt = numeric(p.amount);
                    if (!Number.isFinite(amt) || amt <= 0) errs.push(`Row ${idx + 1}: Enter a valid Amount (> 0).`);
                    if (!p.date) errs.push(`Row ${idx + 1}: Select a Date.`);
                    if (!p.mode || !PAYMENT_MODES.includes(p.mode)) {
                        errs.push(`Row ${idx + 1}: Select a valid Payment Mode.`);
                    }
                    if (!PAYMENT_METHODS.includes(p.method)) {
                        errs.push(`Row ${idx + 1}: Select a valid Payment Method.`);
                    }
                });
            }
        }

        if (notes && notes.length > 1000) errs.push('Notes must be 1000 characters or fewer.');

        return { ok: errs.length === 0, errors: errs, cleanedEmails };
    };





    // Build payload exactly like the controller expects
    const buildPayload = () => {
        // If we already have payments and user is adding any new, overall becomes partial
        if (hasExistingPayments && payments.length > 0) {
            const normalizedPayments = payments.map((p) => ({
                amount: numeric(p.amount),
                date: p.date,
                mode: p.mode.trim(),
                method: p.method,
                attachments: Array.isArray(p.attachments) ? p.attachments : [],
            }));
            return {
                payType: 'partial',
                payments: normalizedPayments,
                notes,
                salesPersonName,
                salesPersonEmail,
            };
        }

        if (payType === 'pending') {
            return {
                payType: 'pending',
                payments: [],
                notes,
                salesPersonName,
                salesPersonEmail,
            };
        }

        const normalizedPayments = payments.map((p) => ({
            amount: numeric(p.amount),
            date: p.date,
            mode: p.mode.trim(),
            method: p.method,
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



    // const handleSavePayment = async () => {
    //     const { ok, errors } = validate();

    //     console.log("vendorEmails?.length", vendorEmails)

    //     if (!ok) {
    //         showError('Validation Error', errors.join('\n'));
    //         return;
    //     }

    //     try {
    //         const payload = buildPayload();

    //         let resp;

    //         if (!paymentDetail) {
    //             resp = await upsertPoPaymentDetail({
    //                 purchaseOrderId,
    //                 ...payload,
    //                 vendorName: po?.vendor_name,
    //                 poNumber: po?.purchaseorder_number,
    //                 poTotal: po?.total,
    //                 totalPaid: totalPaidOverall,
    //                 vendorEmails,
    //                 invoiceNo: manInvoiceNo,
    //             }).unwrap();
    //         } else {
    //             resp = await updatePoPaymentDetail({
    //                 purchaseOrderId,
    //                 vendorName: po?.vendor_name,
    //                 ...payload,
    //                 poNumber: po?.purchaseorder_number,
    //                 poTotal: po?.total,
    //                 totalPaid: totalPaidOverall,
    //                 vendorEmails,
    //                 invoiceNo: manInvoiceNo,
    //             }).unwrap();
    //         }
    //         // success
    //         showSuccess('Success', 'Updated successfully!');
    //         setNotes("")
    //         setIsEditing(false);
    //     } catch (e) {
    //         console.error('Save failed:', e);

    //         showError(
    //             'Error',
    //             e?.data?.error?.join?.('\n') ||
    //             e?.data?.message ||
    //             e?.error ||
    //             'Failed to save payment details'
    //         );
    //     }
    // };


    const handleSavePayment = async () => {
        const { ok, errors, cleanedEmails } = validate();
        if (!ok) {
            showError('Validation Error', errors.join('\n'));
            return;
        }

        try {
            const payload = buildPayload();
            const base = {
                purchaseOrderId,
                ...payload,
                vendorName: po?.vendor_name,
                poNumber: po?.purchaseorder_number,
                poTotal: po?.total,
                totalPaid: totalPaidOverall,
                vendorEmails: cleanedEmails,
                invoiceNo: manInvoiceNo,
            };

            let resp;
            if (!paymentDetail) {
                resp = await upsertPoPaymentDetail(base).unwrap();
            } else {
                resp = await updatePoPaymentDetail(base).unwrap();
            }

            showSuccess('Success', 'Updated successfully!');
            setNotes('');
            setIsEditing(false);
        } catch (e) {
            console.error('Save failed:', e);
            showError(
                'Error',
                e?.data?.error?.join?.('\n') || e?.data?.message || e?.error || 'Failed to save payment details'
            );
        }
    };




    return (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={onClose}>
            <div
                className="absolute right-0 top-0 h-full w-full sm:w-[760px] bg-white shadow-xl overflow-y-auto animate-slideIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-700" />
                        <h3 className="text-lg font-semibold text-blue-900">
                            Purchase Order {po?.purchaseorder_number ? `#${po.purchaseorder_number}` : ''}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-1 cursor-pointer text-gray-600 hover:text-red-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                {(isLoading || isPaymentLoading) && <Loader />}

                {error && (
                    <div className="m-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
                        {error?.data?.message || 'Failed to load purchase order'}
                    </div>
                )}

                {isPaymentError && (
                    <div className="m-4 p-3 rounded bg-yellow-50 text-yellow-800 text-sm border border-yellow-200">
                        {paymentError?.data?.message || 'Payment detail not found (you can create one)'}
                    </div>
                )}

                {!isLoading && !error && (
                    <div className="p-6 space-y-8">

                        {/* Top facts */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Info label="Vendor" value={po?.vendor_name} />
                            <Info
                                label="Vendor Email"
                                value={po?.contact_persons_associated?.[0]?.contact_person_email}
                            />
                            <Info label="Status" value={po?.status} />
                            <Info label="Order Status" value={po?.order_status} />
                            <Info label="Date" value={fmtDate(po?.date)} />
                            <Info label="Branch" value={po?.branch_name} />
                            <Info label="Location" value={po?.location_name} />
                            <Info label="Source of Supply" value={po?.source_of_supply} />
                            <Info label="Destination of Supply" value={po?.destination_of_supply} />
                            <Info label="GST No" value={po?.gst_no} />
                            <Info
                                label="Payment Terms"
                                value={
                                    po?.payment_terms && po?.payment_terms_label
                                        ? `${po?.payment_terms} (${po?.payment_terms_label})`
                                        : ''
                                }
                            />
                            <Info label="Submitted By" value={po?.submitted_by_name || po?.submitted_by} />
                            <Info label="Purchaser Name" value={salesPersonName} />
                        </section>

                        <div>
                            <div className="flex items-center">
                                <span className="text-md font-medium text-gray-500 pr-2 whitespace-nowrap">
                                    Vendor emails : {"  "}
                                </span>
                                {vendorEmails.length > 0 ? vendorEmails?.map((ele, i) => {
                                    return (
                                        <div className='flex items-center' key={i}>
                                            <Info label="" value={ele} /> {i < vendorEmails.length - 1 && <span className='mr-2'>,</span>}
                                        </div>
                                    )
                                })
                                    :
                                    <div className="rounded text-gray-800 text-sm italic">
                                        Vendor emails not found. Please add manually.
                                    </div>
                                }
                            </div>
                        </div>

                        {/* Contact persons */}
                        {Array.isArray(po?.contact_persons_associated) &&
                            po.contact_persons_associated.length > 0 && (
                                <section>
                                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Contact Persons</h4>
                                    <div className="overflow-hidden rounded border border-gray-200">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 text-gray-600">
                                                <tr>
                                                    <th className="text-left px-3 py-2">Name</th>
                                                    <th className="text-left px-3 py-2">Email</th>
                                                    <th className="text-left px-3 py-2">Phone</th>
                                                    <th className="text-left px-3 py-2">Mobile</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {po.contact_persons_associated.map((p) => (
                                                    <tr key={p.contact_person_id} className="border-t">
                                                        <td className="px-3 py-2">
                                                            {p.contact_person_name ||
                                                                `${p.first_name || ''} ${p.last_name || ''}`.trim()}
                                                        </td>
                                                        <td className="px-3 py-2">{p.contact_person_email || '-'}</td>
                                                        <td className="px-3 py-2">{p.phone || '-'}</td>
                                                        <td className="px-3 py-2">{p.mobile || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                        {/* Totals */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Info label="Total" value={fmtMoney(po?.total, currency)} />
                        </section>

                        {/* Taxes */}
                        {Array.isArray(po?.taxes) && po.taxes.length > 0 && (
                            <section>
                                <h4 className="text-sm font-semibold text-blue-900 mb-2">Taxes</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {po.taxes.map((t, i) => (
                                        <Info key={i} label={t.tax_name} value={fmtMoney(t.tax_amount, currency)} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Line Items */}
                        {lineItems.length !== 0 && (
                            <section>
                                <h4 className="text-sm font-semibold text-blue-900 mb-2">Line Items</h4>
                                <div className="overflow-x-auto rounded border border-gray-200">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="text-left px-3 py-2">Item</th>
                                                <th className="text-right px-3 py-2">Qty</th>
                                                <th className="text-right px-3 py-2">Rate</th>
                                                <th className="text-right px-3 py-2">Tax %</th>
                                                <th className="text-right px-3 py-2">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lineItems.map((it, i) => {
                                                const name =
                                                    it?.item_name || it?.name || it?.description || `Item ${i + 1}`;
                                                const qty = it?.quantity ?? it?.qty ?? 0;
                                                const rate = Number(it?.rate ?? it?.price ?? 0);
                                                const taxPct = Number(
                                                    it?.tax_percentage ?? it?.tax_percent ?? it?.tax_rate ?? 0
                                                );
                                                const amount = Number(
                                                    it?.total ?? it?.item_total ?? it?.amount ?? qty * rate
                                                );
                                                return (
                                                    <tr key={it?.line_item_id || i} className="border-t">
                                                        <td className="px-3 py-2">{name}</td>
                                                        <td className="px-3 py-2 text-right">{qty}</td>
                                                        <td className="px-3 py-2 text-right">{fmtMoney(rate, currency)}</td>
                                                        <td className="px-3 py-2 text-right">{taxPct}%</td>
                                                        <td className="px-3 py-2 text-right">{fmtMoney(amount, currency)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* Approvers */}
                        {Array.isArray(po?.approvers_list) && po.approvers_list.length > 0 && (
                            <section>
                                <h4 className="text-sm font-semibold text-blue-900 mb-2">Approvals</h4>
                                <div className="overflow-hidden rounded border border-gray-200">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="text-left px-3 py-2">Approver</th>
                                                <th className="text-left px-3 py-2">Email</th>
                                                <th className="text-left px-3 py-2">Status</th>
                                                <th className="text-left px-3 py-2">Approved Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {po.approvers_list.map((a, i) => (
                                                <tr key={i} className="border-t">
                                                    <td className="px-3 py-2">{a.approver_name}</td>
                                                    <td className="px-3 py-2">{a.email || '-'}</td>
                                                    <td className="px-3 py-2 capitalize">{a.approval_status || '-'}</td>
                                                    <td className="px-3 py-2">{fmtDate(a.approved_date)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* Custom Fields */}
                        {
                            po?.custom_field_hash && Object.keys(po.custom_field_hash).length > 0 && (
                                <section>
                                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Custom Fields</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Object.entries(po.custom_field_hash).map(([k, v]) => (
                                            <Info key={k} label={k} value={String(v)} />
                                        ))}
                                    </div>
                                </section>
                            )
                        }

                        {/* === Payment Details (FINAL v3) === */}
                        <section className="">
                            <h2 className="w-full text-lg font-semibold text-blue-800 bg-blue-50 px-3 py-1.5 rounded inline-block mb-4">
                                Payment Details
                            </h2>

                            <div className="col-span-1 md:col-span-3 my-3">
                                <div className="w-full rounded-xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm p-4 sm:p-5">
                                    {/* Top row: totals + button */}
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                        {/* Totals */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-700">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Wallet className="h-4 w-4 text-slate-500" />
                                                Total Paid: <b className="ml-1">{fmtMoney(totalPaidOverall, currency)}</b>
                                            </span>

                                            {Number.isFinite(totalAmount) && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <IndianRupee className="h-4 w-4 text-slate-500" />
                                                    Remaining:{' '}
                                                    <b
                                                        className={`ml-1 ${remainingOverall > 0 ? 'text-amber-700' : 'text-emerald-700'
                                                            }`}
                                                    >
                                                        {fmtMoney(remainingOverall, currency)}
                                                    </b>
                                                </span>
                                            )}
                                        </div>

                                        {/* Add payment button (visible in partial when editing/creating) */}
                                        {(payType === 'partial' && (isEditing || !paymentDetail) && !hasExistingPayments) ? (
                                            <div className="flex md:justify-end">
                                                <button
                                                    type="button"
                                                    onClick={addPayment}
                                                    className="inline-flex cursor-pointer w-full md:w-auto items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-white shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Add payment
                                                </button>
                                            </div>
                                        ) : (
                                            <div />
                                        )}

                                        {(isAdmin && hasExistingPayments) && (
                                            <div className="">

                                                <div className="flex md:justify-end">
                                                    <button
                                                        onClick={() => setIsEditing(true)}
                                                        className="inline-flex cursor-pointer items-center gap-2 rounded bg-blue-900 px-4 py-2 text-white"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Add payment
                                                    </button>
                                                </div>

                                            </div>
                                        )}

                                        {(isAdmin && paymentDetail && payType == 'pending') && (
                                            <div className="">

                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="inline-flex cursor-pointer items-center gap-2 rounded bg-blue-900 px-4 py-2 text-white"
                                                >
                                                    Edit
                                                </button>

                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>

                            {!isAdmin && !paymentDetail && (
                                <div className="rounded text-gray-800 text-sm pl-4">
                                    Payment details not found. Please contact admin.
                                </div>
                            )}

                            {/* Read-only view */}
                            {!isEditing && paymentDetail && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {typeof paymentDetail.paymentStatus === 'string' && (
                                            <Info label="Status" value={paymentDetail.paymentStatus} />
                                        )}
                                        {typeof paymentDetail.dueAmount === 'number' && (
                                            <Info label="Due" value={fmtMoney(paymentDetail.dueAmount, currency)} />
                                        )}

                                        {/* {(paymentDetail.invoiceNo || (paymentDetail?.payments?.length && paymentDetail?.payments[0]?.invoiceNo)) && (
                                            <Info label="Invoice No" value={paymentDetail?.invoiceNo || paymentDetail?.payments[0]?.invoiceNo} />
                                        )} */}

                                        {!!(paymentDetail.invoiceNo || paymentDetail?.payments?.[0]?.invoiceNo) && (
                                            <Info label="Invoice No" value={paymentDetail?.invoiceNo || paymentDetail?.payments[0]?.invoiceNo} />
                                        )}


                                        {paymentDetail.notes && <LongText label="Notes" text={paymentDetail.notes} />}
                                    </div>

                                    {Array.isArray(paymentDetail.payments) &&
                                        paymentDetail.payments.length > 0 && (
                                            <section className="mt-4">
                                                <h4 className="text-sm font-semibold text-blue-900 mb-2">Payments</h4>
                                                <div className="overflow-hidden rounded border border-gray-200">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-gray-50 text-gray-600">
                                                            <tr>
                                                                <th className="text-left px-3 py-2">Date</th>
                                                                <th className="text-left px-3 py-2">Mode</th>
                                                                <th className="text-left px-3 py-2">Method</th>
                                                                <th className="text-right px-3 py-2">Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {paymentDetail.payments.map((p, i) => (
                                                                <tr key={i} className="border-t">
                                                                    <td className="px-3 py-2">{fmtDate(p.date)}</td>
                                                                    <td className="px-3 py-2">{p.mode || '-'}</td>
                                                                    <td className="px-3 py-2">{p.method || '-'}</td>
                                                                    <td className="px-3 py-2 text-right">
                                                                        {fmtMoney(p.amount, currency)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </section>
                                        )}


                                </>
                            )}

                            {/* Edit / Create view */}
                            {(isEditing || !paymentDetail) && isAdmin && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* If existing payments, show them read-only and hide radios */}
                                    {hasExistingPayments && Array.isArray(paymentDetail?.payments) && paymentDetail.payments.length > 0 && (
                                        <section className="col-span-1 md:col-span-full">
                                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Existing Payments</h4>
                                            <div className="overflow-hidden rounded border border-gray-200">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50 text-gray-600">
                                                        <tr>
                                                            <th className="text-left px-3 py-2">Date</th>
                                                            <th className="text-left px-3 py-2">Mode</th>
                                                            <th className="text-left px-3 py-2">Method</th>
                                                            <th className="text-right px-3 py-2">Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paymentDetail.payments.map((p, i) => (
                                                            <tr key={i} className="border-t">
                                                                <td className="px-3 py-2">{fmtDate(p.date)}</td>
                                                                <td className="px-3 py-2">{p.mode || '-'}</td>
                                                                <td className="px-3 py-2">{p.method || '-'}</td>
                                                                <td className="px-3 py-2 text-right">{fmtMoney(p.amount, currency)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </section>
                                    )}

                                    {/* RADIO: Full vs Partial vs Pending (HIDDEN when existing payments are locked) */}
                                    {!hasExistingPayments && (
                                        <div role="radiogroup" aria-labelledby="payTypeLabel" className="col-span-1 md:col-span-3">
                                            <div>
                                                <label className="text-md font-medium mb-1 text-gray-600">Payment Type</label>
                                            </div>

                                            <div className="mt-3 flex flex-col sm:flex-row gap-4">
                                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="payType"
                                                        value="pending"
                                                        className="h-4 w-4 accent-blue-700"
                                                        checked={payType === 'pending'}
                                                        onChange={() => handlePayTypeChange('pending')}
                                                    />
                                                    <span className="text-sm text-gray-700">Mark as pending (no payments yet)</span>
                                                </label>

                                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="payType"
                                                        value="full"
                                                        className="h-4 w-4 accent-blue-700"
                                                        checked={payType === 'full'}
                                                        onChange={() => handlePayTypeChange('full')}
                                                    />
                                                    <span className="text-sm text-gray-700">Mark as fully paid</span>
                                                </label>

                                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="payType"
                                                        value="partial"
                                                        className="h-4 w-4 accent-blue-700"
                                                        checked={payType === 'partial'}
                                                        onChange={() => handlePayTypeChange('partial')}
                                                    />
                                                    <span className="text-sm text-gray-700">Mark as partially paid</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* PAYMENTS TABLE / LIST for NEW rows */}
                                    <div className="col-span-1 md:col-span-full">
                                        {payType === 'pending' && !hasExistingPayments ? (
                                            <div className="text-sm text-slate-600 italic py-3">
                                                No payments done yet.
                                            </div>
                                        ) : (
                                            payments.map((p, i) => (
                                                <div
                                                    key={i}
                                                    className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end border-b-2 border-gray-100 py-5"
                                                >
                                                    {/* Row header with remove */}
                                                    <div className="col-span-full flex items-center justify-between">
                                                        {payments?.length > 1 && (
                                                            <span className="inline-flex items-center gap-2 text-xs">
                                                                <span className="rounded-full bg-blue-900 px-3 py-1 font-semibold text-white">
                                                                    Payment {i + 1}
                                                                </span>
                                                            </span>
                                                        )}

                                                        {payments.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removePayment(i)}
                                                                className="inline-flex items-center cursor-pointer gap-1.5 rounded-full border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-200"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Amount */}
                                                    <div className="flex flex-col">
                                                        <label className="text-md font-medium mb-1 text-gray-600">Amount</label>
                                                        <input
                                                            type="text"
                                                            placeholder="₹0.00"
                                                            value={p.amount}
                                                            onChange={(e) => updatePayment(i, 'amount', e.target.value)}
                                                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                        />
                                                    </div>

                                                    {/* Mode */}
                                                    <div className="flex flex-col">
                                                        <label className="text-md font-medium mb-1 text-gray-600">Mode</label>
                                                        <select
                                                            value={PAYMENT_MODES.includes(p.mode) ? p.mode : ''} // keep empty if old value not in list
                                                            onChange={(e) => updatePayment(i, 'mode', e.target.value)}
                                                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                        >
                                                            <option value="" disabled>
                                                                Select mode
                                                            </option>
                                                            {PAYMENT_MODES.map((m) => (
                                                                <option key={m} value={m}>
                                                                    {m}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {!PAYMENT_MODES.includes(p.mode) && p.mode?.trim() ? (
                                                            <span className="mt-1 text-xs text-amber-700">
                                                                Previously saved mode “{p.mode}” isn’t in the list. Pick the closest option.
                                                            </span>
                                                        ) : null}
                                                    </div>

                                                    {/* Date */}
                                                    <div className="flex flex-col">
                                                        <label className="text-md font-medium mb-1 text-gray-600">{p.mode === 'Cheque' ? 'PDC Date' : 'Date'}</label>
                                                        <input
                                                            type="date"
                                                            value={p.date}
                                                            onChange={(e) => updatePayment(i, 'date', e.target.value)}
                                                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                        />
                                                    </div>

                                                    {/* Method */}
                                                    <div className="flex flex-col">
                                                        <label className="text-md font-medium mb-1 text-gray-600">Method</label>
                                                        <select
                                                            value={p.method}
                                                            onChange={(e) => updatePayment(i, 'method', e.target.value)}
                                                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                        >
                                                            {PAYMENT_METHODS.map((m) => (
                                                                <option key={m} value={m}>
                                                                    {m}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>


                                                    {/* === PER-ROW DOCUMENTS === */}
                                                    <section className="col-span-1 md:col-span-full mb-6">
                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
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
                                                                                name={`documents_row_${i}`}
                                                                                accept="*/*"
                                                                                previews={previewsByRow[i] || []}
                                                                                setPreviews={(urls) => setRowPreviews(i, urls)}
                                                                                defaultFiles={[]}
                                                                                onUploadComplete={(urlsFromInput) => {
                                                                                    // Keep only truly new files for this row
                                                                                    const existing = new Set(payments[i]?.attachments || []);
                                                                                    const newUrls = (urlsFromInput || []).filter((u) => !existing.has(u));
                                                                                    if (newUrls.length) addAttachmentsToRow(i, newUrls);
                                                                                    // reset previews for next upload
                                                                                    setRowPreviews(i, []);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Row documents preview */}
                                                                {Array.isArray(p.attachments) && p.attachments.length > 0 ? (
                                                                    <div className="md:col-span-12">
                                                                        <div className="mb-4">
                                                                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                                                {p.attachments.map((url, idx2) => {
                                                                                    const ext = getExt(url);
                                                                                    const isImg = isImageExt(ext);
                                                                                    return (
                                                                                        <div key={idx2} className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden">
                                                                                            <div className="h-28 w-full bg-gray-50 flex items-center justify-center">
                                                                                                {isImg ? (
                                                                                                    <Image src={url} alt={'img'} width={256} height={112} className="h-28 w-full object-cover" />
                                                                                                ) : (
                                                                                                    <div className="flex flex-col items-center justify-center">
                                                                                                        <FileIcon /* ext prop is ignored by lucide; kept from original code */ />
                                                                                                        <div className="mt-1 text-[10px] text-gray-500 uppercase">{ext || 'file'}</div>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>

                                                                                            <div className="px-3 py-2">
                                                                                                <div className="mt-2 flex items-center justify-between">
                                                                                                    <a
                                                                                                        href={url}
                                                                                                        target="_blank"
                                                                                                        rel="noreferrer"
                                                                                                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                                                                                                    >
                                                                                                        Open
                                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h6m0 0v6m0-6L10 16" />
                                                                                                        </svg>
                                                                                                    </a>
                                                                                                    {isAdmin && (
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => removeDocFromRow(i, url)}
                                                                                                            className="text-xs text-red-600 hover:text-red-700"
                                                                                                        >
                                                                                                            Remove
                                                                                                        </button>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </section>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Invoice numbers (when adding payments) */}
                                    {(payType !== 'pending' && testManInvoice.length <= 0) &&
                                        <div className="flex flex-col col-span-4 md:col-span-4">
                                            <MultiInvoiceInput
                                                invoices={manInvoiceNo || ''}
                                                onChange={(vals) => setManInvoiceNo(vals)}
                                            />
                                        </div>
                                    }

                                    {/* Vendor email capture if not auto-detected */}
                                    {(payType !== 'pending' && testMailBox.length <= 0) && (
                                        <div className="flex flex-col col-span-4 md:col-span-4">
                                            <label className="text-md font-medium text-gray-600 mb-1">Vendor Email</label>
                                            <input
                                                type="email"
                                                placeholder="Enter vendor email"
                                                value={vendorEmails[0] || ''}
                                                // onChange={(e) => setVendorEmails([e.target.value])}
                                                onChange={(e) => {
                                                    const v = e.target.value.trim().toLowerCase();
                                                    setVendorEmails(v ? [v] : []); // ← empty string becomes []
                                                }}

                                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            />
                                        </div>
                                    )}

                                    {/* Notes (always enabled) */}
                                    <div className="col-span-1 md:col-span-4 mt-2 flex flex-col">
                                        <label className="text-md font-medium text-gray-500 mb-1">Additional Notes</label>
                                        <textarea
                                            placeholder="Add any remarks"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={3}
                                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-1 md:col-span-3 mt-2 flex justify-end">
                                        <div className="flex gap-2">
                                            {paymentDetail && (
                                                <button
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                    }}
                                                    className="inline-flex cursor-pointer items-center gap-2 rounded bg-gray-300 px-4 py-2 text-black disabled:opacity-60"
                                                >
                                                    cancel
                                                </button>
                                            )}
                                            <button
                                                onClick={handleSavePayment}
                                                disabled={isSaving || isSavingUp}
                                                className="inline-flex cursor-pointer items-center gap-2 rounded bg-blue-900 px-4 py-2 text-white disabled:opacity-60"
                                            >
                                                {isSaving || isSavingUp ? 'Saving…' : !paymentDetail ? 'Save' : 'Update Details'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                        {/* === End Payment Details === */}
                    </div>
                )
                }
            </div>
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

function LongText({ label, text }) {
    return (
        <div className="flex flex-col">
            <span className="text-md font-medium text-gray-500">{label}</span>
            <pre className="text-md text-gray-900 whitespace-pre-wrap break-words">{text}</pre>
        </div>
    );
}

function AddressBlock({ title, addr }) {
    if (!addr) return null;

    const addressLine =
        addr.address || [addr.address1, addr.address2].filter(Boolean).join(' ') || null;
    const cityLine = [addr.city, addr.state, addr.zip].filter(Boolean).join(', ');

    const lines = [
        addr.attention,
        addressLine,
        addr.street2,
        cityLine,
        addr.country,
        addr.phone,
        addr.email,
    ].filter(Boolean);

    return (
        <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">{title}</h4>
            {lines.length === 0 ? (
                <p className="text-sm text-gray-500">-</p>
            ) : (
                <div className="text-sm text-gray-800 space-y-0.5">
                    {lines.map((l, i) => (
                        <div key={i}>{l}</div>
                    ))}
                </div>
            )}
        </div>
    );
}
