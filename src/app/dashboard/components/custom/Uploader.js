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
        accept={onlySvg ? 'image/svg+xml' : 'image/*'} 
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
