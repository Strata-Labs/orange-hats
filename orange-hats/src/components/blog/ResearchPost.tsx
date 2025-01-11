import React from "react";
import { MDXRemote } from "next-mdx-remote";
import BlogLayout from "./BlogLayout";
import Image from "next/image";
import { ResearchPostProps } from "./ResearchList.tsx";
import { trpc } from "../../../utils/trpc";

const ImageComponent: React.FC<{
  src: string;
  alt: string;
  post: ResearchPostProps["post"];
}> = ({ src, alt, post }) => {
  const shouldFetchUrl = src.includes("research/");

  const { data: imageData } = trpc.public.getResearchImageUrl.useQuery(
    {
      researchId: post.id,
      whichImage:
        shouldFetchUrl && src.includes("/main/") ? "main" : "secondary",
    },
    {
      enabled: shouldFetchUrl,
    }
  );

  const imageUrl = shouldFetchUrl ? imageData?.url : src;

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="flex justify-center my-8">
      <div className="relative w-full max-w-3xl h-[400px] rounded-xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={alt || "Research image"}
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
};

const components = {
  h1: (props: any) => (
    <h1
      className="text-[58px] font-space-mono text-secondary-white mb-4"
      {...props}
    />
  ),
  h2: (props: any) => (
    <h2
      className="text-[32px] font-space-mono text-secondary-white mb-4 mt-8"
      {...props}
    />
  ),
  h3: (props: any) => (
    <h3
      className="text-[24px] font-space-mono text-secondary-white mb-3 mt-6"
      {...props}
    />
  ),
  p: (props: any) => (
    <p
      className="text-[16px] font-space-grotesk text-secondary-white mb-4 leading-relaxed"
      {...props}
    />
  ),
  ul: (props: any) => (
    <ul
      className="list-disc list-inside space-y-2 mb-6 text-secondary-white"
      {...props}
    />
  ),
  ol: (props: any) => (
    <ol
      className="list-decimal list-inside space-y-2 mb-6 text-secondary-white"
      {...props}
    />
  ),
  li: (props: any) => (
    <li
      className="text-[16px] font-space-grotesk text-secondary-white pl-4"
      {...props}
    />
  ),
  pre: (props: any) => (
    <pre
      className="bg-main-dark-grey p-4 rounded-lg overflow-x-auto mb-6"
      {...props}
    />
  ),
  code: (props: any) => (
    <code
      className="bg-main-dark-grey px-2 py-1 rounded-md text-secondary-white"
      {...props}
    />
  ),
  blockquote: (props: any) => (
    <blockquote
      className="border-l-4 border-main-orange pl-4 my-4 text-secondary-white italic"
      {...props}
    />
  ),
};

const ResearchPost: React.FC<ResearchPostProps> = ({ post }) => {
  const mdxComponents = {
    ...components,
    img: (props: any) => <ImageComponent {...props} post={post} />,
  };

  return (
    <BlogLayout>
      <article className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-[48px] md:text-[58px] font-space-mono text-secondary-white mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-[14px] font-space-grotesk text-secondary-white opacity-80">
            <span>Protocol: {post.protocol}</span>
            <span>•</span>
            <span>Type: {post.type}</span>
            <span>•</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>

        <div className="prose prose-invert max-w-none">
          {typeof post.content === "string" ? (
            <div className="text-[16px] font-space-grotesk text-secondary-white space-y-4">
              {post.content.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <MDXRemote {...post.content} components={mdxComponents} />
          )}
        </div>

        <div className="mt-16 pt-8 border-t border-main-dark-grey">
          <a
            href="/research"
            className="text-main-orange hover:text-opacity-80 transition-colors"
          >
            ← Back to Research List
          </a>
        </div>
      </article>
    </BlogLayout>
  );
};

export default ResearchPost;
