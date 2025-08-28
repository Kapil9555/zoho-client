'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useGetAzureUploadUrlMutation } from '@/redux/features/api/uploadsApi'

/* Shared Input Styles */
const inputClass = `
  w-full
  bg-white
  text-sm
  text-gray-800
  placeholder-gray-400
  border border-gray-300
  rounded-md
  px-4
  py-2.5
  shadow-[0_1px_3px_rgba(0,0,0,0.1)]
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  transition-all
`
const labelClass = 'text-sm font-medium text-gray-700'

/* Text Input */
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
  disabled = false,
  className = '',
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={name} className={labelClass}>
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
          disabled={disabled}
          required={required}
          className={`${inputClass} pr-10 ${className}`}
        />
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

/* Textarea Input */
export function TextareaInput({
  label,
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  className = '',
}) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={name} className={labelClass}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={4}
        className={`${inputClass} resize-none ${className}`}
      />
    </div>
  )
}

/* Select Input (Simple Array) */
export function SelectInput({
  label,
  options = [],
  value,
  onChange,
  required = false,
  placeholder = 'Select an option',
  name = '',
  className = '',
}) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className={labelClass}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`${inputClass} ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}

/* Select Input (Key/Value) */
export function SelectInputKeyValue({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  labelKey = 'label',
  valueKey = 'value',
  className = '',
}) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={name} className={labelClass}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`${inputClass} ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt[valueKey]} value={opt[valueKey]}>
            {opt[labelKey]}
          </option>
        ))}
      </select>
    </div>
  )
}

/* Image Input (URL Based) */
export function ImageInput({
  label,
  name,
  value,
  onChange,
  placeholder = 'Paste image URL',
  required = false,
  className = '',
}) {
  const [preview, setPreview] = useState(value || '')

  const handleChange = (e) => {
    const url = e.target.value
    setPreview(url)
    onChange(e)
  }

  return (
    <div className="w-full space-y-2">
      {label && (
        <label htmlFor={name} className={labelClass}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={`${inputClass} ${className}`}
      />
      {preview && (
        <div className="mt-2 w-fit overflow-hidden rounded-xl border shadow-sm">
          <Image src={preview} alt="Preview" width={120} height={80} className="object-cover" />
        </div>
      )}
    </div>
  )
}

/* Image Upload Input (Azure Blob) */
export function ImageUploadInput({
  label,
  name,
  onUploadComplete,
  defaultImages = [],
  className = '',
  required = false,
  onlySvg = false, 
}) {
  const [previews, setPreviews] = useState([]);
  const [getAzureUploadUrl] = useGetAzureUploadUrlMutation();

  useEffect(() => {
    if (defaultImages?.length > 0) {
      setPreviews(defaultImages.map((url) => ({ url })));
    }
  }, [defaultImages]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedUrls = [];

    const maxImages = 5;
    const currentCount = previews.length;

    if (currentCount + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed.`);
      e.target.value = null;
      return;
    }

    for (let file of files) {
      if (onlySvg && file.type !== 'image/svg+xml') {
        toast.error('Only SVG files are allowed.');
        continue;
      }

      if (!file.type.startsWith('image/')) continue;

      try {
        const { data, error } = await getAzureUploadUrl({
          fileName: file.name,
          fileType: file.type,
        });

        if (error || !data?.uploadUrl || !data?.blobUrl) {
          toast.error('Failed to get Azure upload URL');
          continue;
        }

        console.log("datadatadata",data)

        await fetch(data.uploadUrl, {
          method: 'PUT',
          headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': file.type,
          },
          body: file,
        });

        const newImage = { url: data.blobUrl };
        setPreviews((prev) => [...prev, newImage]);
        uploadedUrls.push(data.blobUrl);
        toast.success('Uploaded successfully');
      } catch (err) {
        console.error('Azure upload failed:', err);
        toast.error('Upload failed');
      }
    }

    const allUrls = [...previews.map((p) => p.url), ...uploadedUrls];
    onUploadComplete?.(allUrls);
  };

  const handleRemove = (urlToRemove) => {
    const updated = previews.filter((img) => img.url !== urlToRemove);
    setPreviews(updated);
    onUploadComplete?.(updated.map((img) => img.url));
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label htmlFor={name} className={labelClass}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <input
        id={name}
        name={name}
        type="file"
        accept={onlySvg ? 'image/svg+xml' : 'image/*'} // ✅ SVG-only when needed
        multiple
        required={required}
        onChange={handleFileChange}
        className={`
          ${inputClass}
          file:mr-4 file:py-2 file:px-4 
          file:rounded-lg file:border-0 
          file:text-sm file:font-semibold 
          file:bg-blue-50 file:text-blue-700 
          hover:file:bg-blue-100
          ${className}
        `}
      />

      {previews.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {previews.map((img, idx) => (
            <div
              key={idx}
              className="relative w-28 h-20 overflow-hidden rounded-xl border shadow-sm"
            >
              <Image
                src={img.url}
                alt={`Preview ${idx}`}
                width={112}
                height={80}
                className="object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={() => handleRemove(img.url)}
                className="absolute top-1 right-1 bg-white/80 text-red-600 hover:text-white hover:bg-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow transition duration-150"
                title="Remove"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
