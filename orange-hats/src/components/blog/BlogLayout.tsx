import React from "react";
import Menu from "@/components/Menu/Menu";

interface BlogLayoutProps {
  children: React.ReactNode;
}

const BlogLayout: React.FC<BlogLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Menu />

      <main className="max-w-7xl mx-auto px-6 pt-8">
        <h1 className="text-[30px] md:text-[48px] font-space-mono text-secondary-white mb-4 text-center">
          Security Research
        </h1>

        <p className="text-[18px] md:text-[32px] font-space-grotesk text-secondary-white mb-8 text-center">
          Here you'll find security research, analysis, and important findings
          from the ecosystem.
        </p>

        <div className="bg-main-dark-grey rounded-xl p-6">{children}</div>
      </main>
    </div>
  );
};

export default BlogLayout;
