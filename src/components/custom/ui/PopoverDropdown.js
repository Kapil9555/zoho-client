import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState, useId, useCallback } from "react";

export default function PopoverDropdown({
  button,
  options = [],
  selected,
  onSelect,
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // <= NEW: responsive breakpoint
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const listboxId = useId();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!open) return;
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ESC to close, focus trap basics
  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Detect mobile (tailwind sm breakpoint ~640px)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Move focus to first option when opening
  useEffect(() => {
    if (open) {
      // tiny timeout so DOM mounts
      const t = setTimeout(() => {
        const first = menuRef.current?.querySelector('[data-menu-item="true"]');
        first?.focus();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Keyboard navigation in list
  const onItemKeyDown = useCallback(
    (e) => {
      if (!open) return;
      const items = Array.from(
        menuRef.current?.querySelectorAll('[data-menu-item="true"]') || []
      );
      const idx = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = items[(idx + 1) % items.length];
        next?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = items[(idx - 1 + items.length) % items.length];
        prev?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        items[items.length - 1]?.focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const val = document.activeElement?.getAttribute("data-value");
        if (val != null) {
          onSelect?.(val);
          setOpen(false);
          btnRef.current?.focus();
        }
      } else if (e.key === "Tab") {
        // close on tab to avoid focus leaving behind an open sheet
        setOpen(false);
      }
    },
    [open, onSelect]
  );

  const handleSelect = (option) => {
    onSelect?.(option);
    setOpen(false);
    btnRef.current?.focus();
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
      >
        {button}
        <ChevronDown className="w-4 h-4 ml-1" />
      </button>

      {/* Overlay for mobile (click to close) */}
      {open && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => {
            setOpen(false);
            btnRef.current?.focus();
          }}
          aria-hidden="true"
        />
      )}

      {/* Menu */}
      {open && (
        <>
          {/* Desktop popover */}
          {!isMobile ? (
            <div
              ref={menuRef}
              id={listboxId}
              role="listbox"
              className="absolute right-0 z-50 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1"
            >
              {options.map((option) => {
                const isSelected = option === selected;
                return (
                  <button
                    key={option}
                    type="button"
                    data-menu-item="true"
                    data-value={option}
                    role="option"
                    aria-selected={isSelected}
                    onKeyDown={onItemKeyDown}
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left px-4 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${
                      isSelected ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-800"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            // Mobile bottom sheet
            <div
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-2xl border-t border-gray-200"
              role="dialog"
              aria-modal="true"
            >
              <div
                className="mx-auto mt-2 mb-3 h-1.5 w-12 rounded-full bg-gray-300"
                aria-hidden="true"
              />
              <div className="flex items-center justify-between px-4 pb-2">
                <div className="text-sm font-medium text-gray-900">Choose an option</div>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    btnRef.current?.focus();
                  }}
                  className="p-2 rounded-md hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div
                ref={menuRef}
                id={listboxId}
                role="listbox"
                className="max-h-[50vh] overflow-y-auto py-1"
              >
                {options.map((option) => {
                  const isSelected = option === selected;
                  return (
                    <button
                      key={option}
                      type="button"
                      data-menu-item="true"
                      data-value={option}
                      role="option"
                      aria-selected={isSelected}
                      onKeyDown={onItemKeyDown}
                      onClick={() => handleSelect(option)}
                      className={`w-full text-left px-4 py-3 text-base outline-none hover:bg-gray-100 focus:bg-gray-100 ${
                        isSelected ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-800"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    btnRef.current?.focus();
                  }}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
