import React from "react";
import { useAtom } from "jotai";
import { adminModalAtom } from "@/atoms/adminAtoms";

import { toast } from "sonner";
import { trpc } from "../../../utils/trpc";
import AdminTable from "./AdminTable";
import AdminModal from "./AdminModal";
import AdminToolForm from "./AdminToolsForm";

const AdminTools = () => {
  const [modalState, setModalState] = useAtom(adminModalAtom);
  const utils = trpc.useContext();

  const { data: tools, isLoading } = trpc.public.getSecurityTools.useQuery({
    page: 1,
    limit: 100,
    sortField: "name",
    sortDirection: "asc",
  });

  const createTool = trpc.admin.createSecurityTool.useMutation({
    onSuccess: () => {
      utils.public.getSecurityTools.invalidate();
      setModalState({ type: null, section: null });
      toast.success("Security tool created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating security tool: ${error.message}`);
    },
  });

  const updateTool = trpc.admin.updateSecurityTool.useMutation({
    onSuccess: () => {
      utils.public.getSecurityTools.invalidate();
      setModalState({ type: null, section: null });
      toast.success("Security tool updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating security tool: ${error.message}`);
    },
  });

  const deleteTool = trpc.admin.deleteSecurityTool.useMutation({
    onSuccess: () => {
      utils.public.getSecurityTools.invalidate();
      setModalState({ type: null, section: null });
      toast.success("Security tool deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting security tool: ${error.message}`);
    },
  });

  const handleSubmit = async (data: any) => {
    if (modalState.type === "create") {
      await createTool.mutateAsync(data);
    } else if (modalState.type === "edit" && modalState.itemId) {
      await updateTool.mutateAsync({ id: modalState.itemId, ...data });
    }
  };

  const handleDelete = async () => {
    if (modalState.itemId) {
      await deleteTool.mutateAsync(modalState.itemId);
    }
  };

  const columns = [
    { key: "name", header: "Name" },
    { key: "createdBy", header: "Created By" },
    { key: "description", header: "Description" },
    {
      key: "securityUrl",
      header: "URL",
      render: (url: string) =>
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-main-orange hover:underline"
          >
            Visit
          </a>
        ) : (
          "N/A"
        ),
    },
  ];

  return (
    <>
      <AdminTable
        columns={columns}
        data={tools?.items || []}
        section="tools"
        isLoading={isLoading}
      />

      {modalState.type && modalState.section === "tools" && (
        <AdminModal
          title={`${
            modalState.type === "create" ? "Create" : "Edit"
          } Security Tool`}
          onClose={() => setModalState({ type: null, section: null })}
        >
          {modalState.type === "delete" ? (
            <div className="space-y-4">
              <p className="text-secondary-white">
                Are you sure you want to delete this security tool?
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
            <AdminToolForm
              initialData={
                modalState.type === "edit"
                  ? tools?.items.find((t) => t.id === modalState.itemId)
                  : undefined
              }
              onSubmit={handleSubmit}
              isLoading={createTool.isLoading || updateTool.isLoading}
            />
          )}
        </AdminModal>
      )}
    </>
  );
};

export default AdminTools;
