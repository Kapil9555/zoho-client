import { Eye, EyeOff, X } from 'lucide-react'
import { useState } from 'react'

export function SelectInput({ label, options, value, onChange, required }) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        value={value.label}
        onChange={(e) => {
          const selected = options.find((opt) => opt.label === e.target.value)
          if (selected) onChange(selected)
        }}
        required={required}
        className="w-full bg-white text-sm text-gray-800 border border-gray-300 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.label}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}



export function TextInput({
  label,
  name,
  type = 'text',
  icon: Icon,
  value,
  onChange,
  placeholder,
  error,
  required = false,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="w-full space-y-1">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full
            bg-white
            text-sm
            text-gray-800
            placeholder-gray-400
            rounded-md
            px-4
            py-2.5
            pr-10
            shadow-[0_1px_3px_rgba(0,0,0,0.1)]
            focus:outline-none
            focus:ring-2
            focus:ring-gray-100
            transition-all
          `}
        />

        {/* Icon */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        ) : Icon ? (
          <Icon className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
        ) : null}
      </div>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}



export function MultiInvoiceInput({ invoices = "", onChange }) {
  // Split the string into tags initially
  const [values, setValues] = useState(
    invoices ? invoices.split(",").map(v => v.trim()).filter(Boolean) : []
  );
  const [input, setInput] = useState("");

  const updateParent = (vals) => {
    const joined = vals.join(", ");
    onChange?.(joined);
  };

  const addValue = (val) => {
    const trimmed = val.trim();
    if (!trimmed || values.includes(trimmed)) return;
    const newValues = [...values, trimmed];
    setValues(newValues);
    updateParent(newValues);
    setInput("");
  };

  const removeValue = (val) => {
    const newValues = values.filter(v => v !== val);
    setValues(newValues);
    updateParent(newValues);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addValue(input);
    }
  };

  const handleBlur = () => {
    if (input.trim() !== "") {
      addValue(input);
    }
  };


  return (
    <div className="flex flex-col">
      <label className="text-md font-medium mb-1 text-gray-600">Invoice No.</label>

      <div className="w-full flex flex-wrap items-center gap-2 rounded border border-gray-300 px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-200">
        {values.map((v, i) => (
          <span
            key={i}
            className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
          >
            {v}
            <button type="button" onClick={() => removeValue(v)}>
              <X size={14} />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Type & press Enter"
          className="flex-grow border-none outline-none text-sm bg-transparent"
        />
      </div>
    </div>
  );
}
