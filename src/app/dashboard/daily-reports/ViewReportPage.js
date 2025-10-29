'use client';

import { useEffect } from 'react';
import moment from 'moment';
import { X, ClipboardList, Calendar, User, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/custom/ui/Card';


const fmtDate = (d) => (d ? moment(d).format('DD MMM YYYY') : '—');

export default function ViewReportDrawer({
  row,
  onClose,
}) {
  const report = row ?? {};



  // Close on ES

  // Click outside to close (but ignore clicks inside the drawer)
  const handleOverlayClick = (e) => {
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] transition-opacity"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute right-0 top-0 h-full w-full sm:w-[760px] bg-white shadow-xl overflow-y-auto will-change-transform transition-transform duration-300 ease-out translate-x-0 animate-[slideIn_.3s_ease-out]"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-blue-800" size={20} />
            <h2 className="text-xl font-bold text-blue-900">Daily Report</h2>
          </div>
          <div className="flex items-center gap-2">

            <button
              onClick={onClose}
              aria-label="Close"
              className="inline-flex cursor-pointer items-center justify-center rounded-md p-2 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">


          {/* Sections */}
          <div>
            <div className="p-5 space-y-6">

              <div className='flex gap-2'>
                <span className="py-1 rounded text-lg font-medium text-gray-500"> Date :</span>
                <span className="py-1 rounded text-lg font-medium italic">
                  {fmtDate(report?.date)}
                </span>
              </div>

              <Section title="Activities">
                <p className="text-gray-800 whitespace-pre-line">
                  {report?.activitiesSummary || '—'}
                </p>
              </Section>

              <Section title="Visited Clients / Meetings">
                <p className="text-gray-800 whitespace-pre-line">
                  {report?.visitedClients || '—'}
                </p>
              </Section>



              <Section title="Pending Tasks">
                <p className="text-gray-800 whitespace-pre-line">
                  {report?.pendingTasks || '—'}
                </p>
              </Section>

              <Section title="Comments">
                <p className="text-gray-800 whitespace-pre-line">
                  {report?.comments || '—'}
                </p>
              </Section>

            </div>
          </div>
        </div>
      </div>

      {/* Keyframes for slide-in (scoped via utility) */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  );
}

/* ---------- Small subcomponents ---------- */

function Section({ title, children }) {
  // matches your preferred section chip style (see your AdminUserViewDrawer memory)
  return (
    <section>
      <div className="py-1.5 font-semibold text-lg border-0 border-b border-gray-300 text-gray-600 inline-block mb-2 w-full">
        {title}
      </div>
      {children}
    </section>
  );
}
