import React, { useState } from "react";
import Menu from "../Menu/Menu";

type Tab = "audits" | "auditors" | "research" | "tools";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-space-grotesk text-sm md:text-base rounded-full transition-colors
      ${
        active
          ? "bg-main-orange text-black"
          : "bg-main-dark-grey text-secondary-white hover:bg-opacity-80"
      }`}
  >
    {label}
  </button>
);

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<Tab>("audits");

  return (
    <div className="min-h-screen bg-background">
      <Menu />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8">
        <h1 className="text-[30px] md:text-[48px] font-space-mono text-secondary-white mb-4 text-center">
          Admin Dashboard
        </h1>

        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
          <TabButton
            label="Audits"
            active={activeTab === "audits"}
            onClick={() => setActiveTab("audits")}
          />
          <TabButton
            label="Auditors"
            active={activeTab === "auditors"}
            onClick={() => setActiveTab("auditors")}
          />
          <TabButton
            label="Research"
            active={activeTab === "research"}
            onClick={() => setActiveTab("research")}
          />
          <TabButton
            label="Tools"
            active={activeTab === "tools"}
            onClick={() => setActiveTab("tools")}
          />
        </div>

        <div className="bg-main-dark-grey rounded-xl p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
