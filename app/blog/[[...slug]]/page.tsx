import { getPageBySlug, getPage, getTags, getPublishedPosts } from "@/lib/notion";
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
  const { POSTS_PER_PAGE } = await import('@/lib/constants');

  // Blog root page (/) - Show latest posts with pagination
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

  // Single blog post (/slug)
  const postSlug = getPostSlug(pageParams);
  if (postSlug) {
    const post = await getPageBySlug(postSlug);
    const recordMap = await getPage(post.id, tags);
    return <BlogPost recordMap={recordMap} />;
  }

  // Tag page (/tag/tag-name) or tag pagination (/tag/tag-name/page/2)
  const tagSlug = getTagSlug(pageParams);
  if (tagSlug) {
    const tag = tags.find((t) => t.value === tagSlug);

    if (!tag) {
      return <div className="max-w-3xl mx-auto p-4">Tag not found</div>;
    }

    // Filter posts by tag ID
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

  // Pagination is now handled in the blog root page condition

  // 404 - Not Found
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600">The requested page could not be found.</p>
    </div>
  );
}
