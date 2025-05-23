import { getPublishedPosts, getTags, type Tag } from "./notion";

type StaticParam = { slug: string[] };
const POSTS_PER_PAGE = 3;

type NotionPage = {
  id: string;
  properties: {
    Tags?: {
      id: string;
      type: 'relation';
      relation: Array<{ id: string }>;
    };
    [key: string]: any;
  };
};

function isNotionPage(page: any): page is NotionPage {
  return page && typeof page === 'object' && 'properties' in page;
}

export async function generateBlogStaticParams() {
  const allParams: StaticParam[] = [];

  // 1. Get all published posts
  const { results: posts } = await getPublishedPosts();

  // 2. Generate root blog paths (/, /page/2, etc.)
  const rootParams = generateRootPathParams(posts.length);
  allParams.push(...rootParams);

  // 3. Generate individual post paths (/blog/{slug})
  const postParams = generatePostPathParams(posts);
  allParams.push(...postParams);

  // 4. Generate tag paths (/blog/tag/{tag-slug}, /blog/tag/{tag-slug}/page/2)
  const tagParams = await generateTagPathParams();
  allParams.push(...tagParams);

  console.log("allParams", allParams);

  return allParams;
}

function generateRootPathParams(totalPosts: number): StaticParam[] {
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const params: StaticParam[] = [];

  // Skip page 1 as it's handled by the root route
  for (let i = 1; i < totalPages; i++) {
    params.push({ slug: ["page", (i + 1).toString()] });
  }

  return params;
}

function generatePostPathParams(posts: any[]): StaticParam[] {
  return posts
    .filter((post) => "properties" in post)
    .filter((post) => {
      const slugProp = post.properties.Slug;
      return (
        slugProp?.type === "rich_text" &&
        Array.isArray(slugProp.rich_text) &&
        slugProp.rich_text.length > 0
      );
    })
    .map((post) => ({
      slug: [post.properties.Slug.rich_text[0].plain_text],
    }));
}

async function generateTagPathParams(): Promise<StaticParam[]> {
  const [tags, { results: posts }] = await Promise.all([
    getTags(),
    getPublishedPosts()
  ]);

  const allParams: StaticParam[] = [];
  const tagPostCounts = new Map<string, number>();

  // Count posts per tag
  for (const post of posts) {
    if (isNotionPage(post)) {
      const tagsProperty = post.properties.Tags;
      if (tagsProperty?.type === 'relation') {
        const tagIds = tagsProperty.relation?.map((r) => r.id) || [];
        tagIds.forEach((tagId: string) => {
          tagPostCounts.set(tagId, (tagPostCounts.get(tagId) || 0) + 1);
        });
      }
    }
  }

  // Generate paths for each tag
  for (const tag of tags) {
    const postCount = tagPostCounts.get(tag.id) || 0;
    
    if (postCount === 0) continue;

    // Add tag page (/blog/tag/{tag-slug})
    allParams.push({ slug: ["tag", tag.value] });

    // Add pagination pages if needed (/blog/tag/{tag-slug}/page/2, etc.)
    const totalPages = Math.ceil(postCount / POSTS_PER_PAGE);
    for (let i = 1; i < totalPages; i++) {
      allParams.push({ 
        slug: ["tag", tag.value, "page", (i + 1).toString()] 
      });
    }
  }

  return allParams;
}
