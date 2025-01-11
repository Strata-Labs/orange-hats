import React from "react";
import { useAtom } from "jotai";
import { adminModalAtom } from "@/atoms/adminAtoms";
import { toast } from "sonner";
import { trpc } from "../../../utils/trpc";
import AdminTable from "./AdminTable";
import AdminModal from "./AdminModal";
import AdminAuditorForm from "./AdminAuditorsForm";

const AdminAuditors = () => {
  const [modalState, setModalState] = useAtom(adminModalAtom);
  const utils = trpc.useContext();

  const { data: auditors, isLoading } = trpc.public.getAuditors.useQuery({
    page: 1,
    limit: 100,
    sortField: "name",
    sortDirection: "asc",
  });

  const createAuditor = trpc.admin.createAuditor.useMutation({
    onSuccess: () => {
      utils.public.getAuditors.invalidate();
      setModalState({ type: null, section: null });
      toast.success("Auditor created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating auditor: ${error.message}`);
    },
  });

  const updateAuditor = trpc.admin.updateAuditor.useMutation({
    onSuccess: () => {
      utils.public.getAuditors.invalidate();
      setModalState({ type: null, section: null });
      toast.success("Auditor updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating auditor: ${error.message}`);
    },
  });

  const deleteAuditor = trpc.admin.deleteAuditor.useMutation({
    onSuccess: () => {
      utils.public.getAuditors.invalidate();
      setModalState({ type: null, section: null });
      toast.success("Auditor deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting auditor: ${error.message}`);
    },
  });

  const handleSubmit = async (data: any) => {
    if (modalState.type === "create") {
      await createAuditor.mutateAsync(data);
    } else if (modalState.type === "edit" && modalState.itemId) {
      await updateAuditor.mutateAsync({ id: modalState.itemId, ...data });
    }
  };

  const handleDelete = async () => {
    if (modalState.itemId) {
      await deleteAuditor.mutateAsync(modalState.itemId);
    }
  };

  const columns = [
    { key: "name", header: "Name" },
    { key: "team", header: "Team" },
    {
      key: "proofOfWork",
      header: "Proof of Work",
      render: (proofOfWork: string[]) => proofOfWork.join(", "),
    },
    { key: "contact", header: "Contact" },
    {
      key: "websiteUrl",
      header: "Website",
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
        data={auditors?.items || []}
        section="auditors"
        isLoading={isLoading}
      />

      {modalState.type && modalState.section === "auditors" && (
        <AdminModal
          title={`${modalState.type === "create" ? "Create" : "Edit"} Auditor`}
          onClose={() => setModalState({ type: null, section: null })}
        >
          {modalState.type === "delete" ? (
            <div className="space-y-4">
              <p className="text-secondary-white">
                Are you sure you want to delete this auditor?
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
            <AdminAuditorForm
              initialData={
                modalState.type === "edit"
                  ? auditors?.items.find((a) => a.id === modalState.itemId)
                  : undefined
              }
              onSubmit={handleSubmit}
              isLoading={createAuditor.isLoading || updateAuditor.isLoading}
            />
          )}
        </AdminModal>
      )}
    </>
  );
};

export default AdminAuditors;
