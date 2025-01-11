import { GetStaticProps, GetStaticPaths } from "next";
import ResearchPost from "@/components/blog/ResearchPost";
import { serialize } from "next-mdx-remote/serialize";
import { ResearchPostWithContent } from "@/components/blog/ResearchList.tsx";
import { ContentManager } from "../../../utils/contentManager";
import { s3Utils } from "../../../utils/s3";
import prisma from "../../../lib/prisma";

interface PostProps {
  post: ResearchPostWithContent;
}

export default function Post({ post }: PostProps) {
  return <ResearchPost post={post} />;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const contentManager = new ContentManager();
  const posts = await contentManager.getAllPosts();

  const paths = posts.map((post) => {
    const date = new Date(post.publishedAt);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return {
      params: {
        slug: [year.toString(), month, day, post.slug],
      },
    };
  });

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({ params }) => {
  if (!params?.slug || !Array.isArray(params.slug)) {
    return { notFound: true };
  }

  const [year, month, day, slug] = params.slug;
  const contentManager = new ContentManager();

  try {
    const post = await prisma.research.findUnique({
      where: { slug },
    });

    if (!post) {
      return { notFound: true };
    }

    let mainImageUrl = null;
    let secondaryImageUrl = null;

    if (post.mainImageKey) {
      try {
        const { url } = await s3Utils.getSignedDownloadUrl(
          post.mainImageKey,
          3600
        );
        mainImageUrl = url;
      } catch (error) {
        console.error(`Failed to get signed URL for main image:`, error);
      }
    }

    if (post.secondaryImageKey) {
      try {
        const { url } = await s3Utils.getSignedDownloadUrl(
          post.secondaryImageKey,
          3600
        );
        secondaryImageUrl = url;
      } catch (error) {
        console.error(`Failed to get signed URL for secondary image:`, error);
      }
    }

    const mdxSource = await serialize(post.content || "");

    const postWithContent: ResearchPostWithContent = {
      ...post,
      content: mdxSource,
      mainImage: mainImageUrl,
      secondaryImage: secondaryImageUrl,
      publishedAt: post.publishedAt.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };

    return {
      props: {
        post: postWithContent,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error getting post:", error);
    return { notFound: true };
  }
};
