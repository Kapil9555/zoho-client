'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    PieChart,
    Pie,
    Cell,
    Rectangle,
} from "recharts";
import { MoreVertical, ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, IndianRupee, Target, TrendingUp, Trophy, Wallet } from "lucide-react";
import {
    useGetCrmInvoicesQuery,
    useGetCrmPurchaseOrdersQuery,
    useGetSalesMembersQuery,
    useGetSalesMeQuery,
} from "@/redux/features/api/zohoApi";
import Loader from "@/components/custom/ui/Loader";
import { useRouter } from "next/navigation";

/* ================= THEME ================= */
const THEME = "#3E57A7";     // Achieved
const THEME_600 = "#566DB9";  // Over Target
const THEME_300 = "#9AABE0";  // Remaining to Target
const TRACK = "#F3F4F6";

const now = new Date();
const demoMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
const days = Array.from({ length: 13 }, (_, i) => i + 1);

/* =============== Small UI bits =============== */
const Dot = ({ color }) => (
    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
);

function Delta({ value, positive = true }) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs font-medium ${positive ? "border-[#cfd6f1] text-[#3E57A7] bg-[#eef1fb]" : "border-red-200 text-red-600 bg-red-50"
                }`}
        >
            {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {value}
        </span>
    );
}

function StatusBadge({ status }) {
    const map = {
        Paid: { bg: "bg-green-50", text: "text-green-700", ring: "ring-green-200" },
        Pending: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" },
        Overdue: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
        sent: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200" },
    };
    const s = map[status] || map[status?.toLowerCase()] || { bg: "bg-gray-50", text: "text-gray-700", ring: "ring-gray-200" };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.bg} ${s.text} ring-1 ${s.ring}`}>
            {status || "-"}
        </span>
    );
}

/* Tooltip for per-PI profit chart */
function TopPiTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const p = payload[0]?.payload || {};
    const margin = p.invoiceTotal ? Math.round((p.profitRaw / p.invoiceTotal) * 100) : 0;

    return (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
            <div className="font-medium text-gray-900">{p.customerName || "—"}</div>
            <div className="mt-1 grid gap-1">
                <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Invoice</span>
                    <span className="font-semibold text-gray-900">₹{(p.invoiceTotal || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-gray-500">PO</span>
                    <span className="font-semibold text-gray-900">₹{(p.poTotal || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Profit</span>
                    <span className="font-semibold text-gray-900">
                        ₹{(p.profitRaw || 0).toLocaleString("en-IN")} ({margin}%)
                    </span>
                </div>
            </div>
        </div>
    );
}

/* NEW: tooltip for team stacked bars (All) */
function TeamBarsTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const p = payload[0]?.payload || {};
    const pct = p.target ? Math.round((p.achieved / p.target) * 100) : 0;

    return (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
            <div className="font-medium text-gray-900">{p.name}</div>
            <div className="mt-1 grid gap-1">
                <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Target</span>
                    <span className="font-semibold text-gray-900">₹{(p.target || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Achieved</span>
                    <span className="font-semibold text-gray-900">₹{(p.achieved || 0).toLocaleString("en-IN")}</span>
                </div>
                {p.remaining > 0 && (
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Remaining</span>
                        <span className="font-semibold text-gray-900">₹{p.remaining.toLocaleString("en-IN")}</span>
                    </div>
                )}
                {p.over > 0 && (
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Over Target</span>
                        <span className="font-semibold text-gray-900">₹{p.over.toLocaleString("en-IN")}</span>
                    </div>
                )}
                <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Achievement</span>
                    <span className="font-semibold text-gray-900">{pct}%</span>
                </div>
            </div>
        </div>
    );
}

function ReturningCustomersCard({
    title = "Returning Customers",
    totalLabel = "100%",
    outerPercent = 100,
    innerPercent = 62,
    outerLabel = "Target",
    outerAmount = "—",
    innerLabel = "Total Profit",
    innerAmount = "—",
    totalSales = "0.00",
    className = "",
    pureProfit = 0,
    topLineLabel = "Monthly Target Top Line",
    topLineAmount = 0,

    topLineAch = "Monthly Target Top Line Achieved",

    bottomLineLabel = "Monthly Target Bottom Line",

    bottomLineAchLabel = "Monthly Target Bottom Line",
}) {
    const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

    const OUT = clamp(outerPercent);
    const INN = clamp(innerPercent);

    const START = 90;
    const FULL_END = START - 360;
    const endFor = (pct) => START - (pct >= 100 ? 359.999 : pct * 3.6);

    const [hoverLabel, setHoverLabel] = useState(null);
    const wrapRef = useRef(null);

    const INNER_MIN = 62;
    const INNER_MAX = 78;
    const OUTER_MIN = 86;
    const OUTER_MAX = 104;

    const computeHover = useCallback(
        (clientX, clientY) => {
            const el = wrapRef.current;
            if (!el) return;

            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            const dx = clientX - cx;
            const dy = clientY - cy;
            const r = Math.sqrt(dx * dx + dy * dy);

            if (r >= INNER_MIN && r <= INNER_MAX) {
                setHoverLabel(`${INN}%`);
            } else if (r >= OUTER_MIN && r <= OUTER_MAX) {
                setHoverLabel(`${OUT}%`);
            } else {
                setHoverLabel(null);
            }
        },
        [INN, OUT]
    );

    const handleMouseMove = useCallback(
        (e) => computeHover(e.clientX, e.clientY),
        [computeHover]
    );

    const handleMouseLeave = useCallback(() => setHoverLabel(null), []);

    const handleTouchMove = useCallback(
        (e) => {
            const t = e.touches?.[0];
            if (t) computeHover(t.clientX, t.clientY);
        },
        [computeHover]
    );
    const handleTouchEnd = handleMouseLeave;

    // util
    function formatIndianAmount(num) {
        if (num == null || isNaN(num)) return "—";
        const n = Number(num);
        if (n >= 1e7) return (n / 1e7).toFixed(1).replace(/\.0$/, "") + "Cr";
        if (n >= 1e5) return (n / 1e5).toFixed(1).replace(/\.0$/, "") + "L";
        if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
        return n.toString();
    }

    return (
        <div className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-full flex flex-col ${className}`}>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <button className="rounded-md p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <div
                    ref={wrapRef}
                    className="relative h-56 w-56"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            {/* OUTER TRACK */}
                            <Pie
                                data={[{ v: 100 }]}
                                dataKey="v"
                                innerRadius={86}
                                outerRadius={104}
                                startAngle={START}
                                endAngle={FULL_END}
                                stroke="none"
                                isAnimationActive={false}
                            >
                                <Cell fill={TRACK} />
                            </Pie>

                            {/* OUTER PROGRESS */}
                            <Pie
                                data={[{ v: 1 }]}
                                dataKey="v"
                                innerRadius={86}
                                outerRadius={104}
                                startAngle={START}
                                endAngle={endFor(OUT)}
                                stroke="none"
                                isAnimationActive={false}
                            >
                                <Cell fill={THEME} />
                            </Pie>

                            {/* INNER TRACK */}
                            <Pie
                                data={[{ v: 100 }]}
                                dataKey="v"
                                innerRadius={62}
                                outerRadius={78}
                                startAngle={START}
                                endAngle={FULL_END}
                                stroke="none"
                                isAnimationActive={false}
                            >
                                <Cell fill={TRACK} />
                            </Pie>

                            {/* INNER PROGRESS */}
                            <Pie
                                data={[{ v: 1 }]}
                                dataKey="v"
                                innerRadius={62}
                                outerRadius={78}
                                startAngle={START}
                                endAngle={endFor(INN)}
                                stroke="none"
                                isAnimationActive={false}
                            >
                                <Cell fill={THEME_600} />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center label */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="text-3xl font-semibold text-gray-900 transition-opacity duration-150">
                            {hoverLabel || `₹${formatIndianAmount(pureProfit)}`}
                        </div>
                    </div>

                </div>
            </div>

            <div className="mt-8 space-y-6 text-center">

                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Target color={THEME} />
                        <span>{topLineLabel}</span>
                    </div>
                    <div className="mt-1 text-xl font-medium text-gray-900">{topLineAmount}</div>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp color={THEME} />
                        <span>{topLineAch}</span>
                    </div>
                    <div className="mt-1 text-xl font-medium text-gray-900">{totalSales}</div>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Wallet color={THEME} />
                        <span>{bottomLineLabel}</span>
                    </div>
                    <div className="mt-1 text-xl font-medium text-gray-900">{outerAmount}</div>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle color={THEME} />
                        <span>{bottomLineAchLabel}</span>
                    </div>
                    <div className="mt-1 text-xl font-medium text-gray-900">{innerAmount}</div>
                </div>




            </div>
        </div>
    );
}

/* ======================= MAIN PAGE ======================= */
export default function DashboardOverview() {
    const router = useRouter();
    const [month, setMonth] = useState(demoMonth);
    const [invPage, setInvPage] = useState(1);
    const [poPage, setPoPage] = useState(1);
    const limit = 10;

    const { data: me } = useGetSalesMeQuery();
    const isAdmin = !!me?.isAdmin || me?.role === "admin";

    /* ====== Fetch ALL sales team ====== */
    const TEAM_LIMIT = 10000;
    const [teamSearch] = useState("");

    const teamArgs = useMemo(
        () => ({
            page: 1,
            limit: TEAM_LIMIT,
            search: teamSearch || undefined,
        }),
        [teamSearch]
    );

    const {
        data: teamData,
        isFetching: teamFetching,
        isLoading: teamLoading,
    } = useGetSalesMembersQuery(teamArgs, { refetchOnMountOrArgChange: true });

    // Normalize team response shape
    const teamRows =
        teamData?.items ||
        teamData?.list ||
        teamData?.data ||
        teamData?.results ||
        teamData?.members ||
        [];

    // Selected person
    const [personId, setPersonId] = useState("all");
    const [selectedSalesMember, setSelectedSalesMember] = useState(null);

    // Helper: match logged-in user to a team row
    const findMyTeamRow = useCallback(() => {
        if (!me || !teamRows?.length) return null;
        const candidates = [
            (row) => row._id && (row._id === me._id || row._id === me.id),
            (row) => row.email && me.email && row.email.toLowerCase() === me.email.toLowerCase(),
            (row) => row.name && me.name && row.name.trim().toLowerCase() === me.name.trim().toLowerCase(),
        ];
        return teamRows.find((r) => candidates.some((fn) => fn(r))) || null;
    }, [me, teamRows]);

    // Role-aware selection: admins free; sales locked to self
    useEffect(() => {
        if (!teamRows.length) return;

        if (isAdmin) {
            if (personId === "all") {
                setSelectedSalesMember(undefined);
                return;
            }
            const found = teamRows.find((m) => m._id === personId);
            if (!found) {
                setPersonId(teamRows[0]._id);
                setSelectedSalesMember(teamRows[0]);
            } else {
                setSelectedSalesMember(found);
            }
            return;
        }

        // Non-admin: force to own row
        const mine = findMyTeamRow();
        if (mine) {
            if (personId !== mine._id) setPersonId(mine._id);
            setSelectedSalesMember(mine);
        }
    }, [teamRows, personId, isAdmin, findMyTeamRow]);

    // Name for invoice filter (blank => all)
    const personName = useMemo(() => {
        if (personId === "all") return "";
        return teamRows.find((p) => p._id === personId)?.name ?? "";
    }, [personId, teamRows]);

    /* ====== LIVE INVOICES ====== */
    const invoiceArgs = useMemo(() => {
        const q = { page: invPage, limit, date: `${month}-01` };
        if (personName) q.personName = personName;
        return q;
    }, [invPage, limit, month, personName]);

    const {
        data: invData,
        isFetching: invFetching,
        isLoading: invLoading,
        isError: invError,
        error: invErr,
    } = useGetCrmInvoicesQuery(invoiceArgs);

    const {
        isFetching: poFetching,
        isLoading: poLoading,
    } = useGetCrmPurchaseOrdersQuery(invoiceArgs);

    const invoices = invData?.raw?.data ?? [];
    const piSummary = invData?.raw?.piSummary ?? [];

    const truncate = (str, max = 12) =>
        (str ? (str.length > max ? str.slice(0, max - 1) + "…" : str) : "—");

    const top10PI = useMemo(() => {
        const rows = (piSummary || []).map((r) => {
            const customerName = (r.customerName || "").toString();
            const profitRaw = Number(r.difference) || 0;
            const profit = Math.max(0, profitRaw);
            return {
                label: (truncate(r.customerName) || "—").toString(),
                customerName,
                invoiceTotal: Number(r.invoiceTotal) || 0,
                poTotal: Number(r.poTotal) || 0,
                profitRaw,
                profit,
            };
        });

        rows.sort((a, b) => b.profit - a.profit);
        return rows.slice(0, 10);
    }, [piSummary]);

    /* ====== Case-insensitive, unique salesperson aggregation ====== */
    const normalize = (s = "") => s.trim().toLowerCase();

    // Sum profit by normalized salesperson name
    const profitBySalesperson = useMemo(() => {
        const map = new Map();
        (piSummary || []).forEach((r) => {
            const raw = (r.salespersonName || r.salesperson || "Unknown").toString();
            const key = normalize(raw);
            const diff = Number(r.difference) || 0;
            map.set(key, (map.get(key) || 0) + diff);
        });
        return map;
    }, [piSummary]);

    // Index team members by normalized name (choose one display name + target)
    const teamIndex = useMemo(() => {
        const map = new Map();
        (teamRows || []).forEach((m) => {
            const key = normalize(m?.name || "Unknown");
            if (!map.has(key)) {
                map.set(key, {
                    name: m?.name || "Unknown",
                    target: Number(m?.monthlyTarget) || 0,
                });
            } else {
                const cur = map.get(key);
                const t = Number(m?.monthlyTarget) || 0;
                if (cur.target === 0 && t > 0) cur.target = t;
            }
        });
        return map;
    }, [teamRows]);


    // Build stacked bars for "All": TOP 10 by achieved (profit)
    const teamBars = useMemo(() => {
        const rows = [];
        const keys = new Set([
            ...teamIndex.keys(),
            ...profitBySalesperson.keys(),
        ]);

        keys.forEach((key) => {
            const profit = Number(profitBySalesperson.get(key) || 0);
            const info = teamIndex.get(key);
            const name = info?.name || (key || "Unknown");
            const target = info?.target || 0;

            const achieved = Math.max(0, profit);
            rows.push({
                name,
                target,
                achieved,
                remaining: Math.max(0, target - achieved),
                over: Math.max(0, achieved - target),
            });
        });

        return rows.sort((a, b) => b.achieved - a.achieved).slice(0, 5);

    }, [teamIndex, profitBySalesperson]);

    /* ====== Overall / percentages ====== */
    const overAll = invData?.raw?.overall || {};
    const invoiceSum = Number(overAll?.invoiceSum) || 0;
    const profitSum = Number(overAll?.profit) || 0;

    const clampPct = (n) => Math.max(0, Math.min(100, Math.round(n)));

    const innerPercentPerson = selectedSalesMember?.monthlyTarget
        ? clampPct((profitSum / (Number(selectedSalesMember.monthlyTarget) || 0.0000001)) * 100)
        : 0;

    const totalTeamTarget = useMemo(
        () => teamRows.reduce((s, m) => s + (Number(m?.monthlyTarget) || 0), 0),
        [teamRows]
    );

    const totalTeamTopLine = useMemo(
        () => teamRows.reduce((s, m) => s + (Number(m?.topLine) || 0), 0),
        [teamRows]
    );



    // console.log("totalTeaTopLinetotalTeaTopLine", totalTeaTopLine)


    const allPct = totalTeamTarget ? clampPct((profitSum / totalTeamTarget) * 100) : 0;

    const formatINRShort = (n) => {
        const v = Number(n) || 0;
        if (v >= 1e7) return `${(v / 1e7).toFixed(1).replace(/\.0$/, "")} Cr`;
        if (v >= 1e5) return `${(v / 1e5).toFixed(1).replace(/\.0$/, "")} L`;
        if (v >= 1e3) return `${(v / 1e3).toFixed(1).replace(/\.0$/, "")} K`;
        return v.toLocaleString("en-IN");
    };


    const pct = (num, den) => {
        const n = Number(num) || 0;
        const d = Number(den) || 0;
        if (d <= 0) return 0;
        const p = Math.round((n / d) * 100);

        return Math.max(0, Math.min(100, p));
    };

    // %s
    const profitVsSalesPct = useMemo(() => pct(invoiceSum, totalTeamTopLine), [totalTeamTopLine, invoiceSum]);




    const achievementAllPct = useMemo(() => pct(profitSum, totalTeamTarget), [profitSum, totalTeamTarget]);

    const innerPercentSingle = useMemo(() => pct(profitSum, selectedSalesMember?.monthlyTarget), [profitSum, selectedSalesMember?.monthlyTarget]);
    // keep outer = profit/sales (fix dependency to invoiceSum)
    const outerPercentSingle = useMemo(() => pct(profitSum, invoiceSum), [profitSum, invoiceSum]);
    const achievementPersonPct = useMemo(() => pct(profitSum, selectedSalesMember?.monthlyTarget), [profitSum, selectedSalesMember?.monthlyTarget]);

    const handleSeeAll = () => {
        const query = personName ? encodeURIComponent(personName) : "All";
        router.push(`/dashboard/invoices/${query}`);
    };

    const handleSeeAllSales = () => {
        const query = personName ? encodeURIComponent(personName) : "All";
        router.push(`/dashboard/sales-report/${query}`);
    };

    const AchievedTopRadiusIfHit = (props) => {
        const { payload, ...rest } = props;
        // console.log("payload check",payload)
        // Round top if target achieved: remaining <= 0 and over <= 0
        const hitTarget =
            (Number(payload?.remaining) || 0) <= (Number(payload?.over) || 0);

        return (
            <Rectangle
                {...rest}
                radius={hitTarget ? [6, 6, 0, 0] : [0, 0, 0, 0]}
            />
        );
    };

    return (
        <div className="w-full bg-[#fafbfe] p-6 md:p-8">
            {/* Header with controls */}
            <div className="mb-6 flex flex-col justify-between gap-2 md:flex-row md:items-end">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 ">
                        Welcome back{" "}
                        {!isAdmin && (
                            <span className="ml-1 text-3xl font-bold text-[#3E57A7] ">
                                {me?.name}
                            </span>
                        )}
                    </h1>

                    <p className="mt-1 text-gray-500">Sales dashboard — track monthly performance against targets</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none"
                    />

                    {isAdmin && (
                        <select
                            value={personId}
                            onChange={(e) => {
                                setPersonId(e.target.value);
                                setInvPage(1);
                                setPoPage(1);
                            }}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none"
                        >
                            <option value="all">All</option>
                            {teamRows.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Top charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left: chart changes depending on All vs single */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-full flex flex-col">
                        <div className="mb-4 flex items-center justify-between">
                            {personId === "all" ? (
                                <h2 className="text-lg font-semibold text-gray-900">Team Performance — Target vs Achieved</h2>
                            ) : (
                                <h2 className="text-lg font-semibold text-gray-900">Top 10 Billings — Profit</h2>
                            )}
                        </div>

                        {/* Legend for All view */}
                        {personId === "all" && (
                            <div className="mb-3 flex items-center gap-5 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Dot color={THEME} /> Achieved
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Dot color={THEME_300} /> Remaining to Target
                                </div>
                                {/* <div className="flex items-center gap-2 text-gray-600">
                                    <Dot color={THEME_600} /> Over Target
                                </div> */}
                            </div>
                        )}

                        <div className="h-72 w-full">
                            {personId === "all" ? (
                                teamBars.length === 0 ? (
                                    <div className="grid h-full place-items-center text-sm text-gray-500">
                                        No team data for this selection.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={teamBars} barGap={4} barCategoryGap={18}>
                                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                                            <XAxis
                                                dataKey="name"
                                                tickLine={false}
                                                axisLine={{ stroke: "#E5E7EB" }}
                                                tick={{ fill: "#6B7280", fontSize: 12 }}
                                                interval={0}
                                                height={60}
                                                angle={-20}
                                                textAnchor="end"
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={{ stroke: "#E5E7EB" }}
                                                tick={{ fill: "#6B7280", fontSize: 12 }}
                                                tickFormatter={formatINRShort}
                                                domain={[0, (max) => Math.ceil((Number(max) || 0) * 1.1)]}
                                                allowDecimals={false}
                                            />
                                            <RechartsTooltip content={<TeamBarsTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />

                                            {/* <Bar dataKey="achieved" stackId="a" barSize={45} maxBarSize={28} fill={THEME} /> */}

                                            <Bar
                                                dataKey="achieved"
                                                stackId="a"
                                                barSize={45}
                                                maxBarSize={28}
                                                fill={THEME}
                                                shape={<AchievedTopRadiusIfHit />}
                                            />

                                            <Bar dataKey="remaining" stackId="a" barSize={45} maxBarSize={28} fill={THEME_300} radius={[6, 6, 0, 0]} />

                                            {/* <Bar dataKey="over" stackId="a" barSize={45} maxBarSize={28} fill={THEME_600} radius={[6, 6, 0, 0]} /> */}
                                        </BarChart>
                                    </ResponsiveContainer>
                                )
                            ) : top10PI.length === 0 ? (
                                <div className="grid h-full place-items-center text-sm text-gray-500">
                                    No PI data for this selection.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={top10PI} barCategoryGap={18}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="label"
                                            tickLine={false}
                                            axisLine={{ stroke: "#E5E7EB" }}
                                            tick={{ fill: "#6B7280", fontSize: 12 }}
                                            interval={0}
                                            height={60}
                                            angle={-25}
                                            textAnchor="end"
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={{ stroke: "#E5E7EB" }}
                                            tick={{ fill: "#6B7280", fontSize: 12 }}
                                            tickFormatter={formatINRShort}
                                            domain={[0, (max) => Math.ceil((Number(max) || 0) * 1.1)]}
                                            allowDecimals={false}
                                        />
                                        <RechartsTooltip content={<TopPiTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                                        <Bar dataKey="profit" name="Profit" barSize={45} maxBarSize={28} fill={THEME} radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Summary cards */}
                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
                            <div className="group rounded-2xl border border-gray-200/80 bg-white/90 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-gray-500">Top Line Achievement</div>
                                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <IndianRupee className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                                    {`₹${(Number(overAll?.invoiceSum) || 0).toLocaleString("en-IN")}`}
                                </div>
                                <div className="mt-2 text-xs text-gray-400">Overall billed amount</div>
                            </div>

                            <div className="group rounded-2xl border border-gray-200/80 bg-white/90 p-4 shadow-sm ">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-gray-500">Bottom Line</div>
                                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <Target className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                                    {personId === "all"
                                        ? `₹${totalTeamTarget.toLocaleString("en-IN")}`
                                        : (selectedSalesMember?.monthlyTarget
                                            ? `₹${Number(selectedSalesMember.monthlyTarget).toLocaleString("en-IN")}`
                                            : "N/A")}
                                </div>
                                <div className="mt-2 text-xs text-gray-400">{personId === "all" ? "Sum of all members’ targets" : "Monthly goal"}</div>
                            </div>

                            <div className="group rounded-2xl border border-gray-200/80 bg-white/90 p-4 shadow-sm ">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-gray-500"> Bottom Line Achievement</div>
                                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                </div>

                                <div className="mt-2 flex items-center gap-3">
                                    <div
                                        className="relative h-10 w-10 shrink-0 rounded-full"
                                        aria-label={`Achievement ${personId === "all" ? allPct : innerPercentPerson}%`}
                                        style={{
                                            background: `conic-gradient(#3E57A7 ${(personId === "all" ? allPct : innerPercentPerson) * 3.6}deg, #E5E7EB 0deg)`,
                                        }}
                                    >
                                        <div className="absolute inset-1 rounded-full bg-white"></div>
                                        <div className="absolute inset-0 grid place-items-center text-xs font-semibold text-gray-900">
                                            {personId === "all" ? allPct : innerPercentPerson}%
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-semibold text-gray-900">{personId === "all" ? allPct : innerPercentPerson}%</span>
                                            <Delta
                                                value={`${(personId === "all" ? allPct : innerPercentPerson) >= 100 ? "+" : ""}${(personId === "all" ? allPct : innerPercentPerson) - 100}%`}
                                                positive={(personId === "all" ? allPct : innerPercentPerson) >= 100}
                                            />
                                        </div>
                                        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                                            <div
                                                className="h-2 rounded-full transition-[width] duration-700"
                                                style={{
                                                    width: `${Math.max(0, Math.min(100, personId === "all" ? allPct : innerPercentPerson))}%`,
                                                    background: "linear-gradient(90deg, #3E57A7 0%, #6474C8 100%)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2 text-xs text-gray-400">
                                    {personId === "all" ? "Overall progress toward team target" : "Progress toward monthly target"}
                                </div>
                            </div>

                            <div className="group rounded-2xl border border-gray-200/80 bg-white/90 p-4 shadow-sm ">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-gray-500">Status</div>
                                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                        <Trophy className="h-4 w-4" />
                                    </div>
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                    {(personId === "all"
                                        ? totalTeamTarget <= profitSum
                                        : (Number(selectedSalesMember?.monthlyTarget) || 0) <= profitSum) ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                            <span className="text-base font-semibold text-emerald-700">Target Achieved</span>
                                            <span className="ml-1 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-100">
                                                Great job
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-5 w-5 text-red-500" />
                                            <span className="text-base font-semibold text-gray-900">Not Achieved</span>
                                            <span className="ml-1 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-100 whitespace-nowrap">
                                                Keep pushing
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className="mt-2 text-xs text-gray-400">
                                    {(personId === "all"
                                        ? totalTeamTarget <= profitSum
                                        : (Number(selectedSalesMember?.monthlyTarget) || 0) <= profitSum)
                                        ? "You’ve met or exceeded the goal."
                                        : "You’re below target for this month."}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right card (pie / donut) */}
                <div className="h-fit">
                    {personId === "all" ? (
                        <ReturningCustomersCard
                            className="h-full"
                            title="Overall Target vs Achieved"
                            totalLabel={`${achievementAllPct}%`}
                            outerPercent={profitVsSalesPct}
                            innerPercent={achievementAllPct}
                            outerLabel="Overall Target"
                            outerAmount={`₹${totalTeamTarget.toLocaleString("en-IN")}`}
                            innerLabel="Achieved (Profit)"
                            innerAmount={`₹${profitSum.toLocaleString("en-IN")}`}
                            pureProfit={profitSum}
                            totalSales={`₹${(Number(overAll?.invoiceSum) || 0).toLocaleString("en-IN")}`}


                            topLineLabel={"Monthly Target Top Line"}
                            topLineAmount={totalTeamTopLine}

                            topLineAch={"Monthly Target Top Line Achieved"}

                            bottomLineLabel={"Monthly Target Bottom Line"}

                            bottomLineAchLabel={"All Monthly Target Bottom Line"}
                        />
                    ) : (
                        <ReturningCustomersCard
                            className="h-full"
                            topLineLabel={"Monthly Target Top Line"}
                            topLineAmount={selectedSalesMember?.topLine}

                            topLineAch={"Monthly Target Top Line Achieved"}

                            bottomLineLabel={"Monthly Target Bottom Line"}

                            bottomLineAchLabel={"All Monthly Target Bottom Line"}


                            totalLabel={`${innerPercentSingle}%`}
                            outerPercent={outerPercentSingle}
                            innerPercent={innerPercentSingle}
                            outerLabel="Target"
                            outerAmount={
                                selectedSalesMember?.monthlyTarget
                                    ? `₹${Number(selectedSalesMember.monthlyTarget).toLocaleString("en-IN")}`
                                    : "N/A"
                            }
                            innerLabel="Achieved (Profit)"
                            pureProfit={profitSum}
                            innerAmount={`₹${profitSum.toLocaleString("en-IN")}`}
                            totalSales={`₹${(Number(overAll?.invoiceSum) || 0).toLocaleString("en-IN")}`}
                        />
                    )}
                </div>
            </div>

            {/* ================= INVOICES TABLE (LIVE) ================= */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Invoices — {personName || "All"} </h2>

                    <button
                        onClick={handleSeeAll}
                        className="text-sm font-medium cursor-pointer text-[#3E57A7]"
                    >
                        See All →
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3 whitespace-nowrap">S.no</th>
                                <th className="px-4 py-3 whitespace-nowrap">Invoice #</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Salesperson</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">Amount (₹)</th>
                                {/* <th className="px-4 py-3">Status</th> */}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {invLoading || invFetching ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        Loading…
                                    </td>
                                </tr>
                            ) : invError ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-red-600">
                                        {invErr?.data?.message || "Failed to load invoices."}
                                    </td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        No invoices found for this selection.
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv, i) => (
                                    <tr key={inv._id || inv.invoice_number || inv.invoice_id} className="hover:bg-gray-50/60">
                                        <td className="px-4 py-3 text-gray-900">{i + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {inv.invoice_url ? (
                                                <a href={inv.invoice_url} target="_blank" rel="noreferrer" className="text-[#3E57A7] hover:underline">
                                                    {inv.invoice_number || "-"}
                                                </a>
                                            ) : (
                                                inv.invoice_number || "-"
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {inv.date ? new Date(inv.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900">{inv.customer_name || "-"}</td>
                                        <td className="px-4 py-3 text-gray-700">{inv.salesperson_name || "-"}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{(Number(inv.total) || 0).toLocaleString("en-IN")}</td>
                                        {/* <td className="px-4 py-3">
                                            <StatusBadge status={inv.status} />
                                        </td> */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= OVERALL TABLE (LIVE) ================= */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Sales Report — {personName || "All"}
                    </h2>
                    <button
                        onClick={handleSeeAllSales}
                        className="text-sm font-medium cursor-pointer text-[#3E57A7]"
                    >
                        See All →
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">S.No</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Sales Person</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">Invoice Total (₹)</th>
                                <th className="px-4 py-3 text-right whitespace-nowrap">PO Total (₹)</th>
                                <th className="px-4 py-3">Profit</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {invLoading || invFetching ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        Loading…
                                    </td>
                                </tr>
                            ) : invError ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-red-600">
                                        {invErr?.data?.message || "Failed to load invoices."}
                                    </td>
                                </tr>
                            ) : (invData?.raw?.piSummary ?? []).length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        No invoices found for this selection.
                                    </td>
                                </tr>
                            ) : (
                                (invData?.raw?.piSummary ?? []).map((inv, i) => {
                                    const poTotal = Number(inv.poTotal) || 0
                                    return (
                                        <tr
                                            key={inv._id || inv.pi || inv.invoice_id}
                                            className={`${poTotal === 0
                                                ? "bg-red-600 text-gray-300"
                                                : "hover:bg-gray-100 text-gray-900"
                                                }`}
                                        >
                                            <td
                                                className={`px-4 py-3 font-medium whitespace-nowrap ${poTotal === 0 ? "rounded-l-[10px]" : ""
                                                    }`}
                                            >
                                                {i + 1}
                                            </td>
                                            <td className="px-4 py-3">{inv.customerName || "-"}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {inv.salespersonName || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                {(Number(inv.invoiceTotal) || 0).toLocaleString("en-IN")}
                                            </td>
                                            <td className="px-4 py-3">
                                                {(Number(inv.poTotal) || 0).toLocaleString("en-IN")}
                                            </td>
                                            <td
                                                className={`px-4 py-3 font-semibold ${poTotal === 0
                                                    ? "text-gray-300 rounded-r-[10px]"
                                                    : inv.difference > 0
                                                        ? "text-green-600"
                                                        : inv.difference < 0
                                                            ? "text-red-600"
                                                            : "text-gray-900"
                                                    }`}
                                            >
                                                {(Number(inv.difference) || 0).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </td>
                                        </tr>


                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {(invLoading || invFetching || poLoading || poFetching || teamLoading || teamFetching) && <Loader />}
        </div>
    );
}
