'use client';

import { FileText, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useUpsertManualProfitMutation } from '@/redux/features/api/zohoApi';
import Loader from '@/components/custom/ui/Loader';

export default function SalesReportDrawer({ open, onClose, row, month, salespersonName }) {
  if (!open) return null;

  console.log('row check', row);

  const round2 = (n) =>
    Number.isFinite(Number(n)) ? Math.round(Number(n) * 100) / 100 : 0;

  const profitAuto = (invoiceTotal, poTotal, extraExpenses) => {
    const inv = Number(invoiceTotal) || 0;
    const po = Number(poTotal) || 0;
    const exp = Number(extraExpenses) || 0;
    return round2(inv - po - exp);
  };

  const isValidPositive = (v) => Number.isFinite(Number(v)) && Number(v) > 0;
  const isValidNonNegative = (v) =>
    Number.isFinite(Number(v)) && Number(v) >= 0;

  // --- NEW: helper to read incoming gross profit safely ---
  const getIncomingGross = (r) => {
    const v = r?.grossProfit ?? r?.gross_profit ?? r?.gross ?? r?.difference ?? 0;
    return Number.isFinite(Number(v)) ? Number(v) : 0;
  };

  const [manualInvoice, setManualInvoice] = useState(
    row?.invoiceTotal != null ? Number(row.invoiceTotal) : 0
  );
  const [manualPo, setManualPo] = useState(
    row?.poTotal != null ? Number(row.poTotal) : 0
  );
  const [miscellaneouss, setMiscellaneouss] = useState(
    Number(row?.miscellaneouss) || 0
  );
  const [transportation, setTransportation] = useState(
    Number(row?.transportation) || 0
  );
  const [manualExpenses, setManualExpenses] = useState(
    (Number(row?.miscellaneouss) || 0) + (Number(row?.transportation) || 0)
  );

  // --- CHANGED: start with incoming gross profit ---
  const [profit, setProfit] = useState(getIncomingGross(row));
  const [profitEdited, setProfitEdited] = useState(false);

  // --- NEW: only recalc after user changes something ---
  const [touched, setTouched] = useState(false);
  const [notes, setNotes] = useState('');

  const [saveManualProfit, { isLoading: saving }] =
    useUpsertManualProfitMutation();

  // Reset when row/month/open changes
  useEffect(() => {
    const baseInv = row?.invoiceTotal != null ? Number(row.invoiceTotal) : 0;
    const basePo = row?.poTotal != null ? Number(row.poTotal) : 0;
    const baseMisc = Number(row?.miscellaneouss) || 0;
    const baseTrans = Number(row?.transportation) || 0;
    const summed = round2(baseMisc + baseTrans);
    const rowNotes = row?.notes || '';

    setManualInvoice(baseInv);
    setManualPo(basePo);
    setMiscellaneouss(baseMisc);
    setTransportation(baseTrans);
    setManualExpenses(summed);

    // show incoming gross FIRST
    setProfit(getIncomingGross(row));
    setProfitEdited(false);
    setTouched(false); // not touched yet
    setNotes(rowNotes);
  }, [row, month, open]);

  const num = (v, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };

  // Keep manualExpenses = misc + trans (auto)
  useEffect(() => {
    const summed = round2(num(miscellaneouss) + num(transportation));
    setManualExpenses(summed);
  }, [miscellaneouss, transportation]);

  // Recompute profit (when not manually edited)
  useEffect(() => {
    if (!profitEdited && touched) {
      setProfit(profitAuto(num(manualInvoice), num(manualPo), num(manualExpenses)));
    }
  }, [manualInvoice, manualPo, manualExpenses, profitEdited, touched]);

  const pi = row?.pi ?? '-';
  const cust = row?.customerName ?? '-';
  const sp = row?.salespersonName ?? salespersonName ?? '-';
  const invDisplay = toINR(row?.invoiceTotal);
  const poDisplay = toINR(row?.poTotal);
  const profitDisplay = toINR(row?.difference);

  const profitClass = useMemo(() => {
    const n = Number(row?.difference || 0);
    return n > 0
      ? 'text-green-600'
      : n < 0
      ? 'text-red-600'
      : 'text-gray-900';
  }, [row?.difference]);

  const handleSave = async () => {
    if (!pi || pi === '-') return alert('Missing PI');
    if (!month) return alert('Missing month');

    const cleanInvoice = Number(manualInvoice);
    const cleanPo = Number(manualPo);
    const cleanExpenses = Number(manualExpenses);
    const cleanProfit = Number(profit);

    const invoiceProfit = round2((manualInvoice - manualPo) / 1.18);
    const profitToSend = invoiceProfit - cleanExpenses;

    if (!isValidPositive(cleanInvoice))
      return alert('Enter a valid Invoice amount (> 0).');
    if (!isValidPositive(cleanPo))
      return alert('Enter a valid PO amount (> 0).');
    if (!isValidNonNegative(cleanExpenses))
      return alert('Enter a valid Extra Expenses amount (≥ 0).');

    try {
      const payload = {
        pi,
        month,
        invoice: round2(cleanInvoice),
        po: round2(cleanPo),
        expenses: round2(cleanExpenses),
        profit: round2(profitToSend),
        salespersonName: sp,
        customerName: cust,
        miscellaneous: round2(Number(miscellaneouss) || 0),
        transportation: round2(Number(transportation) || 0),
        notes: [ 
          (notes ?? '').trim(), 
          `Expenses: ₹${round2(cleanExpenses)}`
        ]
          .filter(Boolean)
          .join(' | '),
      };

      console.log('payload check', payload);

      await saveManualProfit(payload).unwrap();
      onClose?.();
    } catch (e) {
      const msg = e?.data?.message || e?.error || 'Failed to save values';
      alert(msg);
    }
  };

  if (saving) {
    onClose?.();
    return <Loader />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full sm:w-[560px] bg-white shadow-xl overflow-y-auto animate-slideIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <h3 className="text-lg font-semibold text-blue-900">
              Sales Summary {pi !== '-' ? `#${pi}` : ''}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 cursor-pointer text-gray-600 hover:text-red-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          {/* Context */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Info label="Salesperson" value={sp} />
            <Info label="Customer" value={cust} />
          </section>

          {/* Current Totals (read-only context) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Info label="Invoice Total (current)" value={invDisplay} />
            <Info label="PO Total (current)" value={poDisplay} />
            <Info
              label="Profit (current)"
              value={<span className={`font-semibold ${profitClass}`}>{profitDisplay}</span>}
            />
          </section>

          {/* Manual Overrides */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-blue-900">Manual Overrides</h4>

            {/* Invoice & PO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldNumber
                label="Manual Invoice (₹)"
                value={manualInvoice}
                onChange={(v) => {
                  setManualInvoice(v);
                  setTouched(true);
                }}
              />
              <FieldNumber
                label="Manual PO (₹)"
                value={manualPo}
                onChange={(v) => {
                  setManualPo(v);
                  setTouched(true);
                }}
              />
            </div>

            {/* Expense parts -> auto-summed */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <FieldNumber
                label="Miscellaneous (₹)"
                value={miscellaneouss}
                onChange={(v) => {
                  setMiscellaneouss(v);
                  setTouched(true);
                }}
              />
              <FieldNumber
                label="Transportation (₹)"
                value={transportation}
                onChange={(v) => {
                  setTransportation(v);
                  setTouched(true);
                }}
              />
            </div>

            {/* Profit (auto but editable) */}
            <div>
              <div className="flex items-center gap-2">
                <label className="block text-xs font-medium text-gray-600">
                  Profit (₹)
                </label>
                {profitEdited && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfit(profitAuto(manualInvoice, manualPo, manualExpenses));
                      setProfitEdited(false);
                      setTouched(true);
                    }}
                    className="text-xs text-blue-700 hover:underline"
                  >
                    Reset to auto (Invoice − PO − Expenses)
                  </button>
                )}
              </div>
              <input
                type="number"
                value={profit}
                onChange={(e) => {
                  setProfit(e.target.value === '' ? '' : Number(e.target.value));
                  setProfitEdited(true);
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add context for this manual entry"
              />
            </div>

            {/* Actions */}
            <div className="mt-2 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="inline-flex cursor-pointer items-center px-4 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={
                  saving ||
                  !isValidPositive(manualInvoice) ||
                  !isValidPositive(manualPo) ||
                  !isValidNonNegative(manualExpenses)
                }
                className="inline-flex cursor-pointer items-center px-4 py-2 rounded bg-blue-900 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* --------- helpers & tiny components ---------- */
function toINR(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

function Info({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 break-words">{value || '-'}</span>
    </div>
  );
}

function FieldNumber({ label, value, onChange }) {
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        type="number"
        value={value ?? 0}
        onChange={(e) => onChange(toNum(e.target.value))}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        step="0.01"
        min="0"
      />
    </div>
  );
}
