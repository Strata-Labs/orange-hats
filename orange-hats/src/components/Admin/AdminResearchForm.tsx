import React, { useState } from "react";
import { toast } from "sonner";
import { trpc } from "../../../utils/trpc";
import dynamic from "next/dynamic";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface AdminResearchFormProps {
  initialData?: Partial<{
    id: string;
    title: string;
    protocol: string;
    type: string;
    description: string;
    content: string;
    publishedAt: Date;
    slug: string;
    jekyllUrl: string;
    mainImage: string | null;
    mainImageKey: string | null;
    secondaryImage: string | null;
    secondaryImageKey: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const AdminResearchForm: React.FC<AdminResearchFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    protocol: initialData?.protocol || "",
    type: initialData?.type || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    publishedAt: initialData?.publishedAt
      ? initialData.publishedAt.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    mainImage: initialData?.mainImage || "",
    mainImageKey: initialData?.mainImageKey || "",
    secondaryImage: initialData?.secondaryImage || "",
    secondaryImageKey: initialData?.secondaryImageKey || "",
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [secondaryImage, setSecondaryImage] = useState<File | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const imageUploadMutation =
    trpc.admin.getResearchImageUploadUrl.useMutation();

  const handleContentChange = (value?: string) => {
    setFormData((prev) => ({ ...prev, content: value || "" }));
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "main" | "secondary"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "main") {
        setMainImage(file);
      } else {
        setSecondaryImage(file);
      }
    }
  };

  const insertTemplate = (
    type: "bullets" | "numbers" | "subtitle" | "image"
  ) => {
    let template = "";
    switch (type) {
      case "bullets":
        template =
          "\n\n- First bullet point\n- Second bullet point\n- Third bullet point\n\n";
        break;
      case "numbers":
        template = "\n\n1. First item\n2. Second item\n3. Third item\n\n";
        break;
      case "subtitle":
        template = "\n\n## New Subtitle\n\n";
        break;
      case "image":
        template = "\n\n![Image description](image_url)\n\n";
        break;
    }
    setFormData((prev) => ({
      ...prev,
      content: prev.content + template,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingImages(true);

    try {
      let updatedFormData = { ...formData };

      if (mainImage) {
        const uploadUrlResult = await imageUploadMutation.mutateAsync({
          researchId: initialData?.id || "new",
          fileName: mainImage.name,
          type: "main",
        });

        if (uploadUrlResult.url && uploadUrlResult.key) {
          await fetch(uploadUrlResult.url, {
            method: "PUT",
            body: mainImage,
            headers: {
              "Content-Type": mainImage.type,
            },
          });

          updatedFormData.mainImageKey = uploadUrlResult.key;
          updatedFormData.mainImage = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${uploadUrlResult.key}`;
        }
      }

      if (secondaryImage) {
        const uploadUrlResult = await imageUploadMutation.mutateAsync({
          researchId: initialData?.id || "new",
          fileName: secondaryImage.name,
          type: "secondary",
        });

        if (uploadUrlResult.url && uploadUrlResult.key) {
          await fetch(uploadUrlResult.url, {
            method: "PUT",
            body: secondaryImage,
            headers: {
              "Content-Type": secondaryImage.type,
            },
          });

          updatedFormData.secondaryImageKey = uploadUrlResult.key;
          updatedFormData.secondaryImage = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${uploadUrlResult.key}`;
        }
      }

      if (updatedFormData.mainImage || updatedFormData.secondaryImage) {
        let contentWithImages = updatedFormData.content;

        if (updatedFormData.mainImage) {
          contentWithImages = `![Main image](${updatedFormData.mainImage})\n\n${contentWithImages}`;
        }

        if (updatedFormData.secondaryImage) {
          contentWithImages = `${contentWithImages}\n\n![Secondary image](${updatedFormData.secondaryImage})`;
        }

        updatedFormData.content = contentWithImages;
      }

      await onSubmit(updatedFormData);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploadingImages(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 h-[400px] overflow-y-scroll"
    >
      {" "}
      <div>
        <label htmlFor="title" className="block text-secondary-white mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="protocol" className="block text-secondary-white mb-2">
            Protocol
          </label>
          <input
            id="protocol"
            type="text"
            value={formData.protocol}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, protocol: e.target.value }))
            }
            className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
            required
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-secondary-white mb-2">
            Type
          </label>
          <input
            id="type"
            type="text"
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, type: e.target.value }))
            }
            className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
            required
          />
        </div>
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
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
          required
        />
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
          type="date"
          value={formData.publishedAt}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, publishedAt: e.target.value }))
          }
          className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
          required
        />
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-secondary-white mb-2">Main Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "main")}
            className="text-secondary-white"
          />
          {formData.mainImage && (
            <p className="mt-2 text-sm text-secondary-white">
              Current image: {formData.mainImage.split("/").pop()}
            </p>
          )}
        </div>
        <div>
          <label className="block text-secondary-white mb-2">
            Secondary Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "secondary")}
            className="text-secondary-white"
          />
          {formData.secondaryImage && (
            <p className="mt-2 text-sm text-secondary-white">
              Current image: {formData.secondaryImage.split("/").pop()}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => insertTemplate("bullets")}
          className="px-4 py-2 bg-main-dark-grey text-secondary-white rounded-lg hover:bg-opacity-80 transition-colors"
        >
          Add Bullet List
        </button>
        <button
          type="button"
          onClick={() => insertTemplate("numbers")}
          className="px-4 py-2 bg-main-dark-grey text-secondary-white rounded-lg hover:bg-opacity-80 transition-colors"
        >
          Add Numbered List
        </button>
        <button
          type="button"
          onClick={() => insertTemplate("subtitle")}
          className="px-4 py-2 bg-main-dark-grey text-secondary-white rounded-lg hover:bg-opacity-80 transition-colors"
        >
          Add Subtitle
        </button>
        <button
          type="button"
          onClick={() => insertTemplate("image")}
          className="px-4 py-2 bg-main-dark-grey text-secondary-white rounded-lg hover:bg-opacity-80 transition-colors"
        >
          Add Image Placeholder
        </button>
      </div>
      <div data-color-mode="dark">
        <MDEditor
          value={formData.content}
          onChange={handleContentChange}
          height={400}
          preview="edit"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || isUploadingImages}
        className="w-full bg-main-orange text-black py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isLoading || isUploadingImages ? "Saving..." : "Save Research"}
      </button>
    </form>
  );
};

export default AdminResearchForm;
