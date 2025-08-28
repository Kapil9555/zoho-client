export default function Error({ message = 'Something went wrong.' }) {
  return (
    <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded shadow-sm text-sm animate-fade-in mt-4 justify-center">
      <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
