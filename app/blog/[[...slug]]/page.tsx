import {
  getPageBySlug,
  getPage,
  getTags,
  getPublishedPosts,
} from "@/lib/notion";
import { BlogPost } from "@/components/blog/BlogPost";
import { generateBlogStaticParams } from "@/lib/static-params";
import { BlogList } from "@/components/blog/BlogList";
import { mapNotionPostToBlogPost } from "@/lib/notion-mappers";
import {
  isBlogRootPage,
  isBlogPostPage,
  isTagPage,
  isPaginatedTagPage,
  isPaginatedBlogPage,
  getTagSlug,
  getPageNumber,
  getPostSlug,
} from "@/lib/page-utils";

export { generateBlogStaticParams as generateStaticParams };

// Main page component
export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const { slug = [] } = params;
  const posts = await getPublishedPosts();
  const tags = await getTags();
  const pageParams = { slug };

  // Import the constant
  const { POSTS_PER_PAGE } = await import("@/lib/constants");

  // Handle blog post page
  if (isBlogPostPage(pageParams)) {
    const postSlug = getPostSlug(pageParams);
    if (!postSlug) {
      return <div className="max-w-3xl mx-auto p-4">Invalid post URL</div>;
    }

    const post = await getPageBySlug(postSlug);
    if (!post) {
      return <div className="max-w-3xl mx-auto p-4">Post not found</div>;
    }
    const recordMap = await getPage(post.id, tags);
    return <BlogPost recordMap={{
      ...recordMap,
      pageInfo: {
        ...recordMap.pageInfo,
        tags // Pass the tags to the BlogPost component
      }
    }} />;
  }

  // Handle tag pages (both paginated and non-paginated)
  if (isTagPage(pageParams) || isPaginatedTagPage(pageParams)) {
    const tagSlug = getTagSlug(pageParams);
    if (!tagSlug) {
      return <div className="max-w-3xl mx-auto p-4">Invalid tag URL</div>;
    }

    const tag = tags.find((t) => t.value === tagSlug);
    if (!tag) {
      return <div className="max-w-3xl mx-auto p-4">Tag not found</div>;
    }

    const taggedPosts = posts.results.filter((post: any) => {
      const tags = post.properties?.Tags?.relation || [];
      return tags.some((t: { id: string }) => t.id === tag.id);
    });

    return (
      <BlogList
        posts={taggedPosts}
        tags={tags}
        pageParams={pageParams}
        isPaginated={true}
        heading={`Posts tagged with: ${tag.label}`}
        basePath={`/blog/tag/${tag.value}`}
      />
    );
  }

  // Handle blog root and paginated blog pages
  if (isBlogRootPage(pageParams) || isPaginatedBlogPage(pageParams)) {
    return (
      <BlogList
        posts={posts.results}
        tags={tags}
        pageParams={pageParams}
        isPaginated={true}
        heading="Latest Posts"
        basePath="/blog"
      />
    );
  }

  // 404 - Not Found
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600">The requested page could not be found.</p>
    </div>
  );
}
