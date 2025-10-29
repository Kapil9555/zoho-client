'use client';
import React, { useMemo, useRef, useState } from 'react';
import { Calendar, ChevronDown, Loader2 } from 'lucide-react';
import { useTriggerZohoBackfillMutation } from '@/redux/features/api/zohoApi';



function isYMD(s) {
    if (!s) return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(s);
}


function cmpDate(a, b) {
    return new Date(a).getTime() - new Date(b).getTime();
}


export default function BackfillWithCalendar({
    className = ''
}) {
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);

    // form state
    const [mode, setMode] = useState('calendar');
    const [preset, setPreset] = useState('last-two-months');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [days, setDays] = useState('');

    const [trigger, { isLoading }] = useTriggerZohoBackfillMutation();

    // derived
    const hasRange = useMemo(() => isYMD(from) && isYMD(to) && cmpDate(from, to) <= 0, [from, to]);

    const daysValid = useMemo(
        () => typeof days === 'number' && Number.isFinite(days) && days > 0 && days <= 3650,
        [days]
    );

    //   const disabledReason = useMemo(() => {
    //     if (mode === 'calendar') {
    //       if (!from || !to) return 'Select both dates';
    //       if (!isYMD(from) || !isYMD(to)) return 'Use YYYY-MM-DD';
    //       if (cmpDate(from, to) > 0) return '`From` must be ≤ `To`';
    //       return '';
    //     }
    //     if (mode === 'days') {
    //       if (!daysValid) return 'Enter days (1–3650)';
    //       return '';
    //     }
    //     // preset
    //     return '';
    //   }, [mode, from, to, daysValid]);


    const disabledReason = useMemo(() => {
        if (mode === 'calendar') {
            if (!from || !to) return 'Select both dates';
            if (!isYMD(from) || !isYMD(to)) return 'Use YYYY-MM-DD';
            if (cmpDate(from, to) > 0) return '`From` must be ≤ `To`';
            if (isFuture(from) || isFuture(to)) return 'Future dates are not allowed';
            return '';
        }
        if (mode === 'days') {
            if (!daysValid) return 'Enter days (1–3650)';
            return '';
        }
        return '';
    }, [mode, from, to, daysValid]);


    const canRun = !disabledReason && !isLoading;

    const buttonLabel = useMemo(() => {
        if (isLoading) return 'Starting…';
        if (mode === 'calendar' && hasRange) return `Backfill ${from} → ${to}`;
        if (mode === 'days' && daysValid) return `Backfill last ${days} days`;
        if (mode === 'preset' && preset === 'calendar') return 'Backfill: Previous 2 full months';
        return 'Hard Refetch Now';
    }, [mode, hasRange, from, to, daysValid, days, preset, isLoading]);





    async function runBackfill() {
        try {
            if (mode === 'calendar' && hasRange) {
                if (isFuture(from) || isFuture(to)) return;
                await trigger({ from, to }).unwrap();
            } else if (mode === 'days' && daysValid) {
                await trigger({ days }).unwrap();
            } else if (mode === 'preset') {
                if (preset === 'calendar') {
                    await trigger({ mode: 'calendar' }).unwrap();
                } else {
                    await trigger({ preset: 'last-two-months' }).unwrap();
                }
            } else {
                // fallback
                await trigger({ preset: 'last-two-months' }).unwrap();
            }
            setOpen(false);
        } catch (e) {
            // you can hook a toast here
            console.error('Backfill error', e);
        }
    }

    
    // helpers (top of file)
    function todayYMD() {
        const d = new Date();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${mm}-${dd}`;
    }
    function isFuture(ymd) {
        if (!isYMD(ymd)) return false;
        // compare as YYYY-MM-DD strings (safe because both are Y-M-D)
        return ymd > todayYMD();
    }


    return (
        <div className={`relative inline-block ${className}`}>
            {/* Main button toggles the panel */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#3E57A7] px-3 py-2 text-white hover:opacity-90"
            >
                <Calendar className="h-4 w-4" />
                <span>{buttonLabel}</span>
                <ChevronDown className="h-4 w-4 opacity-90" />
            </button>

            {/* Popover panel */}
            {open && (
                <div
                    ref={panelRef}
                    className="absolute right-0 z-50 mt-2 min-w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl"
                >
                    {/* Mode tabs */}
                    <div className="mb-3 grid grid-cols-3 gap-2">
                        {/* <button
              onClick={() => setMode('preset')}
              className={`rounded-md px-2 py-1.5 text-sm ${mode === 'preset' ? 'bg-[#eef1fb] text-[#3E57A7] font-semibold' : 'bg-gray-50 text-gray-700'}`}
            >
              Preset
            </button> */}
                        <button
                            onClick={() => setMode('calendar')}
                            className={`rounded-md px-2 py-1.5 text-sm ${mode === 'calendar' ? 'bg-[#eef1fb] text-[#3E57A7] font-semibold' : 'bg-gray-50 text-gray-700'}`}
                        >
                            Calendar
                        </button>
                        <button
                            onClick={() => setMode('days')}
                            className={`rounded-md whitespace-nowrap  py-1.5 text-sm ${mode === 'days' ? 'bg-[#eef1fb] text-[#3E57A7] font-semibold' : 'bg-gray-50 text-gray-700'}`}
                        >
                            Last N days
                        </button>
                    </div>

                    {/* Content per mode */}
                    {mode === 'preset' && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">Choose preset</label>
                            <select
                                value={preset}
                                onChange={(e) => setPreset(e.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                            >
                                <option value="last-two-months">Rolling: last two months</option>
                                <option value="calendar">Previous two complete months</option>
                            </select>
                            <div className="text-xs text-gray-500">
                                “Rolling” uses today → today−2m. “Calendar” runs the previous 2 full months.
                            </div>
                        </div>
                    )}

                    {mode === 'calendar' && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">Select range</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    max={todayYMD()}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                                />
                                <span className="text-gray-500 text-sm">to</span>
                                <input
                                    type="date"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    max={todayYMD()}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                                />
                            </div>
                            {!hasRange && (
                                <div className="text-xs text-red-600">{disabledReason}</div>
                            )}
                        </div>
                    )}

                    {mode === 'days' && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">Number of days</label>
                            <input
                                type="number"
                                min={1}
                                max={3650}
                                step={1}
                                placeholder="e.g. 60"
                                value={days === '' ? '' : String(days)}
                                onChange={(e) => setDays(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                            />
                            {!daysValid && days !== '' && (
                                <div className="text-xs text-red-600">{disabledReason}</div>
                            )}
                            <div className="text-xs text-gray-500">Backfills from today going back N days.</div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={runBackfill}
                            disabled={!canRun}
                            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-white ${canRun ? 'bg-[#3E57A7] hover:opacity-90' : 'bg-gray-400 cursor-not-allowed'}`}
                            title={disabledReason || ''}
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Run Backfill
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
