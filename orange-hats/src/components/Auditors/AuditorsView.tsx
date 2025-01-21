import React from "react";
import { useRouter } from "next/router";
import Menu from "@/components/Menu/Menu";
import { useAtom } from "jotai";
import { auditorSortAtom, auditorPaginationAtom } from "@/atoms";
import { AuditorSortField } from "@/atoms/types";
import { trpc } from "../../../utils/trpc";
import { Auditor } from "@prisma/client";
import Image from "next/image";
import SponsoredJoinButtons from "../Audits/SponsoredJoin";
import Pagination from "../Pagination";

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
  const [pagination, setPagination] = useAtom(auditorPaginationAtom);
  const utils = trpc.useContext();

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const { data: auditorsData, isLoading } = trpc.public.getAuditors.useQuery({
    page: pagination.page,
    limit: pagination.limit,
    sortField: sortState.field,
    sortDirection: sortState.direction,
  });

  const handleSort = async (field: AuditorSortField) => {
    const newDirection =
      field === sortState.field && sortState.direction === "asc"
        ? "desc"
        : "asc";

    setSortState({ field, direction: newDirection });

    await utils.public.getAuditors.invalidate();
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

        <SponsoredJoinButtons />

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-6">
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
                    className="cursor-pointer hover:bg-main-orange hover:-translate-y-1 bg-main-dark-grey transition-all ease-in-out duration-500"
                  >
                    <td className="first:rounded-l-full last:rounded-r-full py-4 px-6">
                      {auditor.name}
                    </td>
                    <td className=" py-4 px-6 block sm:table-cell">
                      {auditor.team || "-"}
                    </td>
                    <td className=" py-4 px-6 hidden sm:table-cell">
                      {auditor.proofOfWork.join(", ") || "-"}
                    </td>
                    <td className="first:rounded-l-full last:rounded-r-full  py-4 px-6">
                      {auditor.contact}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {auditorsData && auditorsData.metadata.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={auditorsData.metadata.totalPages}
            hasNextPage={auditorsData.metadata.hasNextPage}
            hasPreviousPage={auditorsData.metadata.hasPreviousPage}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
};

export default AuditorsView;
