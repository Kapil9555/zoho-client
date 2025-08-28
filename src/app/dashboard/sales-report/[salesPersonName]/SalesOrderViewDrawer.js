'use client';

import { useGetInvoiceByIdQuery, useGetPurchaseOrderByIdQuery, useGetPurchaseOrdersByRefQuery } from '@/redux/features/api/zohoApi';
import Loader from '@/components/custom/ui/Loader';
import { X, FileText, ExternalLink, Copy } from 'lucide-react';

export default function InvoiceViewDrawer({ invoiceId, onClose }) {


  const { data, isLoading, error } = useGetInvoiceByIdQuery(invoiceId, { skip: !invoiceId });


  // Your controller returns { invoice: { ... } }

  const invoice = data || {};


  const fmtMoney = (n, currency = 'INR') =>
    typeof n === 'number'
      ? n.toLocaleString('en-IN', { style: 'currency', currency })
      : (n ?? '-');


  const fmtDate = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString();
  };

  const getCF = (inv, key) => inv?.custom_field_hash?.[key] ?? inv?.[key] ?? '-';

  const currency = invoice?.currency_code || 'INR';
  const lineItems = invoice?.line_items || invoice?.items || [];

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
          <button onClick={onClose} className="p-1 text-gray-600 hover:text-red-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {isLoading && <Loader />}

        {error && (
          <div className="m-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
            {error?.data?.message || 'Failed to load invoice'}
          </div>
        )}



        {!isLoading && !error && (
          <div className="p-6 space-y-8">
            {/* Top facts */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="Customer" value={invoice?.customer_name} />
              <Info label="Email" value={invoice?.email} />
              <Info label="Status" value={invoice?.status} />
              <Info label="Sub Status" value={invoice?.current_sub_status} />
              <Info label="Date" value={fmtDate(invoice?.date)} />
              <Info label="Due Date" value={fmtDate(invoice?.due_date)} />
              <Info label="Salesperson" value={invoice?.salesperson_name} />
              <Info label="Reference #" value={invoice?.reference_number} />
              <Info label="PO No." value={getCF(invoice, 'cf_purchase_order_no')} />
            </section>

            {/* Addresses (v3 uses zip, also has street) */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AddressBlock title="Billing Address" addr={invoice?.billing_address} />
              <AddressBlock title="Shipping Address" addr={invoice?.shipping_address} />
            </section>

            {/* Totals */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Info label="Total" value={fmtMoney(invoice?.total, currency)} />
              <Info label="Balance" value={fmtMoney(invoice?.balance, currency)} />
              <Info label="Adjustment" value={fmtMoney(invoice?.adjustment, currency)} />
            </section>

            {/* Line Items */}
            <section>
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Line Items</h4>
              {lineItems.length === 0 ? (
                <p className="text-sm text-gray-500">No items</p>
              ) : (
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
                        const name = it?.item_name || it?.name || it?.description || `Item ${i + 1}`;
                        const qty = it?.quantity ?? it?.qty ?? 0;
                        const rate = Number(it?.rate ?? it?.price ?? 0);
                        const taxPct = Number(it?.tax_percentage ?? it?.tax_percent ?? it?.tax_rate ?? 0);
                        const amount = Number(it?.total ?? it?.item_total ?? it?.amount ?? qty * rate);
                        return (
                          <tr key={i} className="border-t">
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
              )}
            </section>

            {/* Custom Fields */}
            {invoice?.custom_field_hash && Object.keys(invoice.custom_field_hash).length > 0 && (
              <section>
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Custom Fields</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(invoice.custom_field_hash).map(([k, v]) => (
                    <Info key={k} label={k} value={String(v)} />
                  ))}
                </div>
              </section>
            )}

            {/* e-Invoice */}
            {invoice?.einvoice_details && (
              <section>
                <h4 className="text-sm font-semibold text-blue-900 mb-2">e-Invoice Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Info label="Status" value={invoice.einvoice_details?.formatted_status || invoice.einvoice_details?.status} />
                  <Info label="Ack No." value={invoice.einvoice_details?.ack_number} />
                  <Info label="Ack Date" value={invoice.einvoice_details?.ack_date} />
                  <Info label="IRN" value={invoice.einvoice_details?.inv_ref_num} />
                </div>
              </section>
            )}

            {/* Actions
            <section className="flex items-center justify-end gap-3">
              <button
                onClick={copyUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={!safeUrl}
              >
                <Copy className="w-4 h-4" /> Copy Link
              </button>
              <button
                onClick={openExternal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                disabled={!safeUrl}
              >
                <ExternalLink className="w-4 h-4" /> Open in Zoho
              </button>
            </section> */}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 break-words">{value || '-'}</span>
    </div>
  );
}

function AddressBlock({ title, addr }) {
  // v3 uses { address, street, street2, city, state, zip, country, phone, attention }
  const zip = addr?.zip ?? addr?.zipcode;
  const cityLine = [addr?.city, addr?.state, zip].filter(Boolean).join(', ');
  const lines = [
    addr?.attention,
    addr?.address || addr?.street,
    addr?.street2,
    cityLine,
    addr?.country,
    addr?.phone,
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
