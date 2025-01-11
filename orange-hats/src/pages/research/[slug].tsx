import { GetStaticProps, GetStaticPaths } from "next";
import ResearchPost from "@/components/blog/ResearchPost";
import { serialize } from "next-mdx-remote/serialize";
import { ResearchPostWithContent } from "@/components/blog/ResearchList.tsx";
import { ContentManager } from "../../../utils/contentManager";

interface PostPageProps {
  post: ResearchPostWithContent;
}

const Post = ({ post }: PostPageProps) => {
  return <ResearchPost post={post} />;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const contentManager = new ContentManager();
  const posts = await contentManager.getAllPosts();

  return {
    paths: posts.map((post) => ({
      params: { slug: post.slug },
    })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<PostPageProps> = async ({
  params,
}) => {
  const contentManager = new ContentManager();
  const post = await contentManager.getPostBySlug(params?.slug as string);

  const mdxSource = await serialize(post.content);

  return {
    props: {
      post: {
        ...post,
        content: mdxSource,
      },
    },
    revalidate: 60,
  };
};

export default Post;
