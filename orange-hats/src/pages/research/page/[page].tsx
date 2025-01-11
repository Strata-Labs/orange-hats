import ResearchList, {
  ResearchListProps,
} from "@/components/blog/ResearchList.tsx";
import { GetStaticProps, GetStaticPaths } from "next";
import { ContentManager } from "../../../../utils/contentManager";

const POSTS_PER_PAGE = 10;

const PaginatedPage = ({
  posts,
  currentPage,
  totalPages,
}: ResearchListProps) => {
  return (
    <ResearchList
      posts={posts}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const contentManager = new ContentManager();
  const posts = await contentManager.getAllPosts();
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  const paths = Array.from({ length: totalPages }, (_, i) => ({
    params: { page: String(i + 1) },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<ResearchListProps> = async ({
  params,
}) => {
  const contentManager = new ContentManager();
  const allPosts = await contentManager.getAllPosts();
  const currentPage = Number(params?.page) || 1;
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  if (currentPage > totalPages) {
    return {
      notFound: true,
    };
  }

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, endIndex);

  return {
    props: {
      posts,
      currentPage,
      totalPages,
    },
    revalidate: 60,
  };
};

export default PaginatedPage;
