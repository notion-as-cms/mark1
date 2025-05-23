import {
  getPageBySlug,
  getPage,
  getTags,
  getPublishedPosts,
  type Tag,
} from "@/lib/notion";
import { BlogPost } from "@/components/blog/BlogPost";
import { generateBlogStaticParams } from "@/lib/static-params";

type NotionPage = {
  id: string;
  properties: {
    Name?: {
      title: Array<{ plain_text: string }>;
    };
    Description?: {
      rich_text: Array<{ plain_text: string }>;
    };
    Tags?: {
      type: "relation";
      relation: Array<{ id: string }>;
    };
    [key: string]: any;
  };
};

function isNotionPage(page: any): page is NotionPage {
  return page && typeof page === "object" && "properties" in page;
}

export { generateBlogStaticParams as generateStaticParams };

// Helper functions to determine page type
const isBlogRoot = (slug?: string[]) => !slug || slug.length === 0;
const isBlogPost = (slug?: string[]) => slug?.length === 1;
const isTagPage = (slug?: string[]) => slug?.[0] === "tag" && slug.length >= 2;
const isPaginationPage = (slug?: string[]) =>
  slug?.[0] === "page" && !isNaN(Number(slug[1]));
const isTagPaginationPage = (slug?: string[]) =>
  slug?.[0] === "tag" && slug[2] === "page" && !isNaN(Number(slug[3]));

// Main page component
export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const { slug } = params;
  const posts = await getPublishedPosts();
  const tags = await getTags();

  // Blog root page (/) - Show latest posts
  if (isBlogRoot(slug)) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Latest Posts</h1>
        <div className="space-y-8">
          {posts.results.slice(0, 5).map((post: any) => (
            <div key={post.id} className="border-b pb-6">
              <h2 className="text-2xl font-semibold">
                {post.properties.Name?.title?.[0]?.plain_text || "Untitled"}
              </h2>
              <p className="text-gray-600 mt-2">
                {post.properties.Description?.rich_text?.[0]?.plain_text || ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Single blog post (/slug)
  if (isBlogPost(slug) && slug?.[0]) {
    const post = await getPageBySlug(slug[0]);
    const recordMap = await getPage(post.id, tags);
    return <BlogPost recordMap={recordMap} />;
  }

  // Tag page (/tag/tag-name) or tag pagination (/tag/tag-name/page/2)
  if ((isTagPage(slug) || isTagPaginationPage(slug)) && slug?.[1]) {
    const tagSlug = slug[1];
    const tag = tags.find((t) => t.value === tagSlug);

    if (!tag) {
      return <div className="max-w-3xl mx-auto p-4">Tag not found</div>;
    }

    // Get current page number (default to 1 for non-paginated tag page)
    const currentPage = isTagPaginationPage(slug) ? Number(slug[3]) : 1;

    // Filter posts by tag
    const taggedPosts = posts.results.filter((post) => {
      if (!isNotionPage(post)) return false;
      const tagsProperty = post.properties.Tags;
      if (tagsProperty?.type === "relation") {
        const tagIds = tagsProperty.relation.map((r) => r.id);
        return tagIds.includes(tag.id);
      }
      return false;
    });

    // Pagination
    const postsPerPage = 5; // Should match POSTS_PER_PAGE from static-params.ts
    const totalPages = Math.ceil(taggedPosts.length / postsPerPage);
    const startIdx = (currentPage - 1) * postsPerPage;
    const paginatedPosts = taggedPosts.slice(startIdx, startIdx + postsPerPage);

    return (
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">
          Posts tagged with: {tag.label}
        </h1>

        {/* Posts list */}
        <div className="space-y-8 mb-8">
          {paginatedPosts.map((post: any) => (
            <div key={post.id} className="border-b pb-6">
              <h2 className="text-2xl font-semibold">
                {post.properties.Name?.title?.[0]?.plain_text || "Untitled"}
              </h2>
              <p className="text-gray-600 mt-2">
                {post.properties.Description?.rich_text?.[0]?.plain_text || ""}
              </p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-8">
            {currentPage > 1 ? (
              <a
                href={`/blog/tag/${tag.value}${
                  currentPage > 2 ? `/page/${currentPage - 1}` : ""
                }`}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Previous
              </a>
            ) : (
              <div />
            )}

            <span>
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages ? (
              <a
                href={`/blog/tag/${tag.value}/page/${currentPage + 1}`}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Next
              </a>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>
    );
  }

  // Pagination (/page/2)
  if (isPaginationPage(slug)) {
    const page = Number(slug?.[1]) || 1;
    return (
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Page {page}</h1>
        {/* TODO: Implement pagination */}
        <pre>{JSON.stringify({ page }, null, 2)}</pre>
      </div>
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
