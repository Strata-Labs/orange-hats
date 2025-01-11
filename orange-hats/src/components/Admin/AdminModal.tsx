import React from "react";
import { useAtom } from "jotai";
import { adminModalAtom } from "@/atoms/adminAtoms";

interface AdminModalProps {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({
  children,
  title,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-background rounded-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-main-dark-grey">
          <h3 className="text-xl font-space-mono text-secondary-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-secondary-white hover:text-main-orange transition-colors px-2 py-1"
          >
            X
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default AdminModal;
