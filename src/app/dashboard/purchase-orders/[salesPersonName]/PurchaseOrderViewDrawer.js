'use client';

import Loader from '@/components/custom/ui/Loader';
import { useGetPurchaseOrderByIdQuery, useGetSalesMembersQuery, useGetSalesMeQuery } from '@/redux/features/api/zohoApi';
import { FileText, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// RTK Query for payment details (from the slice we set up)
import {
  useAddPoPaymentDetailMutation,
  useGetPoPaymentDetailByIdQuery,
  useGetPoPaymentDetailsQuery,
  useUpdatePoPaymentDetailMutation,
} from '@/redux/features/api/poPaymentApi';
import { showError, showSuccess } from '@/utils/customAlert';

export default function PurchaseOrderViewDrawer({ purchaseOrderId, onClose }) {
  const { data, isLoading, error } = useGetPurchaseOrderByIdQuery(purchaseOrderId, {
    skip: !purchaseOrderId,
  });

  // Payment details fetch
  const {
    data: paymentDetail,
    isLoading: isPaymentLoading,
    isError: isPaymentError,
    error: paymentError,
  } = useGetPoPaymentDetailByIdQuery(purchaseOrderId, { skip: !purchaseOrderId });

  const [upsertPoPaymentDetail, { isLoading: isSaving }] = useAddPoPaymentDetailMutation();
  const [updatePoPaymentDetail, { isLoading: isSavingUp }] = useUpdatePoPaymentDetailMutation();

  const { data: me } = useGetSalesMeQuery();


  const [salesPersonName, setSalesPersonName] = useState('');
  const [salesPersonEmail, setSalesPersonEmail] = useState('');



  const {
    data: teamData,
    isLoading: teamLoading,
    isFetching: teamFetching,
  } = useGetSalesMembersQuery(
    { page: 1, limit: 10000 },
    { refetchOnMountOrArgChange: true }
  );

  const allTeams = teamData?.items


  const isAdmin = !!me?.isAdmin || me?.role === 'admin';

  // console.log('ME records check', isAdmin);

  // API may return { purchaseorder: {...} } or data directly depending on your hook wrapper.
  const po = data || {};

  const fmtMoney = (n, currency = 'INR') =>
    typeof n === 'number'
      ? n.toLocaleString('en-IN', { style: 'currency', currency })
      : (n ?? '-');

  const fmtDate = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
  };

  const getCF = (obj, key) => obj?.custom_field_hash?.[key] ?? obj?.[key] ?? '-';

  const poUrlRaw = po?.purchaseorder_url || po?.url || po?.pdf_url || '';

  const poUrl = typeof poUrlRaw === 'string' ? poUrlRaw.trim() : '';

  const openExternal = () => {
    if (poUrl) window.open(poUrl, '_blank', 'noopener,noreferrer');
  };

  const copyUrl = async () => {
    if (!poUrl) return;
    try {
      await navigator.clipboard.writeText(poUrl);
    } catch { }
  };

  const currency = po?.currency_code || 'INR';
  const lineItems = po?.line_items || po?.items || [];

  /* =======================
     PAYMENT DETAILS (FINAL v2)
     ======================= */
  const PAYMENT_METHODS = ['Yes Bank', 'Hero Fincap', 'HDFC'];
  const PAYMENT_STATUSES = ['Paid', 'Due'];

  // status
  const [paymentStatus, setPaymentStatus] = useState('Paid');

  const [paidAmount, setPaidAmount] = useState('');
  const [dueAmount, setDueAmount] = useState('');

  // Paid-only fields
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('HDFC');

  // Due-only fields
  const [dueReason, setDueReason] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Always-on notes
  const [notes, setNotes] = useState('');

  const isDue = paymentStatus === 'Due';

  // ===== Helpers for validation =====
  const toNumber = (val) => {
    if (val === '' || val == null) return NaN;
    const n = Number(String(val).replace(/,/g, '').trim());
    return Number.isFinite(n) ? n : NaN;
  };

  const parseYMD = (s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const todayMidnight = () => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  };

  const isFutureDate = (s) => {
    const dt = parseYMD(s);
    if (!dt) return false;
    return dt > todayMidnight();
  };

  const isPastDate = (s) => {
    const dt = parseYMD(s);
    if (!dt) return false;
    return dt < todayMidnight();
  };


  const totalAmount = (() => {
    const raw = po?.total;
    const n = Number(String(raw ?? '').toString().replace(/,/g, ''));
    return Number.isFinite(n) ? n : NaN;
  })();

  // Hydrate from server on load / change
  useEffect(() => {
    if (!paymentDetail) return;

    const d = paymentDetail;
    setPaymentStatus(d.paymentStatus || 'Paid');

    // Paid fields
    setPaidAmount(d.paidAmount != null ? String(d.paidAmount) : '');
    setPaymentDate(d.paymentDate ? String(d.paymentDate).slice(0, 10) : '');
    setPaymentMode(d.paymentMode || '');
    setPaymentMethod(d.paymentMethod || 'HDFC');

    // Due fields
    setDueAmount(d.dueAmount != null ? String(d.dueAmount) : '');
    setDueDate(d.dueDate ? String(d.dueDate).slice(0, 10) : '');
    setDueReason(d.dueReason || '');

    // Notes
    setNotes(d.notes || '');
  }, [paymentDetail]);


  useEffect(() => {

    const spName = po?.cf_sales_person || '';
    setSalesPersonName(spName);

    // Find email from teamData
    const matched = allTeams?.find(
      (t) => t.name?.trim().toLowerCase() === spName?.trim().toLowerCase()
    );
    setSalesPersonEmail(matched?.email || '');
  }, [po, allTeams]);

  // Reset opposite side fields for a clean payload (UI-level)
  const onStatusChange = (val) => {
    setPaymentStatus(val);
    if (val === 'Due') {
      setPaidAmount('');
      setPaymentDate('');
      setPaymentMode('');
      setPaymentMethod('HDFC');
    } else {
      setDueAmount('');
      setDueReason('');
      setDueDate('');
    }
  };

  // ===== Validation =====
  const validate = () => {
    const errs = [];

    if (!purchaseOrderId) {
      errs.push('Missing purchase order ID.');
    }

    if (!PAYMENT_STATUSES.includes(paymentStatus)) {
      errs.push('Select a valid payment status.');
    }

    if (!po?.vendor_name || !po.vendor_name.trim()) {
      errs.push('Vendor Name is required.');
    }

    if (!salesPersonName || !salesPersonName.trim()) {
      errs.push('Sales Person Name is required.');
    }

    if (!salesPersonEmail || !salesPersonEmail.trim()) {
      errs.push('Sales Person Email is required.');
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(salesPersonEmail.trim())) {
        errs.push('Sales Person Email is not valid.');
      }
    }

    if (isDue) {
      const dAmt = toNumber(dueAmount);
      if (!Number.isFinite(dAmt) || dAmt <= 0) {
        errs.push('Enter a valid Due Amount (> 0).');
      }
      if (!dueDate) {
        errs.push('Select a Due Date.');
      }
      if (!dueReason || dueReason.trim().length < 3) {
        errs.push('Add a brief Reason of Due (min 3 characters).');
      }
      if (Number.isFinite(totalAmount) && dAmt > totalAmount) {
        errs.push('Due Amount cannot exceed PO Total.');
      }
    } else {
      const pAmt = toNumber(paidAmount);
      if (!Number.isFinite(pAmt) || pAmt <= 0) {
        errs.push('Enter a valid Paid Amount (> 0).');
      }
      if (!paymentDate) {
        errs.push('Select a Payment Date.');
      }
      if (!paymentMode || !paymentMode.trim()) {
        errs.push('Enter Payment Mode (e.g., NEFT/RTGS/UPI/Cash).');
      }
      if (!PAYMENT_METHODS.includes(paymentMethod)) {
        errs.push('Select a valid Payment Method.');
      }
      if (Number.isFinite(totalAmount) && pAmt > totalAmount) {
        errs.push('Paid Amount cannot exceed PO Total.');
      }
    }

    if (notes && notes.length > 1000) {
      errs.push('Notes must be 1000 characters or fewer.');
    }

    return { ok: errs.length === 0, errors: errs };
  };

  // Build payload exactly like the controller expects
  const buildPayload = () => {
    const base = { paymentStatus, notes, salesPersonName, salesPersonEmail };

    if (isDue) {
      return {
        ...base,
        dueAmount: dueAmount || undefined,
        dueDate: dueDate || undefined,
        dueReason: dueReason || undefined,
      };
    }

    return {
      ...base,
      paidAmount: paidAmount || undefined,
      paymentDate: paymentDate || undefined,
      paymentMode: paymentMode || undefined,
      paymentMethod: paymentMethod || undefined,
    };
  };

  const handleSavePayment = async () => {
    // Run validations first
    const { ok, errors } = validate();
    if (!ok) {
      showError('Validation Error', errors.join('\n'));
      return;
    }

    try {
      const payload = buildPayload();

      // console.log("datadata", data)

      // console.log("payload check", payload)
      // return

      let resp;
      if (!paymentDetail) {
        resp = await upsertPoPaymentDetail({
          purchaseOrderId,
          ...payload,
          vendorName: po?.vendor_name,
          // optional: poNumber can help debugging/server queries
          poNumber: po?.purchaseorder_number,
        }).unwrap();
      } else {
        // console.log('Updating existing payment detail', {
        //   purchaseOrderId,
        //   ...payload,
        //   poNumber: po?.purchaseorder_number,
        // });
        resp = await updatePoPaymentDetail({
          purchaseOrderId,
          vendorName: po?.vendor_name,
          ...payload,
          // optional: poNumber can help debugging/server queries
          poNumber: po?.purchaseorder_number,
        }).unwrap();
      }
      // You can replace with a toast
      console.log('Payment details saved:', resp);

      showSuccess('Success', 'Updated successfully!')
      setIsEditing(false);
    } catch (e) {
      console.error('Save failed:', e);
      showError(
        'Error',
        (
          e?.data?.errors?.join?.('\n') ||
          e?.data?.message ||
          e?.error ||
          'Failed to save payment details'
        )
      );
    }
  };
  /* ======================= */

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
              <Info label="Sub Status" value={po?.current_sub_status} />
              <Info label="Date" value={fmtDate(po?.date)} />
              {/* <Info
                label="Expected Delivery"
                value={fmtDate(po?.expected_delivery_date || po?.delivery_date)}
              /> */}
              <Info label="Reference #" value={po?.reference_number} />
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

              <Info label="Sales Person Name" value={salesPersonName} />
              <Info label="Sales Person Email" value={salesPersonEmail} />
              {/* <Info label="Submitted Date" value={fmtDate(po?.submitted_date)} /> */}
            </section>

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

            {/* Addresses */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AddressBlock title="Vendor/Billing Address" addr={po?.billing_address} />
              <AddressBlock title="Delivery Address" addr={po?.delivery_address} />
            </section>

            {/* Totals */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* <Info label="Subtotal" value={fmtMoney(po?.sub_total, currency)} /> */}
              {/* <Info label="Tax Total" value={fmtMoney(po?.tax_total, currency)} /> */}
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
            {po?.custom_field_hash && Object.keys(po.custom_field_hash).length > 0 && (
              <section>
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Custom Fields</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(po.custom_field_hash).map(([k, v]) => (
                    <Info key={k} label={k} value={String(v)} />
                  ))}
                </div>
              </section>
            )}

            {/* === Payment Details (FINAL v2) === */}

            <section className="">
              <h2 className="w-full text-lg font-semibold text-blue-800 bg-blue-50 px-3 py-1.5 rounded inline-block mb-4">
                Payment Details
              </h2>

              {
                !isAdmin && !paymentDetail &&
                <div className="rounded  text-gray-800 text-sm pl-4">
                  Payment details not found. Please contact admin.
                </div>
              }

              {
                !isEditing && paymentDetail &&
                <>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <Info label="Payment Status" value={paymentDetail.paymentStatus} />

                    {paymentDetail.paymentStatus === 'Paid' && (
                      <>
                        <Info label="Paid Amount" value={fmtMoney(paymentDetail.paidAmount, currency)} />
                        <Info label="Payment Date" value={fmtDate(paymentDetail.paymentDate)} />
                        <Info label="Payment Mode" value={paymentDetail.paymentMode} />
                        <Info label="Payment Method" value={paymentDetail.paymentMethod} />
                      </>
                    )}
                    {paymentDetail.paymentStatus === 'Due' && (
                      <>
                        <Info label="Due Amount" value={fmtMoney(paymentDetail.dueAmount, currency)} />
                        <Info label="Due Date" value={fmtDate(paymentDetail.dueDate)} />
                        <Info label="Reason of Due" value={paymentDetail.dueReason} />
                      </>
                    )}
                    {paymentDetail.notes && <LongText label="Notes" text={paymentDetail.notes} />}

                  </div>

                  {
                    isAdmin &&
                    <div className="p-4 flex justify-end">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded bg-blue-900 px-4 py-2 text-white"
                      >
                        Edit
                      </button>
                    </div>
                  }
                </>
              }
              {
                ((isEditing || !paymentDetail) && isAdmin) &&
                <div>
                  {/* Status & Paid-only fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Payment Status */}
                    <div className="flex flex-col">
                      <label className="text-md font-medium text-gray-600 mb-1">Payment Status</label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        {PAYMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!isDue && (
                      <>
                        <div className="flex flex-col">
                          <label className="text-md font-medium mb-1 text-gray-600">Paid Amount</label>
                          <input
                            type="text"
                            placeholder="Amount paid"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            disabled={isDue}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                        {/* Payment Date (Paid only) */}
                        <div className="flex flex-col">
                          <label className="text-md font-medium mb-1 text-gray-600">Payment Date</label>
                          <input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            disabled={isDue}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                        {/* Payment Mode (Paid only) */}
                        <div className="flex flex-col">
                          <label className="text-md font-medium mb-1 text-gray-600">Payment Mode</label>
                          <input
                            type="text"
                            placeholder="NEFT / RTGS / UPI / Cash"
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
                            disabled={isDue}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="text-md font-medium mb-1 text-gray-600">Payment Method</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            disabled={isDue}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                          >
                            {PAYMENT_METHODS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>






                      </>
                    )}

                    {isDue && (
                      <>
                        <div className="flex flex-col">
                          <label className="text-md font-medium mb-1 text-gray-600">Due Amount</label>
                          <input
                            type="text"
                            placeholder="Due amount"
                            value={dueAmount}
                            onChange={(e) => setDueAmount(e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-md font-medium mb-1 text-gray-600">Due Date</label>
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex flex-col">
                      <label className="text-md font-medium text-gray-600 mb-1">Sales Person Name</label>
                      <input
                        type="text"
                        placeholder="Enter sales person name"
                        value={salesPersonName}
                        onChange={(e) => setSalesPersonName(e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    {/* Sales Person Email */}
                    <div className="flex flex-col">
                      <label className="text-md font-medium text-gray-600 mb-1">Sales Person Email</label>
                      <input
                        type="email"
                        placeholder="Enter sales person email"
                        value={salesPersonEmail}
                        onChange={(e) => setSalesPersonEmail(e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>

                  {/* Method & Due-only fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">



                  </div>

                  {/* Reason of Due (Due only) */}
                  {isDue && (
                    <div className="flex flex-col mt-4">
                      <label className="text-md font-medium mb-1 text-gray-500">Reason of Due</label>
                      <textarea
                        placeholder={'Enter reason (e.g., awaiting approval, goods not delivered)'}
                        value={dueReason}
                        onChange={(e) => setDueReason(e.target.value)}
                        disabled={!isDue}
                        rows={3}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  )}

                  {/* Notes (always enabled) */}
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


                  <div className="mt-4 flex justify-end ">
                    <div className='flex gap-2'>
                      {
                        (paymentDetail) &&
                        <button
                          onClick={() => { setIsEditing(false); }}

                          className="inline-flex cursor-pointer items-center gap-2 rounded bg-gray-300 px-4 py-2 text-black disabled:opacity-60"
                        >
                          cancel
                        </button>
                      }
                      <button
                        onClick={handleSavePayment}
                        disabled={(isSaving || isSavingUp)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded bg-blue-900 px-4 py-2 text-white disabled:opacity-60"
                      >
                        {(isSaving || isSavingUp) ? 'Saving…' : !paymentDetail ? 'Save' : "Update Details"}
                      </button>
                    </div>
                  </div>
                </div>
              }


            </section>

            {/* === End Payment Details (FINAL v2) === */}
          </div>
        )}
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
