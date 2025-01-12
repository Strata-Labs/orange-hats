import React from "react";
import Image from "next/image";
import Menu from "@/components/Menu/Menu";
import { useAtom } from "jotai";
import { securityToolPaginationAtom, selectedTypeAtom } from "@/atoms";
import { trpc } from "../../../utils/trpc";
import Link from "next/link";
import { SecurityToolWithSignedUrl } from "@/atoms/types";
import type { PaginatedResponse } from "@/atoms/types";

const ToolsView = () => {
  const [pagination] = useAtom(securityToolPaginationAtom);
  const [, setSelectedType] = useAtom(selectedTypeAtom);

  const { data: toolsData, isLoading } = trpc.public.getSecurityTools.useQuery({
    page: pagination.page,
    limit: pagination.limit,
    sortField: "name",
    sortDirection: "asc",
  });

  const handleGrantClick = () => {
    setSelectedType("grant");
  };

  const handleToolClick = (securityUrl: string | null) => {
    if (securityUrl) {
      window.open(securityUrl, "_blank");
    }
  };

  const renderToolImage = (tool: SecurityToolWithSignedUrl) => {
    const imageUrl = tool.signedImageUrl || "/PlaceHolder.png";

    return (
      <div className="relative w-full h-full">
        <Image
          src={imageUrl}
          alt={tool.name}
          width={1000}
          height={1000}
          className="object-cover rounded-t-xl h-[200px]"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/PlaceHolder.png";
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Menu />

      <main className="max-w-7xl mx-auto px-6 pt-8">
        <h1 className="text-[30px] md:text-[48px] font-space-mono text-secondary-white mb-4 text-center">
          Security Tools
        </h1>

        <p className="text-[18px] md:text-[32px] font-space-grotesk text-secondary-white mb-8 text-center">
          Here you&apos;ll find all existing ecosystem security-based tools.
          Most of these tools are Clarity-focused with the goal of securing
          production deployments.
        </p>

        <div className="flex justify-center mb-12">
          <Link
            className="w-full sm:w-[224px] h-[60px] bg-main-orange text-black text-[20px] font-bold rounded-[100px] hover:opacity-90 transition-opacity flex items-center justify-center"
            href={"/apply"}
            onClick={handleGrantClick}
          >
            Apply For Grant
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="hidden md:grid md:grid-cols-2 gap-8 mb-12 w-full place-items-center">
              {toolsData?.items.map((tool) => (
                <div
                  key={tool.id}
                  className="flex flex-col items-start h-[292px] w-[460px] bg-main-dark-grey rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
                  onClick={() => handleToolClick(tool.securityUrl)}
                >
                  <div className="relative h-[190px] w-full">
                    {renderToolImage(tool)}
                    {tool.securityUrl && (
                      <div className="absolute top-4 right-4 bg-main-orange text-black px-3 py-1 rounded-full text-sm">
                        Visit Tool
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 w-full">
                    <h3 className="text-[22px] font-space-grotesk font-bold text-secondary-white mb-2">
                      {tool.name}
                    </h3>
                    <p className="text-secondary-white text-base line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:hidden flex flex-col gap-6 w-full items-center">
              {toolsData?.items.map((tool) => (
                <div
                  key={tool.id}
                  className="flex flex-col items-start h-[230px] w-full max-w-[380px] bg-main-dark-grey rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
                  onClick={() => handleToolClick(tool.securityUrl)}
                >
                  <div className="relative h-[150px] w-full">
                    {renderToolImage(tool)}
                    {tool.securityUrl && (
                      <div className="absolute top-4 right-4 bg-main-orange text-black px-3 py-1 rounded-full text-sm">
                        Visit Tool
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 w-full">
                    <h3 className="text-[20px] font-space-grotesk font-bold text-secondary-white">
                      {tool.name}
                    </h3>
                    <p className="text-secondary-white text-sm line-clamp-1">
                      {tool.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ToolsView;
