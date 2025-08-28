'use client';

import { Button } from '@/components/custom/ui/Buttons';
import { TextInput } from '@/components/custom/ui/input';

export default function AddressForm({ onNext, onBack, onChange, data }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({
      address: {
        ...data.address,
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
        label="Street"
        name="street"
        value={data.address?.street || ''}
        onChange={handleChange}
        required
      />
      <TextInput
        label="City"
        name="city"
        value={data.address?.city || ''}
        onChange={handleChange}
        required
      />
      <TextInput
        label="State"
        name="state"
        value={data.address?.state || ''}
        onChange={handleChange}
        required
      />
      <TextInput
        label="Pincode"
        name="pinCode"
        value={data.address?.pinCode || ''}
        onChange={handleChange}
        required
      />
      {/* <TextInput
        label="Country"
        name="country"
        value={data.address?.country || ''}
        onChange={handleChange}
        required
      /> */}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
