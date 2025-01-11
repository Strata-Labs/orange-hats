import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { isAuthenticatedAtom } from "@/atoms";
import { activeAdminSectionAtom, AdminSection } from "@/atoms/adminAtoms";
import AdminAuth from "@/components/Admin/AdminAuth";

import Menu from "@/components/Menu/Menu";
import AdminAudits from "@/components/Admin/AdminAudits";
import AdminAuditors from "@/components/Admin/AdminAuditors";
import AdminTools from "@/components/Admin/AdminTools";
import AdminApplications from "@/components/Admin/AdminApplications";
import AdminResearch from "@/components/Admin/AdminResearch";

const AdminPage = () => {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [activeSection, setActiveSection] = useAtom(activeAdminSectionAtom);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={() => null} />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case "audits":
        return <AdminAudits />;
      case "auditors":
        return <AdminAuditors />;
      case "research":
        return <AdminResearch />;
      case "tools":
        return <AdminTools />;
      case "applications":
        return <AdminApplications />;
      default:
        return <AdminAudits />;
    }
  };

  const tabs: Array<{ label: string; value: AdminSection }> = [
    { label: "Audits", value: "audits" },
    { label: "Auditors", value: "auditors" },
    { label: "Research", value: "research" },
    { label: "Tools", value: "tools" },
    { label: "Applications", value: "applications" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Menu />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8">
        <h1 className="text-[30px] md:text-[48px] font-space-mono text-secondary-white mb-4 text-center">
          Admin Dashboard
        </h1>

        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
          {tabs.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveSection(value)}
              className={`px-6 py-3 font-space-grotesk text-sm md:text-base rounded-full transition-colors
                ${
                  activeSection === value
                    ? "bg-main-orange text-black"
                    : "bg-main-dark-grey text-secondary-white hover:bg-opacity-80"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-main-dark-grey rounded-xl p-6">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
