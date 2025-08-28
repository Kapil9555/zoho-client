'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, Download, Share2, UploadCloud, ChevronDown,
  Star, ExternalLink, Filter, MoreHorizontal,
  BarChart3, Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  LabelList,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

/* ===============================
   Helpers
================================*/
const money = (n) =>
  (n ?? 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const brand = {
  Dribbble: { text: 'D', bg: 'bg-pink-100', fg: 'text-pink-600' },
  Instagram: { text: 'IG', bg: 'bg-gradient-to-br from-yellow-200 to-pink-200', fg: 'text-pink-700' },
  Behance: { text: 'Be', bg: 'bg-blue-100', fg: 'text-blue-700' },
  Google: { text: 'G', bg: 'bg-emerald-100', fg: 'text-emerald-700' },
  Other: { text: '•', bg: 'bg-gray-200', fg: 'text-gray-700' },
};

function BrandPill({ name }) {
  const b = brand[name] || brand.Other;
  return (
    <span
      className={[
        'inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-black/5 text-sm font-semibold',
        b.bg,
        b.fg,
      ].join(' ')}
      title={String(name)}
    >
      {b.text}
    </span>
  );
}

function FiltersPill({ children = 'Filters' }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm shadow-sm ring-1 ring-gray-200">
      <Filter className="h-4 w-4 text-gray-700" />
      <span className="text-gray-800">{children}</span>
    </button>
  );
}

function AvatarTiny({ text }) {
  return (
    <span className="inline-flex h-6 w-6 -mt-2 items-center justify-center rounded-full bg-white ring-1 ring-gray-300 text-[10px] font-bold">
      {text}
    </span>
  );
}

/* ===============================
   Mock Data (can be wired to API)
================================*/
const users = [
  { id: 1, name: 'Armin A.', avatar: 'A', revenue: 209633, share: 39.63, leads: 118, kpi: 0.84, w: { win: 12, lose: 29 } },
  { id: 2, name: 'Mikasa A.', avatar: 'M', revenue: 156841, share: 29.65, leads: 103, kpi: 0.89, w: { win: 21, lose: 33 } },
  { id: 3, name: 'Eren Y.', avatar: 'E', revenue: 117115, share: 22.14, leads: 84, kpi: 0.79, w: { win: 7, lose: 15 } },
  { id: 4, name: 'C', avatar: 'C', revenue: 45386, share: 8.58, leads: 22, kpi: 0.71, w: { win: 3, lose: 9 } },
];

const summary = {
  revenue: 528976.82,
  deltaPct: -7.9,
  deltaAbs: -27335.09,
  prev: 501641.73,
  range: 'Sep 1 – Nov 30, 2023',
  timeframeOn: true,
};

const kpis = [
  { label: 'Deals', main: '256', sub: '+5' },
  { label: 'Value', main: '528k', sub: '▼ 7.9%', highlight: true },
  { label: 'Win rate', main: '44%', sub: '▲ 1.2%' },
];

const platforms = [
  { name: 'Dribbble', revenue: 227459, pct: 43 },
  { name: 'Instagram', revenue: 142823, pct: 27 },
  { name: 'Behance', revenue: 89935, pct: 11 },
  { name: 'Google', revenue: 37028, pct: 7 },
];

const referrers = [
  { key: 'Behance', amt: 4, logo: 'Behance', hatch: true },
  { key: 'Dribbble', amt: 9, logo: 'Dribbble', hatch: false },
  { key: 'Google', amt: 6, logo: 'Google', hatch: false },
  { key: 'Instagram', amt: 3, logo: 'Instagram', hatch: false },
  { key: 'Other', amt: 9, logo: 'Other', hatch: true },
];

const monthlyPlatform = [
  { m: 'Sep', value: 6901, avatar: 'A' },
  { m: 'Oct', value: 11035, avatar: 'M' },
  { m: 'Nov', value: 9288, avatar: 'E' },
];

const lineDynamic = [
  { w: 'W1', value: 12 },
  { w: 'W3', value: 19 },
  { w: 'W5', value: 17 },
  { w: 'W7', value: 23 },
  { w: 'W9', value: 21 },
  { w: 'W11', value: 35 },
];

/* ===============================
   Custom label for bars (pink tags)
================================*/
const ValueTag = (props) => {
  const { x, y, value } = props;
  if (!value) return null;
  return (
    <g transform={`translate(${x},${y - 18})`}>
      <foreignObject x={-22} y={-6} width="76" height="20">
        <div className="inline-flex items-center justify-center rounded-full bg-rose-600 px-2 py-[2px] text-[11px] font-semibold text-white shadow">
          {money(value)}
        </div>
      </foreignObject>
    </g>
  );
};

/* ===============================
   Main Component
================================*/
export default function NewReportDashboard() {
  return (
    <div className="w-full bg-white text-gray-900">
      {/* ===== TOP BAR ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 pt-4">
        <div className="flex items-center gap-2">
          <button className="h-8 w-8 grid place-items-center rounded-full bg-white ring-1 ring-gray-200 shadow-sm">
            <Plus className="h-4 w-4 text-gray-700" />
          </button>
          {users.slice(0, 3).map((u) => (
            <UserChip key={u.id} name={u.name} avatar={u.avatar} />
          ))}
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white ring-1 ring-gray-200 shadow-sm text-sm font-semibold text-gray-700">C</span>
        </div>
        <div className="flex items-center gap-2">
          <IconRound><Share2 className="h-4 w-4" /></IconRound>
          <IconRound><Download className="h-4 w-4" /></IconRound>
          <IconRound><UploadCloud className="h-4 w-4" /></IconRound>
        </div>
      </div>

      {/* ===== TITLE + TIMEFRAME ===== */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 mt-3">
        <h1 className="text-4xl font-semibold text-gray-800/70">New report</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <span className="relative inline-flex h-5 w-9 items-center">
              <input type="checkbox" className="peer sr-only" defaultChecked={summary.timeframeOn} />
              <span className="absolute inset-0 rounded-full bg-gray-300 peer-checked:bg-black transition-colors" />
              <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white peer-checked:translate-x-4 transition-transform" />
            </span>
            Timeframe
          </label>
          <button className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm shadow-sm ring-1 ring-gray-200">
            <CalendarDays className="h-4 w-4 text-gray-700" />
            <span>{summary.range}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>



      {/* ===== REVENUE + CARDS ROW ===== */}
      <div className="px-4 sm:px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 ">
        {/* Revenue */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="lg:col-span-6 bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-5">
          <div className="text-sm font-semibold text-gray-800">Revenue</div>
          <div className="mt-1 flex items-end gap-3">
            <div className="text-5xl font-extrabold tracking-tight">{money(summary.revenue)}</div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-600/10 text-rose-700 text-xs px-2 py-1 font-semibold">
                <span className="inline-block h-2 w-2 rounded-full bg-rose-600" /> {summary.deltaPct}%
              </span>
              <span className="inline-flex items-center rounded-full bg-rose-600 text-white text-xs px-2 py-1 font-semibold">
                {money(Math.abs(summary.deltaAbs))}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">vs prev. {money(summary.prev)}
            <span className="inline-flex items-center ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">Jun 1 – Aug 31, 2023</span>
          </div>
        </motion.div>

        {/* Top sales */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="lg:col-span-3 bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-5">
          <div className="text-sm text-gray-500">Top sales</div>
          <div className="mt-2 text-3xl font-bold">72</div>
          <div className="mt-2 flex items-center gap-2 text-sm font-medium"><AvatarCircle text="M" /> Mikasa</div>
          <button className="mt-4 ml-auto inline-flex items-center gap-2 text-sm text-gray-700 hover:text-black">
            Details <ExternalLink className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Best deal */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="lg:col-span-3 bg-black text-white rounded-2xl shadow-sm p-5 relative">
          <div className="text-sm text-gray-300">Best deal</div>
          <button className="absolute right-4 top-4 text-gray-400 hover:text-white"><Star className="h-4 w-4" /></button>
          <div className="mt-2 text-3xl font-bold">{money(42300)}</div>
          <div className="mt-2 text-sm text-gray-200">Rolf Inc.</div>
          <button className="mt-4 ml-auto inline-flex items-center gap-2 text-sm text-gray-200 hover:text-white">
            Details <ExternalLink className="h-4 w-4" />
          </button>
        </motion.div>
      </div>

      {/* KPI pills */}
      <div className="px-4 sm:px-6 mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-4 flex items-center justify-between`}>
            <div>
              <div className="text-sm text-gray-500">{k.label}</div>
              <div className="text-2xl font-bold mt-1">{k.main}</div>
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Ownership ribbon */}
      <div className="px-4 sm:px-6 mt-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {users.map((u, idx) => (
            <div key={u.id} className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm shadow-sm ring-1 ${idx === users.length - 1 ? 'bg-gray-900 text-white ring-gray-900' : 'bg-white ring-gray-200'}`}>
              <AvatarCircle text={u.avatar} dark={idx === users.length - 1} />
              <span className="font-medium">{money(u.revenue)}</span>
              <span className="text-gray-500/80 ml-1">{u.share}%</span>
            </div>
          ))}
          <button className="ml-auto inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-1.5 text-sm shadow">
            Details <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ===== LOWER GRID ===== */}
      <div className="px-4 sm:px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Platform list */}
            <div className="rounded-3xl bg-[#f1f2f4] p-3 ring-1 ring-black/5 shadow-sm">
              <div className="mb-2 flex items-center justify-between px-1">
                <button className="h-9 w-9 grid place-items-center rounded-xl bg-white ring-1 ring-gray-200 text-gray-700">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                <FiltersPill />
              </div>
              <div className="space-y-2">
                {platforms.map((p) => (
                  <div key={p.name} className="flex items-center justify-between rounded-[18px] bg-white px-3 py-2 ring-1 ring-black/5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <BrandPill name={p.name} />
                      <span className="text-[10px] font-medium text-gray-800">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold">{money(p.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deals amount by referrer */}
            <div className="rounded-3xl bg-[#f1f2f4] p-3 ring-1 ring-black/5 shadow-sm">
              <div className="mb-2 flex items-center justify-between px-1">
                <button className="h-9 w-9 grid place-items-center rounded-xl bg-white ring-1 ring-gray-200 text-gray-700">
                  <BarChart3 className="h-5 w-5" />
                </button>
                <FiltersPill />
              </div>
              <div className="h-56 ">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={referrers} barCategoryGap={70} margin={{ top: 6, right: 8, left: 8, bottom: 6 }}>
                    <defs>
                      <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                        <rect width="3" height="6" fill="#d9dde5" />
                      </pattern>
                    </defs>
                    <CartesianGrid vertical={false} horizontal={false} />
                    <XAxis dataKey="key" tick={false} axisLine={false} />
                    <YAxis hide domain={[0, 10]} />
                    <Tooltip content={null} cursor={false} />
                    <Bar dataKey="amt" radius={[12, 12, 0, 0]} stroke="#d1d5db" strokeWidth={1} maxBarSize={50} minPointSize={60} isAnimationActive={false}>
                      <LabelList dataKey="logo" content={(props) => {
                        const { x, y, width, height, value } = props;
                        const cx = x + width / 2; const cy = y + Math.max(height, 60) / 2;
                        return (
                          <g transform={`translate(${cx - 12},${cy - 12})`}>
                            <foreignObject width="24" height="24">
                              <div className="grid place-items-center">
                                <BrandPill name={value} />
                              </div>
                            </foreignObject>
                          </g>
                        );
                      }} />
                      {referrers.map((r, i) => (
                        <Cell key={i} fill={r.hatch ? 'url(#hatch)' : '#ffffff'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm px-1">
                <span className="font-semibold text-gray-800">Deals amount</span>{' '}
                <span className="text-gray-500">by referrer category ▾</span>
              </div>
            </div>
          </div>

          {/* Platform value */}
          <div className="rounded-3xl ring-1 ring-black/5 shadow-sm overflow-hidden h-full">
            <div className="bg-[#f1f2f4] px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700">
                <BrandPill name="Dribbble" />
                <span className="text-sm"><span className="text-gray-500">Platform value</span>{' '}<span className="font-semibold text-gray-800">Dribbble ▾</span></span>
              </div>
              <div className="flex items-center gap-2">
                <TabPill active>Revenue</TabPill>
                <TabPill>Leads</TabPill>
                <TabPill>W/L</TabPill>
              </div>
            </div>

            <div className="grid grid-cols-12 h-full">
              <div className="col-span-4 bg-rose-600 text-white p-4 rounded-tr-[48px]">
                <div className="mt-6 space-y-4 text-sm">
                  <div>
                    <div className="opacity-85">Revenue</div>
                    <div className="text-lg font-bold">{money(18552)}</div>
                  </div>
                  <div>
                    <div className="opacity-85">Leads</div>
                    <div className="font-semibold">373 <span className="opacity-80">97/276</span></div>
                  </div>
                  <div>
                    <div className="opacity-85">Win/lose</div>
                    <div className="font-semibold">16% <span className="opacity-80">51/318</span></div>
                  </div>
                </div>
              </div>

              <div className="col-span-8 bg-white px-3 pt-3 flex flex-col justify-center w-full">
                <div className="h-[70%] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyPlatform} barCategoryGap="30%">
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]} maxBarSize={36} fill="#e5e7eb">
                        <LabelList dataKey="value" content={<ValueTag />} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between px-4 pb-4">
                  {monthlyPlatform.map((m) => (
                    <AvatarTiny key={m.m} text={m.avatar} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <Card className="p-4">
            <div className="grid grid-cols-12 text-[12px] text-gray-500 px-2 mb-2">
              <div className="col-span-4">Sales</div>
              <div className="col-span-3">Revenue</div>
              <div className="col-span-2 text-center">Leads</div>
              <div className="col-span-1 text-center">KPI</div>
              <div className="col-span-2 text-center">W/L</div>
            </div>

            <div className="space-y-2">
              {users.slice(0, 2).map((u, idx) => {
                const leadsA = (u.leadsPills && u.leadsPills[0]) ?? (idx === 0 ? 41 : 54);
                return (
                  <div key={u.id} className="grid grid-cols-12 items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-md px-3 py-2 ring-1 ring-black/5 shadow">
                    <div className="col-span-4 flex items-center gap-2">
                      <AvatarCircle text={u.avatar} />
                      <span className="font-medium">{u.name}</span>
                    </div>
                    <div className="col-span-3 font-semibold">{money(u.revenue)}</div>
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-black px-2 text-xs font-semibold text-white">{leadsA}</span>
                    </div>
                    <div className="col-span-1 text-center">{u.kpi}</div>
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-semibold text-gray-800">{u.w.lose}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow ring-1 ring-black/5">Top sales</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow ring-1 ring-black/5">Sales streak</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow ring-1 ring-black/5">Top review</span>
              <div className="ml-auto flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-rose-600/90 text-white text-sm px-2 py-1 shadow">3</span>
                <span className="inline-flex items-center justify-center rounded-full bg-rose-600 text-white text-sm px-3 py-1 shadow">{money(156841)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="bg-[radial-gradient(120%_120%_at_0%_0%,#ffe4e6_0%,#fdf2f8_40%,#ede9fe_100%)]">
              <div className="px-4 pt-3">
                <div className="text-sm font-semibold text-gray-800">Work with platforms</div>
              </div>

              <div className="px-4 py-3 grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-6 rounded-2xl p-4 ring-1 ring-black/5 bg-white/70" style={{
                  background: 'linear-gradient(90deg,rgba(255,255,255,.7) 0 65%, rgba(255,255,255,.6) 0), repeating-linear-gradient(135deg, #f5f5f7 0 10px, #ececf1 10px 20px)',
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <BrandPill name="Dribbble" />
                    <span className="font-medium">Dribbble</span>
                  </div>
                  <div className="text-[34px] font-bold leading-none">45.3% <span className="text-gray-400 text-xl align-top">{money(71048)}</span></div>
                </div>

                <div className="col-span-12 md:col-span-3 rounded-2xl p-4 ring-1 ring-black/5 bg-white/70">
                  <div className=" gap-2 mb-1">
                    <BrandPill name="Instagram" />
                    <span className="font-medium">Instagram</span>
                  </div>
                  <div className="text-sm text-gray-800">28.1% <span className="text-gray-400">{money(44072)}</span></div>
                </div>

                <div className="col-span-12 md:col-span-3 rounded-2xl p-4 ring-1 ring-black/5" style={{ background: 'repeating-linear-gradient(135deg,#ffffff 0 12px,#f3f4f6 12px 24px)' }}>
                  <div className=" gap-2 mb-1">
                    <BrandPill name="Google" />
                    <span className="font-medium">Google</span>
                  </div>
                  <div className="text-sm text-gray-800">14.1% <span className="text-gray-400">{money(8469)}</span></div>
                </div>

                <div className="col-span-12 md:col-span-4 rounded-2xl p-3 ring-1 ring-black/5 bg-white/80">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-gray-300 text-xs font-semibold">☐</span>
                    <span className="font-medium">Other</span>
                    <span className="ml-auto text-sm text-gray-800">7.1% <span className="text-gray-400">{money(11135)}</span></span>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="text-sm font-semibold text-gray-800 mb-1">Sales dynamic</div>
                <div className="rounded-2xl p-3 ring-1 ring-black/5 bg-white/65">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={lineDynamic} margin={{ left: 6, right: 6, top: 6, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaRed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.18} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.04} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="w" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip content={null} cursor={{ strokeDasharray: '4 4' }} />
                        <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} fill="url(#areaRed)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 text-sm">
                  <AvatarCircle text="E" />
                  <span className="font-medium">Eren Y.</span>
                  <span className="ml-auto">{money(117115)}</span>
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-black px-2 text-xs font-semibold text-white">22</span>
                  <span>0.79</span>
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-black px-2 text-xs font-semibold text-white">32%</span>
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-semibold text-gray-800">15</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   Sub Components
================================*/
function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 ${className}`}>{children}</div>;
}

function IconRound({ children }) {
  return (
    <button className="h-9 w-9 rounded-full bg-white shadow-sm ring-1 ring-gray-200 grid place-items-center text-gray-700 hover:bg-gray-50">
      {children}
    </button>
  );
}

function UserChip({ name, avatar }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm shadow-sm ring-1 ring-gray-200">
      <AvatarCircle text={avatar} />
      <span className="font-medium text-gray-800">{name}</span>
    </div>
  );
}

function AvatarCircle({ text = '?', dark = false }) {
  return (
    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${dark ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}>
      {text}
    </span>
  );
}

function TabPill({ children, active }) {
  return (
    <button className={`px-3 py-1.5 text-xs rounded-full font-semibold ${active ? 'bg-black text-white' : 'bg-white text-gray-800 ring-1 ring-gray-200'}`}>{children}</button>
  );
}
