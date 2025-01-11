import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { currentRouteAtom, isMobileMenuOpenAtom } from "../../atoms";
import HamburgerButton from "./HamburgerButton";

interface MenuItem {
  name: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { name: "Audits", path: "/audits" },
  { name: "Auditors", path: "/auditors" },
  { name: "Research", path: "/research" },
  { name: "Tools", path: "/tools" },
  { name: "Apply", path: "/apply" },
];

const Menu: React.FC = () => {
  const router = useRouter();
  const [currentRoute, setCurrentRoute] = useAtom(currentRouteAtom);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useAtom(isMobileMenuOpenAtom);

  useEffect(() => {
    setCurrentRoute(router.pathname);
  }, [router.pathname, setCurrentRoute]);

  const handleMenuItemClick = (path: string) => {
    setIsMobileMenuOpen(false);
    router.push(path);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-background z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="z-50">
            <Image
              src="/Home.png"
              alt="Orange Hats Logo"
              width={1000}
              height={1000}
              className="w-[167px]"
              priority
            />
          </Link>

          <HamburgerButton />

          <ul className="hidden sm:flex items-center gap-10 font-dm-sans">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`transition-colors duration-200 md:text-[18px] text-base
                    ${
                      currentRoute === item.path
                        ? "text-main-orange"
                        : "text-secondary-white hover:text-main-orange"
                    }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div
        className={`fixed inset-0 bg-background z-40 transform transition-transform duration-300 ease-in-out sm:hidden
          ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <ul className="flex flex-col items-center gap-8">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleMenuItemClick(item.path)}
                  className={`text-2xl font-dm-sans transition-colors duration-200
                    ${
                      currentRoute === item.path
                        ? "text-main-orange"
                        : "text-secondary-white hover:text-main-orange"
                    }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="h-24" />
    </>
  );
};

export default Menu;
