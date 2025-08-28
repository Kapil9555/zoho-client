'use client';

import { useGetPurchaseOrderByIdQuery } from '@/redux/features/api/zohoApi';
import Loader from '@/components/custom/ui/Loader';
import { X, FileText, ExternalLink, Copy } from 'lucide-react';

export default function PurchaseOrderViewDrawer({ purchaseOrderId, onClose }) {
  const { data, isLoading, error } = useGetPurchaseOrderByIdQuery(purchaseOrderId, {
    skip: !purchaseOrderId,
  });

  // Controller returns: { purchaseorder: { ... } }


  const po = data || {};

  console.log("po data", po)

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

  // POs typically don't have a portal URL like invoices; keep defensive
  const poUrlRaw = po?.purchaseorder_url || po?.url || po?.pdf_url || '';
  const poUrl = typeof poUrlRaw === 'string' ? poUrlRaw.trim() : '';

  const openExternal = () => {
    if (poUrl) window.open(poUrl, '_blank', 'noopener,noreferrer');
  };

  const copyUrl = async () => {
    if (!poUrl) return;
    try { await navigator.clipboard.writeText(poUrl); } catch { }
  };

  const currency = po?.currency_code || 'INR';
  const lineItems = po?.line_items || po?.items || [];

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
          <button onClick={onClose} className="p-1 text-gray-600 hover:text-red-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {isLoading && <Loader />}

        {error && (
          <div className="m-4 p-3 rounded bg-red-50 text-red-700 text-sm border border-red-200">
            {error?.data?.message || 'Failed to load purchase order'}
          </div>
        )}

        {!isLoading && !error && (
          <div className="p-6 space-y-8">
            {/* Top facts */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="Vendor" value={po?.vendor_name} />
              <Info label="Vendor Email" value={po?.contact_persons_associated?.[0]?.contact_person_email} />
              <Info label="Status" value={po?.status} />
              <Info label="Order Status" value={po?.order_status} />
              <Info label="Sub Status" value={po?.current_sub_status} />
              <Info label="Date" value={fmtDate(po?.date)} />
              <Info label="Expected Delivery" value={fmtDate(po?.expected_delivery_date || po?.delivery_date)} />
              <Info label="Reference #" value={po?.reference_number} />
              <Info label="Branch" value={po?.branch_name} />
              <Info label="Location" value={po?.location_name} />
              <Info label="Source of Supply" value={po?.source_of_supply} />
              <Info label="Destination of Supply" value={po?.destination_of_supply} />
              <Info label="GST No" value={po?.gst_no} />
              <Info label="Payment Terms" value={(po?.payment_terms && po?.payment_terms_label) ? `${po?.payment_terms} (${po?.payment_terms_label})` : ""} />
              <Info label="Submitted By" value={po?.submitted_by_name || po?.submitted_by} />
              <Info label="Submitted Date" value={fmtDate(po?.submitted_date)} />
            </section>

            {/* Contact persons (if any) */}
            {Array.isArray(po?.contact_persons_associated) && po.contact_persons_associated.length > 0 && (
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
                          <td className="px-3 py-2">{p.contact_person_name || `${p.first_name || ''} ${p.last_name || ''}`.trim()}</td>
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
              <Info label="Subtotal" value={fmtMoney(po?.sub_total, currency)} />
              <Info label="Tax Total" value={fmtMoney(po?.tax_total, currency)} />
              <Info label="Total" value={fmtMoney(po?.total, currency)} />
            </section>

            {/* Taxes (if present) */}
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
            {
              lineItems.length !== 0
              &&
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
                )}
              </section>
            }

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

            {/* Notes/Terms */}
            {/* {(po?.notes || po?.terms) && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {po?.notes && <LongText label="Notes" text={po.notes} />}
                {po?.terms && <LongText label="Terms" text={po.terms} />}
              </section>
            )} */}

            {/* Actions */}
            {/* <section className="flex items-center justify-end gap-3">
              <button
                onClick={copyUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={!poUrl}
              >
                <Copy className="w-4 h-4" /> Copy Link
              </button>
              <button
                onClick={openExternal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={!poUrl}
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
  if (value === null || value === undefined || value === '' || value === '-') {
    return null; // don't render anything
  }

  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 break-words">{value || '-'}</span>
    </div>
  );
}

function LongText({ label, text }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <pre className="text-sm text-gray-900 whitespace-pre-wrap break-words">{text}</pre>
    </div>
  );
}

function AddressBlock({ title, addr }) {
  // Normalize both shapes:
  // billing_address: { address, street2, city, state, zip, country, phone, attention }
  // delivery_address: { address/address1/address2, city, state, zip, country, phone, email }
  if (!addr) {
    return (
      null
    );
  }

  const addressLine =
    addr.address ||
    [addr.address1, addr.address2].filter(Boolean).join(' ') ||
    null;

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
