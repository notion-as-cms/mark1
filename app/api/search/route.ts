import {
  createSearchAPI,
  type AdvancedIndex,
} from "fumadocs-core/search/server";
import { getPublishedPosts } from "@/lib/notion";

let cachedIndexes: AdvancedIndex[] = [];

async function getSearchIndexes(): Promise<AdvancedIndex[]> {
  if (cachedIndexes.length) return cachedIndexes;

  try {
    const response = await getPublishedPosts();
    const posts = Array.isArray(response) ? response : response?.results || [];

    cachedIndexes = posts.map((post) => ({
      id: post.id,
      title: post.properties.Name?.title?.[0]?.plain_text || "Untitled",
      description:
        post.properties.Description?.rich_text?.[0]?.plain_text || "",
      keywords: post.properties.Keywords?.rich_text?.[0]?.plain_text || "",
      tag: "blog",
      url: `/blog/${
        post.properties.Slug?.rich_text?.[0]?.plain_text || post.id
      }`,
      structuredData: {
        headline: post.properties.Name?.title?.[0]?.plain_text || "Untitled",
        description:
          post.properties.Description?.rich_text?.[0]?.plain_text || "",
        contents: [],
        headings: [],
      },
    }));
  } catch (error) {
    console.error("Error fetching posts for search index:", error);
    cachedIndexes = [];
  }

  console.log("cachedIndexes", cachedIndexes);

  return cachedIndexes;
}

export const revalidate = false;

export const { staticGET: GET } = createSearchAPI("advanced", {
  indexes: () => getSearchIndexes(),
});
