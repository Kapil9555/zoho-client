import { PackageSearch, RefreshCcw, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AdminPageHeader({
  title,
  count,
  breadcrumb,
  onRefresh,
  onSettings,
  actionButtons,
  className,
}) {
  const router = useRouter();

  return (
    <div className={cn("bg-white px-6 pt-6 pb-4 flex flex-col gap-4 border-b border-gray-200 md:flex-row md:items-center md:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
          {title}
          {count !== undefined && (
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-red-100 text-red-600">
              {count}
            </span>
          )}
        </h1>
        {breadcrumb && (
          <nav className="text-sm text-gray-500 mt-1">
            Home <span className="mx-1">&#8250;</span> <span className="text-gray-800 font-medium">{breadcrumb}</span>
          </nav>
        )}
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        {actionButtons}

        <button
          type="button"
          onClick={onRefresh}
          title="Refresh"
          className="rounded-lg border bg-white text-gray-700 hover:bg-gray-50 px-2.5 py-2 shadow-sm"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onSettings}
          title="Settings"
          className="rounded-lg border bg-white text-gray-700 hover:bg-gray-50 px-2.5 py-2 shadow-sm"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
