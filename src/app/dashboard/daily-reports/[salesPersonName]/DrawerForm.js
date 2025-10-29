'use client';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { X } from 'lucide-react';
// import { TextareaInput, TextInput } from '@/components/custom/ui/input';
import { Button } from '@/components/custom/ui/Buttons';
import { Card, CardContent } from '@/components/custom/ui/Card';
import { useAddDailyReportMutation, useUpdateDailyReportMutation } from '@/redux/features/api/reportsApi';
import { showError, showSuccess } from '@/utils/customAlert';
// import { TextInput } from '@/components/custom/inputs';
// import { TextareaInput } from '@/components/custom/ui/input';
import { TextareaInput, TextInput } from '@/components/custom/ui/input';



export default function DrawerForm({ row, onClose, onSaved,user }) {

  const DEPARTMENTS = ["Sales", "Accounts", "Purchase", "Developer", "Other"];

  const isEdit = !!row;


  const [form, setForm] = useState({
    date: moment().format('YYYY-MM-DD'),
    department: '',
    activitiesSummary: '',
    pendingTasks: '',
    comments: '',
    visitedClients: '',
  });


  const [createReport] = useAddDailyReportMutation();
  const [updateReport] = useUpdateDailyReportMutation();


  useEffect(() => {
    if (row) {
      setForm({
        date: moment(row.date).format('YYYY-MM-DD'),
        department: row.department || '',
        activitiesSummary: row.activitiesSummary || '',
        pendingTasks: row.pendingTasks || '',
        comments: row.comments || '',
        visitedClients: row.visitedClients || '',
      });
    }
  }, [row]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!form.department.trim()) return await showError('Validation Error', 'Department is required');
    if (!form.activitiesSummary.trim()) return await showError('Validation Error', 'Activities Summary is required');

    try {
      if (isEdit) {
        await updateReport({ id: row._id, ...form }).unwrap();
        await showSuccess('Success', 'Report updated successfully!');
      } else {
        await createReport(form).unwrap();
        await showSuccess('Success', 'Report added successfully!');
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.error ||
        (typeof err === 'string' ? err : 'Failed to save report');
      await showError('Error', msg);
    }
  };



  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full sm:w-[600px] bg-white shadow-xl overflow-y-auto animate-slideIn px-6 py-6">
        <div className="flex justify-between items-center mb-6 px-4 py-3 bg-blue-100 rounded-md">
          <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
            {isEdit ? 'Edit Report' : 'Add New Report'}
          </h2>
          <button onClick={onClose} className="text-gray-600 cursor-pointer hover:text-red-500">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">


          {/* Date & Department */}
          <div className="grid grid-cols-2 gap-4">

            <TextInput
              type="date"
              label="Date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all cursor-pointer"
                required
              >
                <option value="" className='cursor-pointer'>Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className='cursor-pointer'>
                    {dept}
                  </option>
                ))}
              </select>
            </div> */}

          </div>

          {/* Activities Summary */}
          {/* <TextInput
            type="text"
            label="Activities Summary *"
            name="activitiesSummary"
            value={form.activitiesSummary}
            onChange={handleChange}
            placeholder="Summary of activities"
            required
          /> */}

          <TextareaInput
            label="Activities Summary"
            name="activitiesSummary"
            value={form.activitiesSummary}
            onChange={handleChange}
            placeholder="Summary of activities"
            required
          />

          {/* Visited Clients / Meetings */}
          <TextareaInput
            label="Visited Clients / Meetings"
            name="visitedClients"
            value={form.visitedClients}
            onChange={handleChange}
            placeholder="Enter clients or meetings info"
          />

          {/* Pending Tasks */}
          <TextareaInput
         
            label="Pending Tasks"
            name="pendingTasks"
            value={form.pendingTasks}
            onChange={handleChange}
            placeholder="Enter pending tasks"
          />

          {/* Comments */}
          <TextareaInput
          
            label="Comments"
            name="comments"
            value={form.comments}
            onChange={handleChange}
            placeholder="Additional comments"
          />



          {/* Actions */}
          <div className="col-span-1 md:col-span-3 mt-2 flex justify-end">
            <div className="flex gap-2">

              <button
                type='button'
                onClick={onClose}
                className="inline-flex cursor-pointer items-center gap-2 rounded bg-gray-300 px-4 py-2 text-black disabled:opacity-60"
              >
                cancel
              </button>

              <button
                type="submit"

                className="inline-flex cursor-pointer items-center gap-2 rounded bg-blue-900 px-4 py-2 text-white disabled:opacity-60"
              >
                {isEdit ? 'Update' : 'Save'}
              </button>
            </div>
          </div>



        </form>
      </div>
    </div>
  );
}
