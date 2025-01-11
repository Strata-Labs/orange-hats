import React from "react";
import { useRouter } from "next/router";
import Menu from "@/components/Menu/Menu";
import { useAtom } from "jotai";
import { auditorSortAtom, auditorPaginationAtom } from "@/atoms";
import { AuditorSortField } from "@/atoms/types";
import { trpc } from "../../../utils/trpc";
import { Auditor } from "@prisma/client";
import Image from "next/image";

const SortArrow: React.FC<{ direction: "asc" | "desc" }> = ({ direction }) => (
  <Image
    src="/Arrows.png"
    alt={`Sort ${direction}`}
    width={12}
    height={12}
    className={`inline-block ml-2 ${direction === "desc" ? "rotate-180" : ""}`}
  />
);

const AuditorsView = () => {
  const router = useRouter();
  const [sortState, setSortState] = useAtom(auditorSortAtom);
  const [pagination] = useAtom(auditorPaginationAtom);

  const { data: auditorsData, isLoading } = trpc.public.getAuditors.useQuery({
    page: pagination.page,
    limit: pagination.limit,
    sortField: sortState.field,
    sortDirection: sortState.direction,
  });

  const handleSort = (field: AuditorSortField) => {
    setSortState((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Menu />

      <main className="max-w-7xl mx-auto px-6 pt-8">
        <h1 className="text-[30px] md:text-[48px] font-space-mono text-secondary-white mb-4 text-center">
          Ecosystem Auditors
        </h1>

        <p className="text-[18px] md:text-[32px] font-space-grotesk text-secondary-white mb-8 text-center">
          Who can you trust with the security of your contracts? Ultimately, no
          one but yourself, but here&apos;s a handful of freelancers & firms
          that have proven themselves multiple times.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12 items-center justify-center">
          <button className="w-full sm:w-[224px] h-[60px] bg-main-orange text-black text-[20px] font-bold rounded-[100px] hover:opacity-90 transition-opacity">
            Sponsored Audits
          </button>
          <button className="w-full sm:w-[224px] h-[60px] bg-main-dark-grey text-secondary-white text-[20px] font-bold rounded-[100px] hover:opacity-90 transition-opacity">
            Join TaskForce
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className=" text-[10px] md:text-[16px]">
                <th
                  className="py-4 px-6 text-left cursor-pointer hover:text-main-orange"
                  onClick={() => handleSort("name")}
                >
                  Name
                  {sortState.field === "name" && (
                    <SortArrow direction={sortState.direction} />
                  )}
                </th>
                <th
                  className="py-4 px-6 text-left cursor-pointer hover:text-main-orange block sm:table-cell"
                  onClick={() => handleSort("team")}
                >
                  Team
                  {sortState.field === "team" && (
                    <SortArrow direction={sortState.direction} />
                  )}
                </th>
                <th className="py-4 px-6 text-left hidden sm:table-cell">
                  Proof of Work
                </th>
                <th className="py-4 px-6 text-left cursor-pointer hover:text-main-orange">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : (
                auditorsData?.items.map((auditor: Auditor) => (
                  <tr
                    key={auditor.id}
                    className="cursor-pointer hover:bg-black"
                  >
                    <td className="first:rounded-l-full last:rounded-r-full bg-main-dark-grey py-4 px-6">
                      {auditor.name}
                    </td>
                    <td className="bg-main-dark-grey py-4 px-6 block sm:table-cell">
                      {auditor.team || "-"}
                    </td>
                    <td className="bg-main-dark-grey py-4 px-6 hidden sm:table-cell">
                      {auditor.proofOfWork.join(", ") || "-"}
                    </td>
                    <td className="first:rounded-l-full last:rounded-r-full bg-main-dark-grey py-4 px-6">
                      {auditor.contact}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AuditorsView;
