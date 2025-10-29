// 'use client';

// import { useGetInvoiceByIdQuery, useGetPurchaseOrderByIdQuery, useGetPurchaseOrdersByRefQuery } from '@/redux/features/api/zohoApi';
// import Loader from '@/components/custom/ui/Loader';
// import { X, FileText, ExternalLink, Copy } from 'lucide-react';

// export default function InvoiceViewDrawer({ invoiceId, onClose }) {


//   const { data, isLoading, error } = useGetInvoiceByIdQuery(invoiceId, { skip: !invoiceId });


//   // Your controller returns { invoice: { ... } }

//   const invoice = data || {};


//   const fmtMoney = (n, currency = 'INR') =>
//     typeof n === 'number'
//       ? n.toLocaleString('en-IN', { style: 'currency', currency })
//       : (n ?? '-');


//   const fmtDate = (d) => {
//     if (!d) return '-';
//     const dt = new Date(d);
//     return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
//   };

//   const getCF = (inv, key) => inv?.custom_field_hash?.[key] ?? inv?.[key] ?? '-';

//   const currency = invoice?.currency_code || 'INR';
//   const lineItems = invoice?.line_items || invoice?.items || [];

//   return (
//     <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={onClose}>
//       <div
//         className="absolute right-0 top-0 h-full w-full sm:w-[760px] bg-white shadow-xl overflow-y-auto animate-slideIn"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b">
//           <div className="flex items-center gap-2">
//             <FileText className="w-5 h-5 text-blue-700" />
//             <h3 className="text-lg font-semibold text-blue-900">
//               Invoice {invoice?.invoice_number ? `#${invoice.invoice_number}` : ''}
//             </h3>
//           </div>
//           <button onClick={onClose} className="p-1 text-gray-600 hover:text-red-500">
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Body */}
//         {isLoading && <Loader />}

//         {error && (
//           <div className="m-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
//             {error?.data?.message || 'Failed to load invoice'}
//           </div>
//         )}



//         {!isLoading && !error && (
//           <div className="p-6 space-y-8">
//             {/* Top facts */}
//             <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Info label="Customer" value={invoice?.customer_name} />
//               {/* <Info label="Email" value={invoice?.email} /> */}
//               <Info label="Status" value={invoice?.status} />
//               {/* <Info label="Sub Status" value={invoice?.current_sub_status} /> */}
//               <Info label="Date" value={fmtDate(invoice?.date)} />
//               <Info label="Due Date" value={fmtDate(invoice?.due_date)} />
//               <Info label="Salesperson" value={invoice?.salesperson_name} />
//               {/* <Info label="Reference #" value={invoice?.reference_number} /> */}
//               <Info label="PO No." value={getCF(invoice, 'cf_purchase_order_no')} />
//             </section>

//             {/* Addresses (v3 uses zip, also has street) */}
//             {/* <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <AddressBlock title="Billing Address" addr={invoice?.billing_address} />
//               <AddressBlock title="Shipping Address" addr={invoice?.shipping_address} />
//             </section> */}

//             {/* Totals */}
//             <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <Info label="Total" value={fmtMoney(invoice?.total, currency)} />
//               {/* <Info label="Balance" value={fmtMoney(invoice?.balance, currency)} /> */}
//               {/* <Info label="Adjustment" value={fmtMoney(invoice?.adjustment, currency)} /> */}
//             </section>

//             {/* Line Items */}
//             {/* <section>
//               <h4 className="text-sm font-semibold text-blue-900 mb-2">Line Items</h4>
//               {lineItems.length === 0 ? (
//                 <p className="text-sm text-gray-500">No items</p>
//               ) : (
//                 <div className="overflow-x-auto rounded border border-gray-200">
//                   <table className="w-full text-sm">
//                     <thead className="bg-gray-50 text-gray-600">
//                       <tr>
//                         <th className="text-left px-3 py-2">Item</th>
//                         <th className="text-right px-3 py-2">Qty</th>
//                         <th className="text-right px-3 py-2">Rate</th>
//                         <th className="text-right px-3 py-2">Tax %</th>
//                         <th className="text-right px-3 py-2">Amount</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {lineItems.map((it, i) => {
//                         const name = it?.item_name || it?.name || it?.description || `Item ${i + 1}`;
//                         const qty = it?.quantity ?? it?.qty ?? 0;
//                         const rate = Number(it?.rate ?? it?.price ?? 0);
//                         const taxPct = Number(it?.tax_percentage ?? it?.tax_percent ?? it?.tax_rate ?? 0);
//                         const amount = Number(it?.total ?? it?.item_total ?? it?.amount ?? qty * rate);
//                         return (
//                           <tr key={i} className="border-t">
//                             <td className="px-3 py-2">{name}</td>
//                             <td className="px-3 py-2 text-right">{qty}</td>
//                             <td className="px-3 py-2 text-right">{fmtMoney(rate, currency)}</td>
//                             <td className="px-3 py-2 text-right">{taxPct}%</td>
//                             <td className="px-3 py-2 text-right">{fmtMoney(amount, currency)}</td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </section> */}

//             {/* Custom Fields */}
//             {/* {invoice?.custom_field_hash && Object.keys(invoice.custom_field_hash).length > 0 && (
//               <section>
//                 <h4 className="text-sm font-semibold text-blue-900 mb-2">Custom Fields</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   {Object.entries(invoice.custom_field_hash).map(([k, v]) => (
//                     <Info key={k} label={k} value={String(v)} />
//                   ))}
//                 </div>
//               </section>
//             )} */}

//             {/* e-Invoice */}
//             {/* {invoice?.einvoice_details && (
//               <section>
//                 <h4 className="text-sm font-semibold text-blue-900 mb-2">e-Invoice Details</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   <Info label="Status" value={invoice.einvoice_details?.formatted_status || invoice.einvoice_details?.status} />
//                   <Info label="Ack No." value={invoice.einvoice_details?.ack_number} />
//                   <Info label="Ack Date" value={invoice.einvoice_details?.ack_date} />
//                   <Info label="IRN" value={invoice.einvoice_details?.inv_ref_num} />
//                 </div>
//               </section>
//             )} */}

//             {/* Actions
//             <section className="flex items-center justify-end gap-3">
//               <button
//                 onClick={copyUrl}
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
//                 disabled={!safeUrl}
//               >
//                 <Copy className="w-4 h-4" /> Copy Link
//               </button>
//               <button
//                 onClick={openExternal}
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
//                 disabled={!safeUrl}
//               >
//                 <ExternalLink className="w-4 h-4" /> Open in Zoho
//               </button>
//             </section> */}
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

// function Info({ label, value }) {
//   return (
//     <div className="flex flex-col">
//       <span className="text-xs font-medium text-gray-500">{label}</span>
//       <span className="text-sm text-gray-900 break-words">{value || '-'}</span>
//     </div>
//   );
// }

// function AddressBlock({ title, addr }) {
//   // v3 uses { address, street, street2, city, state, zip, country, phone, attention }
//   const zip = addr?.zip ?? addr?.zipcode;
//   const cityLine = [addr?.city, addr?.state, zip].filter(Boolean).join(', ');
//   const lines = [
//     addr?.attention,
//     addr?.address || addr?.street,
//     addr?.street2,
//     cityLine,
//     addr?.country,
//     addr?.phone,
//   ].filter(Boolean);

//   return (
//     <div>
//       <h4 className="text-sm font-semibold text-blue-900 mb-1">{title}</h4>
//       {lines.length === 0 ? (
//         <p className="text-sm text-gray-500">-</p>
//       ) : (
//         <div className="text-sm text-gray-800 space-y-0.5">
//           {lines.map((l, i) => (
//             <div key={i}>{l}</div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


'use client';

import { useGetInvoiceByIdQuery, useGetSalesMembersQuery } from '@/redux/features/api/zohoApi';
import Loader from '@/components/custom/ui/Loader';
import Image from 'next/image';
import { X, FileText, Wallet, IndianRupee, Plus, Trash2 } from 'lucide-react';

// RTK Query for **invoice** payment details (mirror of poPaymentApi)


import { useGetSalesMeQuery } from '@/redux/features/api/zohoApi';
import { showError, showSuccess } from '@/utils/customAlert';
import { ImageUploadInput } from '@/components/custom/ui/input';
import { useAddCustomerPaymentDetailMutation, useGetCustomerPaymentDetailByIdQuery, useUpdateCustomerPaymentDetailMutation } from '@/redux/features/api/customerPaymentApi';
import { useEffect, useState } from 'react';

/* --------------------------- Local constants (parity) --------------------------- */

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'];

// Modes you locked down on the PO side
const PAYMENT_MODES = ['NEFT', 'RTGS', 'IMPS', 'UPI', 'Cash', 'Cheque'];

// Banks/Methods same as PO side
const PAYMENT_METHODS = ['Yes Bank', 'Hero Fincap', 'HDFC'];

/* ---------------------------------- Helpers ---------------------------------- */

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

const fmtMoney = (n, currency = 'INR') =>
  typeof n === 'number'
    ? n.toLocaleString('en-IN', { style: 'currency', currency })
    : (n ?? '-');

const fmtDate = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
};

const numeric = (v) => {
  const n = Number(String(v ?? '').replace(/[,₹\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export default function InvoiceViewDrawer({ invoiceId, onClose }) {
  /* --------------------------------- Fetch base invoice --------------------------------- */
  const { data, isLoading, error } = useGetInvoiceByIdQuery(invoiceId, { skip: !invoiceId });


  const invoice = data || {};
  const currency = invoice?.currency_code || 'INR';


  /* --------------------------------- Me / isAdmin --------------------------------- */
  const { data: me } = useGetSalesMeQuery();
  const isAdmin = !!me?.isAdmin || me?.role === 'admin';


  const {data: teamData,isLoading: teamLoading,isFetching: teamFetching} = useGetSalesMembersQuery({ page: 1, limit: 10000 }, {refetchOnMountOrArgChange: true });


  console.log("data data invoice", data)



  const {data: paymentDetail,isLoading: isPaymentLoading,isError: isPaymentError,error: paymentError,} = useGetCustomerPaymentDetailByIdQuery(invoiceId, { skip: !invoiceId });


  const [ addInvoicePayment, { isLoading: isSaving }] = useAddCustomerPaymentDetailMutation();
  const [updateInvoicePayment, { isLoading: isSavingUp }] = useUpdateCustomerPaymentDetailMutation();





  /* --------------------------------- Local state --------------------------------- */

  // Email(s) we’ll send receipts/notifications to (prefill from invoice if available)


  const [customerEmails, setCustomerEmails] = useState([]);
  const [previewsByRow, setPreviewsByRow] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [payType, setPayType] = useState('pending');
  const [payments, setPayments] = useState([]);
  const [notes, setNotes] = useState('');
  const [salesPersonEmail, setSalesPersonEmail] = useState('');
  const [salesPersonName, setSalesPersonName] = useState('');
  const [testMailBox, setTestMailBox] = useState('');
  



  // Compute invoice total safely (Zoho often returns stringified number)



  const totalAmount = (() => {
    const raw = invoice?.total;
    const n = Number(String(raw ?? '').toString().replace(/,/g, ''));
    return Number.isFinite(n) ? n : NaN;
  })();
  const totalPaid = payments.reduce((acc, p) => acc + numeric(p.amount), 0);
  const remaining = Number.isFinite(totalAmount) ? Math.max(0, totalAmount - totalPaid) : 0;


  const allTeams = teamData?.items




  useEffect(() => {

    const spName =  invoice?.salesperson_name || '';
    setSalesPersonName(spName);

    // Find email from teamData
    const matched = allTeams?.find(
      (t) => t.name?.trim().toLowerCase() === spName?.trim().toLowerCase()
    );

    setSalesPersonEmail(matched?.email || '');
    setTestMailBox(matched?.email || '')

  }, [invoice, allTeams]);


  console.log("paymentDetail",paymentDetail)





  /* ------------------------ Prefill customerEmails from invoice ------------------------ */
  useEffect(() => {
    const candidates = new Set();

    // Whatever Zoho returns, try common places
    if (invoice?.email) candidates.add(String(invoice.email).trim());
    if (invoice?.customer_email) candidates.add(String(invoice.customer_email).trim());
    if (invoice?.billing_address?.email) candidates.add(String(invoice.billing_address.email).trim());
    if (invoice?.shipping_address?.email) candidates.add(String(invoice.shipping_address.email).trim());

    // Avoid empties
    const list = Array.from(candidates).filter(Boolean);
    if (paymentDetail?.customerEmails?.length) {
      setCustomerEmails(paymentDetail.customerEmails);
    } else {
      setCustomerEmails(list);
    }
  }, [invoice, paymentDetail]);



  /* ------------------------------- Hydrate edit state ------------------------------- */
  useEffect(() => {
    if (!paymentDetail) return;

    const serverPayType = paymentDetail.payType || 'partial';

    if (serverPayType === 'pending') {
      setPayType('pending');
      setPayments([]);
    } else if (Array.isArray(paymentDetail.payments)) {
      const arr = paymentDetail.payments.map((p) => ({
        amount: p.amount != null ? String(p.amount) : '',
        date: p.date ? String(p.date).slice(0, 10) : '',
        mode: PAYMENT_MODES.includes(p.mode) ? p.mode : (p.mode || ''),
        method: p.method || 'HDFC',
        invoiceNo: p.invoiceNo || '',
        attachments: Array.isArray(p.attachments) ? p.attachments : [],
      }));
      setPayType(serverPayType);
      setPayments(arr);
    } else {
      // Legacy single-payment fallback (optional)
      const legacyAmount = paymentDetail.paidAmount != null ? String(paymentDetail.paidAmount) : '';
      const legacyDate = paymentDetail.paymentDate ? String(paymentDetail.paymentDate).slice(0, 10) : '';
      const legacyMode = paymentDetail.paymentMode || '';
      const legacyMethod = paymentDetail.paymentMethod || 'HDFC';
      const legacyInvoiceNo = paymentDetail.invoiceNo || '';

      if (!legacyAmount) {
        setPayType('partial');
        setPayments([{ amount: '', date: '', mode: '', method: 'HDFC', attachments: [], invoiceNo: '' }]);
      } else {
        setPayType(serverPayType || 'partial');
        setPayments([
          { amount: legacyAmount, date: legacyDate, mode: legacyMode, method: legacyMethod, attachments: [], invoiceNo: legacyInvoiceNo },
        ]);
      }
    }

    setNotes(paymentDetail.notes || '');
  }, [paymentDetail, isEditing]);

  /* -------------------------------- Row operations -------------------------------- */
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
        // keep relaxed rule like PO (no hard clamp unless you want)
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
        setPayments([
          {
            amount: Number.isFinite(totalAmount) ? String(totalAmount) : '',
            date: '',
            mode: '',
            method: 'HDFC',
            attachments: [],
            invoiceNo: '',
          },
        ]);
      }
      return;
    }
    if (next === 'partial') {
      if (!Array.isArray(payments) || payments.length === 0) {
        setPayments([{ amount: '', date: '', mode: '', method: 'HDFC', attachments: [], invoiceNo: '' }]);
      }
    }
  };

  /* ---------------------------- Per-row document helpers ---------------------------- */
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


  /* --------------------------------- Validation --------------------------------- */
  const validate = () => {
    const errs = [];

    if (!invoiceId) errs.push('Missing invoice ID.');
    if (!invoice?.customer_name?.trim()) errs.push('Customer Name is required.');

    if ((payType !== 'pending') && (!salesPersonEmail?.length || !salesPersonEmail)) {
      errs.push('Sales Person Email is required.');
    }

    if (payType === 'pending') {
      // ok
    } else if (!Array.isArray(payments) || payments.length === 0) {
      errs.push('Add at least one payment row.');
    } else {
      payments.forEach((p, idx) => {
        const amt = numeric(p.amount);
        if (!Number.isFinite(amt) || amt <= 0) errs.push(`Row ${idx + 1}: Enter a valid Amount (> 0).`);
        if (!p.date) errs.push(`Row ${idx + 1}: Select a Date.`);
        if (!p.mode || !PAYMENT_MODES.includes(p.mode)) errs.push(`Row ${idx + 1}: Select a valid Payment Mode.`);
        if (!PAYMENT_METHODS.includes(p.method)) errs.push(`Row ${idx + 1}: Select a valid Payment Method.`);
      });
      // You kept relaxed sum rules on PO side; keep same here
    }

    if (notes && notes.length > 1000) errs.push('Notes must be 1000 characters or fewer.');
    return { ok: errs.length === 0, errors: errs };
  };

  /* ----------------------------- Payload construction ----------------------------- */
  const buildPayload = () => {
    if (payType === 'pending') {
      return {
        payType: 'pending',
        payments: [],
        notes,
        // extra meta for emails & audit (optional)
      };
    }

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

      console.log("payload and records check", {
        invoiceId,
        ...payload,
        customerName: invoice?.customer_name,
        invoiceNumber: invoice?.invoice_number,
        invoiceTotal: invoice?.total,
        totalPaid,
        salesPersonEmail,
        dueDate: invoice?.due_date
      })

      // return;

      let resp;
      if (!paymentDetail) {
        resp = await addInvoicePayment({
          invoiceId,
          ...payload,
          customerName: invoice?.customer_name,
          invoiceNumber: invoice?.invoice_number,
          invoiceTotal: invoice?.total,
          totalPaid,
          salesPersonName:salesPersonName || '',
          salesPersonEmail,
          dueDate: invoice?.due_date || invoice?.date
        }).unwrap();
      } else {
        resp = await updateInvoicePayment ({
          invoiceId,
          ...payload,
          customerName: invoice?.customer_name,
          invoiceNumber: invoice?.invoice_number,
          invoiceTotal: invoice?.total,
          totalPaid,
          salesPersonName:salesPersonName || '',
          salesPersonEmail,
          dueDate: invoice?.due_date || invoice?.date
        }).unwrap();
      }

      showSuccess('Success', 'Updated successfully!');
      setNotes('');
      setIsEditing(false);
    } catch (e) {
      console.error('Save failed:', e);
      showError(
        'Error',
        e?.data?.errors?.join?.('\n') ||
        e?.data?.message ||
        e?.error ||
        'Failed to save customer payment details'
      );
    }
  };





  /* ------------------------------------ UI ------------------------------------ */
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
              Invoice {invoice?.invoice_number ? `#${invoice.invoice_number}` : ''}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 cursor-pointer text-gray-600 hover:text-red-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {(isLoading || isPaymentLoading) && <Loader />}

        {error && (
          <div className="m-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
            {error?.data?.message || 'Failed to load invoice'}
          </div>
        )}

        {isPaymentError && (
          <div className="m-4 p-3 rounded bg-yellow-50 text-yellow-800 text-sm border border-yellow-200">
            {paymentError?.data?.message || 'Customer payment detail not found (you can create one)'}
          </div>
        )}

        {!isLoading && !error && (
          <div className="p-6 space-y-8">
            {/* Top facts */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="Customer" value={invoice?.customer_name} />
              <Info label="Status" value={invoice?.status} />
              <Info label="Date" value={fmtDate(invoice?.date)} />
              <Info label="Due Date" value={fmtDate(invoice?.due_date)} />
              <Info label="Salesperson" value={invoice?.salesperson_name} />
              <Info label="PO No." value={invoice?.custom_field_hash?.cf_purchase_order_no ?? '-'} />
            </section>

            {/* Totals */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Info label="Total" value={fmtMoney(invoice?.total, currency)} />
            </section>

            {/* Customer emails */}

            {/* <div>
              <div className="flex items-center flex-wrap">
                <span className="text-md font-medium text-gray-500 pr-2 whitespace-nowrap">Customer emails:&nbsp;</span>
                {customerEmails?.length ? (
                  customerEmails.map((em, i) => (
                    <div key={em + i} className="flex items-center">
                      <Info label="" value={em} />
                      {i < customerEmails.length - 1 && <span className="mr-2">,</span>}
                    </div>
                  ))
                ) : (
                  <div className="rounded text-gray-800 text-sm italic">
                    Customer emails not found. Please add manually.
                  </div>
                )}
              </div>
            </div> */}

            {/* ==================== Customer Payment Details (FINAL v3) ==================== */}
            <section>
              <h2 className="w-full text-lg font-semibold text-blue-800 bg-blue-50 px-3 py-1.5 rounded inline-block mb-4">
                Customer Payment Details
              </h2>

              {/* Totals header + add button */}
              <div className="col-span-1 md:col-span-3 my-3">
                <div className="w-full rounded-xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm p-4 sm:p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <Wallet className="h-4 w-4 text-slate-500" />
                        Total Received:&nbsp;<b className="ml-1">{fmtMoney(totalPaid, currency)}</b>
                      </span>
                      {Number.isFinite(totalAmount) && (
                        <span className="inline-flex items-center gap-1.5">
                          <IndianRupee className="h-4 w-4 text-slate-500" />
                          Remaining:&nbsp;
                          <b className={`ml-1 ${remaining > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                            {fmtMoney(remaining, currency)}
                          </b>
                        </span>
                      )}
                    </div>

                    {((payType === 'partial' && isEditing) || (payType === 'partial' && !paymentDetail)) ? (
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
                  </div>
                </div>
              </div>

              {/* Non-admin notice */}
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
                    {paymentDetail.notes && <LongText label="Notes" text={paymentDetail.notes} />}
                  </div>

                  {Array.isArray(paymentDetail.payments) && paymentDetail.payments.length > 0 && (
                    <section className="mt-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">Payments</h4>
                      <div className="overflow-hidden rounded border border-gray-200">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-gray-600">
                            <tr>
                              <th className="text-left px-3 py-2">Date</th>
                              <th className="text-left px-3 py-2">Mode</th>
                              <th className="text-left px-3 py-2">Method</th>
                              {/* <th className="text-left px-3 py-2">Invoice No.</th> */}
                              <th className="text-right px-3 py-2">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paymentDetail.payments.map((p, i) => (
                              <tr key={i} className="border-t">
                                <td className="px-3 py-2">{fmtDate(p.date)}</td>
                                <td className="px-3 py-2">{p.mode || '-'}</td>
                                <td className="px-3 py-2">{p.method || '-'}</td>
                                {/* <td className="px-3 py-2">{p.invoiceNo || '-'}</td> */}
                                <td className="px-3 py-2 text-right">{fmtMoney(p.amount, currency)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {isAdmin && (
                    <div className="p-4 flex justify-end">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded bg-blue-900 px-4 py-2 text-white"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Edit/Create view */}
              {(isEditing || !paymentDetail) && isAdmin && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* PayType */}
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
                          <span className="text-sm text-gray-700">Mark as fully received</span>
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
                          <span className="text-sm text-gray-700">Mark as partially received</span>
                        </label>
                      </div>
                    </div>

                    {/* Payments list */}
                    <div className="col-span-1 md:col-span-full">
                      {payType === 'pending' ? (
                        <div className="text-sm text-slate-600 italic py-3">No payments received yet.</div>
                      ) : (
                        payments.map((p, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end border-b-2 border-gray-100 py-5"
                          >
                            {/* Row header/remove */}
                            <div className="col-span-full flex items-center justify-between">
                              {payments?.length > 1 && (
                                <span className="inline-flex items-center gap-2 text-xs">
                                  <span className="rounded-full bg-blue-900 px-3 py-1 font-semibold text-white">
                                    Payment {i + 1}
                                  </span>
                                </span>
                              )}
                              {payType === 'partial' && payments.length > 1 && (
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
                                value={PAYMENT_MODES.includes(p.mode) ? p.mode : ''}
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

                            {/* Date (Cheque => PDC Date) */}
                            <div className="flex flex-col">
                              <label className="text-md font-medium mb-1 text-gray-600">
                                {p.mode === 'Cheque' ? 'PDC Date' : 'Date'}
                              </label>
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

                            {/* Customer Invoice No.
                            <div className="flex flex-col">
                              <label className="text-md font-medium mb-1 text-gray-600">Invoice No.</label>
                              <input
                                type="text"
                                placeholder="Customer invoice number"
                                value={p.invoiceNo || ''}
                                onChange={(e) => updatePayment(i, 'invoiceNo', e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                              />
                            </div> */}

                            {/* Per-row documents */}
                            <section className="col-span-1 md:col-span-full mb-6">
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                  <div className="md:col-span-12 lg:col-span-12 min-w-0">
                                    <div className="text-sm font-medium text-gray-700 mb-1">Upload Files</div>
                                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/60 p-3">
                                      <p className="text-xs text-gray-500">
                                        Upload any files (images, PDF, Word, Excel, CSV, TXT, ZIP, etc.).
                                      </p>
                                      <div className="mt-3">
                                        <ImageUploadInput
                                          label=""
                                          name={`invoice_documents_row_${i}`}
                                          accept="*/*"
                                          previews={previewsByRow[i] || []}
                                          setPreviews={(urls) => setRowPreviews(i, urls)}
                                          defaultFiles={[]}
                                          onUploadComplete={(urlsFromInput) => {
                                            const existing = new Set(payments[i]?.attachments || []);
                                            const newUrls = (urlsFromInput || []).filter((u) => !existing.has(u));
                                            if (newUrls.length) addAttachmentsToRow(i, newUrls);
                                            setRowPreviews(i, []);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Row doc preview */}
                                  {Array.isArray(p.attachments) && p.attachments.length > 0 ? (
                                    <div className="md:col-span-12">
                                      <div className="mb-4">
                                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                          {p.attachments.map((url, idx2) => {
                                            const ext = getExt(url);
                                            const isImg = isImageExt(ext);
                                            return (
                                              <div
                                                key={idx2}
                                                className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden"
                                              >
                                                <div className="h-28 w-full bg-gray-50 flex items-center justify-center">
                                                  {isImg ? (
                                                    <Image
                                                      src={url}
                                                      alt={'img'}
                                                      width={256}
                                                      height={112}
                                                      className="h-28 w-full object-cover"
                                                    />
                                                  ) : (
                                                    <div className="flex flex-col items-center justify-center text-xs text-gray-600">
                                                      {/* Generic file block */}
                                                      <div className="h-6 w-6 rounded bg-gray-200" />
                                                      <div className="mt-1 text-[10px] text-gray-500 uppercase">
                                                        {ext || 'file'}
                                                      </div>
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
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-3 w-3"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          d="M13 7h6m0 0v6m0-6L10 16"
                                                        />
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
                                  ) : !isAdmin ? (
                                    <div className="md:col-span-12 text-gray-800 text-sm pl-4">
                                      No related documents uploaded yet!
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </section>
                          </div>
                        ))
                      )}
                    </div>


                    {/* Manual customer email (if nothing auto-detected) */}
                    { !testMailBox && (


                      <div className="flex flex-col">

                        <label className="text-md font-medium text-gray-600 mb-1">Sales Person Email</label>

                        <input
                          type="email"
                          placeholder="Enter sales person email"
                          value={salesPersonEmail || ''}
                          onChange={(e) => setSalesPersonEmail(e.target.value)}
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />

                      </div>

                    )}
                  </div>

                  {/* Notes */}
                  <div className="mt-4 flex flex-col">
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
                  <div className="mt-4 flex justify-end">
                    <div className="flex gap-2">
                      {paymentDetail && (
                        <button
                          onClick={() => setIsEditing(false)}
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
            {/* ==================== End Customer Payment Details ==================== */}
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- Small bits --------------------------------- */

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
