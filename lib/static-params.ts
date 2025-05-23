import { getPublishedPosts, getTags } from "./notion";

type StaticParam = { slug: string[] };
const POSTS_PER_PAGE = 3;

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
  const tags = await getTags();
  const allParams: StaticParam[] = [];

  for (const tag of tags) {
    // Add tag page (/blog/tag/{tag-slug})
    allParams.push({ slug: ["tag", tag.value] });

    // Add tag pagination pages (/blog/tag/{tag-slug}/page/2, etc.)
    // Note: In a real implementation, you'd need to get the count of posts per tag
    // For now, we'll assume 1 page per tag (no pagination)
    // To implement pagination, you'd need to modify getTags to return post counts per tag
    // and then generate pagination params similar to generateRootPathParams
  }

  return allParams;
}
