'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Target as TargetIcon,
  RefreshCw,
  Download,
  Share2,
  UploadCloud,
} from 'lucide-react';
import { useGetDashboardQuery } from '@/redux/features/api/zohoApi';
import Loader from '@/components/custom/ui/Loader';

/* ===============================
   Helpers
================================*/
const money = (n) =>
  (Number(n) || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function Pill({ children, active }) {
  return (
    <button
      className={`px-3 py-1.5 text-xs rounded-full font-semibold transition ${
        active
          ? 'bg-black text-white shadow'
          : 'bg-white text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

function IconRound({ children }) {
  return (
    <button className="h-9 w-9 rounded-full bg-white shadow-sm ring-1 ring-gray-200 grid place-items-center text-gray-700 hover:bg-gray-50 transition">
      {children}
    </button>
  );
}

function Badge({ ok, children }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
        ok
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-rose-50 text-rose-700 ring-rose-200'
      }`}
    >
      {ok ? (
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
      ) : (
        <span className="inline-block h-2 w-2 rounded-full bg-rose-600" />
      )}
      {children}
    </span>
  );
}

/* ===============================
   Component
================================*/
export default function NewReportDashboard() {
  const [metric, setMetric] = useState('realized'); // 'realized' | 'billed'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [invPage, setInvPage] = useState(1);
  const [poPage, setPoPage] = useState(1);
  const invPerPage = 25;
  const poPerPage = 25;

  // Reset pages when filters change
  useEffect(() => {
    setInvPage(1);
    setPoPage(1);
  }, [metric, startDate, endDate]);

  const queryArgs = useMemo(
    () => ({
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
      metric,
      inv_page: invPage,
      inv_per_page: invPerPage,
      po_page: poPage,
      po_per_page: poPerPage,
    }),
    [metric, startDate, endDate, invPage, invPerPage, poPage, poPerPage]
  );

  const { data, isFetching, isLoading, isError, refetch } = useGetDashboardQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });

  const totals = data?.totals || {};
  const monthly = data?.monthlyRevenue || [];
  const invoices = data?.invoices?.items || [];
  const invCtx = data?.invoices?.page_context || {};
  const pos = data?.purchaseOrders?.items || [];
  const poCtx = data?.purchaseOrders?.page_context || {};

  const totalValue = metric === 'billed' ? totals.billed : totals.realized;

  if (isLoading) return <Loader />;

  return (
    <div className="w-full bg-white text-gray-900">
      {/* ===== TOP BAR ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 pt-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800/90">
            Revenue Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <IconRound>
            <Share2 className="h-4 w-4" />
          </IconRound>
          <IconRound>
            <Download className="h-4 w-4" />
          </IconRound>
          <IconRound>
            <UploadCloud className="h-4 w-4" />
          </IconRound>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* ===== CONTROLS ===== */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 mt-4 gap-3">
        <div className="flex items-center gap-2">
          <Pill active={metric === 'realized'} onClick={() => setMetric('realized')}>
            Realized
          </Pill>
          <span onClick={() => setMetric('realized')} className="hidden" />
          <button
            onClick={() => setMetric('realized')}
            className="sr-only"
            aria-label="Realized"
          />
          <Pill active={metric === 'billed'} onClick={() => setMetric('billed')}>
            Billed
          </Pill>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <CalendarDays className="h-4 w-4 text-gray-600" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border-gray-200 text-sm px-2 py-1"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border-gray-200 text-sm px-2 py-1"
            />
          </label>

          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm shadow-sm ring-1 ring-gray-200">
            <CalendarDays className="h-4 w-4 text-gray-700" />
            <span className="text-gray-800">
              {data?.range?.start_date || '—'} → {data?.range?.end_date || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ===== KPI STRIP ===== */}
      <div className="px-4 sm:px-6 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-3xl shadow-sm ring-1 ring-gray-200 overflow-hidden"
        >
          <div className="bg-[radial-gradient(120%_120%_at_0%_0%,#eff6ff_0%,#eef2ff_45%,#f5f3ff_100%)] h-full p-5">
            <div className="text-sm text-gray-600">Total Revenue ({metric})</div>
            <div className="mt-1 text-4xl font-extrabold tracking-tight">
              {money(totalValue)}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Billed: <span className="font-medium text-gray-700">{money(totals.billed)}</span>{' '}
              · Realized:{' '}
              <span className="font-medium text-gray-700">{money(totals.realized)}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl shadow-sm ring-1 ring-gray-200 overflow-hidden"
        >
          <div className="bg-[radial-gradient(120%_120%_at_0%_0%,#ecfdf5_0%,#f0fdf4_40%,#f5f5f4_100%)] p-5 h-full">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TargetIcon className="h-4 w-4" />
              Target
            </div>
            <div className="mt-1 text-3xl font-bold">
              {totals?.target ? money(totals.target) : '—'}
            </div>
            <div className="mt-2">
              {totals?.target != null && (
                <Badge ok={!!totals?.targetAchieved}>
                  {totals?.targetAchieved ? 'Achieved' : 'Not achieved'}
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl shadow-sm ring-1 ring-gray-200 overflow-hidden"
        >
          <div className="bg-[radial-gradient(120%_120%_at_0%_0%,#fef3c7_0%,#ffedd5_45%,#fff7ed_100%)] p-5 h-full">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="mt-1 text-3xl font-bold">
              {totals?.targetProgressPct != null ? `${totals.targetProgressPct}%` : '—'}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Toward {totals?.target ? money(totals.target) : '—'}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== MONTHLY CHART ===== */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-4 sm:px-6 mt-6"
      >
        <div className="rounded-3xl ring-1 ring-black/5 shadow-sm overflow-hidden">
          <div className="bg-[#f6f7fb] px-4 py-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">
              Monthly revenue <span className="text-gray-500">({metric})</span>
            </div>
            <div className="flex items-center gap-2">
              <Pill active>Revenue</Pill>
            </div>
          </div>
          <div className="bg-white p-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ left: 6, right: 6, top: 6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <Tooltip formatter={(v) => money(v)} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#areaMain)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== TABLES ===== */}
      <div className="px-4 sm:px-6 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl bg-white ring-1 ring-gray-200 p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-lg font-semibold">Invoices</h2>
            {isFetching && <span className="text-xs text-gray-500">Loading…</span>}
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Invoice</th>
                  <th className="text-left py-2">Customer</th>
                  <th className="text-right py-2">Total</th>
                  <th className="text-right py-2">Balance</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((r) => (
                  <tr key={r.invoice_id} className="border-t border-gray-100">
                    <td className="py-2">{r.date}</td>
                    <td className="py-2">{r.invoice_number}</td>
                    <td className="py-2">{r.customer_name}</td>
                    <td className="py-2 text-right">{money(r.total)}</td>
                    <td className="py-2 text-right">{money(r.balance)}</td>
                    <td className="py-2">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!invoices.length && (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={6}>
                      No invoices in this range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {invCtx.page || invPage}</span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 rounded-full ring-1 ring-gray-200 disabled:opacity-50 hover:bg-gray-50"
                disabled={(invCtx.page || invPage) <= 1}
                onClick={() => setInvPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <button
                className="px-3 py-1.5 rounded-full ring-1 ring-gray-200 disabled:opacity-50 hover:bg-gray-50"
                disabled={invCtx.has_more_page === false}
                onClick={() => setInvPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>

        {/* Purchase Orders */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-white ring-1 ring-gray-200 p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-lg font-semibold">Purchase Orders</h2>
            {isFetching && <span className="text-xs text-gray-500">Loading…</span>}
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">PO</th>
                  <th className="text-left py-2">Vendor</th>
                  <th className="text-right py-2">Total</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {pos.map((r) => (
                  <tr key={r.purchaseorder_id} className="border-t border-gray-100">
                    <td className="py-2">{r.date}</td>
                    <td className="py-2">{r.purchaseorder_number}</td>
                    <td className="py-2">{r.vendor_name}</td>
                    <td className="py-2 text-right">{money(r.total)}</td>
                    <td className="py-2">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!pos.length && (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={5}>
                      No POs in this range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {poCtx.page || poPage}</span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 rounded-full ring-1 ring-gray-200 disabled:opacity-50 hover:bg-gray-50"
                disabled={(poCtx.page || poPage) <= 1}
                onClick={() => setPoPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <button
                className="px-3 py-1.5 rounded-full ring-1 ring-gray-200 disabled:opacity-50 hover:bg-gray-50"
                disabled={poCtx.has_more_page === false}
                onClick={() => setPoPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== ERROR ===== */}
      {isError && (
        <div className="px-4 sm:px-6 mt-4">
          <div className="rounded-2xl bg-rose-50 text-rose-700 p-3 ring-1 ring-rose-200">
            Failed to load dashboard. Please check Zoho credentials/range and try again.
          </div>
        </div>
      )}
    </div>
  );
}
