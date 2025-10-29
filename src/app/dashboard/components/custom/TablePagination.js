'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';



/* ---------------------- Portal custom select with flip ---------------------- */



function PopSelect({
  value,
  options,
  onChange,
  className = '',
  buttonClassName = '',
  optionToString = (v) => String(v),
  maxHeight = 240,
  gutter = 6, 
}) {
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const rectRef = useRef({ left: 0, top: 0, bottom: 0, width: 0 });

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((o) => o === value)));
  const [pos, setPos] = useState({ left: 0, top: 0, width: 80 });
  const [flipUp, setFlipUp] = useState(false);

  const label = useMemo(() => optionToString(value), [value, optionToString]);

  const measureButton = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    rectRef.current = r;
    const left = Math.min(Math.max(Math.round(r.left), 8), window.innerWidth - Math.round(r.width) - 8);
    setPos({ left, top: Math.round(r.bottom + gutter), width: Math.max(64, Math.round(r.width)) });
  };

  const placeMenu = () => {
    if (!open) return;
    // First position below, then measure and decide flip
    measureButton();
    requestAnimationFrame(() => {
      if (!menuRef.current) return;
      const r = rectRef.current;
      const menuH = Math.min(menuRef.current.offsetHeight || maxHeight, maxHeight);
      const menuW = Math.max(menuRef.current.offsetWidth || r.width, r.width);
      const spaceBelow = window.innerHeight - (r.bottom + gutter);
      const spaceAbove = r.top - gutter;

      const shouldFlip = spaceBelow < menuH && spaceAbove > spaceBelow;
      setFlipUp(shouldFlip);

      const left = Math.min(Math.max(Math.round(r.left), 8), window.innerWidth - Math.round(menuW) - 8);
      const top = shouldFlip
        ? Math.max(8, Math.round(r.top - menuH - gutter))
        : Math.round(r.bottom + gutter);

      setPos({ left, top, width: Math.max(64, Math.round(r.width)) });
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    placeMenu();
    const onWin = () => placeMenu();
    window.addEventListener('resize', onWin);
    window.addEventListener('scroll', onWin, true);
    return () => {
      window.removeEventListener('resize', onWin);
      window.removeEventListener('scroll', onWin, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, options, maxHeight, gutter]);

  useEffect(() => {
    const onDoc = (e) => {
      const t = e.target;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    setActive(Math.max(0, options.findIndex((o) => o === value)));
  }, [value, options]);

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onChange(options[active]);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`inline-flex items-center gap-1 bg-transparent text-sm text-gray-700 focus:outline-none ${buttonClassName} ${className}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {label}
        <ChevronDown size={14} className="opacity-70" />
      </button>

      {open &&
        createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            className={`z-[9999] rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 ${
              flipUp ? 'origin-bottom' : 'origin-top'
            }`}
            style={{
              position: 'fixed',
              left: pos.left,
              top: pos.top,
              minWidth: pos.width,
              maxHeight,
              overflowY: 'auto',
            }}
          >
            {options.map((opt, i) => {
              const isActive = i === active;
              const selected = opt === value;
              return (
                <li
                  key={String(opt)}
                  role="option"
                  aria-selected={selected}
                  className={`cursor-pointer select-none px-3 py-1.5 ${
                    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  {optionToString(opt)}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
}

/* -------------------------------- Pagination ------------------------------- */
export default function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLimitChange,
}) {
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="mt-6">
      {/* You can keep overflow-hidden — menu portals to <body> so it can't be clipped */}
      <div className="flex flex-wrap items-center justify-between rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700 overflow-hidden">
        {/* Items per page */}
        <div className="relative flex items-center space-x-2 border-r px-4 py-2">
          <span>Items per page:</span>
          <PopSelect
            value={itemsPerPage}
            options={[5, 10, 25, 50]}
            onChange={(val) => {
              const n = Number(val);
              if (!Number.isNaN(n)) {
                onLimitChange(n);
                onPageChange(1);
              }
            }}
            buttonClassName="ring-0 border-0 shadow-none"
          />
        </div>

        {/* Range */}
        <div className="border-r px-4 py-2">
          {start}–{end} of {totalItems} items
        </div>

        {/* Page picker */}
        <div className="relative flex items-center space-x-2 border-r px-4 py-2">
          <PopSelect
            value={currentPage}
            options={Array.from({ length: safeTotalPages }, (_, i) => i + 1)}
            onChange={(p) => {
              const n = Number(p);
              if (!Number.isNaN(n)) onPageChange(n);
            }}
            buttonClassName="ring-0 border-0 shadow-none"
          />
          <span>of {safeTotalPages} pages</span>
        </div>

        {/* Prev / Next */}
        <div className="flex items-center space-x-2 px-4 py-2">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage <= 1}
            className="rounded p-1 disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, safeTotalPages))}
            disabled={currentPage >= safeTotalPages}
            className="rounded p-1 disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
