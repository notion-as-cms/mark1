import { getPageBySlug, getPublishedPosts, notionCustom } from "@/lib/notion";
import { Renderer } from "./renderer";
import {
  PageObjectResponse,
  type DatabaseObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  const results: DatabaseObjectResponse[] = posts.results;
  return results.map((post) => ({
    slug: post.properties.Slug.rich_text[0].plain_text,
  }));
}

const getPage = async (id: string) => {
  const recordMap = await notionCustom.getPage(id);

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

  return (
    <div className="max-w-3xl mx-auto p-4 bg-red-50">
      <Renderer recordMap={recordMap} fullPage={false} darkMode={false} />
    </div>
  );
}
