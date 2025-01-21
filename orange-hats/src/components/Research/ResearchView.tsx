import React from "react";
import { useRouter } from "next/router";
import Menu from "@/components/Menu/Menu";
import { useAtom } from "jotai";
import { researchSortAtom, researchPaginationAtom } from "@/atoms";
import { ResearchSortField } from "@/atoms/types";
import { trpc } from "../../../utils/trpc";
import Image from "next/image";
import Link from "next/link";
import { ResearchPostWithContent } from "../blog/ResearchList.tsx";

const SortButton: React.FC<{
  field: ResearchSortField;
  currentField: ResearchSortField;
  direction: "asc" | "desc";
  onClick: () => void;
  children: React.ReactNode;
}> = ({ field, currentField, direction, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full transition-colors ${
      currentField === field
        ? "bg-main-orange text-black"
        : "bg-main-dark-grey text-secondary-white hover:bg-opacity-80"
    }`}
  >
    {children}
    {currentField === field && (
      <span className="ml-2">{direction === "asc" ? "↑" : "↓"}</span>
    )}
  </button>
);

const ResearchView: React.FC = () => {
  const router = useRouter();
  const [sortState, setSortState] = useAtom(researchSortAtom);
  const [pagination, setPagination] = useAtom(researchPaginationAtom);
  const utils = trpc.useContext();

  const { data: researchData, isLoading } = trpc.public.getResearch.useQuery({
    page: pagination.page,
    limit: pagination.limit,
    sortField: sortState.field,
    sortDirection: sortState.direction,
    search: pagination.search,
  });

  const handleSort = async (field: ResearchSortField) => {
    const newDirection =
      field === sortState.field && sortState.direction === "asc"
        ? "desc"
        : "asc";

    setSortState({ field, direction: newDirection });

    await utils.public.getResearch.invalidate();
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage },
    });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const search = event.target.value;
    setPagination((prev) => ({ ...prev, search, page: 1 }));
  };

  const renderResearchItem = (research: ResearchPostWithContent) => (
    <article
      key={research.id}
      className="group bg-main-dark-grey rounded-xl overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg"
    >
      <Link href={research.jekyllUrl}>
        {research.mainImage && (
          <div className="relative w-full h-[300px]">
            <Image
              src={research.mainImage}
              alt={research.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 text-sm text-secondary-white opacity-80 mb-2">
            <span>{research.protocol}</span>
            <span>•</span>
            <time>
              {new Date(research.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
          <h2 className="text-2xl font-space-mono text-secondary-white group-hover:text-main-orange transition-colors mb-3">
            {research.title}
          </h2>
          <p className="text-secondary-white text-base line-clamp-3">
            {research.description}
          </p>
        </div>
      </Link>
    </article>
  );

  return (
    <div className="min-h-screen bg-background">
      <Menu />

      <main className="max-w-7xl mx-auto px-6 pt-8 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-[30px] md:text-[48px] font-space-mono text-secondary-white mb-4">
            Security Research
          </h1>
          <p className="text-[18px] md:text-[32px] font-space-grotesk text-secondary-white">
            Here you'll find security research, analysis, and important findings
            from the ecosystem.
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <SortButton
              field="publishedAt"
              currentField={sortState.field}
              direction={sortState.direction}
              onClick={() => handleSort("publishedAt")}
            >
              Date
            </SortButton>
            <SortButton
              field="protocol"
              currentField={sortState.field}
              direction={sortState.direction}
              onClick={() => handleSort("protocol")}
            >
              Protocol
            </SortButton>
            <SortButton
              field="type"
              currentField={sortState.field}
              direction={sortState.direction}
              onClick={() => handleSort("type")}
            >
              Type
            </SortButton>
          </div>

          <input
            type="text"
            placeholder="Search research..."
            value={pagination.search || ""}
            onChange={handleSearch}
            className="w-full sm:w-auto px-4 py-2 bg-main-dark-grey border border-secondary-white rounded-full text-secondary-white focus:outline-none focus:border-main-orange transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-main-orange border-r-transparent" />
          </div>
        ) : researchData?.items.length === 0 ? (
          <div className="text-center py-12 text-secondary-white">
            No research found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {researchData?.items.map(renderResearchItem)}
          </div>
        )}

        {researchData && researchData.metadata.totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-12">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!researchData.metadata.hasPreviousPage}
              className="px-6 py-2 bg-main-orange text-black rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-2 text-secondary-white">
              <span>Page</span>
              <span className="px-3 py-1 bg-main-dark-grey rounded-md">
                {pagination.page}
              </span>
              <span>of {researchData.metadata.totalPages}</span>
            </div>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!researchData.metadata.hasNextPage}
              className="px-6 py-2 bg-main-orange text-black rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResearchView;
