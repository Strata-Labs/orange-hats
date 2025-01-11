import React from "react";
import { useAtom } from "jotai";
import { adminModalAtom, AdminSection } from "@/atoms/adminAtoms";

interface Column {
  key: string;
  header: string;
  render?: (value: any) => React.ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
  section: AdminSection;
  isLoading?: boolean;
}

const AdminTable: React.FC<AdminTableProps> = ({
  columns,
  data,
  section,
  isLoading = false,
}) => {
  const [, setModalState] = useAtom(adminModalAtom);

  const handleCreate = () => {
    setModalState({ type: "create", section });
  };

  const handleEdit = (itemId: string) => {
    setModalState({ type: "edit", section, itemId });
  };

  const handleDelete = (itemId: string) => {
    setModalState({ type: "delete", section, itemId });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleCreate}
          className="bg-main-orange text-black px-6 py-2 rounded-full hover:opacity-90 transition-opacity font-space-grotesk"
        >
          Add New
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-main-dark-grey text-[14px] md:text-[16px]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="py-4 px-6 text-left text-secondary-white font-space-grotesk"
                >
                  {column.header}
                </th>
              ))}
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-4 text-secondary-white"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-4 text-secondary-white"
                >
                  No items found
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-main-dark-grey hover:bg-background/50 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={`${item.id}-${column.key}`}
                      className="py-4 px-6 text-secondary-white"
                    >
                      {column.render
                        ? column.render(item[column.key])
                        : item[column.key]}
                    </td>
                  ))}
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(item.id)}
                      className="px-3 py-1 text-secondary-white hover:text-main-orange transition-colors font-space-grotesk"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 text-secondary-white hover:text-red-500 transition-colors font-space-grotesk"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
