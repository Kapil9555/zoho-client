'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useGetAzureUploadUrlMutation } from '@/redux/features/api/uploadsApi'

/* Shared Input Styles */
const inputClass = `w-full bg-white text-sm text-gray-800 placeholder-gray-400 border border-gray-300 rounded-md px-4 py-1 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all
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
          className={`${inputClass} pr-10 ${className} h-12`}
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
// export function ImageUploadInput({
//   label,
//   name,
//   onUploadComplete,
//   defaultImages = [],
//   className = '',
//   required = false,
//   onlySvg = false, 
//   previews,
//   setPreviews
// }) {
//   const [getAzureUploadUrl] = useGetAzureUploadUrlMutation();

//   useEffect(() => {
//     if (defaultImages?.length > 0) {
//       setPreviews(defaultImages.map((url) => ({ url })));
//     }
//   }, [defaultImages]);

//   const handleFileChange = async (e) => {
//     const files = Array.from(e.target.files);
//     const uploadedUrls = [];

//     const maxImages = 5;
//     const currentCount = previews.length;

//     if (currentCount + files.length > maxImages) {
//       toast.error(`Maximum ${maxImages} images allowed.`);
//       e.target.value = null;
//       return;
//     }

//     for (let file of files) {
//       if (onlySvg && file.type !== 'image/svg+xml') {
//         toast.error('Only SVG files are allowed.');
//         continue;
//       }

//       if (!file.type.startsWith('image/')) continue;

//       try {
//         const { data, error } = await getAzureUploadUrl({
//           fileName: file.name,
//           fileType: file.type,
//         });

//         if (error || !data?.uploadUrl || !data?.blobUrl) {
//           toast.error('Failed to get Azure upload URL');
//           continue;
//         }

//         console.log("datadatadata",data)

//         await fetch(data.uploadUrl, {
//           method: 'PUT',
//           headers: {
//             'x-ms-blob-type': 'BlockBlob',
//             'Content-Type': file.type,
//           },
//           body: file,
//         });

//         const newImage = { url: data.blobUrl };
//         setPreviews((prev) => [...prev, newImage]);
//         uploadedUrls.push(data.blobUrl);
//         toast.success('Uploaded successfully');
//       } catch (err) {
//         console.error('Azure upload failed:', err);
//         toast.error('Upload failed');
//       }
//     }

//     const allUrls = [...previews.map((p) => p.url), ...uploadedUrls];
//     onUploadComplete?.(allUrls);
//   };



//   return (
//     <div className="w-full space-y-2">
//       {label && (
//         <label htmlFor={name} className={labelClass}>
//           {label}
//           {required && <span className="text-red-500 ml-0.5">*</span>}
//         </label>
//       )}

//       <input
//         id={name}
//         name={name}
//         type="file"
//         multiple
//         required={required}
//         onChange={handleFileChange}
//         className={`
//           ${inputClass}
//           file:mr-4 file:py-2 file:px-4 
//           file:rounded-lg file:border-0 
//           file:text-sm file:font-semibold 
//           file:bg-blue-50 file:text-blue-900 
//           hover:file:bg-blue-100
//           ${className}
//         `}
//       />

   
//     </div>
//   );
// }

/* Any-File Upload Input (Azure Blob) */
export function ImageUploadInputtt({
  label,
  name,
  onUploadComplete,
  defaultFiles = [],           // initial URLs (images or any file)
  className = '',
  required = false,
  previews,
  setPreviews,
  maxFiles = 20,
  maxSizeMB = 100,             // allow big files by default; adjust as needed
}) {
  const [getAzureUploadUrl] = useGetAzureUploadUrlMutation();
  const maxBytes = maxSizeMB * 1024 * 1024;

  // seed previews from defaults
  useEffect(() => {
    if (defaultFiles?.length > 0) {
      setPreviews(
        defaultFiles.map((url) => ({
          url,
          name: url.split('/').pop() || 'file',
          type: guessTypeFromUrl(url),
          isImage: /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(url.split('?')[0]),
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFiles]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    const uploadedUrls = [];
    const currentCount = previews?.length || 0;

    if (currentCount + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed.`);
      e.target.value = null;
      return;
    }

    for (const file of files) {
      // size guard only (no type restriction)
      if (file.size > maxBytes) {
        toast.error(`${file.name}: exceeds ${maxSizeMB} MB`);
        continue;
      }

      try {
        const contentType = file.type || 'application/octet-stream';
        const { data, error } = await getAzureUploadUrl({
          fileName: file.name,
          fileType: contentType,
        });

        if (error || !data?.uploadUrl || !data?.blobUrl) {
          toast.error(`Failed to get Azure upload URL for ${file.name}`);
          continue;
        }

        await fetch(data.uploadUrl, {
          method: 'PUT',
          headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': contentType,
          },
          body: file,
        });

        const isImage = (contentType.startsWith('image/'));
        const entry = {
          url: data.blobUrl,
          name: file.name,
          type: contentType,
          size: file.size,
          isImage,
        };

        setPreviews((prev = []) => [...prev, entry]);
        uploadedUrls.push(data.blobUrl);
        toast.success(`${file.name}: uploaded`);
      } catch (err) {
        console.error('Azure upload failed:', err);
        toast.error(`${file.name}: upload failed`);
      }
    }

    const allUrls = [ ...(previews || []).map((p) => p.url), ...uploadedUrls ];
    onUploadComplete?.(allUrls);

    // allow selecting the same file again
    e.target.value = null;
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
        multiple
        required={required}
        // accept ANY file type:
        accept="*/*"
        onChange={handleFileChange}
        className={`
          ${inputClass}
          file:mr-4 file:py-2 file:px-4 
          file:rounded-lg file:border-0 
          file:text-sm file:font-semibold 
          file:bg-blue-50 file:text-blue-900 
          hover:file:bg-blue-100
          ${className}
        `}
      />
    </div>
  );
}

export function ImageUploadInput({
  label,
  name,
  onUploadComplete,
  defaultFiles = [],
  className = '',
  required = false,
  previews,
  setPreviews,
  maxFiles = 20,
  maxSizeMB = 100,
}) {
  const [getAzureUploadUrl] = useGetAzureUploadUrlMutation();
  const maxBytes = maxSizeMB * 1024 * 1024;

  // Seed previews once from defaults
  useEffect(() => {
    if (defaultFiles?.length > 0) {
      setPreviews(
        defaultFiles.map((url) => ({
          url,
          name: url.split('/').pop() || 'file',
          type: guessTypeFromUrl(url),
          isImage: /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(url.split('?')[0]),
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFiles]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    const uploadedUrls = [];
    const currentCount = previews?.length || 0;

    if (currentCount + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed.`);
      e.target.value = null;
      return;
    }

    for (const file of files) {
      if (file.size > maxBytes) {
        toast.error(`${file.name}: exceeds ${maxSizeMB} MB`);
        continue;
      }

      try {
        const contentType = file.type || 'application/octet-stream';
        const { data, error } = await getAzureUploadUrl({
          fileName: file.name,
          fileType: contentType,
        });

        if (error || !data?.uploadUrl || !data?.blobUrl) {
          toast.error(`Failed to get Azure upload URL for ${file.name}`);
          continue;
        }

        await fetch(data.uploadUrl, {
          method: 'PUT',
          headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': contentType,
          },
          body: file,
        });

        const entry = {
          url: data.blobUrl,
          name: file.name,
          type: contentType,
          size: file.size,
          isImage: contentType.startsWith('image/'),
        };

        // Show this batch in the UI immediately
        setPreviews((prev = []) => [...prev, entry]);

        uploadedUrls.push(data.blobUrl);
        toast.success(`${file.name}: uploaded`);
      } catch (err) {
        console.error('Azure upload failed:', err);
        toast.error(`${file.name}: upload failed`);
      }
    }

    // ✅ Send ONLY the newly uploaded URLs to parent
    onUploadComplete?.(uploadedUrls);

    // ✅ Clear local state so next time starts fresh
    setPreviews([]);
    e.target.value = null; // allow re-selecting same file again
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
        multiple
        required={required}
        accept="*/*"
        onChange={handleFileChange}
        className={`
          ${inputClass}
          file:mr-4 file:py-2 file:px-4 
          file:rounded-lg file:border-0 
          file:text-sm file:font-semibold 
          file:bg-blue-50 file:text-blue-900 
          hover:file:bg-blue-100
          ${className}
        `}
      />
    </div>
  );
}


/* helpers */
function guessTypeFromUrl(url) {
  const u = (url || '').split('?')[0].toLowerCase();
  if (u.match(/\.(png|jpg|jpeg|gif|webp|avif|svg)$/)) return 'image/*';
  if (u.endsWith('.pdf')) return 'application/pdf';
  if (u.match(/\.(docx?|rtf|odt)$/)) return 'application/msword';
  if (u.match(/\.(xlsx?|ods|csv)$/)) return 'application/vnd.ms-excel';
  if (u.match(/\.(pptx?|odp)$/)) return 'application/vnd.ms-powerpoint';
  if (u.endsWith('.txt')) return 'text/plain';
  if (u.match(/\.(zip|rar|7z|tar|gz)$/)) return 'application/zip';
  if (u.match(/\.(mp4|mov|mkv|webm|avi|mp3|wav|flac)$/)) return 'media/*';
  return 'application/octet-stream';
}

