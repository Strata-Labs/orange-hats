import React, { useState } from "react";
import { SecurityTool } from "@prisma/client";
import { trpc } from "../../../utils/trpc";
import FileUpload from "./FileUpload";

interface AdminToolFormProps {
  initialData?: Partial<SecurityTool>;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const AdminToolForm: React.FC<AdminToolFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    createdBy: initialData?.createdBy || "",
    description: initialData?.description || "",
    securityUrl: initialData?.securityUrl || "",
    imageUrl: initialData?.imageUrl || "",
    imageKey: initialData?.imageKey || "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const imageUploadMutation = trpc.admin.getToolImageUploadUrl.useMutation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsUploadingFile(true);

      let imageUrl = initialData?.imageUrl;
      let imageKey = initialData?.imageKey;

      if (selectedFile) {
        const uploadUrlResult = await imageUploadMutation.mutateAsync({
          toolId: initialData?.id || "new",
          fileName: selectedFile.name,
        });

        if (uploadUrlResult.url && uploadUrlResult.key) {
          await fetch(uploadUrlResult.url, {
            method: "PUT",
            body: selectedFile,
            headers: {
              "Content-Type": selectedFile.type,
            },
          });

          imageKey = uploadUrlResult.key;
          imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${imageKey}`;
        }
      }

      await onSubmit({
        ...formData,
        imageUrl,
        imageKey,
        securityUrl: formData.securityUrl.trim() || null,
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
        <label htmlFor="name" className="block text-secondary-white mb-2">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
        />
      </div>

      <div>
        <label htmlFor="createdBy" className="block text-secondary-white mb-2">
          Created By
        </label>
        <input
          id="createdBy"
          name="createdBy"
          type="text"
          required
          value={formData.createdBy}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
        />
      </div>

      <div>
        <label className="block text-secondary-white mb-2">Tool Image</label>
        <FileUpload
          onFileSelect={handleFileSelect}
          isUploading={isUploadingFile}
          acceptedTypes={{ "image/*": [".png", ".jpg", ".jpeg", ".gif"] }}
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-secondary-white">
            Selected file: {selectedFile.name}
          </p>
        )}
        {initialData?.imageUrl && !selectedFile && (
          <p className="mt-2 text-sm text-secondary-white">
            Current image: {initialData.imageUrl.split("/").pop()}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-secondary-white mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange resize-none"
        />
      </div>

      <div>
        <label
          htmlFor="securityUrl"
          className="block text-secondary-white mb-2"
        >
          Security URL
        </label>
        <input
          id="securityUrl"
          name="securityUrl"
          type="url"
          value={formData.securityUrl}
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

export default AdminToolForm;
