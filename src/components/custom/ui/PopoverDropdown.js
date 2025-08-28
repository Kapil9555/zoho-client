import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function PopoverDropdown({ button, options, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
      >
        {button}
        <ChevronDown className="w-4 h-4 ml-1" />
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-44 bg-white border rounded-md shadow-lg py-1">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                option === selected ? 'bg-indigo-100 text-indigo-700 font-medium' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}