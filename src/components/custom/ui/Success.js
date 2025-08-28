export default function Success({ message = 'Action completed successfully.' }) {
  return (
    <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded shadow-sm text-sm animate-fade-in mt-4 justify-center">
      <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
