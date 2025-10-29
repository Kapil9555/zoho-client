'use client';

import { FileText, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useGetManualProfitByPiMonthQuery, useGetManualProfitsByPiQuery, useUpsertManualProfitMutation } from '@/redux/features/api/zohoApi';
import Loader from '@/components/custom/ui/Loader';




export default function SalesReportDrawer({ open, onClose, row, month, salespersonName, invoicesByPiDate }) {

  // console.log("row check invoicesByPiDate", invoicesByPiDate)


  if (!open) return null;


  function getMonthKey(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // ensures 01–12
    return `${year}-${month}`; // same as your DB format
  }


  // console.log("row check rowrowrowrow", row)

  const round2 = (n) => Number.isFinite(Number(n)) ? Math.round(Number(n) * 100) / 100 : 0;

  const profitAuto = (invoiceTotal, poTotal, extraExpenses) => {
    const inv = Number(invoiceTotal) || 0;
    const po = Number(poTotal) || 0;
    const exp = Number(extraExpenses) || 0;
    return round2(inv - po - exp);
  };


  const isValidPositive = (v) => Number.isFinite(Number(v)) && Number(v) > 0;
  const isValidNonNegative = (v) => Number.isFinite(Number(v)) && Number(v) >= 0;



  // --- NEW: helper to read incoming gross profit safely ---
  const getIncomingGross = (r) => {
    return Number.isFinite(Number(r)) ? Number(r) : 0;
  };



  const [manualInvoice, setManualInvoice] = useState(0);
  // const [manualInvoice, setManualInvoice] = useState(row?.invoiceTotal != null ? Number(row.invoiceTotal) : 0);

  const [manualPo, setManualPo] = useState(0);
  // const [manualPo, setManualPo] = useState(row?.poTotal != null ? Number(row.poTotal) : 0);


  const [miscellaneouss, setMiscellaneouss] = useState(0);
  const [transportation, setTransportation] = useState(0);


  const [manualExpenses, setManualExpenses] = useState(0);

  // --- CHANGED: start with incoming gross profit ---
  const [profit, setProfit] = useState(0);

  // const [profit, setProfit] = useState(getIncomingGross(row));

  const [profitEdited, setProfitEdited] = useState(false);


  // --- NEW: only recalc after user changes something ---
  const [touched, setTouched] = useState(false);


  const [notes, setNotes] = useState('');

  const [saveManualProfit, { isLoading: saving }] = useUpsertManualProfitMutation();


  const { data, isLoading: monthLoading } = useGetManualProfitByPiMonthQuery({
    pi: row?.pi,
    month: getMonthKey(invoicesByPiDate?.date || new Date()),
  });



  // console.log("transportation",transportation)
  // console.log("miscellaneouss",miscellaneouss)

  // console.log("monthData check", monthData)
  // console.log("datadata data", data)



  const manByPi = data?.items?.[0]


  // Reset when row/month/open changes
  useEffect(() => {
    if (manByPi) {

      // console.log("running check",manByPi)


      const baseInv = manByPi?.invoice ? Number(manByPi?.invoice) : 0;
      const basePo = manByPi?.po ? Number(manByPi?.po) : 0;
      const baseMisc = Number(manByPi?.miscellaneous) || 0;
      const baseTrans = Number(manByPi?.transportation) || 0;
      const summed = round2(baseMisc + baseTrans);

      const trans = round2(Number(manByPi?.transportation) || 0);
      const misc = round2(Number(manByPi?.miscellaneous) || 0);

      // console.log("transportation check",manByPi?.transportation);
      // console.log("misc check",manByPi?.miscellaneous);



      const rowNotes = manByPi?.notes || '';
      const profitCal = (Number(manByPi?.invoice) - Number(manByPi?.po) - summed)

      setManualInvoice(baseInv);
      setManualPo(basePo);
      setMiscellaneouss(baseMisc);
      setTransportation(baseTrans);
      setManualExpenses(summed);

      // show incoming gross FIRST
      setProfit(getIncomingGross(profitCal));
      setProfitEdited(false);
      setTouched(false);

      setNotes(rowNotes);

    }
  }, [manByPi]);


  const num = (v, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };

  // Keep manualExpenses = misc + trans (auto)
  useEffect(() => {
    const summed = round2(num(miscellaneouss) + num(transportation));
    setManualExpenses(summed);
    // if (manByPi) {
    // }
  }, [miscellaneouss, transportation]);


  // Recompute profit (when not manually edited)
  useEffect(() => {
    if (!profitEdited && touched) {
      setProfit(profitAuto(num(manualInvoice), num(manualPo), num(manualExpenses)));
    }
  }, [manualInvoice, manualPo, manualExpenses, profitEdited, touched]);


  // console.log("profit check", profit)
  // console.log("manualExpenses", manualExpenses)
  // console.log("miscellaneouss", (miscellaneouss + transportation))


  const pi = row?.pi ?? '-';
  const cust = row?.customerName ?? '-';
  const sp = row?.salespersonName ?? salespersonName ?? '-';

  const invDisplay = toINR(row?.invoiceTotal);
  const poDisplay = toINR(row?.poTotal);
  const profitDisplay = toINR(row?.difference);


  const profitClass = useMemo(() => {
    const n = Number(row?.difference || 0);
    return n > 0 ? 'text-green-600' : n < 0 ? 'text-red-600' : 'text-gray-900';
  }, [row?.difference]);



  const handleSave = async () => {
    if (!pi || pi === '-') return alert('Missing PI');
    if (!month) return alert('Missing month');

    // helper
    const addGST = (amount) => round2((Number(amount) || 0) * 1.18);

    // --- with GST (stored/fallback values)
    const manualInvoiceWithGST =
      Number(manualInvoice) > 0 ? Number(manualInvoice) : addGST(row?.invoiceTotal);

    const manualPoWithGST =
      Number(manualPo) > 0 ? Number(manualPo) : addGST(row?.poTotal);

    const cleanExpenses = Number(manualExpenses);
    const cleanProfitInput = Number(profit);

    // --- prevent submit if both still 0
    if (manualInvoiceWithGST <= 0 && manualPoWithGST <= 0) {
      return alert('Invoice and PO values cannot both be zero. Please enter valid amounts.');
    }

    // --- convert back to ex-GST
    const invoiceExGST = round2(manualInvoiceWithGST / 1.18);
    const poExGST = round2(manualPoWithGST / 1.18);

    // --- profit (always ex-GST)
    const autoProfitExGST = round2(invoiceExGST - poExGST - cleanExpenses);

    const profitToSend = profitEdited
      ? round2(cleanProfitInput) // if user overrides, take directly (assumed ex-GST already)
      : autoProfitExGST;

    if (!isValidPositive(manualInvoiceWithGST)) return alert('Enter a valid Invoice amount (> 0).');
    if (!isValidPositive(manualPoWithGST)) return alert('Enter a valid PO amount (> 0).');
    if (!isValidNonNegative(cleanExpenses)) return alert('Enter a valid Extra Expenses amount (>= 0).');

    try {
      const payload = {
        pi,
        month,
        invoice: round2(manualInvoiceWithGST), // stored as incl. GST
        po: round2(manualPoWithGST),           // stored as incl. GST
        expenses: round2(cleanExpenses),
        profit: round2(profitToSend),          // stored as ex-GST
        salespersonName: sp,
        customerName: cust,
        miscellaneous: round2(Number(miscellaneouss) || 0),
        transportation: round2(Number(transportation) || 0),
        notes: [(notes ?? '').trim(), `Expenses: ₹${round2(cleanExpenses)}`]
          .filter(Boolean)
          .join(' | '),
      };

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
        className="absolute right-0 top-0 h-full w-full sm:w-[700px] bg-white shadow-xl overflow-y-auto animate-slideIn"
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
          <button onClick={onClose} className="p-1 cursor-pointer text-gray-600 hover:text-red-500">
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
            <Info label="Invoice Total (current Ex. GST)" value={invDisplay} />
            <Info label="PO Total (current Ex. GST)" value={poDisplay} />
            <Info
              label="Profit (current Ex. GST)"
              value={<span className={`font-semibold ${profitClass}`}>{profitDisplay}</span>}
            />
          </section>


          {
            manByPi &&
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Info label="Invoice Total (current Incl. GST)" value={toINR(manByPi?.invoice) || toINR(row?.invoiceTotal)} />
              <Info label="PO Total (current Incl. GST)" value={toINR(manByPi?.po) || toINR(row?.invoiceTotal)} />
              <Info
                label="Profit (current Incl. GST)"
                value={<span className={`font-semibold ${profitClass}`}>{toINR((Number(manByPi?.invoice || 0) - Number(manByPi?.po || 0)) - (manualExpenses || 0))}</span>}
              />
            </section>
          }

          {/* Manual Overrides */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-blue-900">Manual Overrides</h4>

            {/* Invoice & PO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldNumber
                label="Manual Invoice (Incl. GST)"
                value={manualInvoice}
                onChange={(v) => { setManualInvoice(v); setTouched(true); }}
              />
              <FieldNumber
                label="Manual PO (Incl. GST)"
                value={manualPo}
                onChange={(v) => { setManualPo(v); setTouched(true); }}
              />
            </div>

            {/* Expense parts -> auto-summed */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <FieldNumber
                label="Miscellaneous"
                value={miscellaneouss}
                onChange={(v) => { setMiscellaneouss(v); setTouched(true); }}
              />
              <FieldNumber
                label="Transportation"
                value={transportation}
                onChange={(v) => { setTransportation(v); setTouched(true); }}
              />
            </div>

            {/* Profit (auto but editable) */}
            <div>
              <div className="flex items-center gap-2 justify-between mb-1">
                <label className="block text-md font-medium text-gray-600">
                  Profit
                </label>
                {profitEdited && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfit(profitAuto(manualInvoice, manualPo, manualExpenses));
                      setProfitEdited(false);
                      setTouched(true);
                    }}
                    className="text-md cursor-pointer text-blue-700 hover:underline"
                  >
                    Reset to auto (Invoice’ PO ’ Expenses)
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
              <label className="block text-md font-medium text-gray-600 mb-1">Notes (optional)</label>
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
                  saving
                }
                className="inline-flex cursor-pointer items-center px-4 py-2 rounded bg-blue-900 text-white text-sm font-medium hover:bg-blue-700 "
              >
                {saving ? 'Saving' : 'Save'}
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
    <div className="flex flex-col ">
      <span className="text-sm font-medium text-gray-500 whitespace-nowrap">{label}</span>
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
      <label className="block text-md font-medium text-gray-600 mb-1">{label}</label>
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




