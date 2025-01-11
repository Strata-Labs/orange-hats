//components/Admin/AdminResearch.tsx

import React from "react";
import { useAtom } from "jotai";
import { adminModalAtom } from "@/atoms/adminAtoms";
import { toast } from "sonner";

import AdminTable from "./AdminTable";
import AdminModal from "./AdminModal";
import AdminResearchForm from "./AdminResearchForm";
import { trpc } from "../../../utils/trpc";
import { ResearchPost } from "../blog/ResearchList.tsx";

interface ResearchItem {
  id: string;
  title: string;
  content:
    | string
    | {
        compiledSource: string;
        scope: Record<string, unknown>;
        frontmatter: Record<string, unknown>;
      };
  protocol: string;
  type: string;
  description: string;
  publishedAt: string;
  slug: string;
  jekyllUrl: string;
  mainImage: string | null;
  mainImageKey: string | null;
  secondaryImage: string | null;
  secondaryImageKey: string | null;
  createdAt: string;
  updatedAt: string;
}

const AdminResearch = () => {
  const [modalState, setModalState] = useAtom(adminModalAtom);
  const utils = trpc.useContext();

  const { data: research, isLoading } = trpc.public.getResearch.useQuery({
    page: 1,
    limit: 100,
    sortField: "publishedAt",
    sortDirection: "desc",
  });

  const createResearch = trpc.admin.createResearch.useMutation({
    onSuccess: () => {
      utils.public.getResearch.invalidate();
      setModalState({ type: null, section: null });
      toast.success("Research created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating research: ${error.message}`);
    },
  });

  const updateResearch = trpc.admin.updateResearch.useMutation({
    onSuccess: () => {
      utils.public.getResearch.invalidate();
      setModalState({ type: null, section: null });
      toast.success("Research updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating research: ${error.message}`);
    },
  });

  const deleteResearch = trpc.admin.deleteResearch.useMutation({
    onSuccess: () => {
      utils.public.getResearch.invalidate();
      setModalState({ type: null, section: null });
      toast.success("Research deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting research: ${error.message}`);
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      const formData = {
        protocol: data.protocol,
        type: data.type,
        title: data.title,
        description: data.description,
        content: data.content,
        publishedAt: data.publishedAt,
        mainImage: data.mainImage || null,
        mainImageKey: data.mainImageKey || null,
        secondaryImage: data.secondaryImage || null,
        secondaryImageKey: data.secondaryImageKey || null,
      };

      if (modalState.type === "create") {
        await createResearch.mutateAsync(formData);
      } else if (modalState.type === "edit" && modalState.itemId) {
        await updateResearch.mutateAsync({
          id: modalState.itemId,
          ...formData,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to save research");
    }
  };

  const handleDelete = async () => {
    if (modalState.itemId) {
      await deleteResearch.mutateAsync(modalState.itemId);
    }
  };

  const columns = [
    { key: "protocol", header: "Protocol" },
    { key: "type", header: "Type" },
    { key: "title", header: "Title" },
    { key: "description", header: "Description" },
    {
      key: "publishedAt",
      header: "Published",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      key: "jekyllUrl",
      header: "URL",
      render: (url: string) =>
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-main-orange hover:underline"
          >
            View
          </a>
        ) : (
          "N/A"
        ),
    },
  ];

  const prepareInitialData = (item: ResearchItem | undefined) => {
    if (!item) return undefined;

    return {
      ...item,
      content: typeof item.content === "string" ? item.content : "",
      publishedAt: new Date(item.publishedAt),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      mainImage: item.mainImage || "",
      mainImageKey: item.mainImageKey || "",
      secondaryImage: item.secondaryImage || "",
      secondaryImageKey: item.secondaryImageKey || "",
    };
  };

  return (
    <>
      <AdminTable
        columns={columns}
        data={research?.items || []}
        section="research"
        isLoading={isLoading}
      />

      {modalState.type && modalState.section === "research" && (
        <AdminModal
          title={`${modalState.type === "create" ? "Create" : "Edit"} Research`}
          onClose={() => setModalState({ type: null, section: null })}
        >
          {modalState.type === "delete" ? (
            <div className="space-y-4">
              <p className="text-secondary-white">
                Are you sure you want to delete this research?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setModalState({ type: null, section: null })}
                  className="px-4 py-2 text-secondary-white hover:text-main-orange transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <AdminResearchForm
              initialData={prepareInitialData(
                research?.items.find((r) => r.id === modalState.itemId)
              )}
              onSubmit={handleSubmit}
              isLoading={createResearch.isLoading || updateResearch.isLoading}
            />
          )}
        </AdminModal>
      )}
    </>
  );
};

export default AdminResearch;
