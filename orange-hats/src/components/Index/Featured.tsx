import React from "react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "../../../utils/trpc";
import { ResearchPostWithContent } from "../blog/ResearchList.tsx";

const Featured: React.FC = () => {
  const { data: researchData, isLoading } = trpc.public.getResearch.useQuery({
    page: 1,
    limit: 4,
    sortField: "publishedAt",
    sortDirection: "desc",
  });

  const renderResearchItem = (post: ResearchPostWithContent) => (
    <Link
      href={`/research/${post.slug}`}
      key={post.id}
      className="flex-none group"
    >
      <div className="w-[172px] h-[172px] md:w-[320px] md:h-[520px] bg-main-dark-grey rounded-xl overflow-hidden flex flex-col">
        <div className="relative w-full h-[108px] md:h-[330px]">
          <Image
            src={post.mainImage || "/PlaceHolder.png"}
            alt={post.title}
            fill
            className="object-cover rounded-t-xl transition-transform group-hover:scale-105"
            priority
          />
        </div>
        <div className="p-4 md:p-6 flex-1 bg-background">
          <h4 className="text-[16px] md:text-[22px] font-space-grotesk font-bold text-secondary-white group-hover:text-main-orange transition-colors">
            {post.title}
          </h4>
          <p className="text-[14px] md:text-[16px] text-secondary-white mt-2 line-clamp-2 md:line-clamp-none opacity-80">
            {post.description}
          </p>
        </div>
      </div>
    </Link>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-16 h-16 mb-4 relative">
        <Image
          src="/PlaceHolder.png"
          alt="No content"
          fill
          className="object-contain"
        />
      </div>
      <p className="text-secondary-white text-lg mb-2">No research posts yet</p>
      <p className="text-secondary-white opacity-60 text-sm text-center max-w-md">
        Check back soon for security research, analysis, and important findings
        from the ecosystem
      </p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex space-x-6 pb-6">
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="w-[172px] h-[172px] md:w-[320px] md:h-[520px] bg-main-dark-grey rounded-xl overflow-hidden flex flex-col animate-pulse"
        >
          <div className="w-full h-[108px] md:h-[330px] bg-background/10" />
          <div className="p-4 md:p-6 flex-1 space-y-4">
            <div className="h-4 bg-background/10 rounded w-3/4" />
            <div className="h-4 bg-background/10 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="w-full">
      <div className="hidden md:block relative -mx-12">
        <div className="absolute inset-0">
          <Image
            src="/Background1.png"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative max-w-7xl mx-auto grid grid-cols-3 gap-8 px-24 py-24">
          <div className="col-span-2">
            <h2 className="text-[26px] font-space-mono text-secondary-white">
              As Strong As Our Weakest Community Member
            </h2>
            <p className="text-[18px] font-space-mono text-secondary-white mt-5">
              The OrangeHats initiative is a cross-community effort backed by
              BitcoinL2Labs & operated by SetDev. Our goal is to provide
              resources & opportunities to life the security floor of all Stacks
              startups. Every page here is designed to provide free,
              self-directed help; however, if you&apos;re in need of a sponsored
              audit, or interested in auditing (paid), or seeking funding for a
              security tool, please reach out through on the Apply page.
            </p>
          </div>
          <div className="col-span-1">
            <p className="text-[20px] font-space-grotesk text-black text-center bg-main-orange w-[322px] h-[280px] items-center justify-center px-3 rounded-[20px] flex flex-col">
              Join the ClarityWG meetings every other Tuesday at 9 am (EST). DM{" "}
              <Link
                href={"https://x.com/setzeus"}
                target="_blank"
                className="underline font-bold"
              >
                {" "}
                @setzeus
              </Link>
              on X for an invite link.
            </p>
          </div>
        </div>
      </div>

      <div className="md:hidden relative bg-main-dark-grey -mx-8">
        <div className="absolute inset-0">
          <Image
            src="/Background2.png"
            alt="Mobile Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative px-6 py-12 space-y-8 flex flex-col items-center">
          <h2 className="text-[24px] font-space-mono text-secondary-white text-center">
            As Strong As Our Weakest Community Member
          </h2>
          <p className="text-[16px] font-space-grotesk text-secondary-white">
            The OrangeHats initiative is a cross-community effort backed by
            BitcoinL2Labs & operated by SetDev. Our goal is to provide resources
            & opportunities to life the security floor of all Stacks startups.
            Every page here is designed to provide free, self-directed help;
            however, if you&apos;re in need of a sponsored audit, or interested
            in auditing (paid), or seeking funding for a security tool, please
            reach out through on the Apply page.
          </p>
          <div className="flex justify-center w-full">
            <p className="text-[20px] font-space-grotesk text-black text-center bg-main-orange w-[322px] h-[280px]  items-center justify-center px-3 rounded-[20px] flex flex-col">
              Join the ClarityWG meetings every other Tuesday at 9 am (EST). DM{" "}
              <Link
                href={"https://x.com/setzeus"}
                target="_blank"
                className="underline font-bold"
              >
                {" "}
                @setzeus
              </Link>
              on X for an invite link.
            </p>
          </div>

          <div className="w-full">
            <h3 className="text-[24px] font-space-grotesk text-secondary-white mb-8">
              Read up on previous additions
            </h3>

            <div className="overflow-x-auto scrollbar-hide">
              {isLoading ? (
                renderLoadingState()
              ) : !researchData?.items?.length ? (
                renderEmptyState()
              ) : (
                <div className="flex space-x-6 pb-6">
                  {researchData.items.map(renderResearchItem)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block max-w-7xl mx-auto px-6 py-24">
        <h3 className="text-[36px] font-space-grotesk text-secondary-white mb-8">
          Read up on previous additions
        </h3>

        <div className="overflow-x-auto scrollbar-hide">
          {isLoading ? (
            renderLoadingState()
          ) : !researchData?.items?.length ? (
            renderEmptyState()
          ) : (
            <div className="flex space-x-6 pb-6">
              {researchData.items.map(renderResearchItem)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Featured;
