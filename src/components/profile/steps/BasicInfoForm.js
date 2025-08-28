'use client';

import { useRef } from 'react';
import { Button } from '@/components/custom/ui/Buttons';
import { TextInput } from '@/components/custom/ui/input';
import { useEffect, useState } from 'react';
import { useGetAzureUploadUrlMutation } from '@/redux/features/api/uploadsApi';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Loader from '@/components/custom/ui/Loader';

export default function BasicInfoForm({ onNext, data, onChange }) {
  const [getUploadUrl, { isLoading }] = useGetAzureUploadUrlMutation();

  // console.log("is loading check",isLoading)

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({
        [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onNext();
  };

  // console.log("datadatadata", data)

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">

        <ProfileImageUploader
          value={data.profilePicture}
          onChange={(url) => onChange({ profilePicture: url })}
          getUploadUrl={getUploadUrl}
        />



        <TextInput
          label="Full Name"
          name="name"
          value={data.name}
          // disabled
          required
          onChange={handleChange}
        />

        <TextInput
          label="Email Address"
          name="email"
          type="email"
          value={data.email}
          disabled
          required
        />

        <TextInput
          label="Mobile Number"
          name="mobile"
          type="tel"
          value={data.mobile}
          disabled
          required
        />

        <div className="pt-4 w-full flex justify-end">
          <Button type="submit" variant="primary">
            Next
          </Button>
        </div>
      </form>
      {
        isLoading && <Loader />
      }
    </>
  );
}





export function ProfileImageUploader({ value, onChange, getUploadUrl }) {
  const fileInputRef = useRef();
  const [imageUrl, setImageUrl] = useState(value || null);

  useEffect(() => {
    setImageUrl(value || null);
  }, [value]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      const { data, error } = await getUploadUrl({
        fileName: file.name,
        fileType: file.type,
      });

      if (error || !data?.uploadUrl || !data?.blobUrl) {
        toast.error('Failed to get upload URL');
        return;
      }

      await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type,
        },
        body: file,
      });

      setImageUrl(data.blobUrl);
      onChange?.(data.blobUrl);
      toast.success('Profile picture uploaded');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    }
  };

  const handleRemove = () => {
    setImageUrl(null);
    onChange?.('');
    toast.success('Profile picture removed');
  };

  return (
    <div className="flex flex-col items-center space-y-2 mb-6">
      <div
        className="w-24 h-24 rounded-full overflow-hidden cursor-pointer border border-gray-300 shadow"
        onClick={() => fileInputRef.current?.click()}
      >
        <Image
          src={imageUrl || '/png/default-user.webp'}
          alt="Profile"
          width={96}
          height={96}
          className="object-cover w-full h-full"
        />
      </div>

      <p
        className="text-sm text-blue-600 hover:underline cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {imageUrl ? 'Change Profile Photo' : 'Upload Profile Photo'}
      </p>

      {imageUrl && (
        <button
          type="button"
          onClick={handleRemove}
          className="text-xs text-red-500 cursor-pointer hover:underline"
        >
          Remove Photo
        </button>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
    </div>
  );
}


