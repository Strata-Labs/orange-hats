import { selectedTypeAtom } from "@/atoms";
import { useAtom } from "jotai";
import Link from "next/link";
import React from "react";

const SponsoredJoinButtons = () => {
  const [, setSelectedType] = useAtom(selectedTypeAtom);

  const handleAuditClick = () => {
    setSelectedType("audit");
  };

  const handleAuditorClick = () => {
    setSelectedType("auditor");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-12 items-center justify-center">
      <Link
        onClick={handleAuditClick}
        className="w-full sm:w-[224px] h-[60px] bg-main-orange text-black text-[20px] font-bold rounded-[100px] hover:opacity-90 transition-opacity flex items-center justify-center"
        href={"/apply"}
      >
        Sponsored Audits
      </Link>
      <Link
        onClick={handleAuditorClick}
        className="w-full sm:w-[224px] h-[60px] bg-main-dark-grey text-secondary-white text-[20px] font-bold rounded-[100px] hover:opacity-90 transition-opacity flex items-center justify-center"
        href={"/apply"}
      >
        Join TaskForce
      </Link>
    </div>
  );
};

export default SponsoredJoinButtons;
