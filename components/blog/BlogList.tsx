import { PostList } from "./PostList";
import { mapNotionPostToBlogPost } from "@/lib/notion-mappers";
import type { BlogPost } from "./PostList";

type BlogListProps = {
  posts: any[];
  tags: any[];
  pageParams: { slug?: string[] };
  isPaginated: boolean;
  heading?: string;
  basePath?: string;
};

export async function BlogList({
  posts,
  tags,
  pageParams,
  isPaginated = false,
  heading = "Latest Posts",
  basePath = "/blog",
}: BlogListProps) {
  const { POSTS_PER_PAGE } = await import('@/lib/constants');
  const currentPage = isPaginated ? getPageNumber(pageParams) : 1;
  
  // Map all posts first and filter out null values with type assertion
  const allBlogPosts = posts
    .map(post => mapNotionPostToBlogPost(post, tags))
    .filter((post): post is BlogPost => post !== null);

  // Apply pagination if enabled
  const paginatedPosts = isPaginated
    ? allBlogPosts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
      )
    : allBlogPosts;

  const totalPages = Math.ceil(allBlogPosts.length / POSTS_PER_PAGE);

  return (
    <PostList
      posts={paginatedPosts}
      currentPage={currentPage}
      totalPages={totalPages}
      heading={heading}
      basePath={basePath}
      disablePagination={!isPaginated}
    />
  );
}

// Helper function to get page number from params
function getPageNumber(pageParams: { slug?: string[] }): number {
  if (!pageParams.slug || pageParams.slug.length === 0) return 1;
  const page = parseInt(pageParams.slug[pageParams.slug.length - 1], 10);
  return isNaN(page) ? 1 : Math.max(1, page);
}
