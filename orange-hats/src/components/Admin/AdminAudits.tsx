import React from "react";
import { useAtom } from "jotai";
import { adminModalAtom } from "@/atoms/adminAtoms";

import { toast } from "sonner";
import { trpc } from "../../../utils/trpc";
import AdminTable from "./AdminTable";
import AdminModal from "./AdminModal";
import AdminAuditForm from "./AdminAuditForm";

const AdminAudits = () => {
  const [modalState, setModalState] = useAtom(adminModalAtom);
  const utils = trpc.useContext();

  const { data: audits, isLoading } = trpc.public.getAudits.useQuery({
    page: 1,
    limit: 100,
    sortField: "publishedAt",
    sortDirection: "desc",
  });

  const createAudit = trpc.admin.createAudit.useMutation({
    onSuccess: () => {
      utils.public.getAudits.invalidate();
      setModalState({ type: null, section: null });
      toast.success("Audit created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating audit: ${error.message}`);
    },
  });

  const updateAudit = trpc.admin.updateAudit.useMutation({
    onSuccess: () => {
      utils.public.getAudits.invalidate();
      setModalState({ type: null, section: null });
      toast.success("Audit updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating audit: ${error.message}`);
    },
  });

  const deleteAudit = trpc.admin.deleteAudit.useMutation({
    onSuccess: () => {
      utils.public.getAudits.invalidate();
      setModalState({ type: null, section: null });
      toast.success("Audit deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting audit: ${error.message}`);
    },
  });

  const handleSubmit = async (data: any) => {
    if (modalState.type === "create") {
      await createAudit.mutateAsync(data);
    } else if (modalState.type === "edit" && modalState.itemId) {
      await updateAudit.mutateAsync({ id: modalState.itemId, ...data });
    }
  };

  const handleDelete = async () => {
    if (modalState.itemId) {
      await deleteAudit.mutateAsync(modalState.itemId);
    }
  };

  const columns = [
    { key: "protocol", header: "Protocol" },
    {
      key: "contracts",
      header: "Contracts",
      render: (contracts: string[]) => contracts.join(", "),
    },
    {
      key: "publishedAt",
      header: "Published",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <>
      <AdminTable
        columns={columns}
        data={audits?.items || []}
        section="audits"
        isLoading={isLoading}
      />

      {modalState.type && modalState.section === "audits" && (
        <AdminModal
          title={`${modalState.type === "create" ? "Create" : "Edit"} Audit`}
          onClose={() => setModalState({ type: null, section: null })}
        >
          {modalState.type === "delete" ? (
            <div className="space-y-4">
              <p className="text-secondary-white">
                Are you sure you want to delete this audit?
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
            <AdminAuditForm
              initialData={
                modalState.type === "edit"
                  ? audits?.items.find((a) => a.id === modalState.itemId)
                  : undefined
              }
              onSubmit={handleSubmit}
              isLoading={createAudit.isLoading || updateAudit.isLoading}
            />
          )}
        </AdminModal>
      )}
    </>
  );
};

export default AdminAudits;
