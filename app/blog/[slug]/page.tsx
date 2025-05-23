import { getPageBySlug, getPublishedPosts, notionCustom } from "@/lib/notion";
import { Renderer } from "./renderer";
import {
  PageObjectResponse,
  type DatabaseObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { getPageTableOfContents } from "notion-utils";
import { type ExtendedRecordMap } from "notion-types";

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

const getPage = async (id: string) => {
  const recordMap: ExtendedRecordMap = await notionCustom.getPage(id);

  return recordMap as typeof recordMap & {
    raw: {
      page: PageObjectResponse;
    };
  };
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPageBySlug(slug);
  const recordMap = await getPage(post.id);

  console.log("recordMap", recordMap.block);

  const tableOfContents = getPageTableOfContents(recordMap, recordMap);

  return (
    <div className="max-w-3xl mx-auto p-4 bg-red-50">
      <Renderer recordMap={recordMap} fullPage={false} darkMode={false} />
    </div>
  );
}
