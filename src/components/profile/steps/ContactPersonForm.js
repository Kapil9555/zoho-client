'use client';

import { Button } from '@/components/custom/ui/Buttons';
import { TextInput } from '@/components/custom/ui/input';

export default function ContactPersonForm({ onNext, onBack, data, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({
      contactPerson: {
        ...data.contactPerson,
        [name]: value,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput
        label="Name"
        name="name"
        value={data.contactPerson.name || ''}
        onChange={handleChange}
        required // ✅ Required in schema
      />
      <TextInput
        label="Designation"
        name="designation"
        value={data.contactPerson.designation || ''}
        onChange={handleChange}
        // optional
      />
      <TextInput
        label="Phone"
        name="phone"
        value={data.contactPerson.phone || ''}
        onChange={handleChange}
        // optional
        required
      />
      <TextInput
        label="Email"
        name="email"
        value={data.contactPerson.email || ''}
        onChange={handleChange}
        // optional
        required
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
