import React, { useState } from "react";
import { Audit, Auditor } from "@prisma/client";
import { trpc } from "../../../utils/trpc";
import FileUpload from "./FileUpload";

interface AuditWithAuditors extends Partial<Audit> {
  auditors?: Auditor[];
}

interface AdminAuditFormProps {
  initialData?: AuditWithAuditors;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const AdminAuditForm: React.FC<AdminAuditFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    protocol: initialData?.protocol || "",
    contracts: initialData?.contracts || [""],
    auditorIds: initialData?.auditors?.map((a) => a.id) || [],
    publishedAt: initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().split("T")[0]
      : "",
    auditUrl: initialData?.auditUrl || "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const { data: auditors } = trpc.public.getAuditors.useQuery({
    page: 1,
    limit: 100,
    sortField: "name",
    sortDirection: "asc",
  });

  const pdfUploadMutation = trpc.admin.getPdfUploadUrl.useMutation();
  const updatePdfMutation = trpc.admin.updateAuditPdf.useMutation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContractChange = (index: number, value: string) => {
    const newContracts = [...formData.contracts];
    newContracts[index] = value;
    setFormData((prev) => ({ ...prev, contracts: newContracts }));
  };

  const addContract = () => {
    setFormData((prev) => ({
      ...prev,
      contracts: [...prev.contracts, ""],
    }));
  };

  const removeContract = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contracts: prev.contracts.filter((_, i) => i !== index),
    }));
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !initialData?.pdfUrl) {
      alert("Please select a PDF file");
      return;
    }

    try {
      setIsUploadingFile(true);

      let pdfUrl = initialData?.pdfUrl;
      let pdfKey = null;

      if (selectedFile) {
        const uploadUrlResult = await pdfUploadMutation.mutateAsync({
          auditId: initialData?.id || "new",
          fileName: selectedFile.name,
        });

        if (uploadUrlResult.url && uploadUrlResult.key) {
          await fetch(uploadUrlResult.url, {
            method: "PUT",
            body: selectedFile,
            headers: {
              "Content-Type": "application/pdf",
            },
          });

          pdfKey = uploadUrlResult.key;
          pdfUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${pdfKey}`;
        }
      }

      await onSubmit({
        ...formData,
        pdfUrl,
        pdfKey,
        auditUrl: formData.auditUrl.trim() || null,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploadingFile(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="protocol" className="block text-secondary-white mb-2">
          Protocol
        </label>
        <input
          id="protocol"
          name="protocol"
          type="text"
          required
          value={formData.protocol}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
        />
      </div>

      <div>
        <label className="block text-secondary-white mb-2">Contracts</label>
        {formData.contracts.map((contract, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={contract}
              onChange={(e) => handleContractChange(index, e.target.value)}
              className="flex-1 px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
            />
            <button
              type="button"
              onClick={() => removeContract(index)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addContract}
          className="mt-2 px-4 py-2 bg-main-orange text-black rounded-lg hover:opacity-90 transition-opacity"
        >
          Add Contract
        </button>
      </div>

      <div>
        <label htmlFor="auditorIds" className="block text-secondary-white mb-2">
          Auditors
        </label>
        <select
          id="auditorIds"
          name="auditorIds"
          multiple
          value={formData.auditorIds}
          onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions).map(
              (option) => option.value
            );
            setFormData((prev) => ({ ...prev, auditorIds: selectedOptions }));
          }}
          className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
        >
          {auditors?.items.map((auditor) => (
            <option key={auditor.id} value={auditor.id}>
              {auditor.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="publishedAt"
          className="block text-secondary-white mb-2"
        >
          Published Date
        </label>
        <input
          id="publishedAt"
          name="publishedAt"
          type="date"
          required
          value={formData.publishedAt}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
        />
      </div>

      <div>
        <label className="block text-secondary-white mb-2">PDF File</label>
        <FileUpload
          onFileSelect={handleFileSelect}
          isUploading={isUploadingFile}
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-secondary-white">
            Selected file: {selectedFile.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="auditUrl" className="block text-secondary-white mb-2">
          Audit URL (Optional)
        </label>
        <input
          id="auditUrl"
          name="auditUrl"
          type="url"
          value={formData.auditUrl}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading || isUploadingFile}
          className="px-6 py-2 bg-main-orange text-black rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading || isUploadingFile ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default AdminAuditForm;
