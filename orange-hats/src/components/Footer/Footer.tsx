import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex-grow h-[1px] bg-main-orange" />
          <span className="px-4 text-main-orange font-space-mono">//:</span>
          <div className="flex-grow h-[1px] bg-main-orange" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center md:items-start pb-8 md:pb-16">
          <div className="mb-8 md:mb-0">
            <Image
              src="/Home.png"
              alt="Logo"
              width={167}
              height={32}
              className="w-[167px]"
              priority
            />
          </div>

          <nav className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
            {[
              { label: "//: Blogs", href: "/research" },
              { label: "//: About Stacks", href: "/about" },
              { label: "//: Events", href: "/events" },
              {
                label: "//: Github",
                href: "https://github.com/Strata-Labs/orange-hats",
              },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-main-dark-grey hover:text-main-orange transition-colors font-space-mono text-base"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
