import React from "react";
import { useAtom } from "jotai";
import { isMobileMenuOpenAtom } from "../../atoms";

const HamburgerButton: React.FC = () => {
  const [isOpen, setIsOpen] = useAtom(isMobileMenuOpenAtom);

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="relative w-6 h-6 focus:outline-none sm:hidden"
      aria-label={isOpen ? "Close Menu" : "Open Menu"}
    >
      <div className="flex flex-col justify-center items-center w-full h-full">
        <span
          className={`block h-[2px] w-6 bg-secondary-white rounded-sm transform transition-all duration-300 ease-in-out origin-center
            ${isOpen ? "rotate-45 translate-y-[.1rem]" : "-translate-y-1"}`}
        />
        <span
          className={`block h-[2px] w-6 bg-secondary-white rounded-sm transform transition-all duration-300 ease-in-out
            ${isOpen ? "opacity-0 translate-x-3" : "opacity-100"}`}
        />
        <span
          className={`block h-[2px] w-6 bg-secondary-white rounded-sm transform transition-all duration-300 ease-in-out origin-center
            ${isOpen ? "-rotate-45 -translate-y-[.2rem]" : "translate-y-1"}`}
        />
      </div>
    </button>
  );
};

export default HamburgerButton;
