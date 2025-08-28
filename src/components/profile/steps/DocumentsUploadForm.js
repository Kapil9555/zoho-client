'use client';

import { Button } from '@/components/custom/ui/Buttons';
import { ImageUploadInput } from '@/components/custom/ui/input';
import { showError } from '@/utils/customAlert';

export default function DocumentsUploadForm({ onBack, onSubmit, onChange, data, disabled }) {

    
    const isDocumentsValid = (docs) => {
        return (
            docs?.businessRegistration?.length > 0 &&
            docs?.taxIdProof?.length > 0 &&
            docs?.personalId?.length > 0 &&
            docs?.addressProof?.length > 0
        );
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // if (!isDocumentsValid(data.documents)) {
        //     showError('Please upload all required documents.');
        //     return;
        // }
        onSubmit();
    };

    const handleDocChange = (field, value) => {
        onChange({
            documents: {
                ...data.documents,
                [field]: value,
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUploadInput

                label="Business Registration"
                name="businessRegistration"
                defaultImages={data?.documents?.businessRegistration}
                onUploadComplete={(urls) => handleDocChange('businessRegistration', urls)}
            />
            <ImageUploadInput

                label="Tax ID Proof"
                name="taxIdProof"
                defaultImages={data?.documents?.taxIdProof}
                onUploadComplete={(urls) => handleDocChange('taxIdProof', urls)}
            />
            <ImageUploadInput

                label="Personal ID"
                name="personalId"
                defaultImages={data?.documents?.personalId}
                onUploadComplete={(urls) => handleDocChange('personalId', urls)}
            />
            <ImageUploadInput

                label="Address Proof"
                name="addressProof"
                defaultImages={data?.documents?.addressProof}
                onUploadComplete={(urls) => handleDocChange('addressProof', urls)}
            />

            <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button type="submit" disabled={disabled}>Submit</Button>
            </div>
        </form>
    );
}
