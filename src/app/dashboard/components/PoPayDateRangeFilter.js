'use client';
import { useState, useMemo } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export default function PoPayDateRangeFilter({ value, onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('preset'); // preset or calendar
  const [preset, setPreset] = useState('this-month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  function todayYMD() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  const hasRange = useMemo(() => from && to && from <= to && from <= todayYMD() && to <= todayYMD(), [from, to]);

  const disabledReason = useMemo(() => {
    if (mode === 'calendar') {
      if (!from || !to) return 'Select both dates';
      if (from > to) return '`From` must be ≤ `To`';
      if (from > todayYMD() || to > todayYMD()) return 'Future dates not allowed';
    }
    return '';
  }, [mode, from, to]);

  const canApply = !disabledReason;
  

  const handleApply = () => {
    if (!canApply) return;

    if (mode === 'preset') {
      const today = new Date();
      let start, end = todayYMD();
      switch(preset) {
        case 'this-week':
          const day = today.getDay();
          start = new Date(today);
          start.setDate(today.getDate() - day);
          start = start.toISOString().split('T')[0];
          break;
        case 'last-30-days':
          start = new Date(today);
          start.setDate(today.getDate() - 30);
          start = start.toISOString().split('T')[0];
          break;
        case 'this-month':
        default:
          start = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,'0')}-01`;
      }
      onChange({ from: start, to: end });
    } else if (mode === 'calendar' && hasRange) {
      onChange({ from, to });
    }
    setOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button type="button" onClick={() => setOpen(v => !v)} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700">
        <Calendar className="h-4 w-4" />
        <span>{mode==='preset' ? preset.replace('-', ' ') : (from && to ? `${from} → ${to}` : 'Select Range')}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 min-w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg z-50">
          {/* Mode Tabs */}
          <div className="flex gap-2 mb-2">
            <button onClick={() => setMode('preset')} className={`px-2 py-1 text-sm rounded-md ${mode==='preset' ? 'bg-[#eef1fb] text-[#3E57A7] font-semibold':'bg-gray-50 text-gray-700'}`}>Preset</button>
            <button onClick={() => setMode('calendar')} className={`px-2 py-1 text-sm rounded-md ${mode==='calendar' ? 'bg-[#eef1fb] text-[#3E57A7] font-semibold':'bg-gray-50 text-gray-700'}`}>Calendar</button>
          </div>

          {mode==='preset' && (
            <select value={preset} onChange={(e)=>setPreset(e.target.value)} className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm">
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="last-30-days">Last 30 Days</option>
            </select>
          )}

          {mode==='calendar' && (
            <div className="flex gap-2 items-center">
              <input type="date" value={from} max={todayYMD()} onChange={(e)=>setFrom(e.target.value)} className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"/>
              <span className="text-gray-500">to</span>
              <input type="date" value={to} max={todayYMD()} onChange={(e)=>setTo(e.target.value)} className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"/>
            </div>
          )}

          {(!hasRange && mode==='calendar') && <div className="text-xs text-red-600 mt-1">{disabledReason}</div>}

          <div className="flex justify-end gap-2 mt-2">
            <button onClick={()=>setOpen(false)} className="px-3 py-1 rounded-md border text-sm text-gray-700">Cancel</button>
            <button onClick={handleApply} disabled={!canApply} className={`px-3 py-1 rounded-md text-sm text-white ${canApply ? 'bg-[#3E57A7]':'bg-gray-400 cursor-not-allowed'}`}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}
