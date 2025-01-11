import React from "react";
import Link from "next/link";
import BlogLayout from "./BlogLayout";
import { MDXRemoteSerializeResult } from "next-mdx-remote";

export interface ResearchPost {
  id: string;
  slug: string;
  title: string;
  protocol: string;
  type: string;
  description: string;
  content: string | MDXRemoteSerializeResult;
  publishedAt: Date;
  jekyllUrl: string;
  mainImage: string | null;
  mainImageKey: string | null;
  secondaryImage: string | null;
  secondaryImageKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchPostWithContent {
  id: string;
  slug: string;
  title: string;
  protocol: string;
  type: string;
  description: string;
  content: string | MDXRemoteSerializeResult;
  publishedAt: string;
  jekyllUrl: string;
  mainImage: string | null;
  mainImageKey: string | null;
  secondaryImage: string | null;
  secondaryImageKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchListProps {
  posts: ResearchPostWithContent[];
  currentPage: number;
  totalPages: number;
}

export interface ResearchPostProps {
  post: ResearchPostWithContent;
}

export interface PaginatedResponse<T> {
  items: T[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const ResearchList: React.FC<ResearchListProps> = ({
  posts,
  currentPage,
  totalPages,
}) => {
  return (
    <BlogLayout>
      <div className="space-y-8">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="bg-background rounded-xl p-6 transition-transform hover:scale-[1.02]"
          >
            <div className="text-[14px] font-space-grotesk text-secondary-white opacity-80 mb-2">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            <Link href={`/research/${post.slug}`} className="block group">
              <h3 className="text-[20px] md:text-[24px] font-space-mono text-secondary-white group-hover:text-main-orange transition-colors mb-2">
                {post.title}
              </h3>
            </Link>

            <div className="text-[14px] font-space-grotesk text-secondary-white opacity-80 mb-4">
              Protocol: {post.protocol} | Type: {post.type}
            </div>

            {post.description && (
              <p className="text-[16px] font-space-grotesk text-secondary-white">
                {post.description}
              </p>
            )}
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          {currentPage > 1 && (
            <Link
              href={`/research/page/${currentPage - 1}`}
              className="px-6 py-2 bg-main-orange text-black rounded-full hover:opacity-90 transition-opacity"
            >
              Previous
            </Link>
          )}

          <span className="text-secondary-white py-2">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages && (
            <Link
              href={`/research/page/${currentPage + 1}`}
              className="px-6 py-2 bg-main-orange text-black rounded-full hover:opacity-90 transition-opacity"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </BlogLayout>
  );
};

export default ResearchList;
