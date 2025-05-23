import { getPageBySlug, getPage, getTags, getPublishedPosts } from "@/lib/notion";
import { BlogPost } from "@/components/blog/BlogPost";
import { generateBlogStaticParams } from "@/lib/static-params";

export { generateBlogStaticParams as generateStaticParams };

// Helper functions to determine page type
const isBlogRoot = (slug?: string[]) => !slug || slug.length === 0;
const isBlogPost = (slug?: string[]) => slug?.length === 1;
const isTagPage = (slug?: string[]) => slug?.[0] === 'tag' && slug.length >= 2;
const isPaginationPage = (slug?: string[]) => 
  slug?.[0] === 'page' && !isNaN(Number(slug[1]));

// Main page component
export default async function BlogPage({
  params,
}: {
  params: { slug?: string[] };
}) {
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
                {post.properties.Name?.title?.[0]?.plain_text || 'Untitled'}
              </h2>
              <p className="text-gray-600 mt-2">
                {post.properties.Description?.rich_text?.[0]?.plain_text || ''}
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

  // Tag page (/tag/tag-name)
  if (isTagPage(slug) && slug?.[1]) {
    const tagSlug = slug[1];
    const tag = tags.find(t => t.value === tagSlug);
    
    if (!tag) {
      return <div className="max-w-3xl mx-auto p-4">Tag not found</div>;
    }

    return (
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Posts tagged with: {tag.label}</h1>
        {/* TODO: Filter posts by tag and display them */}
        <pre>{JSON.stringify({ tag, slug }, null, 2)}</pre>
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
