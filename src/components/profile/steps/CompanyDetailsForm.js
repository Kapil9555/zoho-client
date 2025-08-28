'use client';

import { Button } from '@/components/custom/ui/Buttons';
import { TextInput } from '@/components/custom/ui/input';

const personalIdOptions = [
  { _id: 'PAN', name: 'PAN' },
  { _id: 'SSN', name: 'SSN' },
  { _id: 'NIN', name: 'NIN' },
  { _id: 'TIN', name: 'TIN' },
  { _id: 'Other', name: 'Other' },
];

export default function CompanyDetailsForm({ onNext, onBack, data, onChange }) {
  

   const handleChange = (e) => {
    const { name, value } = e.target;

    // 👉 Top-level company fields
    if (['companyName', 'businessType', 'registrationNumber'].includes(name)) {
      onChange({ [name]: value });
    }

    // 👉 Nested document fields
    if (['taxIdNumber', 'personalIdType', 'personalIdNumber'].includes(name)) {
      onChange({
        documents: {
          ...data.documents,
          [name]: value,
        },
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Required */}
      <TextInput
        label="Company Name"
        name="companyName"
        value={data.companyName}
        onChange={handleChange}
        
      />

      {/* Optional */}
      <TextInput
        label="Business Type"
        name="businessType"
        value={data.businessType || ''}
        onChange={handleChange}
      />

      <TextInput
        label="Registration Number"
        name="registrationNumber"
        value={data.registrationNumber || ''}
        onChange={handleChange}
        
      />

      <TextInput
        label="Tax ID Number (VAT/GST/EIN)"
        name="taxIdNumber"
        value={data.documents?.taxIdNumber || ''}
        onChange={handleChange}
      />


      <TextInput
        label="Personal ID Type"
        name="personalIdType"
        value={data?.documents?.personalIdType || ''}
        onChange={handleChange}
        
      />

      <TextInput
        label="Personal ID Number"
        name="personalIdNumber"
       value={data.documents?.personalIdNumber || ''}
        onChange={handleChange}
        
      />

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
