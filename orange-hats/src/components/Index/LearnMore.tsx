import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { currentRouteAtom } from "../../atoms";

const LearnMore: React.FC = () => {
  const router = useRouter();
  const [, setCurrentRoute] = useAtom(currentRouteAtom);

  const handleLearnMore = () => {
    setCurrentRoute("/audits");
    router.push("/audits");
  };

  return (
    <div className="max-w-7xl mx-5 mt-[50px] flex flex-col items-center md:items-start md:flex-row md:justify-between">
      <div className="block md:hidden mb-8">
        <Image
          src="/LearnMore.png"
          alt="LearnMore"
          width={1000}
          height={1000}
          className="object-contain w-[223px] h-[223px]"
          priority
        />
      </div>

      <div className="flex flex-col items-center md:items-start">
        <h1 className="text-[32px] text-center md:text-left md:text-[48px] font-space-mono leading-relaxed text-secondary-white md:-mt-8">
          Clarity security <br /> basics for the <br />
          Stacks ecosystem.
        </h1>
        <button
          onClick={handleLearnMore}
          className="bg-main-orange text-black font-bold rounded-[100px] font-dm-sans text-[20px] transition-all duration-200 hover:opacity-90 w-[206px] h-[60px] mt-[50px] md:mt-[100px]"
        >
          Learn More
        </button>
      </div>

      <div className="hidden md:block ">
        <Image
          src="/LearnMore.png"
          alt="LearnMore"
          width={1000}
          height={1000}
          className="object-contain w-[373px] h-[373px] shadow-lg shadow-main-orange rounded-3xl"
          priority
        />
      </div>
    </div>
  );
};

export default LearnMore;
