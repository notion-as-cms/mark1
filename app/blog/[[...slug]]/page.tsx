import {
  getPageBySlug,
  getPage,
  getTags,
  getPublishedPosts,
  type Tag,
} from "@/lib/notion";
import { BlogPost } from "@/components/blog/BlogPost";
import { generateBlogStaticParams } from "@/lib/static-params";
import { PostList } from "@/components/blog/PostList";

type NotionPage = {
  id: string;
  properties: {
    Name?: {
      title: Array<{ plain_text: string }>;
    };
    Description?: {
      rich_text: Array<{ plain_text: string }>;
    };
    Date?: {
      date: { start: string };
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

function mapNotionPostToBlogPost(post: any, tags: Tag[] = []): any {
  if (!isNotionPage(post)) return null;

  const tagIds = post.properties.Tags?.relation?.map((r: any) => r.id) || [];
  const postTags = tags
    .filter(tag => tagIds.includes(tag.id))
    .map(tag => tag.label);

  return {
    id: post.id,
    url: `/blog/${post.properties.Slug?.rich_text?.[0]?.plain_text || post.id}`,
    data: {
      title: post.properties.Name?.title?.[0]?.plain_text || 'Untitled',
      description: post.properties.Description?.rich_text?.[0]?.plain_text || '',
      date: post.properties.Date?.date?.start || new Date().toISOString(),
      author: post.properties.Author?.people?.[0]?.name || undefined,
      tags: postTags,
    },
  };
}

export { generateBlogStaticParams as generateStaticParams };

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
    const currentPage = isPaginatedBlogPage(pageParams) ? getPageNumber(pageParams) : 1;
    
    // Map all posts first
    const allBlogPosts = posts.results
      .map(post => mapNotionPostToBlogPost(post, tags))
      .filter(Boolean);

    // Apply pagination
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const paginatedPosts = allBlogPosts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(allBlogPosts.length / POSTS_PER_PAGE);

    return (
      <PostList
        posts={paginatedPosts}
        currentPage={currentPage}
        totalPages={totalPages}
        heading="Latest Posts"
        basePath="/blog"
        disablePagination={false}
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

    // Get current page number (default to 1 for non-paginated tag page)
    const currentPage = getPageNumber(pageParams);

    // Filter posts by tag and map to blog post format
    const taggedPosts = posts.results
      .filter((post) => {
        if (!isNotionPage(post)) return false;
        const tagsProperty = post.properties.Tags;
        if (tagsProperty?.type === "relation") {
          const tagIds = tagsProperty.relation.map((r) => r.id);
          return tagIds.includes(tag.id);
        }
        return false;
      })
      .map(post => mapNotionPostToBlogPost(post, tags))
      .filter(Boolean);

    // Apply pagination using the POSTS_PER_PAGE constant
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const paginatedPosts = taggedPosts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(taggedPosts.length / POSTS_PER_PAGE);

    return (
      <PostList
        posts={paginatedPosts}
        currentPage={currentPage}
        totalPages={totalPages}
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
