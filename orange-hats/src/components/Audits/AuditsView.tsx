import React from "react";
import { useRouter } from "next/router";
import Menu from "@/components/Menu/Menu";
import { useAtom } from "jotai";
import { auditSortAtom, auditPaginationAtom } from "@/atoms";
import { AuditSortField } from "@/atoms/types";
import { trpc } from "../../../utils/trpc";
import { Audit, Auditor } from "@prisma/client";
import Image from "next/image";
import SponsoredJoinButtons from "./SponsoredJoin";

interface AuditWithAuditors extends Audit {
  auditors: Auditor[];
}

const SortArrow: React.FC<{ direction: "asc" | "desc" }> = ({ direction }) => (
  <Image
    src="/Arrows.png"
    alt={`Sort ${direction}`}
    width={12}
    height={12}
    className={`inline-block ml-2 ${direction === "desc" ? "rotate-180" : ""}`}
  />
);

const AuditsView = () => {
  const router = useRouter();
  const [sortState, setSortState] = useAtom(auditSortAtom);
  const [pagination] = useAtom(auditPaginationAtom);
  const utils = trpc.useContext();

  const { data: auditsData, isLoading } = trpc.public.getAudits.useQuery({
    page: pagination.page,
    limit: pagination.limit,
    sortField: sortState.field,
    sortDirection: sortState.direction,
  });

  const handleSort = (field: AuditSortField) => {
    setSortState((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleRowClick = async (auditId: string) => {
    try {
      const result = await utils.public.getPdfDownloadUrl.fetch(auditId);
      if (result.url) {
        window.open(result.url, "_blank");
      }
    } catch (error) {
      console.error("Failed to get download URL:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Menu />

      <main className="max-w-7xl mx-auto px-6 pt-8">
        <h1 className="text-[30px] md:text-[48px] font-space-mono text-secondary-white mb-4 text-center">
          Ecosystem Audits
        </h1>

        <p className="text-[18px] md:text-[32px] font-space-grotesk text-secondary-white mb-8 text-center">
          Here you&apos;ll find all existing Stacks audits provided by auditors.
          If any is missing, please make PR here. If you&apos;re a team looking
          to apply for an OrangeHats sponsored audits, click below.
        </p>

        <SponsoredJoinButtons />

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-6">
            <thead>
              <tr className="text-[10px] md:text-[16px]">
                <th
                  className="py-4 px-6 text-left cursor-pointer hover:text-main-orange"
                  onClick={() => handleSort("protocol")}
                >
                  Protocol
                  {sortState.field === "protocol" && (
                    <SortArrow direction={sortState.direction} />
                  )}
                </th>
                <th
                  className="py-4 px-6 text-left cursor-pointer hover:text-main-orange block sm:table-cell"
                  onClick={() => handleSort("publishedAt")}
                >
                  Auditor
                  {sortState.field === "publishedAt" && (
                    <SortArrow direction={sortState.direction} />
                  )}
                </th>
                <th className="py-4 px-6 text-left hidden sm:table-cell">
                  Assignment
                </th>
                <th
                  className="py-4 px-6 text-left cursor-pointer hover:text-main-orange"
                  onClick={() => handleSort("publishedAt")}
                >
                  Published
                  {sortState.field === "publishedAt" && (
                    <SortArrow direction={sortState.direction} />
                  )}
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
                auditsData?.items.map((audit: AuditWithAuditors) => (
                  <tr
                    key={audit.id}
                    onClick={() => handleRowClick(audit.id)}
                    className="cursor-pointer hover:bg-main-orange hover:-translate-y-1 bg-main-dark-grey transition-all ease-in-out duration-500"
                  >
                    <td className="first:rounded-l-full last:rounded-r-full py-4 px-6">
                      {audit.protocol}
                    </td>
                    <td className=" py-4 px-6 block sm:table-cell">
                      {audit.auditors.map((auditor) => auditor.name).join(", ")}
                    </td>
                    <td className=" py-4 px-6 hidden sm:table-cell">
                      {audit.contracts.join(", ")}
                    </td>
                    <td className="first:rounded-l-full last:rounded-r-full py-4 px-6">
                      {new Date(audit.publishedAt).toLocaleDateString()}
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

export default AuditsView;
