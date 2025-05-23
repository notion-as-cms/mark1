import { getPageBySlug, getPublishedPosts, getPage } from "@/lib/notion";
import { Renderer } from "./renderer";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getPageTableOfContents } from "notion-utils";
import type { ExtendedRecordMap, Block } from "notion-types";

// Helper to find the first page block in the record map
function findPageBlock(recordMap: ExtendedRecordMap): Block | null {
  for (const blockId in recordMap.block) {
    const block = recordMap.block[blockId]?.value;
    if (block?.type === 'page' || block?.type === 'collection_view_page') {
      return block;
    }
  }
  return null;
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.results
    .filter((post): post is PageObjectResponse => {
      if (!("properties" in post)) return false;
      const slugProp = post.properties.Slug;
      return (
        slugProp?.type === "rich_text" &&
        Array.isArray(slugProp.rich_text) &&
        slugProp.rich_text.length > 0
      );
    })
    .map((post) => ({
      slug: (post.properties.Slug as any).rich_text[0].plain_text,
    }));
}



export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPageBySlug(slug);
  const recordMap = await getPage(post.id);

  // Find the page block for table of contents
  const pageBlock = findPageBlock(recordMap);
  const showTableOfContents = Boolean(pageBlock);

  return (
    <div className="max-w-3xl mx-auto p-4 bg-red-50">
      <Renderer 
        recordMap={recordMap} 
        fullPage={false} 
        darkMode={false}
        showTableOfContents={showTableOfContents}
      />
    </div>
  );
}
