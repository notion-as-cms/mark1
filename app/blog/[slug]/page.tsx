import {
  getPageBySlug,
  getPublishedPosts,
  getPage,
  getTags,
} from "@/lib/notion";
import { Renderer } from "./renderer";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getPageTableOfContents } from "notion-utils";
import type { ExtendedRecordMap, Block, PageBlock } from "notion-types";

// Type guard to check if a block is a page block
function isPageBlock(block: Block): block is PageBlock {
  return block.type === "page";
}

// Helper to find the first page block in the record map
function findPageBlock(recordMap: ExtendedRecordMap): PageBlock | null {
  for (const blockId in recordMap.block) {
    const block = recordMap.block[blockId]?.value;
    if (block && isPageBlock(block)) {
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
  const tags = await getTags();
  const recordMap = await getPage(post.id, tags);

  console.log("tags", tags, recordMap);

  // Find the page block and generate table of contents
  const pageBlock = findPageBlock(recordMap);
  const tableOfContents = pageBlock
    ? getPageTableOfContents(pageBlock, recordMap)
    : [];
  const showTableOfContents = tableOfContents.length > 0;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-red-50">
      {showTableOfContents && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Table of Contents</h2>
          <ul className="space-y-1">
            {tableOfContents.map((item, index) => {
              // Ensure item has required properties before rendering
              if (!item || !item.id || !item.text) return null;

              return (
                <li
                  key={index}
                  style={{ paddingLeft: `${(item.indentLevel || 0) * 16}px` }}
                >
                  <a
                    href={`#${item.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <Renderer
        recordMap={recordMap}
        fullPage={false}
        darkMode={false}
        showTableOfContents={false}
      />
    </div>
  );
}
