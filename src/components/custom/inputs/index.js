import { Eye, EyeOff } from 'lucide-react'
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



export  function TextInput({
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

